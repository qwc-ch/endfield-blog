// 关于页"部署"一栏：构建时识别当前构建平台。
// 全站预渲染，这段代码只在构建机（和 dev 的服务端）上跑，浏览器包里没有它
// ——ci-info 顶层就读 process.env，不能让它进客户端。
// 在 Vercel / Netlify / Cloudflare Pages / GitHub Actions 等平台构建时显示
// 对应平台名；本机直接构建时什么都没命中，回落"静态导出"。
import { name } from 'ci-info';

// "Netlify CI" 这类名字去掉 CI 后缀，在"部署"一栏读着更像平台名
export const deployTarget: string = name?.replace(/\s*CI$/, '').trim() || '静态导出';
