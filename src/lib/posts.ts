// 内容层：读取 src/content/posts 下的 markdown 文章。
// 编号、字数、阅读时长、分类全部从文件本身算出来，不手写。

import { postConfig } from '#config';

export interface PostFrontmatter {
	title: string;
	published: string;
	updated?: string;
	description?: string;
	tags?: string[];
	category?: string;
	draft?: boolean;
}

export interface Post {
	/** 文件名去掉 .md，即 URL */
	slug: string;
	/** 按发布先后编的号，从 No.001 起 */
	no: number;
	title: string;
	published: string;
	updated?: string;
	description: string;
	tags: string[];
	category: string;
	draft: boolean;
	/** 正文字数（汉字按字计，英文按词计） */
	words: number;
	/** 阅读时长（分钟） */
	minutes: number;
	/** mdsvex 编译出的 Svelte 组件 */
	component: unknown;
}

type MdModule = { metadata?: PostFrontmatter; default: unknown };

const compiled = import.meta.glob<MdModule>('/src/content/posts/*.md', { eager: true });
const raws = import.meta.glob<string>('/src/content/posts/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
});

/** 正文字数：去掉头注和代码块后，汉字按字数，连续的英文字母数字按词数 */
function countWords(file: string): number {
	const body = file.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
	const clean = body.replace(/```[\s\S]*?```/g, ' ').replace(/`[^`]*`/g, ' ');
	const cjk = clean.match(/[\u3400-\u9fff\uf900-\ufaff\u3040-\u30ff]/g)?.length ?? 0;
	const latin = clean.match(/[A-Za-z0-9]+/g)?.length ?? 0;
	return cjk + latin;
}

const slugOf = (path: string) => path.split('/').pop()!.replace(/\.md$/, '');

/** 头注里的日期：js-yaml 会把 2026-10-16 解析成 Date，统一转回 yyyy-mm-dd */
const iso = (v: unknown): string => {
	if (v instanceof Date) return v.toISOString().slice(0, 10);
	return String(v ?? '').slice(0, 10);
};

const built = Object.entries(compiled).map(([path, mod]) => {
	const fm: PostFrontmatter = mod.metadata ?? ({} as PostFrontmatter);
	const file = raws[path] ?? '';
	const words = countWords(file);
	return {
		slug: slugOf(path),
		no: 0,
		title: String(fm.title ?? slugOf(path)),
		published: iso(fm.published),
		updated: fm.updated ? iso(fm.updated) : undefined,
		description: String(fm.description ?? ''),
		tags: fm.tags ?? [],
		category: String(fm.category ?? '未分类'),
		draft: Boolean(fm.draft),
		words,
		minutes: Math.max(1, Math.ceil(words / postConfig.wordsPerMinute)),
		component: mod.default
	} satisfies Post;
});

// 按发布日期从早到晚排序，早的编号小
built.sort((a, b) => a.published.localeCompare(b.published) || a.slug.localeCompare(b.slug));
built.forEach((p, i) => (p.no = i + 1));

/** 全部已发布文章，新的在前 */
export const posts: Post[] = built.filter((p) => !p.draft).sort((a, b) => b.no - a.no);

export function getPost(slug: string): Post | undefined {
	return posts.find((p) => p.slug === slug);
}

/** 上一篇（更早）和下一篇（更新） */
export function getAdjacent(slug: string): { prev?: Post; next?: Post } {
	const i = posts.findIndex((p) => p.slug === slug);
	if (i === -1) return {};
	return { prev: posts[i + 1], next: posts[i - 1] };
}

/** 分类和数量，按数量从多到少 */
export const categoryList: { name: string; count: number }[] = [...posts.reduce((m, p) => {
	m.set(p.category, (m.get(p.category) ?? 0) + 1);
	return m;
}, new Map<string, number>())]
	.map(([name, count]) => ({ name, count }))
	.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

export const totalWords = posts.reduce((s, p) => s + p.words, 0);

/** 分类名 → URL 里用的编码 */
export const catId = (name: string) => encodeURIComponent(name);

/** 文章 slug → 站内地址（中文要编码，canonical 用得上） */
export const postPath = (slug: string) => `/posts/${encodeURIComponent(slug)}/`;

/** 按年分组（传入的列表需已按新的在前排序） */
export function groupByYear(list: Post[]): { year: number; posts: Post[] }[] {
	const out: { year: number; posts: Post[] }[] = [];
	for (const p of list) {
		const year = Number(p.published.slice(0, 4));
		const g = out.at(-1);
		if (g && g.year === year) g.posts.push(p);
		else out.push({ year, posts: [p] });
	}
	return out;
}

// ---------- 展示格式 ----------

/** 2026-10-18 → 2026.10.18 */
export function formatPostDate(iso: string): string {
	return iso.replaceAll('-', '.');
}

/** 1234 → 1,234 */
export function formatNumber(n: number): string {
	return n.toLocaleString('en-US');
}

/** 3 → No.003 */
export function formatNo(n: number): string {
	return `No.${String(n).padStart(3, '0')}`;
}

/** 自某日起，今天是第几天（当天算第 1 天），按东八区 */
export function daysSince(since: string): number {
	const start = Date.parse(`${since}T00:00:00+08:00`);
	const now = Date.parse(new Date().toISOString());
	return Math.max(1, Math.floor((now - start) / 86_400_000) + 1);
}
