// 统计脚本配置：改成 false 就整段不加载。
export const analyticsConfig = {
	/** 总开关 */
	enabled: true,

	/** Umami 统计（自建实例） */
	umami: {
		enabled: true,
		/** 统计脚本地址 */
		scriptUrl: 'https://umami.520781.xyz/script.js',
		/** 网站 ID */
		websiteId: '0ea6a26e-e3cf-431e-ac72-f9d39cac3b93',
		/** 本地开发（localhost）不统计 */
		excludeLocalhost: true
	}
};

export type AnalyticsConfig = typeof analyticsConfig;
