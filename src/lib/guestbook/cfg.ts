// 留言板聊天的配置适配层：
// Chat 组件沿用了 Firefly 主题里 commentConfig.waline.* 的取值形状，
// 本站的 commentConfig 是扁平结构，这里包一层对齐，组件代码就不用改。

import { commentConfig as base, guestbookConfig as gb } from '#config';

export interface GuestbookAnnouncementItem {
	id: string;
	title: string;
	summary: string;
	lead: string;
	rules: string[];
}

export const commentConfig = {
	waline: {
		serverURL: base.serverURL,
		lang: base.lang,
		emoji: base.emoji,
		/** 本站没有配置图片上传地址，走 Waline 原生的 base64 内联（≤128KB） */
		imageUploadURL: '',
		login: 'enable' as 'enable' | 'force' | 'disable'
	}
};

export const guestbookConfig = gb;
