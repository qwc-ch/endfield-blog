<script lang="ts">
	import { page } from '$app/state';
	import { siteConfig } from '#config';
</script>

<svelte:head>
	<title>{page.status === 404 ? '找不到页面' : `错误 ${page.status}`} · {siteConfig.title}</title>
</svelte:head>

<div class="ef-spread">
	<section class="ef-sheet">
		<p class="ef-eyebrow slash">Error</p>
		<header class="ef-sheet-head">
			<h1 class="ef-read">{page.status === 404 ? '找不到页面' : '出错了'}</h1>
			<p class="ef-field">状态 {page.status}</p>
		</header>
		<p class="ef-empty">
			{page.status === 404
				? '这个地址还没有对应的内容。可能文章改名了，或者链接写错了。'
				: (page.error?.message ?? '发生了一个错误，稍后再试。')}
		</p>
		<p class="ef-actions">
			<a class="ef-btn go" href="/">回首页</a>
			<a class="ef-btn" href="/posts/">看全部文章</a>
		</p>
	</section>
</div>
