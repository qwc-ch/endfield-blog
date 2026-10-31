// 番组收藏在构建时抓取，结果直接烘进静态页面；浏览器端不再请求接口。
import { fetchAllCategories } from '#lib/bangumi.server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({ categories: await fetchAllCategories() });
