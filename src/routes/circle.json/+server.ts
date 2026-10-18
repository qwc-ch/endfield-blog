// 朋友圈聚合结果：构建时抓一遍友链 RSS，烘成静态 JSON。
import { friendsConfig } from '#config';
import { aggregateCircle, type CircleFriend } from '#lib/circle';
import type { RequestHandler } from './$types';

export const prerender = true;

export const GET: RequestHandler = async () => {
	const friends: CircleFriend[] = friendsConfig
		.filter((f) => f.enabled !== false && f.rss)
		.map((f) => ({ rss: f.rss as string, author: f.title, avatar: f.imgurl }));

	const data = await aggregateCircle(friends);
	return new Response(JSON.stringify(data), {
		headers: { 'Content-Type': 'application/json; charset=utf-8' }
	});
};
