<script lang="ts">
	// 侧栏导航：当前项是整块黄色。窄屏时自动横过来。
	import { page } from '$app/state';
	import { navConfig, siteConfig } from '#config';

	const here = (href: string) =>
		href === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(href.replace(/\/$/, ''));
</script>

<nav class="ef-rail" aria-label="主导航">
	<a class="brand" href="/">{siteConfig.title}</a>
	{#each navConfig.items as item (item.href)}
		<a href={item.href} aria-current={here(item.href) ? 'page' : undefined}>{item.zh}</a>
	{/each}
</nav>
