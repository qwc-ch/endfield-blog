<script lang="ts">
	// 最近文章的滚动条：两份列表首尾相接，悬停或聚焦即停。
	import { formatNo, type Post } from '#lib/posts';

	let { posts }: { posts: Post[] } = $props();

	const item = (p: Post, hidden: boolean) => ({ p, hidden });
	const copy = $derived(posts.map((p) => item(p, false)));
	const mirror = $derived(posts.map((p) => item(p, true)));
</script>

<div class="ef-ticker" aria-label="最近的文章">
	<div class="track">
		<ul>
			{#each copy as { p } (p.slug)}
				<li><a href="/posts/{p.slug}/"><b>{formatNo(p.no)}</b>{p.title}</a></li>
			{/each}
		</ul>
		<ul aria-hidden="true">
			{#each mirror as { p } (p.slug)}
				<li><a href="/posts/{p.slug}/" tabindex="-1"><b>{formatNo(p.no)}</b>{p.title}</a></li>
			{/each}
		</ul>
	</div>
</div>
