<script lang="ts">
	// 动态流：数据来自自建 Memos（浏览器端直接拉），样式按旧博客（Firefly）原版恢复——
	// 头像 + 名字 + 时间 + 地点的卡片头、引号装饰、图集网格、每条动态下面自己的评论区。
	// 每条动态的评论 path 是 /dynamic/<id>/，和旧博客一致，旧评论能直接对上。
	import { onMount } from 'svelte';
	import Comment from '#lib/components/Comment.svelte';
	import { dynamicConfig, profileConfig, siteConfig } from '#config';
	import { marked } from 'marked';
	import Built from '#lib/components/Built.svelte';
	import Seo from '#lib/components/Seo.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const renderer = new marked.Renderer();
	renderer.image = () => ''; // 图片单独提取，不重复出现在正文里
	renderer.link = ({ href, title, tokens }) => {
		const text = renderer.parser.parseInline(tokens);
		const t = title ? ` title="${title}"` : '';
		return `<a href="${href}"${t} target="_blank" rel="noopener noreferrer">${text}</a>`;
	};
	marked.use({ gfm: true, breaks: true, renderer });

	interface MemosResp {
		memos?: Memo[];
		nextPageToken?: string;
	}
	interface Memo {
		name: string;
		creator: string;
		state?: string;
		createTime: string;
		content: string;
		pinned?: boolean;
		location?: { placeholder?: string };
		attachments?: { name: string; filename: string; type: string; externalLink?: string }[];
	}
	interface Img {
		src: string;
		alt: string;
	}
	interface Entry {
		id: string;
		time: Date;
		html: string;
		text: string;
		images: Img[];
		location: string;
		pinned: boolean;
	}

	let entries: Entry[] = $state([]);
	let loading = $state(true);
	let failed = $state(false);

	// 筛选：关键词 + 年份
	let query = $state('');
	let year = $state('all');
	let years = $state<string[]>([]);

	// 分页：每页 20 条，和旧博客一致
	const PAGE_SIZE = 20;
	let page = $state(1);

	// 每条动态的评论区开关（打开才挂 Waline，免得一次拉几十个）
	let opened = $state<Record<string, boolean>>({});

	// 图集查看器
	let viewer: { list: Img[]; i: number } | null = $state(null);

	const toHtml = (md: string) => marked.parse(md) as string;

	/** 提取纯文本给搜索用（原版 memos-adapter 的做法） */
	const plainText = (md: string) =>
		md
			.replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
			.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
			.replace(/<[^>]+>/g, ' ')
			.replace(/[#>*_`~[\]()-]/g, ' ')
			.replace(/\s+/g, ' ')
			.trim();

	const imagesOf = (memo: Memo) => {
		const out: Img[] = [];
		for (const t of marked.lexer(memo.content)) {
			if (t.type === 'image' && t.href) out.push({ src: new URL(t.href, dynamicConfig.memos.apiUrl).href, alt: t.text || '' });
		}
		for (const a of memo.attachments ?? []) {
			if (a.type?.startsWith('image/')) {
				const id = a.name.split('/').pop() || '';
				out.push({ src: a.externalLink || `${dynamicConfig.memos.apiUrl}/file/attachments/${id}/${a.filename}`, alt: a.filename });
			}
		}
		return out;
	};

	onMount(async () => {
		const { memos } = dynamicConfig;
		try {
			const all: Memo[] = [];
			let token = '';
			for (let p = 0; p < 10; p++) {
				const url = new URL(`${memos.apiUrl}/api/v1/memos`);
				url.searchParams.set('pageSize', '10000');
				if (memos.parent) url.searchParams.set('parent', memos.parent);
				if (token) url.searchParams.set('pageToken', token);
				const resp = await fetch(url, { headers: { Accept: 'application/json' } });
				if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
				const data: MemosResp = await resp.json();
				all.push(...(data.memos ?? []));
				if (!data.nextPageToken) break;
				token = data.nextPageToken;
			}
			const list = all
				.filter((m) => m.state !== 'ARCHIVED' && (!memos.parent || m.creator === memos.parent))
				.map((m) => ({
					id: m.name.split('/').pop() || '',
					time: new Date(m.createTime),
					html: toHtml(m.content),
					text: plainText(m.content),
					images: imagesOf(m),
					location: m.location?.placeholder?.trim() || '',
					pinned: !!m.pinned
				}))
				.sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.time.getTime() - a.time.getTime());
			entries = list;
			years = [...new Set(list.map((e) => String(e.time.getFullYear())))].sort().reverse();
		} catch {
			failed = true;
		} finally {
			loading = false;
		}
	});

	const filtered = $derived(
		entries.filter(
			(e) =>
				(year === 'all' || String(e.time.getFullYear()) === year) &&
				(!query.trim() || e.text.toLowerCase().includes(query.trim().toLowerCase()))
		)
	);
	const totalPages = $derived(Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
	const pageEntries = $derived(filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));

	function goTo(p: number) {
		page = Math.min(Math.max(1, p), totalPages);
		const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		document.querySelector('.ef-sheet')?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
	}

	/** 页码序列：1 … 中间 … 末页 */
	function pageList(): (number | '…')[] {
		const total = totalPages;
		if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
		const out: (number | '…')[] = [1];
		const left = Math.max(2, page - 1);
		const right = Math.min(total - 1, page + 1);
		if (left > 2) out.push('…');
		for (let i = left; i <= right; i++) out.push(i);
		if (right < total - 1) out.push('…');
		out.push(total);
		return out;
	}

	function openViewer(list: Img[], i: number) {
		viewer = { list, i };
	}
	function closeViewer() {
		viewer = null;
	}
	function step(d: number) {
		if (!viewer) return;
		viewer = { ...viewer, i: (viewer.i + d + viewer.list.length) % viewer.list.length };
	}

	function onViewerKey(ev: KeyboardEvent) {
		if (!viewer) return;
		if (ev.key === 'Escape') closeViewer();
		else if (ev.key === 'ArrowLeft') step(-1);
		else if (ev.key === 'ArrowRight') step(1);
	}

	const fmtDate = (d: Date) =>
		d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
</script>

<Seo title="动态" description="{siteConfig.title}的动态与随手记。" path="/dynamic/" />

<svelte:window onkeydown={onViewerKey} />

<div class="ef-spread">
	<section class="ef-sheet">
		<p class="ef-eyebrow slash">Moments</p>
		<header class="ef-sheet-head">
			<h1 class="ef-read">动态</h1>
			<p class="ef-field">{loading ? '加载中' : failed ? '加载失败' : `共 ${entries.length} 条`}</p>
		</header>
		<p class="ef-lede ef-read" style="margin-top: 1.25rem">
			随手记、截图、碎碎念。源头是我的 Memos，写完就自动出现在这里。
		</p>

		{#if !loading && !failed && entries.length > 0}
			<div class="filter">
				<label class="ef-search">
					<input type="search" placeholder="搜动态…" bind:value={query} oninput={() => (page = 1)} />
				</label>
				<label class="yearsel">
					<select bind:value={year} aria-label="按年份筛选" onchange={() => (page = 1)}>
						<option value="all">全部年份</option>
						{#each years as y (y)}
							<option value={y}>{y}</option>
						{/each}
					</select>
				</label>
			</div>
		{/if}

		{#if loading}
			<div class="wait" role="status">
				<span class="hatch" aria-hidden="true"></span>
				<p class="ef-read">正在拉取动态…</p>
			</div>
		{:else if failed}
			<p class="ef-notice" data-flag="注意" style="margin-top: 2rem">动态拉取失败，可能是网络问题，稍后再试。</p>
		{:else if entries.length === 0}
			<p class="ef-read empty">还没有动态，去 Memos 写一条试试。</p>
		{:else if filtered.length === 0}
			<p class="ef-read empty">没有匹配的动态，换个词试试。</p>
		{:else}
			<ul class="feed">
				{#each pageEntries as e (e.id)}
					<li class="entry" id="dynamic-{e.id}">
						<article>
							<header class="ehead">
								<a class="avatar" href="/about/" aria-label="{profileConfig.name}的主页">
									<img src={profileConfig.avatar} alt={profileConfig.name} loading="lazy" />
								</a>
								<div class="idc">
									<a class="author" href="/about/"><strong>{profileConfig.name}</strong></a>
									<div class="meta">
										<a class="etime ef-field" href="#dynamic-{e.id}">{fmtDate(e.time)}</a>
										{#if e.location}
											<span class="loc">
												<svg viewBox="0 0 24 24" aria-hidden="true">
													<path
														fill="currentColor"
														d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z"
													/>
												</svg>
												<span>{e.location}</span>
											</span>
										{/if}
									</div>
								</div>
								{#if e.pinned}
									<span class="pinned">
										<svg viewBox="0 0 24 24" aria-hidden="true">
											<path
												fill="currentColor"
												d="M16 9V4h1c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3Z"
											/>
										</svg>
										置顶
									</span>
								{/if}
								<span class="quote" aria-hidden="true">
									<svg viewBox="0 0 24 24">
										<path fill="currentColor" d="M6 17h3l2-4V7H5v6h3Zm8 0h3l2-4V7h-6v6h3Z" />
									</svg>
								</span>
							</header>

							<div class="body ef-read">{@html e.html}</div>

							{#if e.images.length}
								<div class="gallery" data-count={e.images.length} data-layout={e.images.length === 1 ? 'single' : 'grid'}>
									{#each e.images.slice(0, 6) as img, i (img.src)}
										<button class="shot" onclick={() => openViewer(e.images, i)} aria-label="查看图片">
											<img src={img.src} alt={img.alt} loading="lazy" />
											{#if i === 5 && e.images.length > 6}
												<span class="more-mark">+{e.images.length - 6}</span>
											{/if}
										</button>
									{/each}
								</div>
							{/if}

							<div class="inline-c">
								<button class="c-toggle" aria-expanded={!!opened[e.id]} onclick={() => (opened[e.id] = !opened[e.id])}>
									<svg viewBox="0 0 24 24" aria-hidden="true">
										<path
											fill="currentColor"
											d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2Z"
										/>
									</svg>
									评论
									<svg class="chev" class:flip={!!opened[e.id]} viewBox="0 0 24 24" aria-hidden="true">
										<path fill="currentColor" d="M16.59 8.59 12 13.17 7.41 8.59 6 10l6 6 6-6Z" />
									</svg>
								</button>
								{#if opened[e.id]}
									<div class="c-panel">
										<!-- 旧博客每条动态的评论挂在 /dynamic/<id>/，path 一致才能继承 -->
										<Comment path="/dynamic/{e.id}/" />
									</div>
								{/if}
							</div>
						</article>
					</li>
				{/each}
			</ul>

			{#if totalPages > 1}
				<nav class="pager" aria-label="动态分页">
					<button class="pg" disabled={page === 1} onclick={() => goTo(page - 1)}>上一页</button>
					{#each pageList() as p, i (i)}
						{#if p === '…'}
							<span class="dots">…</span>
						{:else}
							<button class="pg num" class:cur={p === page} aria-current={p === page ? 'page' : undefined} onclick={() => goTo(p)}>
								{p}
							</button>
						{/if}
					{/each}
					<button class="pg" disabled={page === totalPages} onclick={() => goTo(page + 1)}>下一页</button>
				</nav>
			{/if}
		{/if}
	</section>

	<aside class="ef-margin">
		<h2 class="ef-pair"><span class="ef-eyebrow">Source</span><span>来源</span></h2>
		<p class="rule">
			动态全部来自 Memos 的时间线，直接拉接口，不经过构建。置顶的那几条会排在最前面，每条下面可以单独评论。
		</p>
		<Built target={data.deployTarget} />
	</aside>
</div>

<!-- 图集查看器 -->
{#if viewer}
	<div class="viewer" role="dialog" aria-modal="true" aria-label="图片查看" tabindex="-1">
		<button class="v-backdrop" aria-label="关闭查看器" onclick={closeViewer}></button>
		<button class="v-close" onclick={closeViewer} aria-label="关闭">
			<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12Z" /></svg>
		</button>
		{#if viewer.list.length > 1}
			<button class="v-nav prev" onclick={() => step(-1)} aria-label="上一张">
				<svg viewBox="0 0 24 24"><path fill="currentColor" d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12Z" /></svg>
			</button>
		{/if}
		<figure>
			<img src={viewer.list[viewer.i].src} alt={viewer.list[viewer.i].alt} />
			{#if viewer.list.length > 1}
				<figcaption class="ef-field">{viewer.i + 1} / {viewer.list.length}</figcaption>
			{/if}
		</figure>
		{#if viewer.list.length > 1}
			<button class="v-nav next" onclick={() => step(1)} aria-label="下一张">
				<svg viewBox="0 0 24 24"><path fill="currentColor" d="M8.59 16.59 10 18l6-6-6-6-1.41 1.41L13.17 12Z" /></svg>
			</button>
		{/if}
	</div>
{/if}

<style>
	/* ---- 筛选行 ---- */
	.filter {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.75rem;
		margin-top: 1.75rem;
	}
	.ef-search {
		flex: 1;
		min-width: 12rem;
	}
	.yearsel select {
		padding: 0.625rem 2.25rem 0.625rem 1rem;
		border: 1px solid var(--ef-rule);
		background: var(--ef-panel);
		color: var(--ef-ink);
		font: inherit;
		font-size: 0.9rem;
		cursor: pointer;
		outline: none;
	}
	.yearsel select:focus-visible {
		border-color: var(--ef-ink);
		outline: 2px solid var(--ef-trace);
		outline-offset: -1px;
	}

	/* ---- 加载与空态 ---- */
	.wait {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.9rem;
		padding: 3rem 1rem;
		color: var(--ef-ink-2);
	}
	/* 处理中铺斜线纹 */
	.hatch {
		width: min(100%, 22rem);
		height: 1.5rem;
		background: var(--ef-hatch);
		border: 1px solid var(--ef-rule);
	}
	.empty {
		margin: 2.5rem 0 0;
		color: var(--ef-ink-2);
	}

	/* ---- 动态卡片 ---- */
	.feed {
		display: grid;
		gap: 0.875rem;
		margin: 1.5rem 0 0;
		padding: 0;
		list-style: none;
	}
	.entry {
		border: 1px solid var(--ef-rule);
		padding: 1.125rem;
		scroll-margin-top: 4rem;
	}
	.ehead {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		min-width: 0;
	}
	.avatar {
		width: 3rem;
		height: 3rem;
		flex: 0 0 3rem;
		overflow: hidden;
		border: 1px solid var(--ef-rule);
	}
	.avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
	.idc {
		display: flex;
		flex: 1;
		flex-direction: column;
		min-width: 0;
	}
	.author {
		width: fit-content;
		max-width: 100%;
		color: var(--ef-ink);
		text-decoration: none;
		overflow: hidden;
	}
	.author:hover {
		text-decoration: underline;
		text-decoration-color: var(--ef-trace);
	}
	.author strong {
		display: block;
		overflow: hidden;
		font-size: 0.95rem;
		line-height: 1.4;
		white-space: nowrap;
		text-overflow: ellipsis;
	}
	.meta {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		min-width: 0;
	}
	.etime {
		flex: 0 0 auto;
		color: var(--ef-ink-2);
		text-decoration: none;
	}
	.etime:hover {
		color: var(--ef-ink);
		text-decoration: underline;
	}
	.loc {
		display: inline-flex;
		align-items: center;
		gap: 0.15rem;
		min-width: 0;
		color: var(--ef-ink-2);
		font-size: 0.78rem;
		line-height: 1.5;
	}
	.loc svg {
		width: 1rem;
		height: 1rem;
		flex: 0 0 auto;
	}
	.loc span {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}
	.pinned {
		display: inline-flex;
		align-items: center;
		gap: 0.2rem;
		margin-left: auto;
		padding: 0.125rem 0.45rem;
		background: var(--ef-signal);
		color: var(--ef-on-signal);
		font-size: 0.7rem;
		font-weight: 700;
		line-height: 1.5;
	}
	.pinned svg {
		width: 0.8rem;
		height: 0.8rem;
	}
	.quote {
		display: inline-flex;
		width: 2.5rem;
		height: 2.5rem;
		flex: 0 0 2.5rem;
		align-items: center;
		justify-content: center;
		color: var(--ef-trace);
		opacity: 0.35;
		pointer-events: none;
	}
	.quote svg {
		width: 1.5rem;
		height: 1.5rem;
	}

	.body {
		margin: 0.875rem 0 0 3.75rem;
		font-size: 0.98rem;
		line-height: 1.75;
		overflow-wrap: anywhere;
	}
	.body :global(p) {
		margin: 0 0 0.5rem;
	}
	.body :global(ul),
	.body :global(ol),
	.body :global(blockquote),
	.body :global(pre) {
		margin: 0.75rem 0;
	}
	.body :global(> :first-child) {
		margin-top: 0;
	}
	.body :global(> :last-child) {
		margin-bottom: 0;
	}
	.body :global(a) {
		color: var(--ef-ink);
		text-decoration: underline;
		text-decoration-color: var(--ef-trace);
	}
	.body :global(code) {
		font-family: var(--ef-font-mono);
		font-size: 0.85em;
		background: color-mix(in srgb, var(--ef-ink) 6%, transparent);
		padding: 0.1em 0.35em;
	}
	.body :global(blockquote) {
		border-left: 2px solid var(--ef-rule);
		padding-left: 0.75rem;
		color: var(--ef-ink-2);
	}

	/* ---- 图集（原版 page-gallery-grid 的布局规则） ---- */
	.gallery {
		display: grid;
		width: min(100%, 42rem);
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.25rem;
		margin: 0.875rem 0 0 3.75rem;
	}
	.gallery[data-count='2'],
	.gallery[data-count='4'] {
		width: min(100%, 28rem);
	}
	.gallery[data-count='5'],
	.gallery[data-count='6'] {
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}
	.gallery[data-count='3'] {
		grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
	}
	.gallery[data-count='5'] {
		grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr);
	}
	.gallery[data-count='3'] .shot:first-child,
	.gallery[data-count='5'] .shot:first-child {
		grid-row: span 2;
		aspect-ratio: auto;
	}
	.gallery[data-layout='single'] {
		display: block;
		width: fit-content;
		max-width: 100%;
	}
	.gallery[data-layout='single'] .shot {
		width: fit-content;
		max-width: 100%;
		aspect-ratio: auto;
		background: transparent;
	}
	.shot {
		position: relative;
		display: block;
		margin: 0;
		padding: 0;
		border: 0;
		aspect-ratio: 1;
		overflow: hidden;
		background: color-mix(in srgb, var(--ef-ink) 5%, transparent);
		cursor: zoom-in;
	}
	.shot img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.gallery[data-layout='single'] .shot img {
		width: auto;
		max-width: min(100%, 36rem);
		max-height: min(32rem, 65vh);
		height: auto;
		object-fit: contain;
	}
	.more-mark {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		background: rgb(0 0 0 / 55%);
		color: #fff;
		font-size: 1.5rem;
		font-weight: 600;
	}

	/* ---- 每条动态的评论区 ---- */
	.inline-c {
		margin: 0.875rem 0 0 3.75rem;
	}
	.c-toggle {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.3rem 0.75rem;
		border: 1px solid var(--ef-rule);
		background: transparent;
		color: var(--ef-ink-2);
		font: inherit;
		font-size: 0.8rem;
		cursor: pointer;
		transition: border-color 0.15s, color 0.15s;
	}
	.c-toggle:hover,
	.c-toggle[aria-expanded='true'] {
		border-color: var(--ef-ink);
		color: var(--ef-ink);
	}
	.c-toggle svg {
		width: 1rem;
		height: 1rem;
	}
	.c-toggle .chev {
		transition: transform 0.2s var(--ef-snap);
	}
	.c-toggle .chev.flip {
		transform: rotate(180deg);
	}
	.c-panel {
		margin-top: 0.75rem;
		padding-top: 0.75rem;
		border-top: 1px solid var(--ef-rule);
	}

	/* ---- 分页 ---- */
	.pager {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		margin-top: 2rem;
	}
	.pg {
		min-width: 2.4rem;
		padding: 0.35rem 0.75rem;
		border: 1px solid var(--ef-rule);
		background: transparent;
		color: var(--ef-ink-2);
		font: inherit;
		font-size: 0.85rem;
		font-variant-numeric: tabular-nums;
		cursor: pointer;
		transition: border-color 0.15s, color 0.15s, background-color 0.15s;
	}
	.pg:hover:not(:disabled) {
		border-color: var(--ef-ink);
		color: var(--ef-ink);
	}
	.pg.cur {
		background: var(--ef-ink);
		border-color: var(--ef-ink);
		color: var(--ef-panel);
	}
	.pg:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
	.dots {
		color: var(--ef-ink-2);
		padding: 0 0.25rem;
	}

	/* ---- 手机上：头部的引号装饰和缩进收掉 ---- */
	@media (max-width: 640px) {
		.quote {
			display: none;
		}
		.body,
		.gallery,
		.inline-c {
			margin-left: 0;
		}
	}

	/* ---- 图集查看器 ---- */
	.viewer {
		position: fixed;
		inset: 0;
		z-index: 60;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2.5rem;
		background: color-mix(in srgb, var(--ef-ink) 88%, transparent);
		animation: v-in 0.2s var(--ef-mech) both;
	}
	@keyframes v-in {
		from {
			opacity: 0;
		}
	}
	.viewer figure {
		margin: 0;
		max-width: min(92vw, 64rem);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}
	.viewer img {
		max-width: 100%;
		max-height: 82vh;
		object-fit: contain;
	}
	.viewer figcaption {
		color: rgb(255 255 255 / 75%);
	}
	.v-close,
	.v-nav {
		display: grid;
		place-items: center;
		width: 2.75rem;
		height: 2.75rem;
		padding: 0;
		border: 1px solid rgb(255 255 255 / 35%);
		background: transparent;
		color: #fff;
		cursor: pointer;
		transition: background-color 0.15s;
	}
	/* 铺满全屏的关闭层：点空白处关掉，图片和按钮都浮在它上面 */
	.v-backdrop {
		position: absolute;
		inset: 0;
		padding: 0;
		border: 0;
		background: transparent;
		cursor: zoom-out;
	}
	.viewer figure {
		position: relative;
		z-index: 1;
	}
	.v-close,
	.v-nav {
		z-index: 2;
	}
	.v-close:hover,
	.v-nav:hover {
		background: rgb(255 255 255 / 12%);
	}
	.v-close svg,
	.v-nav svg {
		width: 1.4rem;
		height: 1.4rem;
	}
	.v-close {
		position: absolute;
		top: 1rem;
		right: 1rem;
	}
	.v-nav.prev {
		position: absolute;
		left: 1rem;
	}
	.v-nav.next {
		position: absolute;
		right: 1rem;
	}

	.rule {
		max-width: 18rem;
		line-height: 1.75;
		color: var(--ef-ink-2);
	}

	@media (prefers-reduced-motion: reduce) {
		.viewer {
			animation: none;
		}
		.c-toggle .chev {
			transition: none;
		}
	}
</style>
