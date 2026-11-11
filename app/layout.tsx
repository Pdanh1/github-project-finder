import type { Metadata } from 'next';
import './site.css';

export const metadata: Metadata = {
  title: 'GitHub 开源项目查找器',
  description: '按分类、标签和关键词查找 GitHub 开源项目。',
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
