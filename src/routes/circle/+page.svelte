<script lang="ts">
	// 朋友圈：友链们最新文章的卡片墙，样式按旧博客（Firefly）原版恢复——
	// 标题卡片、右下角头像水印、作者名签。数据构建时抓好烘进页面（/circle.json）。
	import { siteConfig } from '#config';
	import { formatPostDate } from '#lib/posts';
	import Built from '#lib/components/Built.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const stats = $derived(data.data.statistical_data);
	const articles = $derived(
		[...data.data.article_data].sort((a, b) => b.created.localeCompare(a.created))
	);

	// 每页 24 条，「加载更多」往后翻
	const PAGE_SIZE = 24;
	let shown = $state(PAGE_SIZE);
	// 随机一条：从最近 6 篇里挑，构建数据不变时刷新页面才换
	let pick = $state(0);

	const visible = $derived(articles.slice(0, shown));
	const recent = $derived(articles.slice(0, Math.min(6, articles.length)));
	const spotlight = $derived(recent[pick % Math.max(recent.length, 1)] ?? recent[0]);

	function more() {
		shown = Math.min(shown + PAGE_SIZE, articles.length);
	}
</script>

<svelte:head>
	<title>朋友圈 · {siteConfig.title}</title>
	<meta name="description" content="友链们最近在写什么，共收录 {articles.length} 篇。" />
</svelte:head>

