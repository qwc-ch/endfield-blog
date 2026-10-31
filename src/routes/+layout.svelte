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
	import Announcement from '#lib/components/Announcement.svelte';
	import { footerConfig, profileConfig, siteConfig } from '#config';
	import { posts } from '#lib/posts';
	import type { LayoutData } from './$types';
	import { page } from '$app/state';
	import { closeDialog, wireDialogs } from '#lib/fx';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	// 移动端的导航抽屉：点"菜单"从左滑出，选完自动收回去
	let navEl: HTMLDialogElement | undefined = $state();

	// 顶栏滚动状态：页首透底露出等高线，滚动后垫回纸色，内容从栏下滑过不穿帮
	let scrolled = $state(false);

	function onScroll() {
		scrolled = window.scrollY > 4;
	}

	// 路由切换后 SvelteKit 会把滚动归位，按新路径复核一次，别把上一页的状态带过来
	$effect(() => {
		void page.url.pathname;
		scrolled = window.scrollY > 4;
	});

	onMount(async () => {
		const { wireTheme } = await import('#lib/fx');
		wireDialogs();
		wireTheme();
	});

	function maybeClose(e: MouseEvent) {
		// 点了抽屉里的链接就收起（客户端跳转后抽屉不能再挡着页面）
		if (navEl?.open && (e.target as HTMLElement | null)?.closest('a[href]')) {
			void closeDialog(navEl);
		}
	}
</script>

<Tri sweep />
<Analytics />
<svelte:window onscroll={onScroll} />

<!-- 移动端顶栏：站名 + 菜单键，导航收进抽屉 -->
<header class="topbar" class:is-scrolled={scrolled}>
	<a class="brand" href="/">{siteConfig.title}</a>
	<button
		class="ef-btn small go"
		type="button"
		data-open="nav"
		aria-haspopup="dialog"
		aria-controls="nav"
	>
		菜单
	</button>
</header>

