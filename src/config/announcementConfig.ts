// 全站公告条：显示在每页内容上方，读者关掉之后记在浏览器里，不再出现。

export const announcementConfig = {
	/** 是否显示公告条 */
	enabled: false,
	/** 左边那个黄色小标签 */
	flag: '公告',
	/** 公告正文 */
	content: '欢迎来到我的博客。我会用 AI 对博文进行修改和润色。',
	/** 后面的链接，不需要就写 null */
	link: { text: '了解更多', url: '/about/' } as { text: string; url: string } | null,
	/** 是否让读者关掉 */
	closable: true,
};

export type AnnouncementConfig = typeof announcementConfig;
