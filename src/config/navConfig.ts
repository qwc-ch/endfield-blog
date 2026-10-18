// 侧栏导航：en 是每项上方的小字英文，zh 是粗体中文。

export const navConfig = {
	items: [
		{ en: 'Home', zh: '首页', href: '/' },
		{ en: 'Posts', zh: '文章', href: '/posts/' },
		{ en: 'Moments', zh: '动态', href: '/dynamic/' },
		{ en: 'Circle', zh: '朋友圈', href: '/circle/' },
		{ en: 'Friends', zh: '友链', href: '/friends/' },
		{ en: 'Guestbook', zh: '留言', href: '/guestbook/' },
		{ en: 'Timetable', zh: '课程表', href: '/timetable/' },
		{ en: 'Bangumi', zh: '番组', href: '/bangumi/' },
		{ en: 'About', zh: '关于', href: '/about/' }
	]
};

export type NavConfig = typeof navConfig;
