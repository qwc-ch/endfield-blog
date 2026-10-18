import type { CircleData } from '#lib/circle';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	// 聚合结果已在构建时烘成 /circle.json，这里只是读
	const resp = await fetch('/circle.json');
	const data: CircleData = await resp.json();
	return { data };
};
