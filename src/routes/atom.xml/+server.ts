import { profileConfig, siteConfig } from '#config';
import { posts } from '#lib/posts';
import type { RequestHandler } from './$types';

export const prerender = true;

const esc = (s: string) =>
	s.replace(/&/g, String.fromCharCode(38) + 'amp;').replace(/</g, String.fromCharCode(38) + 'lt;').replace(/>/g, String.fromCharCode(38) + 'gt;');

export const GET: RequestHandler = () => {
	const entries = posts
		.map((p) => {
			const url = `${siteConfig.url}/posts/${encodeURIComponent(p.slug)}/`;
			const updated = p.updated ?? p.published;
			return `
	<entry>
		<title>${esc(p.title)}</title>
		<link href="${url}" />
		<id>${url}</id>
		<updated>${new Date(updated).toISOString()}</updated>
		<published>${new Date(p.published).toISOString()}</published>
		${p.description ? `<summary>${esc(p.description)}</summary>` : ''}
		<author><name>${esc(profileConfig.name)}</name></author>
	</entry>`;
		})
		.join('\n');

	const xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
	<title>${esc(siteConfig.title)}</title>
	<link href="${siteConfig.url}/atom.xml" rel="self" />
	<link href="${siteConfig.url}" />
	<id>${siteConfig.url}/</id>
	<updated>${new Date(posts[0]?.updated ?? posts[0]?.published ?? siteConfig.since).toISOString()}</updated>
	<author><name>${esc(profileConfig.name)}</name></author>${entries}
</feed>`;

	return new Response(xml, {
		headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' }
	});
};
