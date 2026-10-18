<script lang="ts">
	import Comment from '#lib/components/Comment.svelte';
	import { guestbookConfig, siteConfig } from '#config';
</script>

<svelte:head>
	<title>留言 · {siteConfig.title}</title>
	<meta name="description" content="给{siteConfig.title}留句话。" />
</svelte:head>

<div class="ef-spread">
	<section class="ef-sheet">
		<p class="ef-eyebrow slash">Guestbook</p>
		<header class="ef-sheet-head">
			<h1 class="ef-read">留言</h1>
			<p class="ef-field">随便说点什么</p>
		</header>
		<p class="ef-lede ef-read" style="margin-top: 1.25rem">
			这里只有一条留言规则：说人话。留言和文章评论走同一套系统，头像是评论服务生成的。
		</p>

		{#each guestbookConfig.announcements as a (a.id)}
			<section class="notice">
				<h2 class="ef-pair"><span class="ef-eyebrow">Notice</span><span>{a.title}</span></h2>
				<p class="ef-notice" data-flag="注意">{a.summary}</p>
				{#if a.lead}
					<p class="lead">{a.lead}</p>
				{/if}
				{#if a.rules.length}
					<ol>
						{#each a.rules as rule (rule)}
							<li>{rule}</li>
						{/each}
					</ol>
				{/if}
			</section>
		{/each}

		<section class="comments">
			<h2 class="ef-pair"><span class="ef-eyebrow">Comments</span><span>留言板</span></h2>
			<!-- 旧博客的群聊留言板用的就是 /guestbook/ 这个 path，留言数据原样继承 -->
			<Comment path="/guestbook/" />
		</section>
	</section>

	<aside class="ef-margin">
		<h2 class="ef-pair"><span class="ef-eyebrow">Elsewhere</span><span>别处找我</span></h2>
		<p class="rule">
			留言板适合公开的短消息。长一点的、私一点的事情，直接发邮件比在这里说更快。
		</p>
	</aside>
</div>

<style>
	.notice {
		margin-top: 2.5rem;
	}
	.notice h2 {
		margin: 0 0 0.75rem;
	}
	.lead {
		margin: 1rem 0 0;
		color: var(--ef-ink-2);
	}
	.notice ol {
		margin: 0.5rem 0 0;
		padding-left: 1.4rem;
		line-height: 1.9;
		color: var(--ef-ink-2);
	}
	.comments {
		margin-top: 3rem;
	}
	.comments h2 {
		margin: 0 0 1rem;
	}
	.ef-margin .rule {
		max-width: 18rem;
		line-height: 1.75;
		color: var(--ef-ink-2);
	}
</style>
