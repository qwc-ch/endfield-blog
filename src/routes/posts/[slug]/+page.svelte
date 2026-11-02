<script lang="ts">
	import Built from '#lib/components/Built.svelte';
	import Comment from '#lib/components/Comment.svelte';
	import Records from '#lib/components/Records.svelte';
	import Tri from '#lib/components/Tri.svelte';
	import Seo from '#lib/components/Seo.svelte';
	import { catId, formatNo, formatNumber, formatPostDate, getPost, postPath, type Post } from '#lib/posts';
	import { licenseConfig, profileConfig, siteConfig } from '#config';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const post = $derived(getPost(data.slug) as Post);
	type AnyComponent = import('svelte').Component;
	const Comp = $derived(post.component as AnyComponent);
	const adjacent = $derived(
		[data.next, data.prev].filter((s): s is string => Boolean(s)).map((s) => getPost(s)!).filter(Boolean)
	);

	// 结构化数据：文章本体 + 面包屑（首页 / 分类 / 文章）
	const base = siteConfig.url.replace(/\/$/, '');
	const articleUrl = $derived(base + postPath(post.slug));
	const ld = $derived([
		{
			'@type': 'BlogPosting',
			'@id': `${articleUrl}#article`,
			headline: post.title,
			description: post.description,
			datePublished: post.published,
			dateModified: post.updated ?? post.published,
			inLanguage: 'zh-CN',
			articleSection: post.category,
			keywords: post.tags.join(','),
			wordCount: post.words,
			url: articleUrl,
			mainEntityOfPage: articleUrl,
			author: { '@type': 'Person', name: profileConfig.name, url: `${base}/about/` },
			publisher: { '@type': 'Organization', name: siteConfig.title, url: `${base}/` },
			isPartOf: { '@type': 'Blog', name: siteConfig.title, url: `${base}/posts/` }
		},
		{
			'@type': 'BreadcrumbList',
			itemListElement: [
				{ '@type': 'ListItem', position: 1, name: '首页', item: `${base}/` },
				{
					'@type': 'ListItem',
					position: 2,
					name: post.category,
					item: `${base}/posts/c/${catId(post.category)}/`
				},
				{ '@type': 'ListItem', position: 3, name: post.title }
			]
		}
	]);

	interface Heading {
		id: string;
		text: string;
		level: number;
	}
	let headings = $state<Heading[]>([]);
	let current = $state('');

	onMount(() => {
		// 从正文里取出标题，做页边的目录；滚动时标出正在读的那节
		const nodes = [...document.querySelectorAll<HTMLElement>('.ef-prose :is(h2, h3)[id]')];
		headings = nodes.map((h) => ({
			id: h.id,
			text: h.textContent ?? '',
			level: h.tagName === 'H2' ? 2 : 3
		}));
		const seen = new IntersectionObserver(
			(entries) => {
				for (const e of entries) {
					if (e.isIntersecting) current = e.target.id;
				}
			},
			{ rootMargin: '-12% 0px -78% 0px' }
		);
		nodes.forEach((h) => seen.observe(h));
		return () => seen.disconnect();
	});
</script>

<Seo
	title={post.title}
	description={post.description}
	path={postPath(post.slug)}
	type="article"
	published={post.published}
	updated={post.updated}
	tags={post.tags}
	section={post.category}
	jsonLd={ld}
/>

