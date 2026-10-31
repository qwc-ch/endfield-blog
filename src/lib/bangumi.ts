// 番组计划：配置、类型和纯函数（浏览器也会用到）。
// 真正的接口拉取在 bangumi.server.ts，只在构建时跑，页面不再请求接口。
// 改 userId / subjectBaseUrl / userBaseUrl 就能换账号或镜像。

export const bangumiConfig = {
	/** Bangumi 用户 ID */
	userId: '1186385',
	/** 条目详情页（镜像站） */
	subjectBaseUrl: 'https://bangumi.lat/subject/',
	/** 个人主页（镜像站） */
	userBaseUrl: 'https://bangumi.lat/user/',
	/** 分类与接口的 subject_type 对应：1 书籍 / 2 动画 / 3 音乐 / 4 游戏 */
	categories: [
		{ id: 'anime', name: '动画', en: 'Anime', subjectType: 2 },
		{ id: 'book', name: '书籍', en: 'Book', subjectType: 1 },
		{ id: 'music', name: '音乐', en: 'Music', subjectType: 3 },
		{ id: 'game', name: '游戏', en: 'Game', subjectType: 4 }
	] as const,
	/** 每页条数 / 单次构建最多拉多少条 */
	limit: 50,
	maxTotal: 1000
};

/** 收藏状态：1 想看 · 2 在看 · 3 看过（各分类叫法不同） */
export const STATUS_WORDS: Record<string, Record<number, string>> = {
	anime: { 1: '想看', 2: '在看', 3: '看过' },
	book: { 1: '想读', 2: '在读', 3: '读过' },
	music: { 1: '想听', 2: '在听', 3: '听过' },
	game: { 1: '想玩', 2: '在玩', 3: '玩过' }
};

export interface BgmSubject {
	id: number;
	name: string;
	name_cn?: string;
	date?: string;
	score?: number;
	images?: { common?: string; medium?: string };
}
export interface BgmItem {
	type: number;
	comment?: string;
	updated_at?: string;
	subject?: BgmSubject;
}
export interface BgmCategory {
	id: string;
	name: string;
	en: string;
	items: BgmItem[];
	failed?: boolean;
}

/** 组内排序：在看优先，其余按收藏更新时间倒序 */
export function sortItems(items: BgmItem[]): BgmItem[] {
	return [...items].sort((a, b) => {
		if ((a.type === 2) !== (b.type === 2)) return a.type === 2 ? -1 : 1;
		return (b.updated_at ?? '').localeCompare(a.updated_at ?? '');
	});
}

/** 收藏时间取到年月日 */
export function bgmDate(iso: string | undefined): string {
	return iso ? iso.slice(0, 10).replaceAll('-', '.') : '';
}
