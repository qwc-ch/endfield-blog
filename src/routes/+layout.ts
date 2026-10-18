// 全站预渲染 + 页脚要用的运行天数（预渲染时算好写进 HTML）。
import { siteConfig } from '#config';
import { daysSince } from '#lib/posts';
import type { LayoutLoad } from './$types';

export const prerender = true;

export const load: LayoutLoad = () => {
	return { days: daysSince(siteConfig.since) };
};
