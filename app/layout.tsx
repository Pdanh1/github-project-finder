import type { Metadata } from 'next';
import './site.css';

export const metadata: Metadata = {
  title: 'GitHub 开源项目查找器',
  description: '搜索 GitHub 开源项目，按用途逐级浏览分类，支持模糊匹配。',
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
