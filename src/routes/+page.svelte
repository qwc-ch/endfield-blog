<script lang="ts">
	import Records from '#lib/components/Records.svelte';
	import Ticker from '#lib/components/Ticker.svelte';
	import Built from '#lib/components/Built.svelte';
	import Seo from '#lib/components/Seo.svelte';
	import { categoryList, catId, formatNo, formatNumber, formatPostDate, posts, totalWords } from '#lib/posts';
	import { profileConfig, siteConfig } from '#config';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const latest = $derived(posts[0]);
	const latestNo = $derived(latest ? String(latest.no).padStart(3, '0') : '000');

	// 首页的结构化数据：站点 + 作者
	const base = siteConfig.url.replace(/\/$/, '');
	const ld = [
		{
			'@type': 'WebSite',
			'@id': `${base}/#website`,
			url: `${base}/`,
			name: siteConfig.title,
			description: siteConfig.description,
			inLanguage: 'zh-CN',
			author: { '@id': `${base}/#person` }
		},
		{
			'@type': 'Person',
			'@id': `${base}/#person`,
			name: profileConfig.name,
			url: `${base}/about/`,
			image: profileConfig.avatar,
			sameAs: profileConfig.links.map((l) => l.url).filter((u) => u.startsWith('http'))
		}
	];

	onMount(async () => {
		const { wireParallax, wireReadouts } = await import('#lib/fx');
		wireReadouts(document);
		wireParallax(document.querySelector('[data-hero]'));
	});
</script>

<Seo path="/" jsonLd={ld} />

<section class="hero" data-hero>
	<p class="meta ef-field">
		<time>{data.today}</time>
		<span>第 <b data-fx-load>{data.days}</b> 天</span>
		<span><b data-fx-load>{posts.length}</b> 篇</span>
		<span><b data-fx-load>{formatNumber(totalWords)}</b> 字</span>
	</p>

	<h1 class="ef-wordmark" style="--ef-wordmark: clamp(2.75rem, 7.5vw, 6rem)">
		<span class="solid ef-in-drive">{siteConfig.title}</span>
		<span class="hollow ef-in-drive" style="animation-delay: 140ms" aria-hidden="true">{siteConfig.titleLatin}</span>
	</h1>

	<div class="copy">
		<p class="claim"><span class="ef-marker ef-in-stroke">{siteConfig.subtitle}</span></p>
		<p class="bio">{siteConfig.description}</p>
		<p class="ef-actions">
			<a class="ef-btn go" href="/posts/{latest.slug}/">读最新一篇 <span class="sub">{formatNo(latest.no)}</span></a>
			<a class="ef-btn" href="/posts/">全部文章</a>
			<a class="ef-btn" href="/about/">关于本站</a>
		</p>
	</div>

	<figure class="ef-frame">
		<div class="window">
			<a class="art" href="/posts/{latest.slug}/" data-fx-host>
				<span class="ef-hollow-no" aria-hidden="true" data-fx>{latestNo}</span>
				<span class="art-title">{latest.title}</span>
				<span class="ef-field">{formatPostDate(latest.published)} / {formatNumber(latest.words)} 字</span>
			</a>
		</div>
		<figcaption class="ef-plate">最新发布，点开就读。</figcaption>
	</figure>

	<Ticker posts={posts.slice(0, 6)} />
</section>

<section class="index">
	<div class="list">
		<p class="ef-eyebrow slash">Posts</p>
		<h2 class="ef-bar-title">全部文章</h2>
		<Records {posts} come />
		<p class="ef-actions">
			<a class="ef-btn" href="/posts/">按时间看全部</a>
		</p>
	</div>
	<aside class="side">
		<h2 class="ef-pair"><span class="ef-eyebrow">Categories</span><span>分类</span></h2>
		<ul class="ef-ledger">
			{#each categoryList as cat (cat.name)}
				<li>
					<a href="/posts/c/{catId(cat.name)}/">
						<span>{cat.name}</span>
						<span class="ef-field">{cat.count} 篇</span>
					</a>
				</li>
			{/each}
		</ul>
		<Built target={data.deployTarget} />
	</aside>
</section>

<style>
	/* ---------- 首屏（展示页） ---------- */
	.hero {
		--mx: 0;
		--my: 0;
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 42%);
		grid-template-rows: auto 1fr auto auto;
		column-gap: clamp(1.5rem, 4vw, 3.5rem);
		min-height: min(44rem, calc(100dvh - 3px));
		padding-top: 1.25rem;
		border-bottom: 1px solid var(--ef-rule);
		overflow: hidden;
	}
	.hero > :global(.meta) {
		grid-column: 1;
		margin: 0;
		padding-inline: var(--ef-pad);
	}
	.hero > :global(.meta > * + *)::before {
		content: '/';
		margin-inline: 0.75em;
		color: var(--ef-rule);
	}
	.hero > :global(.ef-wordmark) {
		grid-column: 1;
		align-self: end;
		margin-top: 2rem;
		padding-left: var(--ef-pad);
	}
	.copy {
		grid-column: 1;
		padding: 1.75rem var(--ef-pad) 2.25rem;
	}
	.copy p {
		margin: 0;
	}
	.claim {
		font-size: clamp(1.15rem, 2.2vw, 1.6rem);
	}
	.bio {
		max-width: 30rem;
		margin-top: 0.9rem !important;
		color: var(--ef-ink-2);
	}
	.hero :global(.ef-actions) {
		margin-top: 1.5rem;
	}
	.hero > :global(.ef-frame) {
		grid-column: 2;
		grid-row: 1 / 4;
		margin: 0 var(--ef-pad) 2.25rem 0;
	}
	.hero :global(.ef-frame)::before {
		transform: translate(calc(var(--mx) * 12px), calc(var(--my) * 10px));
	}
	.hero > :global(.ef-ticker) {
		grid-column: 1 / -1;
	}

	/* 画框里的主视觉：最新一篇的编号、标题和字段 */
	.art {
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		gap: 0.9rem;
		height: 100%;
		padding: clamp(1.25rem, 3vw, 2rem);
		/* 底部让位给收进框内的铭牌，日期字段不被压住 */
		padding-bottom: 3.75rem;
	}
	.art-title {
		font-weight: 800;
		font-size: clamp(1.2rem, 2vw, 1.7rem);
		line-height: 1.3;
	}
	.art:hover .art-title {
		text-decoration: underline;
		text-decoration-color: var(--ef-trace);
	}

	/* ---------- 索引段 ---------- */
	.index {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 18rem);
		gap: clamp(1.5rem, 4vw, 4rem);
		padding: clamp(2rem, 4vw, 3rem) var(--ef-pad) 4rem;
	}
	.index .side h2 {
		margin: 0 0 0.75rem;
	}
	.index .side a {
		color: inherit;
	}
	.index .ef-actions {
		margin-top: 1.25rem;
	}

	@media (max-width: 959px) {
		.index {
			grid-template-columns: minmax(0, 1fr);
		}
	}
	@media (max-width: 899px) {
		.hero {
			grid-template-columns: minmax(0, 1fr);
			grid-template-rows: none;
			min-height: 0;
		}
		.hero > :global(.meta),
		.hero > :global(.ef-wordmark),
		.copy {
			grid-column: 1;
		}
		.hero > :global(.ef-frame) {
			grid-column: 1;
			grid-row: auto;
			height: 18rem;
			margin: 0 calc(var(--ef-pad) + 1rem) 2.25rem var(--ef-pad);
		}
	}
</style>
