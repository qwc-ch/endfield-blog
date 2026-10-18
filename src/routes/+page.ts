// 首页需要的"今天"和运行天数（预渲染时算好，避免闪烁和hydration不一致）。
import { formatPostDate } from '#lib/posts';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { days } = await parent();
	return { days, today: formatPostDate(new Date().toISOString().slice(0, 10)) };
};
