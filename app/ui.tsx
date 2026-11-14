'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { allRepositories, categories, categoryChildren, categoryCount } from './search-data';

function SearchIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.3 4.3" />
  </svg>;
}

function LayersIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" aria-hidden="true">
    <path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 16l9 5 9-5" />
  </svg>;
}

export function SiteHeader({ onCategories }: { onCategories: () => void }) {
  return <header className="site-header">
    <Link href="/" className="brand"><span className="brand-mark" aria-hidden="true">g/</span><span>开源项目查找器</span></Link>
    <button type="button" className="category-trigger" onClick={onCategories} aria-label="打开分类目录">
      <LayersIcon /><span>分类目录</span>
    </button>
  </header>;
}

export function SearchForm({ initialQuery, onSearch, large = false }: {
  initialQuery: string; onSearch: (query: string) => void; large?: boolean;
}) {
  const [query, setQuery] = useState(initialQuery);
  useEffect(() => setQuery(initialQuery), [initialQuery]);
  return <form className={`search-form${large ? ' search-form-large' : ''}`} role="search"
    onSubmit={event => { event.preventDefault(); onSearch(query); }}>
    <label className="sr-only" htmlFor={large ? 'home-search' : 'result-search'}>搜索开源项目</label>
    <span className="search-icon"><SearchIcon /></span>
    <input id={large ? 'home-search' : 'result-search'} type="search" value={query}
      onChange={event => setQuery(event.target.value)} placeholder="搜索项目、用途或技术标签" />
    <button type="submit">搜索</button>
  </form>;
}

export function CategoryDrawer({ open, onClose, onChoose, selectedCategory }: {
  open: boolean; onClose: () => void;
  onChoose: (category: string, subcategory: string) => void; selectedCategory?: string;
}) {
  const [active, setActive] = useState('');
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    setActive(selectedCategory || '');
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, selectedCategory, onClose]);
  if (!open) return null;
  return <div className="drawer-layer">
    <button type="button" className="drawer-backdrop" aria-label="关闭分类目录" onClick={onClose} />
    <aside className="category-drawer" role="dialog" aria-modal="true" aria-label="分类目录">
      <div className="drawer-top"><div><span className="eyebrow">目录</span><h2>按用途浏览</h2></div>
        <button ref={closeRef} type="button" className="icon-button" onClick={onClose} aria-label="关闭分类目录">×</button></div>
      <p className="drawer-intro">先选领域，再进入具体用途。</p>
      {active ? <div className="category-level" key={active}>
        <button type="button" className="drawer-back" onClick={() => setActive('')}>‹ <span>全部领域</span></button>
        <div className="current-category"><h3>{active}</h3><span>{categoryCount(active)} 个项目</span></div>
        <div className="drawer-list">
          <button type="button" onClick={() => onChoose(active, '')}><span>查看全部</span><span>{categoryCount(active)} <b>›</b></span></button>
          {categoryChildren(active).map(name => <button key={name} type="button" onClick={() => onChoose(active, name)}>
            <span>{name}</span><span>{categoryCount(active, name)} <b>›</b></span>
          </button>)}
        </div>
      </div> : <div className="category-level"><div className="drawer-list">
        <button type="button" onClick={() => onChoose('', '')}><span>所有项目</span><span>{allRepositories.length} <b>›</b></span></button>
        {categories.map(name => <button key={name} type="button" onClick={() => setActive(name)}>
          <span>{name}</span><span>{categoryCount(name)} <b>›</b></span>
        </button>)}
      </div></div>}
      <p className="drawer-footnote">项目按主要用途归类，新的项目会持续补充。</p>
    </aside>
  </div>;
}

export function SiteFooter() {
  const feedback = process.env.NEXT_PUBLIC_FEEDBACK_URL;
  const snapshot = allRepositories[0]?.collected_at.slice(0, 10);
  return <footer className="site-footer"><span>数据来自 GitHub REST API · 快照日期 {snapshot}（UTC）</span>
    <span>本站独立运营，与 GitHub 无隶属关系。{feedback && <a href={feedback}>纠错与下架</a>}</span></footer>;
}
