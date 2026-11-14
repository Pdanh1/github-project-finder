'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { projectSubcategory } from './subcategories';
import { searchProjects, searchUrl, type Filters, type Sort } from './search-data';
import { CategoryDrawer, SearchForm, SiteFooter, SiteHeader } from './ui';

const number = new Intl.NumberFormat('zh-CN');

export default function Results({ filters }: { filters: Filters }) {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sort, setSort] = useState<Sort>('relevance');
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const validFilters = { ...filters, subcategory: filters.category ? filters.subcategory : '' };
  const matches = searchProjects(validFilters, sort);
  const hasFilters = !!(filters.q || filters.category || filters.tag);
  const navigate = (next: Filters) => router.push(searchUrl(next));

  return <div className="site-shell results-shell">
    <SiteHeader onCategories={() => setDrawerOpen(true)} />
    <main className="results-main">
      <div className="results-heading"><div><p className="eyebrow">项目目录</p><h1>搜索结果</h1></div>
        <p>{matches.length} 个项目</p></div>
      <SearchForm initialQuery={filters.q} onSearch={q => navigate({ ...validFilters, q })} />
      <div className="results-controls">
        <div className="active-filters">
          {filters.category && <button type="button" onClick={() => navigate({ ...validFilters, category: '', subcategory: '' })}>
            {filters.category}{filters.subcategory ? ` / ${filters.subcategory}` : ''}<span aria-hidden="true">×</span>
          </button>}
          {filters.tag && <button type="button" onClick={() => navigate({ ...validFilters, tag: '' })}>{filters.tag}<span aria-hidden="true">×</span></button>}
          {!filters.category && !filters.tag && <span>{filters.q ? `“${filters.q}” 的匹配项目` : '浏览全部项目'}</span>}
        </div>
        <label>排序 <select value={sort} onChange={event => setSort(event.target.value as Sort)}>
          <option value="relevance">{filters.q ? '相关度' : '综合推荐'}</option>
          <option value="stars">Star 数</option>
          <option value="updated_at">最近更新</option>
        </select></label>
      </div>
      {matches.length ? <div className="project-list">{matches.map(({ project }) => <article key={project.github_id} className="project-row">
        <div className="project-heading"><h2><a href={project.html_url}>{project.full_name}</a></h2><span>★ {number.format(project.stars)}</span></div>
        <p className="project-description">{project.summary_zh || project.original_description}</p>
        <div className="project-bottom">
          <div className="project-labels">
            <span className="project-category">{project.primary_category} / {projectSubcategory(project.primary_category, project.full_name)}</span>
            {project.tags.slice(0, 4).map(tag => <button key={tag} type="button" onClick={() => navigate({ ...validFilters, tag })}>{tag}</button>)}
          </div>
          <div className="project-meta"><span>{project.primary_language || '语言未标注'}</span><span>{project.license || '未检测到许可证'}</span><time dateTime={project.updated_at}>{project.updated_at.slice(0, 10)}</time></div>
        </div>
      </article>)}</div> : <div className="empty-state">
        <h2>没有找到匹配的项目</h2>
        <p>试试更短的关键词，或去掉一个筛选条件。</p>
        {hasFilters && <button type="button" onClick={() => navigate({ q: '', category: '', subcategory: '', tag: '' })}>查看全部项目</button>}
      </div>}
    </main>
    <SiteFooter />
    <CategoryDrawer open={drawerOpen} selectedCategory={filters.category} onClose={closeDrawer}
      onChoose={(category, subcategory) => { closeDrawer(); navigate({ ...validFilters, category, subcategory, tag: '' }); }} />
  </div>;
}
