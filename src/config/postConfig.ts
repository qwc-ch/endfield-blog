// 文章相关设置。

export const postConfig = {
	/** 阅读时长按这个速度估算（字 / 分钟） */
	wordsPerMinute: 350,
	/** 列表行里是否显示字数 */
	showWordCount: true,
};

export type PostConfig = typeof postConfig;
