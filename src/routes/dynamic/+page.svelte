<script lang="ts">
	// 动态流：数据来自自建 Memos（浏览器端直接拉），置顶在前、时间倒序。
	import { onMount } from 'svelte';
	import Comment from '#lib/components/Comment.svelte';
	import { dynamicConfig, siteConfig } from '#config';
	import { formatNumber } from '#lib/posts';
	import { marked } from 'marked';

	const renderer = new marked.Renderer();
	renderer.image = () => ''; // 图片单独提取，不重复出现在正文里
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
	interface Entry {
		id: string;
		no: number;
		time: Date;
		html: string;
		images: { src: string; alt: string }[];
		location: string;
		pinned: boolean;
	}

	let entries: Entry[] = $state([]);
	let loading = $state(true);
	let failed = $state(false);

	const toHtml = (md: string) => marked.parse(md) as string;

	const imagesOf = (memo: Memo) => {
		const out: { src: string; alt: string }[] = [];
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
			for (let page = 0; page < 10; page++) {
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
					images: imagesOf(m),
					location: m.location?.placeholder?.trim() || '',
					pinned: !!m.pinned
				}))
				.sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.time.getTime() - a.time.getTime());
			// 编号按时间正序，最早的一条是 No.001
			const chrono = [...list].sort((a, b) => a.time.getTime() - b.time.getTime());
			const noOf = new Map(chrono.map((e, i) => [e.id, i + 1]));
			entries = list.map((e) => ({ ...e, no: noOf.get(e.id) ?? 0 }));
		} catch {
			failed = true;
		} finally {
			loading = false;
		}
	});

	const pad = (n: number) => String(n).padStart(2, '0');
	const fmt = (d: Date) => `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
</script>

<svelte:head>
	<title>动态 · {siteConfig.title}</title>
	<meta name="description" content="{siteConfig.title}的动态与随手记。" />
</svelte:head>

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

		{#if failed}
			<p class="ef-notice" data-flag="注意" style="margin-top: 2rem">动态拉取失败，可能是网络问题，稍后再试。</p>
		{/if}

		<ul class="feed" style="margin-top: 1.5rem">
			{#each entries as e (e.id)}
				<li class="entry">
					<p class="head">
						<span class="ef-field no">No.{formatNumber(e.no)}</span>
						<span class="ef-field">{fmt(e.time)}</span>
						{#if e.pinned}
							<span class="ef-tag is-current">置顶</span>
						{/if}
						{#if e.location}
							<span class="ef-field loc">{e.location}</span>
						{/if}
					</p>
					<div class="body ef-prose">{@html e.html}</div>
					{#if e.images.length}
						<div class="pics" class:many={e.images.length > 1}>
							{#each e.images as img (img.src)}
								<a href={img.src} target="_blank" rel="noopener">
									<img src={img.src} alt={img.alt} loading="lazy" />
								</a>
							{/each}
						</div>
					{/if}
				</li>
			{/each}
		</ul>

		{#if !loading && !failed}
			<section class="comments">
				<h2 class="ef-pair"><span class="ef-eyebrow">Comments</span><span>说两句</span></h2>
				<!-- 旧博客动态评论挂在 /dynamic/，path 保持一致 -->
				<Comment path="/dynamic/" />
			</section>
		{/if}
	</section>

	<aside class="ef-margin">
		<h2 class="ef-pair"><span class="ef-eyebrow">Source</span><span>来源</span></h2>
		<p class="rule">
			动态全部来自 Memos 的时间线，直接拉接口，不经过构建。置顶的那几条会排在最前面。
		</p>
	</aside>
</div>

<style>
	.feed {
		margin: 0;
		padding: 0;
		list-style: none;
		border-top: 1px solid var(--ef-rule);
	}
	.entry {
		border-bottom: 1px solid var(--ef-rule);
		padding: 1.25rem 0.25rem 1.4rem;
	}
	.head {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.35rem 1rem;
		margin: 0 0 0.7rem;
	}
	.no {
		font-weight: 700;
		color: var(--ef-ink);
	}
	.loc {
		color: var(--ef-ink-3);
	}
	.body {
		max-width: var(--ef-measure);
		font-size: 0.9375rem;
	}
	.body :global(p) {
		margin: 0 0 0.6rem;
		line-height: 1.8;
	}
	.body :global(p:last-child) {
		margin-bottom: 0;
	}
	.body :global(a) {
		color: var(--ef-ink);
		text-decoration: underline;
		text-decoration-color: var(--ef-trace);
	}
	.pics {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: 0.9rem;
	}
	.pics a {
		display: block;
		border: 1px solid var(--ef-rule);
	}
	.pics img {
		display: block;
		width: 100%;
		height: 9rem;
		object-fit: cover;
	}
	.pics:not(.many) img {
		width: auto;
		max-width: min(100%, 26rem);
		height: auto;
		max-height: 16rem;
	}
	.pics.many a {
		width: 8.5rem;
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
