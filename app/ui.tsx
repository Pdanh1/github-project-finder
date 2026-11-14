'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MagnifyingGlass, Stack, X, CaretLeft, CaretRight } from '@phosphor-icons/react';
import { allRepositories, categories, categoryChildren, categoryCount } from './search-data';
import brandMark from '../public/xunyuan-mark.png';

export function SiteHeader({ onCategories }: { onCategories: () => void }) {
  return <header className="site-header">
    <Link href="/" className="brand"><Image src={brandMark} alt="" width={44} height={44} unoptimized priority />
      <span className="brand-name">寻源</span><span className="brand-divider" aria-hidden="true" /><span className="brand-descriptor">开源项目导航</span></Link>
    <button type="button" className="category-trigger" onClick={onCategories} aria-label="打开分类目录">
      <Stack size={19} weight="regular" aria-hidden="true" /><span>分类目录</span>
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
    <span className="search-icon"><MagnifyingGlass size={23} weight="regular" aria-hidden="true" /></span>
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
        <button ref={closeRef} type="button" className="icon-button" onClick={onClose} aria-label="关闭分类目录"><X size={21} /></button></div>
      <p className="drawer-intro">先选领域，再进入具体用途。</p>
      {active ? <div className="category-level" key={active}>
        <button type="button" className="drawer-back" onClick={() => setActive('')}><CaretLeft size={18} /><span>全部领域</span></button>
        <div className="current-category"><h3>{active}</h3><span>{categoryCount(active)} 个项目</span></div>
        <div className="drawer-list">
          <button type="button" onClick={() => onChoose(active, '')}><span>查看全部</span><span>{categoryCount(active)} <CaretRight size={16} /></span></button>
          {categoryChildren(active).map(name => <button key={name} type="button" onClick={() => onChoose(active, name)}>
            <span>{name}</span><span>{categoryCount(active, name)} <CaretRight size={16} /></span>
          </button>)}
        </div>
      </div> : <div className="category-level"><div className="drawer-list">
        <button type="button" onClick={() => onChoose('', '')}><span>所有项目</span><span>{allRepositories.length} <CaretRight size={16} /></span></button>
        {categories.map(name => <button key={name} type="button" onClick={() => setActive(name)}>
          <span>{name}</span><span>{categoryCount(name)} <CaretRight size={16} /></span>
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
