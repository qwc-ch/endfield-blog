import { error } from '@sveltejs/kit';
import { categoryList, catId } from '#lib/posts';
import type { PageLoad } from './$types';

// 每个分类预渲染一个静态页面
export const entries = () => categoryList.map((c) => ({ id: catId(c.name) }));

export const load: PageLoad = ({ params }) => {
	const category = decodeURIComponent(params.id);
	if (!categoryList.some((c) => c.name === category)) {
		error(404, '没有这个分类');
	}
	return { category };
};
