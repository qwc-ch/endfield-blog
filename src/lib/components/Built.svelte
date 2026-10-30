<!-- 构建/部署信息：各页右栏通用的一块。
     target 由根布局的 +layout.server.ts 在预渲染（构建）时识别好，
     组件本身不碰构建环境，这样它进浏览器包也不会带 ci-info。 -->
<script lang="ts">
	let { target }: { target: string } = $props();
</script>

<h2 class="ef-pair"><span class="ef-eyebrow">Built</span><span>构建</span></h2>
<ul class="ef-ledger">
	<li><span>框架</span><span class="ef-field">SvelteKit（Vite）</span></li>
	<li><span>样式</span><span class="ef-field">Tailwind CSS</span></li>
	<li><span>字体</span><span class="ef-field">Saira / 思源黑体</span></li>
	<li><span>部署</span><span class="ef-field">{target}</span></li>
</ul>

<style>
	/* 和右栏上一块之间拉开一档（原来靠各页的 .mid 规则，收进组件里统一） */
	h2 {
		margin: 2.5rem 0 0;
	}
	ul {
		margin: 0.75rem 0 0;
	}
</style>
