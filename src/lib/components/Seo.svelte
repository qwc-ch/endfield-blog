<script lang="ts">
	// 每页的 head 都从这里出：标题、描述、canonical、分享卡片、结构化数据。
	// 页面只传自己那一份内容，站点名、域名、作者从配置里取。
	import { profileConfig, siteConfig } from '#config';

	interface Props {
		/** 页面标题，站点名会自动接在后面；首页留空 */
		title?: string;
		/** 页面描述，不传就用站点描述 */
		description?: string;
		/** 站内路径，带尾斜杠，例如 /posts/foo/ */
		path: string;
		type?: 'website' | 'article';
		/** 文章发布 / 勘误日期（2026-08-19） */
		published?: string;
		updated?: string;
		/** 文章标签，会并进 keywords 和结构化数据 */
		tags?: string[];
		/** 文章分类 */
		section?: string;
		/** 额外的 JSON-LD（BlogPosting、BreadcrumbList 之类），不传就不写 */
		jsonLd?: Record<string, unknown> | Record<string, unknown>[];
	}

	let {
		title,
		description = siteConfig.description,
		path,
		type = 'website',
		published,
		updated,
		tags = [],
		section,
		jsonLd
	}: Props = $props();

	const base = $derived(siteConfig.url.replace(/\/$/, ''));
	const url = $derived(base + path);
	const fullTitle = $derived(title ? `${title} · ${siteConfig.title}` : siteConfig.title);
	const image = $derived(`${base}/og.png`);
	const keywords = $derived([...new Set([...tags, ...siteConfig.keywords])].join(','));

	// JSON-LD 用 @html 拼一段脚本标签：JSON 里的尖括号要转义，
	// 不然正文里出现结束标签会把整段截断。
	const ld = $derived(
		jsonLd
			? JSON.stringify({
					'@context': 'https://schema.org',
					'@graph': Array.isArray(jsonLd) ? jsonLd : [jsonLd]
				}).replace(/</g, '\\u003c')
			: ''
	);
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={url} />
	<meta name="keywords" content={keywords} />
	<meta name="author" content={profileConfig.name} />

	<meta property="og:type" content={type} />
	<meta property="og:site_name" content={siteConfig.title} />
	<meta property="og:locale" content="zh_CN" />
	<meta property="og:title" content={fullTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={url} />
	<meta property="og:image" content={image} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content={siteConfig.title} />

	{#if type === 'article' && published}
		<meta property="article:published_time" content={published} />
		{#if updated}<meta property="article:modified_time" content={updated} />{/if}
		{#if section}<meta property="article:section" content={section} />{/if}
		{#each tags as tag (tag)}
			<meta property="article:tag" content={tag} />
		{/each}
	{/if}

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={fullTitle} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={image} />

	<link rel="alternate" type="application/rss+xml" title="{siteConfig.title} · RSS" href="/rss.xml" />
	<link rel="alternate" type="application/atom+xml" title="{siteConfig.title} · Atom" href="/atom.xml" />

	{#if ld}{@html `<script type="application/ld+json">${ld}</script>`}{/if}
</svelte:head>
