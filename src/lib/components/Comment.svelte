<script lang="ts">
	// Waline 评论挂载：脚本和样式从 CDN 加载，数据在自建服务上。
	import { onMount } from 'svelte';
	import { commentConfig } from '#config';

	let { path }: { path?: string } = $props();

	let el: HTMLDivElement | undefined = $state();
	let ready = $state(false);
	let failed = $state(false);

	onMount(async () => {
		try {
			for (const href of [commentConfig.clientCss, commentConfig.customCss]) {
				const link = document.createElement('link');
				link.rel = 'stylesheet';
				link.href = href;
				document.head.appendChild(link);
			}
			// Waline 的客户端脚本在 CDN 上，类型由运行时决定
			// @ts-expect-error - 外部 URL 模块没有类型声明
			const waline = await import(/* @vite-ignore */ 'https://unpkg.com/@waline/client@v3/dist/waline.js');
			waline.init({
				el,
				serverURL: commentConfig.serverURL,
				lang: commentConfig.lang,
				emoji: commentConfig.emoji,
				pageview: commentConfig.pageview,
				dark: 'html[data-theme="dark"]',
				path
			});
			ready = true;
		} catch {
			failed = true;
		}
	});
</script>

{#if failed}
	<p class="ef-notice" data-flag="注意">评论加载失败，可能是网络不通，稍后再试。</p>
{:else}
	<div bind:this={el} hidden={!ready}></div>
{/if}
