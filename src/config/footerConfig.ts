// 页脚：一句话说明和显示开关。

export const footerConfig = {
	/** 页脚那句说明，写清楚这个站用什么搭的 */
	note: '本站由 Vite + SvelteKit + Tailwind CSS 构建，静态部署。',
	/** 页脚是否显示运行天数 */
	showDays: true,
};

export type FooterConfig = typeof footerConfig;
