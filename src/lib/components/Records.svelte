<script lang="ts">
	// 文章列表的一行：编号 / 日期 / 标题 / 字数。
	import { formatNo, formatNumber, formatPostDate, type Post } from '#lib/posts';
	import { postConfig } from '#config';

	let { posts, come = false }: { posts: Post[]; come?: boolean } = $props();
</script>

<ol class="ef-records">
	{#each posts as post, i (post.slug)}
		<li>
			<a class="ef-record" class:ef-in-come={come} style={come ? `--i: ${i}` : undefined} href="/posts/{post.slug}/">
				<span class="ef-tag">{formatNo(post.no)}</span>
				<time class="ef-field" datetime={post.published}>{formatPostDate(post.published)}</time>
				<span class="name ef-read">{post.title}</span>
				{#if postConfig.showWordCount}
					<span class="ef-field">{formatNumber(post.words)} 字</span>
				{/if}
			</a>
		</li>
	{/each}
</ol>