<div class="ef-spread">
	<section class="ef-sheet">
		<p class="ef-eyebrow slash">Circle</p>
		<header class="ef-sheet-head">
			<h1 class="ef-read">朋友圈</h1>
			<p class="ef-field">共 {articles.length} 篇</p>
		</header>
		<p class="ef-lede ef-read" style="margin-top: 1.25rem">
			友链们最近在写的文章。构建的时候把大家的 RSS 各抓几篇最新的排在一起，点标题去原文。
		</p>
		<p class="ef-actions" style="margin-top: 1rem">
			<a class="ef-btn small" href="/friends/">
				全部友链
				<svg viewBox="0 0 24 24" aria-hidden="true">
					<path
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M5 12h14m-4 4 4-4m-4-4 4 4"
					/>
				</svg>
			</a>
		</p>

		{#if articles.length === 0}
			<p class="ef-notice" data-flag="注意" style="margin-top: 1.5rem">
				这次构建没抓到任何更新——多半是构建环境连不上朋友们的站点，等下次部署再试。
			</p>
		{:else}
			{#if spotlight}
				<p class="spotlight" data-flag="随机">
					<span class="spot-text">
						翻到 <a href={spotlight.link} target="_blank" rel="noopener noreferrer">{spotlight.author}</a>
						的文章：<a href={spotlight.link} target="_blank" rel="noopener noreferrer">{spotlight.title}</a>
					</span>
					<button
						class="refresh"
						onclick={() => { pick = pick + 1 + Math.floor(Math.random() * Math.max(recent.length - 1, 1)); }}
						title="换一条"
					>
						<svg viewBox="0 0 24 24" aria-hidden="true">
							<path
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M20 11A8.1 8.1 0 0 0 4.5 9M4 5v4h4m-4 4a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"
							/>
						</svg>
					</button>
				</p>
			{/if}

			<ul class="ef-facts ef-field stats">
				<li>友链 <strong>{stats.friends_num}</strong></li>
				<li>有更新 <strong>{stats.ok_num}</strong></li>
				<li>没抓到 <strong>{stats.error_num}</strong></li>
				<li>收录 <strong>{stats.article_num}</strong> 篇</li>
			</ul>

			<div class="grid">
				{#each visible as a (a.link)}
					<a class="card" href={a.link} target="_blank" rel="noopener noreferrer">
						<div class="card-body">
							<h3 class="title">{a.title}</h3>
						</div>
						<div class="card-foot">
							{#if a.avatar}
								<img src={a.avatar} alt="" class="mark" loading="lazy" />
							{/if}
							<span class="author">{a.author}</span>
							<span class="date ef-field">{formatPostDate(a.created.slice(0, 10))}</span>
						</div>
					</a>
				{/each}
			</div>

			{#if shown < articles.length}
				<div class="more">
					<button class="ef-btn" onclick={more}>加载更多</button>
				</div>
			{:else}
				<p class="end ef-field">到底了，共 {articles.length} 篇</p>
			{/if}
		{/if}
	</section>

	<aside class="ef-margin">
		<h2 class="ef-pair"><span class="ef-eyebrow">Stats</span><span>抓取</span></h2>
		<ul class="ef-ledger">
			<li><span>友链</span><span class="ef-field">{stats.friends_num} 个</span></li>
			<li><span>有更新</span><span class="ef-field">{stats.ok_num} 个</span></li>
			<li><span>没抓到</span><span class="ef-field">{stats.error_num} 个</span></li>
			<li><span>收录</span><span class="ef-field">{stats.article_num} 篇</span></li>
			<li><span>抓取时间</span><span class="ef-field">{formatPostDate(stats.last_updated_time.slice(0, 10))}</span></li>
		</ul>
		<h2 class="ef-pair mid"><span class="ef-eyebrow">Join</span><span>加入</span></h2>
		<p class="rule">
			友链里带 RSS 的会自动进朋友圈。想上墙的话，先去友链页看看交换规则。
		</p>
		<Built target={data.deployTarget} />
	</aside>
</div>

<style>
	/* 「全部友链」按钮里的箭头 */
	.ef-btn svg {
		width: 1rem;
		height: 1rem;
	}

	/* 随机一条：套件的提示条样子——白底细框，前面一面黄色小旗 */
	.spotlight {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		margin: 1.5rem 0 0;
		padding: 0.55rem 0.8rem;
		border: 1px solid var(--ef-ink);
		background: var(--ef-panel);
		color: var(--ef-ink-2);
		font-size: 0.85rem;
	}
	.spotlight::before {
		content: attr(data-flag);
		flex: none;
		padding: 0 0.4em;
		background: var(--ef-signal);
		color: var(--ef-on-signal);
		font-size: 0.75rem;
		font-weight: 700;
		line-height: 1.6;
	}
	.spot-text {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}
	.spotlight a {
		color: var(--ef-ink);
		font-weight: 500;
		text-decoration: underline;
		text-decoration-color: var(--ef-trace);
		text-underline-offset: 3px;
	}
	.refresh {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: 1.75rem;
		height: 1.75rem;
		padding: 0;
		border: 1px solid var(--ef-rule);
		background: transparent;
		color: var(--ef-ink-2);
		cursor: pointer;
		transition: color 0.15s, border-color 0.15s, transform 0.3s var(--ef-mech);
	}
	.refresh:hover {
		border-color: var(--ef-ink);
		color: var(--ef-ink);
		transform: rotate(180deg);
	}
	.refresh svg {
		width: 1rem;
		height: 1rem;
	}

	/* 统计行：套件的字段行，竖线分隔 */
	.stats {
		margin-top: 1.25rem;
	}
	.stats strong {
		color: var(--ef-ink);
		font-weight: 700;
	}

	/* 卡片墙：细线直角块，悬停描边加深，标题划线 */
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: 1rem;
		margin-top: 1.25rem;
	}
	.card {
		position: relative;
		display: flex;
		flex-direction: column;
		border: 1px solid var(--ef-rule);
		background: var(--ef-panel);
		color: inherit;
		text-decoration: none;
		transition: border-color 0.15s;
	}
	.card:hover,
	.card:focus-visible {
		border-color: var(--ef-ink);
	}
	.card-body {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1.1rem 1.1rem 0.9rem;
	}
	.title {
		display: -webkit-box;
		margin: 0;
		overflow: hidden;
		color: var(--ef-ink);
		font-family: var(--ef-font-text);
		font-size: 0.95rem;
		font-weight: 700;
		line-height: 1.55;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
	}
	.card:hover .title,
	.card:focus-visible .title {
		text-decoration: underline;
		text-decoration-color: var(--ef-trace);
		text-decoration-thickness: 2px;
		text-underline-offset: 4px;
	}
	/* 底部一行：小方头像 + 作者 + 日期，上缘细线分开 */
	.card-foot {
		position: relative;
		display: flex;
		align-items: center;
		gap: 0.45rem;
		margin: 0.75rem 1.1rem 0;
		padding: 0.55rem 0 0.7rem;
		border-top: 1px solid var(--ef-rule);
	}
	.card-foot:last-child {
		border-bottom: 0;
	}
	.card-body + .card-foot {
		margin-top: 0;
		padding-top: 0.55rem;
	}
	.mark {
		width: 1.25rem;
		height: 1.25rem;
		flex-shrink: 0;
		object-fit: cover;
		border: 1px solid var(--ef-rule);
		opacity: 0.85;
	}
	.author {
		min-width: 0;
		overflow: hidden;
		color: var(--ef-ink);
		font-size: 0.78rem;
		font-weight: 600;
		white-space: nowrap;
		text-overflow: ellipsis;
	}
	.date {
		flex-shrink: 0;
		margin-left: auto;
	}

	.more {
		display: flex;
		justify-content: center;
		padding: 1.75rem 0 0;
	}
	.end {
		margin: 1.75rem 0 0;
		text-align: center;
	}

	.ef-margin :global(.mid) {
		margin-top: 2.5rem;
	}
	.rule {
		max-width: 18rem;
		line-height: 1.75;
		color: var(--ef-ink-2);
	}

	@media (prefers-reduced-motion: reduce) {
		.refresh {
			transition: none;
		}
		.refresh:hover {
			transform: none;
		}
	}
</style>
