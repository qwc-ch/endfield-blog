<script lang="ts">
	import { posts, categoryList, totalWords } from '#lib/posts';
	import { profileConfig, siteConfig } from '#config';
</script>

<svelte:head>
	<title>关于 · {siteConfig.title}</title>
	<meta name="description" content={profileConfig.bio} />
</svelte:head>

<div class="ef-spread">
	<section class="ef-sheet">
		<p class="ef-eyebrow slash">About</p>
		<header class="ef-sheet-head">
			<h1 class="ef-read">关于</h1>
			<p class="ef-field">{profileConfig.name}</p>
		</header>

		<p class="ef-lede ef-read" style="margin-top: 1.25rem">{profileConfig.bio}</p>

		<figure class="ef-frame">
			<div class="window">
				<img src={profileConfig.avatar} alt="{profileConfig.name}的头像" loading="lazy" />
			</div>
		</figure>

		<p>
			这里是{profileConfig.name}的博客：{siteConfig.description}
			文章按发布顺序编号，改过的重要勘误会标在文章字段里。
		</p>

		<p class="ef-actions">
			{#each profileConfig.links as link (link.url)}
				<a class="ef-btn" href={link.url}>{link.name}</a>
			{/each}
			<a class="ef-btn" href="/rss.xml">订阅 RSS</a>
		</p>
	</section>

	<aside class="ef-margin">
		<h2 class="ef-pair"><span class="ef-eyebrow">Site</span><span>站点</span></h2>
		<ul class="ef-ledger">
			<li><span>站名</span><span class="ef-field">{siteConfig.title}</span></li>
			<li><span>域名</span><span class="ef-field">{siteConfig.url.replace('https://', '')}</span></li>
			<li><span>建站</span><span class="ef-field">{siteConfig.since.replaceAll('-', '.')}</span></li>
			<li><span>文章</span><span class="ef-field">{posts.length} 篇</span></li>
			<li><span>分类</span><span class="ef-field">{categoryList.length} 个</span></li>
			<li><span>字数</span><span class="ef-field">{totalWords.toLocaleString('en-US')} 字</span></li>
		</ul>

		<h2 class="ef-pair mid"><span class="ef-eyebrow">Built</span><span>构建</span></h2>
		<ul class="ef-ledger">
			<li><span>框架</span><span class="ef-field">SvelteKit（Vite）</span></li>
			<li><span>样式</span><span class="ef-field">Tailwind CSS</span></li>
			<li><span>字体</span><span class="ef-field">Saira / 思源黑体</span></li>
			<li><span>部署</span><span class="ef-field">静态导出</span></li>
		</ul>
	</aside>
</div>

<style>
	p {
		max-width: var(--ef-measure);
		line-height: 1.85;
	}
	.ef-frame {
		height: 16rem;
		max-width: 22rem;
		margin-top: 2rem;
	}
	.ef-margin :global(.mid) {
		margin-top: 2.5rem;
	}
</style>
