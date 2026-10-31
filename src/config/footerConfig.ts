// 页脚：一句话说明和显示开关。

export const footerConfig = {
	/** 页脚那句说明，写清楚这个站用什么搭的 */
	note: ' ',
	/** 页脚是否显示运行天数 */
	showDays: true,
	/** 备案信息，显示在页脚最后一行；不想要就把两项都留空 */
	icp: {
		text: '萌ICP备20260170号',
		url: 'https://icp.gov.moe/?keyword=20260533',
	},
};

export type FooterConfig = typeof footerConfig;
