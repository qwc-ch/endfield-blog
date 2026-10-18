// 作者信息：名字、签名、头像和联系方式。

export const profileConfig = {
	/** 名字 */
	name: '年华',
	/** 一句签名 */
	bio: 'Hello, 欢迎来到我的小破站。',
	/** 头像地址 */
	avatar: 'https://q1.qlogo.cn/g?b=qq&nk=1323860289&s=640',
	/** 联系方式，显示在关于页和页脚 */
	links: [
		{ name: 'GitHub', url: 'https://github.com/qwc-ch' },
		{ name: 'Email', url: 'mailto:zzzzzzxx2022@163.com' },
	],
};

export type ProfileConfig = typeof profileConfig;
