<script lang="ts">
	// 友链页：卡片样式按旧博客（Firefly）原版恢复——描边卡片、圆头像、
	// 悬停展开站点封面；搜索和标签筛选的逻辑改用 Svelte 状态实现。
	import Comment from '#lib/components/Comment.svelte';
	import Built from '#lib/components/Built.svelte';
	import Seo from '#lib/components/Seo.svelte';
	import { friendsConfig, profileConfig, siteConfig } from '#config';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const list = $derived(
		friendsConfig
			.filter((f) => f.enabled !== false)
			.sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0) || a.title.localeCompare(b.title))
	);
	const withRss = $derived(list.filter((f) => f.rss).length);
	const allTags = $derived([...new Set(list.flatMap((f) => f.tags ?? []))].sort());

	let query = $state('');
	let tag = $state('all');

	const shown = $derived.by(() => {
		const q = query.trim().toLowerCase();
		if (!q && tag === 'all') return list;
		return list.filter((f) => {
			const tagOk = tag === 'all' || (f.tags ?? []).includes(tag);
			const text = `${f.title} ${f.desc ?? ''} ${(f.tags ?? []).join(' ')}`.toLowerCase();
			return tagOk && (!q || text.includes(q));
		});
	});

	const domain = (url: string) => url.replace(/^https?:\/\//, '').split(/[/?#]/)[0];
	const tagCount = (t: string) => list.filter((f) => (f.tags ?? []).includes(t)).length;
</script>

<Seo title="友链" description="朋友们的主页，共 {list.length} 个。" path="/friends/" />

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

		{#if list.length > 0}
			<div class="filter" style="margin-top: 1.75rem">
				<label class="ef-search">
					<input type="text" placeholder="搜索友链…" bind:value={query} />
				</label>
				<p class="ef-actions">
					<button class="ef-chip" aria-pressed={tag === 'all'} onclick={() => { tag = 'all' }}>全部 <span class="n">{list.length}</span></button>
					{#each allTags as t (t)}
						<button class="ef-chip" aria-pressed={tag === t} onclick={() => { tag = tag === t ? 'all' : t }}>{t} <span class="n">{tagCount(t)}</span></button>
					{/each}
				</p>
			</div>
		{/if}

		{#key tag}
			<div class="grid" style="margin-top: 1rem">
				{#if shown.length === 0}
					<p class="ef-empty none">没有匹配的友链，换个词试试。</p>
				{/if}
				{#each shown as f (f.siteurl)}
					<a
						class="card"
						href={f.siteurl}
						target="_blank"
						rel="noopener noreferrer"
						data-tags={(f.tags ?? []).join(',')}
					>
					{#if f.cover}
						<span class="cover is-loading">
							<span class="loader" aria-hidden="true"></span>
							<img
								class="cover-img"
								src={f.cover}
								alt={f.title}
								loading="lazy"
								decoding="async"
								onload={(e) => e.currentTarget.parentElement?.classList.remove('is-loading')}
								onerror={(e) => {
									const c = e.currentTarget.parentElement;
									c?.classList.remove('is-loading');
									c?.classList.add('is-error');
								}}
							/>
						</span>
					{/if}

					<span class="body">
						<span class="info">
							<span class="avatar">
								<img
									src={f.imgurl}
									alt={f.title}
									loading="lazy"
									decoding="async"
									onerror={(e) => e.currentTarget.closest('.avatar')?.classList.add('is-error')}
								/>
								<span class="avatar-fallback" aria-hidden="true">{f.title.charAt(0)}</span>
							</span>
							<span class="meta">
								<span class="name-row">
									<strong class="name" title={f.title}>{f.title}</strong>
									<svg class="jump" viewBox="0 0 24 24" aria-hidden="true">
										<path
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M7 17 17 7m0 0H8m9 0v9"
										/>
									</svg>
								</span>
								<span class="url" title={f.siteurl}>{domain(f.siteurl)}</span>
							</span>
						</span>

						<span class="divider" aria-hidden="true"></span>
						<span class="desc">{f.desc}</span>

						{#if f.tags && f.tags.length > 0}
							<span class="tags">
								{#each f.tags.slice(0, 3) as t (t)}
									<span class="tag">{t}</span>
								{/each}
							</span>
						{/if}
					</span>
				</a>
			{/each}
			</div>
		{/key}

		<p class="ef-actions" style="margin-top: 1.75rem">
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
		<Built target={data.deployTarget} />
	</aside>
</div>

<style>
	/* ---- 搜索和标签筛选：输入框与筛选块直接用套件部件 ---- */
	.filter {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	/* ---- 卡片网格 ---- */
	.grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
		padding: 0.25rem 0 0.5rem;
	}
	@media (max-width: 1024px) {
		.grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	@media (max-width: 640px) {
		.grid {
			grid-template-columns: 1fr;
		}
	}

	/* ---- 单张友链卡：细线直角块，悬停描边加深，不抬升不投影 ---- */
	.card {
		position: relative;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		border: 1px solid var(--ef-rule);
		background: transparent;
		color: var(--ef-ink);
		text-decoration: none;
		transition: border-color 0.15s, background-color 0.15s;
		animation: card-in 0.32s var(--ef-snap) both;
	}
	.card:hover,
	.card:focus-visible {
		border-color: var(--ef-ink);
		background: var(--ef-panel);
	}

	/* 悬停展开的站点封面 */
	.cover {
		position: relative;
		display: block;
		height: 0;
		opacity: 0;
		overflow: hidden;
		border-bottom: 1px solid var(--ef-rule);
		transition: height 0.25s var(--ef-mech), opacity 0.2s var(--ef-mech);
	}
	.card:hover .cover,
	.card:focus-visible .cover {
		height: 7rem;
		opacity: 1;
	}
	.cover-img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: top;
		transition: opacity 0.4s;
	}
	/* 封面加载时滚动的墨点 */
	.loader {
		--ballcolor: var(--ef-ink);
		--shadow: 0 0 #fff0;
		--shadowcolor: #fff0;
		position: absolute;
		top: calc(50% - 5px);
		left: calc(50% - 155px);
		display: none;
		width: 10px;
		height: 10px;
		border-radius: 50%;
		pointer-events: none;
	}
	.cover.is-loading .loader {
		display: block;
		animation: 2s linear infinite friendShadowRolling;
	}
	.cover.is-loading .cover-img {
		opacity: 0;
	}
	/* 这三个状态类是 JS 在加载出错时加的，Svelte 看不见，得用 :global 保住 */
	:global(.cover.is-error) {
		display: none;
	}

	.body {
		display: flex;
		flex: 1;
		flex-direction: column;
		padding: 0.875rem 1rem;
	}
	.info {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}
	.avatar {
		position: relative;
		width: 2.75rem;
		height: 2.75rem;
		flex-shrink: 0;
		overflow: hidden;
		border: 1px solid var(--ef-rule);
		background: transparent;
	}
	.avatar img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.avatar-fallback {
		position: absolute;
		inset: 0;
		display: none;
		align-items: center;
		justify-content: center;
		color: var(--ef-ink);
		font-size: 1.125rem;
		font-weight: 700;
	}
	:global(.avatar.is-error) img {
		display: none;
	}
	:global(.avatar.is-error) .avatar-fallback {
		display: flex;
	}

	.meta {
		display: flex;
			flex: 1;
		flex-direction: column;
		gap: 0.2rem;
		min-width: 0;
	}
	.name-row {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		min-width: 0;
	}
	.name {
		min-width: 0;
		overflow: hidden;
		color: var(--ef-ink);
		font-size: 1rem;
		font-weight: 700;
		line-height: 1.3;
		white-space: nowrap;
		text-overflow: ellipsis;
	}
	.jump {
		width: 0.875rem;
		height: 0.875rem;
		flex-shrink: 0;
		color: var(--ef-ink);
		opacity: 0;
		transform: translate(-3px, 3px);
		transition: opacity 0.2s, transform 0.2s;
	}
	.card:hover .jump,
	.card:focus-visible .jump {
		opacity: 1;
		transform: translate(0);
	}
	.url {
		overflow: hidden;
		color: var(--ef-ink-2);
		font-family: var(--ef-font-ui);
		font-size: 0.75rem;
		font-weight: 500;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
		text-overflow: ellipsis;
		transition: color 0.2s;
	}
	.card:hover .url {
		color: var(--ef-ink);
	}
	.divider {
		height: 1px;
		margin: 0.75rem 0 0.625rem;
		background: var(--ef-rule);
	}
	.desc {
		display: -webkit-box;
		overflow: hidden;
		color: var(--ef-ink-2);
		font-size: 0.8rem;
		line-height: 1.5;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
	}
	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
		margin-top: 0.5rem;
	}
	.tag {
		padding: 0.1rem 0.5rem;
		background: var(--ef-chip);
		color: var(--ef-ink-2);
		font-size: 0.65rem;
	}

	/* 空态：套件的空态就是一句完整的话 */
	.none {
		grid-column: 1 / -1;
		margin: 2.5rem 0 0;
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

	@keyframes card-in {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.card {
			animation: none;
		}
		.cover,
		.cover-img,
		.jump {
			transition: none;
		}
		.cover.is-loading .loader {
			animation: none;
			display: none;
		}
	}

	@keyframes friendShadowRolling {
		0% {
			box-shadow: var(--shadow), var(--shadow), var(--shadow), var(--shadow);
		}
		12% {
			box-shadow: 100px 0 var(--ballcolor), var(--shadow), var(--shadow), var(--shadow);
		}
		25% {
			box-shadow: 110px 0 var(--ballcolor), 100px 0 var(--ballcolor), var(--shadow), var(--shadow);
		}
		36% {
			box-shadow: 120px 0 var(--ballcolor), 110px 0 var(--ballcolor), 100px 0 var(--ballcolor), var(--shadow);
		}
		50% {
			box-shadow: 130px 0 var(--ballcolor), 120px 0 var(--ballcolor), 110px 0 var(--ballcolor), 100px 0 var(--ballcolor);
		}
		62% {
			box-shadow: 200px 0 var(--shadowcolor), 130px 0 var(--ballcolor), 120px 0 var(--ballcolor), 110px 0 var(--ballcolor);
		}
		75% {
			box-shadow: 200px 0 var(--shadowcolor), 200px 0 var(--shadowcolor), 130px 0 var(--ballcolor), 120px 0 var(--ballcolor);
		}
		87% {
			box-shadow: 200px 0 var(--shadowcolor), 200px 0 var(--shadowcolor), 200px 0 var(--shadowcolor), 130px 0 var(--ballcolor);
		}
		to {
			box-shadow: 200px 0 var(--shadowcolor), 200px 0 var(--shadowcolor), 200px 0 var(--shadowcolor), 200px 0 var(--shadowcolor);
		}
	}
</style>
