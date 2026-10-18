import { siteConfig } from '#config';
import { posts } from '#lib/posts';
import type { RequestHandler } from './$types';

export const prerender = true;

const esc = (s: string) => s.replace(/&/g, String.fromCharCode(38)+'amp;').replace(/</g, String.fromCharCode(38)+'lt;').replace(/>/g, String.fromCharCode(38)+'gt;');

export const GET: RequestHandler = () => {
	const items = posts
		.map(
			(p) => `
		<item>
			<title>${esc(p.title)}</title>
			<link>${siteConfig.url}/posts/${encodeURIComponent(p.slug)}/</link>
			<guid>${siteConfig.url}/posts/${encodeURIComponent(p.slug)}/</guid>
			<pubDate>${new Date(p.published).toUTCString()}</pubDate>
			${p.description ? `<description>${esc(p.description)}</description>` : ''}
		</item>`
		)
		.join('\n');

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
	<channel>
		<title>${esc(siteConfig.title)}</title>
		<link>${siteConfig.url}</link>
		<description>${esc(siteConfig.description)}</description>
		<language>zh-CN</language>${items}
	</channel>
</rss>`;

	return new Response(xml, {
		headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' }
	});
};