<div class="ef-spread">
	<article class="ef-sheet">
		<p class="ef-crumb ef-field">
			<a href="/posts/">全部文章</a>
			<a href="/posts/c/{catId(post.category)}/">{post.category}</a>
		</p>
		<p class="ids">
			<span class="ef-tag is-current">{formatNo(post.no)}</span>
			<a class="ef-kv" href="/posts/c/{catId(post.category)}/"><span>分类</span><span>{post.category}</span></a>
			{#if post.updated}
				<span class="ef-field">更新于 {formatPostDate(post.updated)}</span>
			{/if}
		</p>
		{#if post.tags.length}
			<p class="ef-field tags">标签 {post.tags.join(' / ')}</p>
		{/if}
		<ul class="ef-facts ef-field">
			<li><time datetime={post.published}>{formatPostDate(post.published)}</time></li>
			<li>{formatNumber(post.words)} 字</li>
			<li>约 {post.minutes} 分钟</li>
		</ul>
		<h1 class="title ef-read">{post.title}</h1>
		<Tri />
		{#if post.description}
			<p class="ef-lede ef-read">{post.description}</p>
		{/if}

		<div class="ef-prose">
			<Comp />
		</div>

		{#if licenseConfig.enabled}
			<section class="license" aria-label="版权">
				<p class="head">
					<span class="ef-eyebrow slash">License</span>
					<span class="ef-field">版权</span>
				</p>
				<p class="body">
					本文《{post.title}》由 <a href="/about/">{profileConfig.name}</a> 写，按 <a
						href={licenseConfig.url}
						target="_blank"
						rel="noopener noreferrer">{licenseConfig.name}</a
					> 协议发布。{licenseConfig.note}
				</p>
				<p class="ef-field src"><a href={articleUrl}>{articleUrl}</a></p>
			</section>
		{/if}

		{#if adjacent.length}
			<section class="nearby">
				<h2 class="ef-pair"><span class="ef-eyebrow">Nearby</span><span>上下篇</span></h2>
				<Records posts={adjacent} />
			</section>
		{/if}

		<section class="comments">
			<h2 class="ef-pair"><span class="ef-eyebrow">Comments</span><span>评论</span></h2>
			<!-- path 沿用旧博客（Firefly）的格式：/posts/文件名，不带尾斜杠，老评论才能对上 -->
			<Comment path={'/posts/' + data.slug} />
		</section>
	</article>

	<aside class="ef-margin">
		{#if headings.length}
			<nav class="toc" aria-label="目录">
				<h2 class="ef-pair"><span class="ef-eyebrow">Contents</span><span>目录</span></h2>
				<ol>
					{#each headings as h (h.id)}
						<li>
							<a
								href="#{h.id}"
								style="margin-left: {(h.level - 2) * 0.9}rem"
								aria-current={current === h.id ? 'true' : undefined}>{h.text}</a
							>
						</li>
					{/each}
				</ol>
			</nav>
		{/if}
		<ul class="ef-ledger mid">
			<li>
				<a href="/posts/c/{catId(post.category)}/">
					<span>分类</span>
					<span class="ef-field">{post.category}</span>
				</a>
			</li>
			<li><span>字数</span><span class="ef-field">{formatNumber(post.words)} 字</span></li>
			<li><span>阅读</span><span class="ef-field">约 {post.minutes} 分钟</span></li>
		</ul>
		<Built target={data.deployTarget} />
	</aside>
</div>

<style>
	.ids {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		margin: 0 0 0.75rem;
	}
	.tags {
		margin: 0 0 0.35rem;
	}
	.title {
		margin: 1.5rem 0 1rem;
		font-size: clamp(var(--ef-t-title), 5.5vw, var(--ef-t-h1));
		font-weight: 700;
		line-height: 1.25;
	}
	.ef-prose {
		margin-top: 2rem;
	}
	/* 版权卡片：正文读完的收尾，一块安静纸色 + 一道墨线，不抢正文 */
	.license {
		margin-top: 2.5rem;
		padding: 0.9rem 1.1rem;
		background: var(--ef-chip);
		border-left: 3px solid var(--ef-ink);
	}
	.license .head {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		margin: 0 0 0.35rem;
	}
	.license .body {
		margin: 0;
		max-width: var(--ef-measure-wide);
		font-size: 0.9375rem;
		line-height: 1.75;
		color: var(--ef-ink-2);
	}
	.license .src {
		margin: 0.4rem 0 0;
		word-break: break-all;
	}
	.license a {
		color: inherit;
		text-decoration: underline;
		text-decoration-color: var(--ef-signal);
		text-decoration-thickness: 0.35em;
		text-underline-offset: -0.16em;
		text-decoration-skip-ink: none;
	}
	.license a:hover {
		color: var(--ef-ink);
	}
	.nearby {
		margin-top: 3rem;
	}
	.nearby h2 {
		margin: 0 0 0.75rem;
	}
	.comments {
		margin-top: 3rem;
	}
	.comments h2 {
		margin: 0 0 1rem;
	}

	/* 页边的目录：正在读的那节用当前位置色线标出。
	   右栏不做吸附：跟随页面一起滚动，和页脚的距离固定不变，
	   滑动时不会再出现"能拉开"的空隙（吸附也是之前重叠的根源） */
	.toc {
		max-width: 18rem;
	}
	.toc h2 {
		margin: 0 0 0.75rem;
	}
	.toc ol {
		margin: 0;
		padding: 0;
		list-style: none;
		border-left: 1px solid var(--ef-rule);
	}
	.toc a {
		display: block;
		margin-left: -1px;
		padding: 0.28rem 0 0.28rem 0.9rem;
		border-left: 3px solid transparent;
		color: var(--ef-ink-2);
		font-size: 0.875rem;
		line-height: 1.5;
	}
	.toc a[aria-current] {
		color: var(--ef-ink);
		border-left-color: var(--ef-trace);
	}
	.ef-margin :global(.mid) {
		margin-top: 2.5rem;
	}
	.ef-margin :global(a) {
		color: inherit;
	}
</style>
