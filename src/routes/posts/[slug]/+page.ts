import { error } from '@sveltejs/kit';
import { getAdjacent, posts } from '#lib/posts';
import type { PageLoad } from './$types';

// 每篇文章预渲染一个静态页面
export const entries = () => posts.map((p) => ({ slug: p.slug }));

export const load: PageLoad = ({ params }) => {
	if (!posts.some((p) => p.slug === params.slug)) {
		error(404, '没有这篇文章');
	}
	const { prev, next } = getAdjacent(params.slug);
	return {
		slug: params.slug,
		prev: prev?.slug ?? null,
		next: next?.slug ?? null
	};
};
