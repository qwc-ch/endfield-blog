// 站点地图：全站可抓取的页面，构建时烘成静态 XML。
import { siteConfig } from '#config';
import { catId, categoryList, posts } from '#lib/posts';
import type { RequestHandler } from './$types';

export const prerender = true;

const esc = (s: string) =>
	s.replace(/&/g, String.fromCharCode(38) + 'amp;').replace(/</g, String.fromCharCode(38) + 'lt;');

export const GET: RequestHandler = () => {
	const base = siteConfig.url.replace(/\/$/, '');
	const now = new Date().toISOString().slice(0, 10);

	// 静态页 + 文章列表 + 分类页
	const staticPages: [string, string][] = [
		['/', now],
		['/posts/', now],
		['/dynamic/', now],
		['/circle/', now],
		['/friends/', now],
		['/guestbook/', now],
		['/timetable/', now],
		['/bangumi/', now],
		['/about/', now]
	];
	const categoryPages = categoryList.map(
		(c) => [`/posts/c/${catId(c.name)}/`, now] as [string, string]
	);
	// 文章页：最后改动 = 勘误日期或发布日期
	const postPages = posts.map(
		(p) => [`/posts/${encodeURIComponent(p.slug)}/`, (p.updated ?? p.published).slice(0, 10)] as [string, string]
	);

	const urls = [...staticPages, ...categoryPages, ...postPages]
		.map(
			([path, lastmod]) => `
	<url>
		<loc>${esc(base + path)}</loc>
		<lastmod>${lastmod}</lastmod>
	</url>`
		)
		.join('\n');

	const xml = `<?xml version="1.0" encoding="utf-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;

	return new Response(xml, {
		headers: { 'Content-Type': 'application/xml; charset=utf-8' }
	});
};
