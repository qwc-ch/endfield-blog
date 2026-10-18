// 侧栏导航：en 是每项上方的小字英文，zh 是粗体中文。

export const navConfig = {
	items: [
		{ en: 'Home', zh: '首页', href: '/' },
		{ en: 'Posts', zh: '文章', href: '/posts/' },
		{ en: 'About', zh: '关于', href: '/about/' },
	],
};

export type NavConfig = typeof navConfig;
