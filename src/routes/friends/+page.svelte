<script lang="ts">
	import Comment from '#lib/components/Comment.svelte';
	import { friendsConfig, profileConfig, siteConfig } from '#config';

	const list = $derived(
		friendsConfig
			.filter((f) => f.enabled !== false)
			.sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0) || a.title.localeCompare(b.title))
	);
	const withRss = $derived(list.filter((f) => f.rss).length);

	const domain = (url: string) => url.replace(/^https?:\/\//, '').replace(/\/$/, '');
</script>

<svelte:head>
	<title>友链 · {siteConfig.title}</title>
	<meta name="description" content="朋友们的主页，共 {list.length} 个。" />
</svelte:head>

<div class="ef-spread">
	<section class="ef-sheet">
		<p class="ef-eyebrow slash">Friends</p>
		<header class="ef-sheet-head">
			<h1 class="ef-read">友链</h1>
			<p class="ef-field">共 {list.length} 个</p>
		</header>
		<p class="ef-lede ef-read" style="margin-top: 1.25rem">
			常逛的一些主页。想交换友链的话，去留言页说一声，或者直接发邮件。
		</p>

		<ul class="list">
			{#each list as f (f.siteurl)}
				<li>
					<a class="row" href={f.siteurl} target="_blank" rel="noopener">
						<img class="avatar" src={f.imgurl} alt="{f.title}的头像" loading="lazy" />
						<span class="who">
							<span class="name ef-read">{f.title}</span>
							{#if f.desc}
								<span class="desc">{f.desc}</span>
							{/if}
						</span>
						<span class="site ef-field">{domain(f.siteurl)}</span>
						{#if f.rss}
							<span class="ef-state">朋友圈</span>
						{/if}
					</a>
				</li>
			{/each}
		</ul>

		<p class="ef-actions">
			<a class="ef-btn" href="/guestbook/">去留言页申请</a>
			{#each profileConfig.links as link (link.url)}
				<a class="ef-btn" href={link.url}>{link.name}</a>
			{/each}
		</p>

		<section class="comments">
			<h2 class="ef-pair"><span class="ef-eyebrow">Comments</span><span>友链留言</span></h2>
			<!-- 旧博客友链页的评论挂在 /friends/，path 保持一致才能继承 -->
			<Comment path="/friends/" />
		</section>
	</section>

	<aside class="ef-margin">
		<h2 class="ef-pair"><span class="ef-eyebrow">Stats</span><span>统计</span></h2>
		<ul class="ef-ledger">
			<li><span>友链</span><span class="ef-field">{list.length} 个</span></li>
			<li><span>进朋友圈的</span><span class="ef-field">{withRss} 个</span></li>
		</ul>
		<h2 class="ef-pair mid"><span class="ef-eyebrow">Rules</span><span>交换</span></h2>
		<p class="rule">
			站点能正常访问、内容是你自己在写，就可以交换。把名字、地址、一句话介绍和头像发我，朋友圈那一栏还需要你的 RSS 地址。
		</p>
	</aside>
</div>

<style>
	.list {
		margin: 1.5rem 0 0;
		padding: 0;
		list-style: none;
		border-top: 1px solid var(--ef-rule);
	}
	.list > li {
		border-bottom: 1px solid var(--ef-rule);
	}
	.row {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto auto;
		gap: 0 1rem;
		align-items: center;
		padding: 0.7rem 0.6rem;
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
	.row:is(:hover, :focus-visible) > * {
		transform: translateX(6px);
	}
	.row > * {
		transition: transform 0.25s var(--ef-snap);
	}
	.avatar {
		width: 2.5rem;
		height: 2.5rem;
		object-fit: cover;
		border: 1px solid var(--ef-rule);
	}
	.who {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		min-width: 0;
	}
	.name {
		font-weight: 700;
	}
	.desc {
		color: var(--ef-ink-2);
		font-size: 0.8125rem;
		line-height: 1.5;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.site {
		justify-self: end;
	}
	@media (max-width: 719px) {
		.row {
			grid-template-columns: auto minmax(0, 1fr) auto;
		}
		.site {
			display: none;
		}
	}

	.ef-actions {
		margin-top: 1.5rem;
	}
	.comments {
		margin-top: 3rem;
	}
	.comments h2 {
		margin: 0 0 1rem;
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
