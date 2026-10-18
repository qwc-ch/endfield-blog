<script lang="ts">
	// 朋友圈：友链们的最新文章，按时间排成一条线。数据构建时抓好烘进页面。
	import { siteConfig } from '#config';
	import { formatPostDate } from '#lib/posts';
	import type { CircleData } from '#lib/circle';

	let { data }: { data: { data: CircleData } } = $props();

	const stats = $derived(data.data.statistical_data);
	const articles = $derived(data.data.article_data);

	const siteOf = (link: string) => {
		try {
			return new URL(link).host;
		} catch {
			return '';
		}
	};
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
			<p class="ef-field">收录 {articles.length} 篇</p>
		</header>
		<p class="ef-lede ef-read" style="margin-top: 1.25rem">
			友链们最近在写的文章。构建的时候把大家的 RSS 各抓几篇最新的排在一起，点标题去原文。
		</p>

		{#if articles.length === 0}
			<p class="ef-notice" data-flag="注意" style="margin-top: 1.5rem">
				这次构建没抓到任何更新——多半是构建环境连不上朋友们的站点，等下次部署再试。
			</p>
		{:else}
			<ul class="rows" style="margin-top: 1.5rem">
				{#each articles as a (a.link)}
					<li>
						<a class="row" href={a.link} target="_blank" rel="noopener">
							<img class="avatar" src={a.avatar} alt="{a.author}的头像" loading="lazy" />
							<span class="who">
								<span class="title ef-read">{a.title}</span>
								<span class="by ef-field">{a.author} · {siteOf(a.link)}</span>
							</span>
							<span class="date ef-field">{formatPostDate(a.created.slice(0, 10))}</span>
						</a>
					</li>
				{/each}
			</ul>
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
	</aside>
</div>

<style>
	.rows {
		margin: 0;
		padding: 0;
		list-style: none;
		border-top: 1px solid var(--ef-rule);
	}
	.rows > li {
		border-bottom: 1px solid var(--ef-rule);
	}
	.row {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		gap: 0 1rem;
		align-items: center;
		padding: 0.65rem 0.5rem;
		position: relative;
		transition: background-color 0.15s;
	}
	.row::before {
		content: '';
		position: absolute;
		inset: 0 auto 0 0;
		width: 4px;
		background: var(--ef-trace);
		transform: scaleY(0);
		transform-origin: top;
		transition: transform 0.2s var(--ef-snap);
	}
	.row:is(:hover, :focus-visible) {
		background: var(--ef-paper);
	}
	.row:is(:hover, :focus-visible)::before {
		transform: none;
	}
	.row:is(:hover, :focus-visible) .title {
		transform: translateX(6px);
	}
	.title {
		transition: transform 0.25s var(--ef-snap);
		font-weight: 700;
		line-height: 1.4;
		display: block;
	}
	.by {
		display: block;
		margin-top: 0.15rem;
		color: var(--ef-ink-3);
	}
	.avatar {
		width: 2.25rem;
		height: 2.25rem;
		object-fit: cover;
		border: 1px solid var(--ef-rule);
	}
	.date {
		justify-self: end;
	}
	@media (max-width: 719px) {
		.date {
			display: none;
		}
	}
	.ef-margin :global(.mid) {
		margin-top: 2.5rem;
	}
	.rule {
		max-width: 18rem;
		line-height: 1.75;
		color: var(--ef-ink-2);
	}
</style>
