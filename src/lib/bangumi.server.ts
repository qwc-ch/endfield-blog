// 番组计划数据：构建时从 Bangumi API 拉取收藏，静态烘进页面里。
// 只在服务端 / 构建时导入（+page.server.ts），浏览器端不会再发请求。
// 镜像站不稳：按 API_URLS 依次换线，成功结果缓存在项目根
// .bangumi-cache.json（12 小时），下次构建接口挂了也能先用上次快照。

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { bangumiConfig, type BgmCategory, type BgmItem } from './bangumi';

/** API 镜像地址，按顺序尝试，最后用官方站兜底。
 *  api.bangumi.pro 是 Firefly 配置里的镜像，常被重置；
 *  api.bangumi.lat 是当前在用的公共镜像（原 bangumi.lol / bangumi.one 改名）。 */
const API_URLS = [
	'https://api.bangumi.lat',
	'https://api.bangumi.pro',
	'https://api.bgm.tv'
];

const CACHE_FILE = resolve(process.cwd(), '.bangumi-cache.json');
const CACHE_TTL = 12 * 60 * 60 * 1000;
const TIMEOUT = 12000;

/** 本次构建里第一个连通的镜像，后面的分类直接用它，别每个分类都重试一轮 */
let preferred: string | undefined;

/** 连接被重置/超时常常是瞬时的，同一个镜像再试一次 */
const ATTEMPTS = 2;
const sleep = (ms: number) => new Promise((done) => setTimeout(done, ms));

type CacheShape = Partial<Record<string, { t: number; items: BgmItem[] }>>;

/** fetch 的报错只有一句 "fetch failed"，把 cause 也带出来，方便判断是 DNS、超时还是被重置 */
function describe(err: unknown): string {
	if (!(err instanceof Error)) return String(err);
	const cause = (err as { cause?: unknown }).cause;
	if (cause instanceof Error) return `${err.message} (${cause.name}: ${cause.message})`;
	if (cause) return `${err.message} (${String(cause)})`;
	return err.message;
}

function readCache(): CacheShape {
	try {
		if (existsSync(CACHE_FILE)) return JSON.parse(readFileSync(CACHE_FILE, 'utf8'));
	} catch {
		// 缓存坏了就当没有
	}
	return {};
}

function writeCache(cache: CacheShape) {
	try {
		writeFileSync(CACHE_FILE, JSON.stringify(cache));
	} catch {
		// 写不进去就算了，别影响构建
	}
}

/** 从指定镜像拉一个分类的全部收藏，失败抛出 */
async function fetchCategoryFrom(apiUrl: string, subjectType: number): Promise<BgmItem[]> {
	const out: BgmItem[] = [];
	let offset = 0;
	while (out.length < bangumiConfig.maxTotal) {
		const url = `${apiUrl}/v0/users/${bangumiConfig.userId}/collections?subject_type=${subjectType}&limit=${bangumiConfig.limit}&offset=${offset}`;
		const resp = await fetch(url, {
			signal: AbortSignal.timeout(TIMEOUT),
			headers: {
				Accept: 'application/json',
				// 镜像站也认 UA，带上站点标识，别被当成匿名爬虫
				'User-Agent': 'amamo-blog/1.0 (+https://amamo.top)'
			}
		});
		if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
		const data: { data?: BgmItem[] } = await resp.json();
		const batch = data.data ?? [];
		out.push(...batch);
		if (batch.length < bangumiConfig.limit) break;
		offset += bangumiConfig.limit;
	}
	return out;
}

/** 按顺序试各个镜像，全挂了才抛错 */
async function fetchCategory(subjectType: number): Promise<BgmItem[]> {
	const order = preferred
		? [preferred, ...API_URLS.filter((u) => u !== preferred)]
		: [...API_URLS];
	const errors: string[] = [];
	for (const apiUrl of order) {
		let lastErr: unknown;
		for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
			try {
				const items = await fetchCategoryFrom(apiUrl, subjectType);
				preferred = apiUrl;
				return items;
			} catch (err) {
				lastErr = err;
				// HTTP 4xx/5xx 重试也没用，直接换下一个镜像
				const retryable = !(err instanceof Error && /^HTTP \d+$/.test(err.message));
				if (!retryable || attempt === ATTEMPTS) break;
				await sleep(500);
			}
		}
		errors.push(`${apiUrl} ${describe(lastErr)}`);
	}
	throw new Error(errors.join('；'));
}

/** 构建时拉全部分类；单个分类失败就用缓存或标 failed，别拖垮整次构建 */
export async function fetchAllCategories(): Promise<BgmCategory[]> {
	const cache = readCache();
	const now = Date.now();
	const results: BgmCategory[] = [];

	for (const cat of bangumiConfig.categories) {
		const hit = cache[cat.id];
		if (hit && now - hit.t < CACHE_TTL) {
			results.push({ ...cat, items: hit.items });
			continue;
		}
		try {
			const items = await fetchCategory(cat.subjectType);
			if (items.length) cache[cat.id] = { t: now, items };
			results.push({ ...cat, items });
		} catch (err) {
			console.warn(`[bangumi] ${cat.name} 拉取失败：${describe(err)}`);
			if (hit?.items.length) {
				console.warn(`[bangumi] ${cat.name} 改用上次成功的缓存快照`);
				results.push({ ...cat, items: hit.items });
			} else {
				results.push({ ...cat, items: [], failed: true });
			}
		}
	}

	writeCache(cache);
	return results;
}
