<script lang="ts">
	// 全站公告条。关掉之后记在 localStorage，并在 <html> 上打标记：
	// app.html 里的首屏脚本会先读这个标记，再进页面时不会闪一下公告。
	import { announcementConfig } from '#config';

	const KEY = 'announcement';

	let hidden = $state(false);

	function dismiss() {
		hidden = true;
		try {
			localStorage.setItem(KEY, 'hidden');
		} catch {
			// 隐私模式存不了也不影响本次关闭
		}
		document.documentElement.dataset.announcement = 'hidden';
	}
</script>

{#if announcementConfig.enabled && !hidden}
	<aside class="announce" aria-label="公告">
		<span class="flag">{announcementConfig.flag}</span>
		<p class="text">
			{announcementConfig.content}
			{#if announcementConfig.link}
				<a href={announcementConfig.link.url}>{announcementConfig.link.text}</a>
			{/if}
		</p>
		{#if announcementConfig.closable}
			<button class="close" type="button" onclick={dismiss} aria-label="关闭公告">×</button>
		{/if}
	</aside>
{/if}

<style>
	.announce {
		position: relative;
		z-index: 2;
		display: flex;
		align-items: baseline;
		gap: 0.75rem;
		flex: none;
		padding: 0.6rem var(--ef-pad);
		background: var(--ef-panel);
		border-bottom: 1px solid var(--ef-ink);
		font-size: 0.875rem;
		line-height: 1.7;
	}
	/* 读者关过之后，首屏脚本在 <html> 上打标记，先一步藏掉 */
	:global(html[data-announcement='hidden']) .announce {
		display: none;
	}
	.flag {
		flex: none;
		padding: 0 0.4em;
		background: var(--ef-signal);
		color: var(--ef-on-signal);
		font-family: var(--ef-font-ui);
		font-size: 0.75rem;
		font-weight: 700;
	}
	.text {
		margin: 0;
		color: var(--ef-ink-2);
	}
	.text a {
		color: inherit;
		text-decoration: underline;
		text-decoration-color: var(--ef-signal);
		text-decoration-thickness: 0.35em;
		text-underline-offset: -0.16em;
		text-decoration-skip-ink: none;
	}
	.text a:hover {
		color: var(--ef-ink);
	}
	.close {
		flex: none;
		margin-left: auto;
		padding: 0 0.45rem;
		border: 1px solid var(--ef-rule);
		background: transparent;
		color: var(--ef-ink-2);
		font-size: 0.95rem;
		line-height: 1.5;
		cursor: pointer;
	}
	.close:hover {
		border-color: var(--ef-ink);
		color: var(--ef-ink);
	}
</style>
