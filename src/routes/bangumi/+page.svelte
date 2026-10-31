<script lang="ts">
	// 番组计划：收藏在构建时拉取并烘进页面，打开页面直接读静态快照，不再请求接口。
	import { STATUS_WORDS, bangumiConfig, bgmDate, sortItems } from '#lib/bangumi';
	import { siteConfig } from '#config';
	import Built from '#lib/components/Built.svelte';
	import Seo from '#lib/components/Seo.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const categories = $derived(data.categories);
	const failed = $derived(categories.every((c) => c.failed));
	const total = $derived(categories.reduce((n, c) => n + c.items.length, 0));
</script>

<Seo title="番组计划" description="{siteConfig.title}在 Bangumi 的收藏。" path="/bangumi/" />

<div class="ef-spread">
	<section class="ef-sheet">
		<p class="ef-eyebrow slash">Bangumi</p>
		<header class="ef-sheet-head">
			<h1 class="ef-read">番组计划</h1>
			<p class="ef-field">{failed ? '构建时拉取失败' : `共 ${total} 条`}</p>
		</header>
		<p class="ef-lede ef-read" style="margin-top: 1.25rem">
			在 Bangumi 上的收藏记录，构建时同步一次，打开页面直接读烘好的快照。
		</p>

		{#if failed}
			<p class="ef-notice" data-flag="注意" style="margin-top: 1.5rem">
				构建时收藏拉取失败，可能是接口限流或网络不通，下次构建会再试。
			</p>
		{/if}

		{#each categories as cat (cat.id)}
			<section class="cat">
				<h2 class="ef-pair">
					<span class="ef-eyebrow">{cat.en}</span><span>{cat.name}</span>
					<span class="ef-field count">{cat.items.length} 条</span>
				</h2>

				{#if cat.failed && !failed}
					<p class="ef-field failed">这个分类构建时拉取失败，下次构建会再试。</p>
				{/if}

				{#each [2, 1, 3] as status (status)}
					{@const group = sortItems(cat.items.filter((i) => i.type === status))}
					{#if group.length}
						<p class="status ef-field">{STATUS_WORDS[cat.id]?.[status] ?? status} │ {group.length}</p>
						<ul class="rows">
							{#each group as item, i (item.subject?.id)}
								<li>
									<a
										class="row"
										href="{bangumiConfig.subjectBaseUrl}{item.subject?.id}"
										target="_blank"
										rel="noopener"
									>
										<img
											class="cover"
											src={item.subject?.images?.common ?? item.subject?.images?.medium}
											alt="{item.subject?.name_cn || item.subject?.name} 的封面"
											loading="lazy"
										/>
										<span class="name ef-read">{item.subject?.name_cn || item.subject?.name}</span>
										{#if item.comment}
											<span class="comment">{item.comment}</span>
										{/if}
										<span class="meta ef-field">
											{#if item.subject?.date}{item.subject.date.slice(0, 4)}{/if}
											{#if item.subject?.score} │ {item.subject.score.toFixed(1)}{/if}
											{#if item.updated_at} │ {bgmDate(item.updated_at)} 收藏{/if}
										</span>
										<span class="no ef-field">No.{String(i + 1).padStart(3, '0')}</span>
									</a>
								</li>
							{/each}
						</ul>
					{/if}
				{/each}

				{#if cat.items.length === 0 && !cat.failed}
					<p class="ef-field" style="margin-top: 0.5rem">这个分类还没有收藏。</p>
				{/if}
			</section>
		{/each}
	</section>

	<aside class="ef-margin">
		<h2 class="ef-pair"><span class="ef-eyebrow">Stats</span><span>计数</span></h2>
		<ul class="ef-ledger">
			{#each categories as cat (cat.id)}
				<li><span>{cat.name}</span><span class="ef-field">{cat.items.length} 条</span></li>
			{/each}
			{#if !failed}
				<li><span>合计</span><span class="ef-field">{total} 条</span></li>
			{/if}
		</ul>
		<h2 class="ef-pair mid"><span class="ef-eyebrow">Link</span><span>主页</span></h2>
		<p class="rule">
			完整主页在镜像站
			<a href="{bangumiConfig.userBaseUrl}{bangumiConfig.userId}" target="_blank" rel="noopener">bangumi.lat</a>，这边只同步收藏。
		</p>
		<Built target={data.deployTarget} />
	</aside>
</div>

<style>
	.cat {
		margin-top: 2.75rem;
	}
	.cat h2 {
		margin: 0 0 1rem;
	}
	.count {
		margin-left: auto;
	}
	.status {
		margin: 1.25rem 0 0.5rem;
		color: var(--ef-ink-2);
	}
	.failed {
		margin-top: 0.5rem;
		color: var(--ef-ink-2);
	}
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
		gap: 0 0.9rem;
		align-items: center;
		padding: 0.55rem 0.4rem;
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
	.row:is(:hover, :focus-visible) .name {
		transform: translateX(6px);
	}
	.name {
		transition: transform 0.25s var(--ef-snap);
		font-weight: 700;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.comment {
		grid-column: 2;
		color: var(--ef-ink-2);
		font-size: 0.8125rem;
		line-height: 1.5;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.meta {
		grid-column: 3;
		justify-self: end;
	}
	.no {
		display: none;
	}
	.cover {
		grid-row: span 2;
		width: 1.9rem;
		height: 2.6rem;
		object-fit: cover;
		border: 1px solid var(--ef-rule);
	}
	.row:not(:has(.comment)) .cover {
		grid-row: span 1;
	}
	@media (max-width: 719px) {
		.meta {
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
