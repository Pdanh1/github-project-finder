'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { allRepositories, categories, searchUrl } from './search-data';
import { CategoryDrawer, SearchForm, SiteFooter, SiteHeader } from './ui';
import heroPanel from '../public/hero-panel.png';

export default function Page() {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  return <div className="site-shell home-shell">
    <div className="home-art" aria-hidden="true"><Image src={heroPanel} alt="" fill unoptimized priority /></div>
    <SiteHeader onCategories={() => setDrawerOpen(true)} />
    <main className="home-main"><section className="home-message">
      <p className="home-kicker">开源项目导航</p>
      <h1>发现值得用的<br /><span>开源项目</span></h1>
      <p className="home-description">从项目名称、用途和技术标签开始搜索。</p>
    </section><section className="home-search-area" aria-label="搜索项目">
      <SearchForm initialQuery="" large onSearch={q => router.push(searchUrl({ q, category: '', subcategory: '', tag: '' }))} />
      <p className="search-support">支持名称片段与少量拼写错误</p>
      <p className="home-hint">收录 {allRepositories.length} 个项目，覆盖 {categories.length} 个领域</p>
    </section></main>
    <SiteFooter />
    <CategoryDrawer open={drawerOpen} onClose={closeDrawer} onChoose={(category, subcategory) => {
      closeDrawer(); router.push(searchUrl({ q: '', category, subcategory, tag: '' }));
    }} />
  </div>;
}
