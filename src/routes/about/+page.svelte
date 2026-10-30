<script lang="ts">
	import { posts, categoryList, totalWords } from '#lib/posts';
	import { profileConfig, siteConfig } from '#config';
	import Built from '#lib/components/Built.svelte';
	import type { PageData } from './$types';

	// deployTarget 由根布局的 +layout.server.ts 在预渲染（构建）时识别好
	let { data }: { data: PageData } = $props();
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

		<!-- 旧站（Firefly）关于页里的自我介绍，原样搬过来 -->
		<p>
			Hello,everyone！我是{profileConfig.name}，一个喜欢折腾的开发者，也是每天库库刷题的初中学生。
		</p>

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

		<Built target={data.deployTarget} />
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
</style>
