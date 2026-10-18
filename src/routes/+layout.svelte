<script lang="ts">
	import '@fontsource-variable/saira/wdth.css';
	import '@fontsource-variable/noto-sans-sc';
	import '../app.css';
	import '#lib/styles/endfield.css';
	import '#lib/styles/site.css';
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';
	import Rail from '#lib/components/Rail.svelte';
	import ThemeToggle from '#lib/components/ThemeToggle.svelte';
	import Tri from '#lib/components/Tri.svelte';
	import Analytics from '#lib/components/Analytics.svelte';
	import { footerConfig, profileConfig, siteConfig } from '#config';
	import { posts } from '#lib/posts';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	onMount(async () => {
		const { wireTheme } = await import('#lib/fx');
		wireTheme();
	});
</script>

<Tri sweep />
<Analytics />

<div class="shell">
	<div class="side">
		<Rail />
		<div class="rail-foot">
			<ThemeToggle />
		</div>
	</div>

	<div class="main">
		{@render children()}

		<footer class="foot">
			<ul class="ef-facts ef-field">
				<li>{siteConfig.title}</li>
				{#if footerConfig.showDays}
					<li>第 {data.days} 天</li>
				{/if}
				<li>{posts.length} 篇</li>
			</ul>
			<ul class="ef-facts ef-field">
				{#each profileConfig.links as link (link.url)}
					<li><a href={link.url}>{link.name}</a></li>
				{/each}
				<li><a href="/rss.xml">RSS</a></li>
			</ul>
			<p class="ef-field note">{footerConfig.note}</p>
		</footer>
	</div>
</div>

<style>
	.shell {
		display: grid;
		grid-template-columns: 12rem minmax(0, 1fr);
		min-height: calc(100dvh - 3px);
	}
	.side {
		position: sticky;
		top: 0;
		align-self: start;
		display: flex;
		flex-direction: column;
		height: 100dvh;
	}
	/* 侧栏底部：深浅切换和运行信息 */
	.rail-foot {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.6rem;
		padding: 0 1.25rem 1.25rem;
		border-right: 1px solid var(--ef-rule);
	}
	.main {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}
	/* 让页面内容撑开，页脚贴在底部 */
	.main > :global(:first-child) {
		flex: 1;
	}
	.foot {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.6rem;
		padding: 1.5rem var(--ef-pad) 2.5rem;
		border-top: 1px solid var(--ef-rule);
		text-align: center;
	}
	.foot ul {
		justify-content: center;
		margin: 0;
	}
	.foot ul a {
		color: inherit;
	}
	.foot ul a:hover {
		color: var(--ef-ink);
		text-decoration: underline;
		text-decoration-color: var(--ef-trace);
	}
	.foot .note {
		margin: 0;
	}

	@media (max-width: 1099px) {
		.shell {
			grid-template-columns: minmax(0, 1fr);
		}
		.side {
			position: static;
			height: auto;
			flex-direction: row;
			flex-wrap: wrap;
			align-items: center;
			justify-content: space-between;
			border-bottom: 1px solid var(--ef-rule);
		}
		.rail-foot {
			flex-direction: row;
			align-items: center;
			padding: 0.5rem var(--ef-pad) 0.5rem 0;
			border-right: 0;
		}
	}
</style>