<div class="shell">
	<div class="side">
		<Rail />
		<div class="rail-foot">
			<ThemeToggle />
		</div>
	</div>

	<div class="main">
		<Announcement />
		<main class="content">
			{@render children()}
		</main>

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
			{#if footerConfig.icp.text && footerConfig.icp.url}
				<p class="ef-field note">
					<a href={footerConfig.icp.url} target="_blank" rel="noopener noreferrer nofollow">{footerConfig.icp.text}</a>
				</p>
			{/if}
		</footer>
	</div>
</div>

<!-- 移动端导航抽屉：从左滑出的侧边栏，内容与桌面侧栏一致 -->
<dialog
	class="ef-drawer nav-drawer"
	id="nav"
	aria-labelledby="nav-title"
	bind:this={navEl}
	onclick={maybeClose}
>
	<div class="body">
		<header class="ef-pair" id="nav-title">
			<span class="ef-eyebrow slash">Menu</span>
			<span class="nav-title-text">导航</span>
		</header>
		<Rail />
		<div class="drawer-foot">
			<ThemeToggle />
			<ul class="ef-facts ef-field">
				{#if footerConfig.showDays}
					<li>第 {data.days} 天</li>
				{/if}
				<li>{posts.length} 篇</li>
			</ul>
		</div>
	</div>
</dialog>

<style>
	.shell {
		display: grid;
		grid-template-columns: 12rem minmax(0, 1fr);
		min-height: calc(100dvh - 3px);
	}
	/* 侧栏是站点导航的“外壳”，不参与“全站透底”：垫回纸色，把等高线墙纸挡在栏后，
	   别让导航条上露出会“跟着内容跑”的等高线（桌面导航与移动顶栏同等对待） */
	.side {
		position: sticky;
		top: 0;
		align-self: start;
		display: flex;
		flex-direction: column;
		height: 100dvh;
		background: var(--ef-paper);
		border-right: 1px solid var(--ef-rule);
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
	/* 正文装进 main 地标（无障碍 landmark-one-main），它自己撑满剩余高度 */
	.content {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-width: 0;
	}
	/* 让页面内容撑开，页脚贴在底部；公告条排在内容前面，不参与撑开 */
	.content > :global(.ef-spread),
	.content > :global(.hero) {
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

	/* ===== 移动端（≤1099px）：顶栏 + 侧滑抽屉 ===== */
	.topbar {
		display: none;
	}
	/* 关闭状态的抽屉必须藏起来：下移动端的 display:block 是作者样式，
	   会盖掉浏览器默认的 dialog:not([open]) { display:none }，不补这条
	   抽屉一进页面就会以整高左栏摊在内容上 */
	.nav-drawer:not([open]) {
		display: none;
	}
	@media (max-width: 1099px) {
		.shell {
			grid-template-columns: minmax(0, 1fr);
		}
		.side {
			display: none;
		}
		.topbar {
			position: sticky;
			top: 0;
			z-index: 30;
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 1rem;
			/* 上下再收薄：站名和菜单键贴上沿，给内容让屏幕（safe-area 保留，防刘海压字） */
			padding: 0.3125rem var(--ef-pad);
			padding-top: env(safe-area-inset-top, 0px);
			/* 页首透底：等高线直接透出来，不垫灰底；滚动后垫回纸色保住可读性 */
			background: transparent;
			border-bottom: 1px solid transparent;
		}
		.topbar.is-scrolled {
			background: var(--ef-paper);
			border-bottom-color: var(--ef-rule);
		}
		@media (prefers-reduced-motion: no-preference) {
			.topbar {
				transition:
					background-color 120ms linear,
					border-color 120ms linear;
			}
		}
		.topbar .brand {
			font-stretch: var(--ef-wider);
			font-weight: 800;
			font-size: 1rem;
			line-height: 1.15;
			letter-spacing: 0.08em;
			color: inherit;
			text-decoration: none;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}
		/* 顶栏菜单键字号跟站名一起放大（别用套件 small 的 0.8rem）。
		   键块尺寸沿用套件，别自己收内边距——黄色块缩水会显得不成比例 */
		.topbar .ef-btn {
			font-size: 1rem;
		}
		/* 站名在键块旁居中会显得偏下，行盒上提 4px 和键块顶边对齐 */
		.topbar .brand {
			position: relative;
			top: -4px;
		}
		.nav-drawer {
			display: block;
			/* 从左边缘整高滑出，与桌面侧栏同位 */
			inset: 0 auto 0 0;
			width: min(19rem, 86vw);
			height: 100dvh;
			max-height: none;
			margin: 0;
		}
		.nav-drawer > .body {
			display: flex;
			flex-direction: column;
			height: 100%;
			padding-bottom: calc(0.75rem + env(safe-area-inset-bottom, 0px));
			border-right: 1px solid var(--ef-rule);
			background: linear-gradient(
				225deg,
				transparent calc(1.6rem * var(--ef-cut-k)),
				var(--ef-panel) calc(1.6rem * var(--ef-cut-k) + 0.5px)
			);
		}
		.nav-drawer header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 0.75rem;
		}
		.nav-drawer .nav-title-text {
			margin-right: auto;
			font-weight: 700;
		}
		/* 抽屉里的导航保持竖排（套件在窄屏会把它横过来），加大点击区 */
		.nav-drawer :global(.ef-rail) {
			flex: 1;
			flex-direction: column;
			align-items: stretch;
			flex-wrap: nowrap;
			overflow-y: auto;
			padding: 0.25rem 0 0.75rem;
			border: 0;
		}
		.nav-drawer :global(.ef-rail .brand) {
			display: none;
		}
		.nav-drawer :global(.ef-rail a:not(.brand)) {
			padding: 0.7rem 1.25rem;
			font-size: 1.05rem;
		}
		.drawer-foot {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 0.75rem;
			padding: 0.85rem 1.25rem 0;
			border-top: 1px solid var(--ef-rule);
		}
	}

	/* 抽屉进出：从左擦入/擦出（mech 曲线），退出约为进入的 2/3 */
	@media (prefers-reduced-motion: no-preference) {
		.nav-drawer[open] > .body {
			animation: nav-in 300ms var(--ef-mech) both;
		}
		/* is-closing 由 fx.js 运行时添加，Svelte 看不见，用 :global 保住 */
		.nav-drawer:global(.is-closing) > .body {
			animation: nav-out 200ms var(--ef-mech) both;
		}
	}
	@keyframes nav-in {
		from {
			transform: translateX(-100%);
		}
	}
	@keyframes nav-out {
		to {
			transform: translateX(-100%);
		}
	}
</style>
