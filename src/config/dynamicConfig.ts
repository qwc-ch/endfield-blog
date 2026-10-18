// 动态页设置：内容源是自建的 Memos，浏览器端直接拉接口。

export const dynamicConfig = {
	title: '动态',
	description: '随手记与碎碎念',
	/** Memos 实例地址 */
	memos: {
		enable: true,
		apiUrl: 'https://memos.amamo.top',
		/** 只拉这个用户的动态 */
		parent: 'users/qwc'
	}
};

export type DynamicConfig = typeof dynamicConfig;
