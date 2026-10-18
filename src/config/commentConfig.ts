// 评论设置：用自建的 Waline 服务，文章页和留言页共用。

export const commentConfig = {
	/** 评论服务地址 */
	serverURL: 'https://waline.520781.xyz',
	/** 界面语言 */
	lang: 'zh-CN',
	/** 表情包 */
	emoji: ['https://unpkg.com/@waline/emojis@1.4.0/bilibili'],
	/** 是否统计阅读量 */
	pageview: true,
	/** 客户端脚本与样式（CDN） */
	clientCss: 'https://unpkg.com/@waline/client@v3/dist/waline.css',
	customCss: '/assets/css/waline-custom.css'
};

export type CommentConfig = typeof commentConfig;
