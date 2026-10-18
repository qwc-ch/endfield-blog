// 朋友圈数据：构建时抓一遍友链们的 RSS/Atom，各取最新几篇合成一条时间线。
// 抓取结果缓存在项目根 .circle-cache.json（12 小时），没过期直接用缓存，构建不拖沓。

import { XMLParser } from 'fast-xml-parser';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const xmlParser = new XMLParser({ ignoreAttributes: false, trimValues: true });

export interface CircleFriend {
	rss: string;
	author: string;
	avatar?: string;
}
export interface CircleArticle {
	title: string;
	link: string;
	created: string;
	author: string;
	avatar?: string;
}
export interface CircleData {
	statistical_data: {
		friends_num: number;
		ok_num: number;
		error_num: number;
		article_num: number;
		last_updated_time: string;
	};
	article_data: CircleArticle[];
}

const CACHE_FILE = resolve(process.cwd(), '.circle-cache.json');
const CACHE_TTL = 12 * 60 * 60 * 1000;
const PER_FRIEND = 3;
const TIMEOUT = 8000;
const CONCURRENCY = 12;

type CacheShape = Record<string, { t: number; items: CircleArticle[] }>;

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

/** 单个友链的 RSS 抓取 + 解析，失败返回空数组 */
async function fetchFeed(friend: CircleFriend): Promise<CircleArticle[]> {
	const ctrl = new AbortController();
	const timer = setTimeout(() => ctrl.abort(), TIMEOUT);
	try {
		const resp = await fetch(friend.rss, { signal: ctrl.signal, headers: { Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml' } });
		if (!resp.ok) return [];
		const xml = await resp.text();
		const doc = xmlParser.parse(xml);

		const out: CircleArticle[] = [];
		const rssItems: any[] = [].concat(doc?.rss?.channel?.item ?? []);
		for (const item of rssItems) {
			const title = typeof item.title === 'string' ? item.title : '';
			const link = typeof item.link === 'string' ? item.link : '';
			if (!title || !link) continue;
			out.push({
				title,
				link,
				created: new Date(item.pubDate || item['dc:date'] || item.date || 0).toISOString() || '',
				author: friend.author,
				avatar: friend.avatar
			});
		}
		const atomEntries: any[] = [].concat(doc?.feed?.entry ?? []);
		for (const entry of atomEntries) {
			const title = typeof entry.title === 'string' ? entry.title : '';
			const rawLink = [].concat(entry.link ?? [])[0];
			const link = typeof entry.link === 'string' ? entry.link : rawLink?.['@_href'] ?? '';
			if (!title || !link) continue;
			out.push({
				title,
				link,
				created: new Date(entry.updated || entry.published || 0).toISOString() || '',
				author: friend.author,
				avatar: friend.avatar
			});
		}
		return out
			.filter((a) => a.created && a.created !== '1970-01-01T00:00:00.000Z')
			.sort((a, b) => b.created.localeCompare(a.created))
			.slice(0, PER_FRIEND);
	} catch {
		return [];
	} finally {
		clearTimeout(timer);
	}
}

export async function aggregateCircle(friends: CircleFriend[]): Promise<CircleData> {
	const cache = readCache();
	const now = Date.now();
	const results: CircleArticle[][] = new Array(friends.length);
	let next = 0;

	async function worker() {
		while (next < friends.length) {
			const i = next++;
			const f = friends[i];
			const hit = cache[f.rss];
			if (hit && now - hit.t < CACHE_TTL) {
				results[i] = hit.items;
				continue;
			}
			const items = await fetchFeed(f);
			results[i] = items;
			if (items.length) cache[f.rss] = { t: now, items };
		}
	}
	await Promise.all(Array.from({ length: Math.min(CONCURRENCY, friends.length) }, worker));
	writeCache(cache);

	const articles = results
		.flat()
		.sort((a, b) => b.created.localeCompare(a.created))
		.map((a, i) => ({ ...a }));
	const ok = friends.filter((_, i) => results[i].length > 0).length;

	return {
		statistical_data: {
			friends_num: friends.length,
			ok_num: ok,
			error_num: friends.length - ok,
			article_num: articles.length,
			last_updated_time: new Date().toISOString()
		},
		article_data: articles
	};
}
