// robots：全站放开 + 指向站点地图，域名跟着 siteConfig 走。
import { siteConfig } from '#config';
import type { RequestHandler } from './$types';

export const prerender = true;

export const GET: RequestHandler = () => {
	const base = siteConfig.url.replace(/\/$/, '');
	const body = `# 全站允许抓取
User-agent: *
Disallow:

Sitemap: ${base}/sitemap.xml
`;
	return new Response(body, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' }
	});
};
