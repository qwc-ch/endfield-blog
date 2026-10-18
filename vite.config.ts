import adapter from '@sveltejs/adapter-static';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import rehypeSlug from 'rehype-slug';
import { mdsvex } from 'mdsvex';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			// markdown 也当组件编译（mdsvex）
			extensions: ['.svelte', '.md'],
			preprocess: [
				mdsvex({ extensions: ['.md'], rehypePlugins: [rehypeSlug] }),
				vitePreprocess()
			],
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			// 静态导出：全部页面预渲染，404.html 作为兜底
			adapter: adapter({ fallback: '404.html' })
		})
	]
});
