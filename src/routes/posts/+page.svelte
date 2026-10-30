<script lang="ts">
	import Records from '#lib/components/Records.svelte';
	import Built from '#lib/components/Built.svelte';
	import Seo from '#lib/components/Seo.svelte';
	import { categoryList, catId, formatNumber, formatPostDate, groupByYear, posts, totalWords } from '#lib/posts';
	import { siteConfig } from '#config';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const groups = $derived(groupByYear(posts));
	const first = $derived(posts.at(-1));
	const last = $derived(posts[0]);
</script>

<Seo
	title="文章"
	description="全部文章，按发布时间排，最新的在最前面。"
	path="/posts/"
/>

<div class="ef-spread">
	<section class="ef-sheet">
		<p class="ef-eyebrow slash">Posts</p>
		<header class="ef-sheet-head">
			<h1 class="ef-read">文章</h1>
			<p class="ef-field">共 {posts.length} 篇</p>
		</header>

		<p class="filters ef-actions">
			<a class="ef-chip is-active" href="/posts/" aria-current="page">全部 <span class="n">{posts.length}</span></a>
			{#each categoryList as cat (cat.name)}
				<a class="ef-chip" href="/posts/c/{catId(cat.name)}/">{cat.name} <span class="n">{cat.count}</span></a>
			{/each}
		</p>

		{#if posts.length === 0}
			<p class="ef-empty">还没有发布文章。写好的文章会按发布顺序编号，列在这里。</p>
		{:else}
			{#each groups as group (group.year)}
				<h2 class="ef-group-head"><span>{group.year}</span><span class="ef-field">{group.posts.length} 篇</span></h2>
				<Records posts={group.posts} />
			{/each}
		{/if}
	</section>

	<aside class="ef-margin">
		<h2 class="ef-pair"><span class="ef-eyebrow">Stats</span><span>统计</span></h2>
		<ul class="ef-ledger">
			<li><span>字数合计</span><span class="ef-field">{formatNumber(totalWords)} 字</span></li>
			{#if first}
				<li><span>最早一篇</span><span class="ef-field">{formatPostDate(first.published)}</span></li>
			{/if}
			{#if last}
				<li><span>最新一篇</span><span class="ef-field">{formatPostDate(last.published)}</span></li>
			{/if}
		</ul>

		<h2 class="ef-pair mid"><span class="ef-eyebrow">Categories</span><span>分类</span></h2>
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
</div>

<style>
	.filters {
		margin-top: 1.25rem;
	}
	.ef-margin :global(.mid) {
		margin-top: 2.5rem;
	}
	.ef-margin :global(a) {
		color: inherit;
	}
	.ef-margin :global(a:hover span:first-child) {
		color: var(--ef-ink);
	}
</style>
