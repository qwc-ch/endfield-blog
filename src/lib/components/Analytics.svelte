<script lang="ts">
	// 统计脚本挂载：由 analyticsConfig 驱动，关掉配置即不加载。
	import { onMount } from 'svelte';
	import { analyticsConfig } from '#config';

	onMount(() => {
		const { umami } = analyticsConfig;
		if (!analyticsConfig.enabled || !umami.enabled) return;
		if (umami.excludeLocalhost && ['localhost', '127.0.0.1', '::1', '0.0.0.0'].includes(location.hostname)) return;

		const script = document.createElement('script');
		script.defer = true;
		script.src = umami.scriptUrl;
		script.dataset.websiteId = umami.websiteId;
		document.head.appendChild(script);
	});
</script>
