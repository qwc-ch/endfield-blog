// 站点信息：站名、域名、简介、建站日期。
// 这里只放"这个站是什么"，界面文案从这里取。

export const siteConfig = {
	/** 站点标题：字标、侧栏、页面标题都来自这里 */
	title: '年华の博客',
	/** 字标第二行的拉丁字（空心大字） */
	titleLatin: 'AMAMO.TOP',
	/** 一句话副标题 */
	subtitle: '欢迎来到我的小破站',
	/** 站点描述，用在 <meta> 和 RSS 里 */
	description: '年华的个人博客，在这里分享生活和技术。',
	/** 站点地址，结尾不带斜杠 */
	url: 'https://blog.amamo.top',
	/** 建站日期，用于"运行天数" */
	since: '2026-01-01',
	/** 界面语言 */
	lang: 'zh-CN',
};

export type SiteConfig = typeof siteConfig;
