'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { allRepositories, categories, searchUrl } from './search-data';
import { CategoryDrawer, SearchForm, SiteFooter, SiteHeader } from './ui';

export default function Page() {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  return <div className="site-shell home-shell">
    <SiteHeader onCategories={() => setDrawerOpen(true)} />
    <main className="home-main"><div className="home-content">
      <p className="home-kicker">开源项目目录</p>
      <h1>找到合适的<br />开源项目</h1>
      <p className="home-description">从项目名称、用途和技术标签开始搜索。</p>
      <SearchForm initialQuery="" large onSearch={q => router.push(searchUrl({ q, category: '', subcategory: '', tag: '' }))} />
      <p className="home-hint">收录 {allRepositories.length} 个项目，覆盖 {categories.length} 个领域 <span aria-hidden="true">·</span> 输入关键词或直接搜索查看全部</p>
    </div></main>
    <SiteFooter />
    <CategoryDrawer open={drawerOpen} onClose={closeDrawer} onChoose={(category, subcategory) => {
      closeDrawer(); router.push(searchUrl({ q: '', category, subcategory, tag: '' }));
    }} />
  </div>;
}
