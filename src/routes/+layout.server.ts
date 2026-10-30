// 全站服务端布局 load：预渲染（构建）时识别构建平台，
// 结果经 layout 数据下发到每个页面的右栏"构建"块。
// 本文件只在服务端跑（SvelteKit 保证不进客户端包）。
import { deployTarget } from '#lib/deploy';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = () => ({ deployTarget });
