<script lang="ts">
	// 留言页：群聊式留言板按旧博客（Firefly）原版恢复。
	// 聊天室、输入框、表情、图片、登录/编辑/撤回全部原样搬自主题组件，
	// 配色经 guestbook-chat.css 头部的"变量桥"接到本站 ef- 令牌上。
	import '#lib/styles/guestbook-chat.css';
	import Chat from '#lib/components/guestbook/Chat.svelte';
	import Built from '#lib/components/Built.svelte';
	import Seo from '#lib/components/Seo.svelte';
	import { siteConfig } from '#config';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<Seo title="留言" description="给{siteConfig.title}留句话。" path="/guestbook/" />

<div class="ef-spread gb-spread">
	<section class="ef-sheet">
		<div class="gb-host">
			<!-- guestbook-page 是聊天样式的变量壳（Firefly 原版写在页面里），必须包住 Chat -->
			<div class="guestbook-page">
				<Chat />
			</div>
		</div>
	</section>

	<aside class="ef-margin">
		<h2 class="ef-pair"><span class="ef-eyebrow">Rules</span><span>规则</span></h2>
		<p class="rule">
			进页面会先弹一次留言规则，同意后就能发言。长一点的、私一点的事情，直接发邮件比在这里说更快。
		</p>
		<h2 class="ef-pair mid"><span class="ef-eyebrow">Elsewhere</span><span>别处找我</span></h2>
		<p class="rule">
			留言板适合公开的短消息；想只给我一个人看，就发邮件或者去动态页的对应那条下面评论。
		</p>
		<Built target={data.deployTarget} />
	</aside>
</div>

<style>
	/* 聊天区尽量占满一屏：页头全去掉，聊天框按"视口高 − 顶栏/内边距"给一个确定高度，
	   消息区在聊天框内部自己滚动。不再依赖 JS 量高。 */
	.gb-spread {
		grid-template-columns: minmax(0, 1fr);
	}
	.gb-host {
		/* 顶栏 2.375rem + sheet 上内边距 0.5rem + 一点余量：聊天框正好铺到屏幕底部，
		   别再多减 3rem 白送给页脚，消息区才够高 */
		height: calc(100dvh - 3.75rem);
		min-height: 22rem;
	}
	.gb-host :global(.guestbook-page) {
		height: 100%;
	}
	/* 手机端 sheet 上内边距收小，聊天区更靠上 */
	.gb-spread :global(.ef-sheet) {
		padding-top: 0.5rem;
	}
	/* 桌面主列让给聊天室：右栏收窄成备注栏，聊天框占满主列宽度（不再限 56rem）。
	   桌面没有移动端那条顶栏，减掉的高度更少 */
	@media (min-width: 1100px) {
		.gb-spread {
			grid-template-columns: minmax(0, 1fr) minmax(12rem, 17rem);
		}
		.gb-host {
			height: calc(100dvh - 6rem);
		}
		.gb-spread :global(.ef-sheet) {
			padding-top: 1.5rem;
		}
	}
	/* 聊天框底下别留 4rem 的死白：纸面本来就透底，收掉下内边距让页脚跟上来 */
	.gb-spread :global(.ef-sheet) {
		padding-bottom: var(--ef-pad);
	}
	.ef-margin :global(.mid) {
		margin-top: 2.5rem;
	}
	.rule {
		max-width: 18rem;
		line-height: 1.75;
		color: var(--ef-ink-2);
	}
</style>
