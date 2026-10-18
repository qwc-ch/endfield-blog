<script lang="ts">
	import Records from '#lib/components/Records.svelte';
	import { categoryList, catId, formatNumber, formatPostDate, groupByYear, posts, totalWords } from '#lib/posts';
	import { siteConfig } from '#config';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const list = $derived(posts.filter((p) => p.category === data.category));
	const groups = $derived(groupByYear(list));
</script>

<svelte:head>
	<title>{data.category} · 文章 · {siteConfig.title}</title>
	<meta name="description" content="分类「{data.category}」下的全部文章，共 {list.length} 篇。" />
</svelte:head>

<div class="ef-spread">
	<section class="ef-sheet">
		<p class="ef-crumb ef-field"><a href="/posts/">全部文章</a><span>{data.category}</span></p>
		<header class="ef-sheet-head">
			<h1 class="ef-read">{data.category}</h1>
			<p class="ef-field">共 {list.length} 篇</p>
		</header>

		<p class="filters ef-actions">
			<a class="ef-chip" href="/posts/">全部 <span class="n">{posts.length}</span></a>
			{#each categoryList as cat (cat.name)}
				<a
					class="ef-chip"
					class:is-active={cat.name === data.category}
					aria-current={cat.name === data.category ? 'page' : undefined}
					href="/posts/c/{catId(cat.name)}/">{cat.name} <span class="n">{cat.count}</span></a
				>
			{/each}
		</p>

		{#if list.length === 0}
			<p class="ef-empty">这个分类下还没有文章。写好后会按发布顺序编号，列在这里。</p>
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
			<li><span>本分类字数</span><span class="ef-field">{formatNumber(list.reduce((s, p) => s + p.words, 0))} 字</span></li>
			<li><span>全站字数</span><span class="ef-field">{formatNumber(totalWords)} 字</span></li>
			{#if list[0]}
				<li><span>最新一篇</span><span class="ef-field">{formatPostDate(list[0].published)}</span></li>
			{/if}
		</ul>
	</aside>
</div>

<style>
	.filters {
		margin-top: 1.25rem;
	}
	.ef-margin :global(a) {
		color: inherit;
	}
</style>
