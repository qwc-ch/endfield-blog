// 全站预渲染 + 页脚要用的运行天数（预渲染时算好写进 HTML）。
// trailingSlash: always → 产物是 目录/index.html，跟站内 /posts/ 这类链接一致，
// 任何静态托管都能直接命中，不走 308 重定向。
import { siteConfig } from '#config';
import { daysSince } from '#lib/posts';
import type { LayoutLoad } from './$types';

export const prerender = true;
export const trailingSlash = 'always';

export const load: LayoutLoad = () => {
	return { days: daysSince(siteConfig.since) };
};
