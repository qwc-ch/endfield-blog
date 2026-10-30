// 文章版权：文章正文结尾那张卡片。
// 从旧博客（Firefly）的 licenseConfig 搬过来，协议还是 CC BY-NC-SA 4.0。

export const licenseConfig = {
	/** 是否显示版权卡片 */
	enabled: true,
	/** 许可协议名 */
	name: 'CC BY-NC-SA 4.0',
	/** 协议原文（中文版） */
	url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hans',
	/** 一句白话解释，跟在协议名后面 */
	note: '可以转载，但要署名、不能商用，改过的内容也按同样的协议发布。',
};

export type LicenseConfig = typeof licenseConfig;
