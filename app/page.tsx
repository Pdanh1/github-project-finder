'use client';

import { useState } from 'react';
import repositories from '../repos.json';
import { projectSubcategory, subcategories } from './subcategories';

const categories = ['AI 与机器学习', 'Web 开发', '移动与桌面应用', '开发者工具',
  '数据与数据库', '运维与自托管', '安全与隐私', '学习与资源'];
const sorts = {
  recommendation_score: '综合推荐',
  stars: 'Star 数',
  updated_at: '最近更新',
} as const;
const number = new Intl.NumberFormat('zh-CN');
const feedback = process.env.NEXT_PUBLIC_FEEDBACK_URL;
const snapshot = repositories[0]?.collected_at.slice(0, 10);
type Sort = keyof typeof sorts;

export default function Page() {
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [expandedCategory, setExpandedCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [tag, setTag] = useState('');
  const [sort, setSort] = useState<Sort>('recommendation_score');
  const terms = keyword.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const categoryProjects = repositories.filter(project => project.primary_category === category);
  const categorySubcategories = category ? [
    ...subcategories[category].map(group => group.name),
    ...(categoryProjects.some(project => projectSubcategory(category, project.full_name) === '其他') ? ['其他'] : []),
  ] : [];
  const matches = repositories.filter(project => {
    const searchable = [project.full_name, project.original_description, project.summary_zh,
      project.primary_category, ...project.tags].join(' ').toLowerCase();
    return (!category || project.primary_category === category)
      && (!subcategory || projectSubcategory(project.primary_category, project.full_name) === subcategory)
      && (!tag || project.tags.some(value => value.toLowerCase() === tag.toLowerCase()))
      && terms.every(term => searchable.includes(term));
  }).sort((left, right) => {
    const difference = sort === 'updated_at' ? right.updated_at.localeCompare(left.updated_at)
      : right[sort] - left[sort];
    return difference || left.full_name.localeCompare(right.full_name);
  });

  function clearFilters() {
    setKeyword('');
    setCategory('');
    setExpandedCategory('');
    setSubcategory('');
    setTag('');
  }

  function selectCategory(value: string) {
    setCategory(value);
    setSubcategory('');
    setTag('');
    setExpandedCategory(value === expandedCategory ? '' : value);
  }

  return <main>
    <header>
      <h1>GitHub 开源项目查找器</h1>
      <p>先选领域，再按用途缩小范围；也可以直接搜索项目</p>
    </header>
    <section aria-label="查找项目">
      <label htmlFor="keyword">搜索项目</label>
      <input id="keyword" type="search" placeholder="项目名、简介、分类或标签"
        value={keyword} onChange={event => setKeyword(event.target.value)} />
      <p className="filter-label">浏览分类</p>
      <div className="categories" role="group" aria-label="项目大类">
        {['', ...categories].map(value => <button key={value} type="button"
          aria-pressed={category === value} aria-expanded={value ? expandedCategory === value : undefined}
          onClick={() => selectCategory(value)}>
          <span>{value || '全部'}</span>
          <span className="category-count">{value ? repositories.filter(project => project.primary_category === value).length : repositories.length}</span>
          {value && <span className="category-chevron" aria-hidden="true">⌄</span>}
        </button>)}
      </div>
      {expandedCategory && <div className="subcategories" role="group" aria-label={`${category}小类`}>
        <p>{category} <span>按用途筛选</span></p>
        <div className="subcategory-options">
          {['', ...categorySubcategories].map(value => <button key={value} type="button"
            aria-pressed={subcategory === value} onClick={() => { setSubcategory(value); setTag(''); }}>
            {value || '全部小类'} <span>{value ? categoryProjects.filter(project => projectSubcategory(category, project.full_name) === value).length : categoryProjects.length}</span>
          </button>)}
        </div>
      </div>}
    </section>
    <section aria-label="项目列表">
      <div className="toolbar">
        <p role="status">{matches.length} 个项目</p>
        <label>排序 <select value={sort} onChange={event => setSort(event.target.value as Sort)}>
          {Object.entries(sorts).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select></label>
      </div>
      {tag && <button type="button" className="selected" onClick={() => setTag('')}>清除标签 · {tag}</button>}
      {!matches.length && <div className="empty">
        <p>没有符合条件的项目。</p>
        <button type="button" onClick={clearFilters}>清除筛选</button>
      </div>}
      {matches.map(project => <article key={project.github_id}>
        <h2>{project.full_name}</h2>
        <p className="description">{project.summary_zh || project.original_description}</p>
        <div className="tags">
          <span>{project.primary_category} / {projectSubcategory(project.primary_category, project.full_name)}</span>
          {project.tags.slice(0, 5).map(value => <button key={value} type="button"
            aria-pressed={tag.toLowerCase() === value.toLowerCase()}
            onClick={() => setTag(tag.toLowerCase() === value.toLowerCase() ? '' : value)}>{value}</button>)}
        </div>
        <div className="details">
          <span className="metadata">{project.primary_language || '语言未标注'} <span aria-hidden="true">·</span> {project.license || '未检测到许可证'} <span aria-hidden="true">·</span> ★ {number.format(project.stars)} <span aria-hidden="true">·</span> <time dateTime={project.updated_at}>{project.updated_at.slice(0, 10)}</time></span>
          <a href={project.html_url} aria-label={`查看项目网页 · ${project.full_name}`}>查看项目网页 ↗</a>
        </div>
      </article>)}
    </section>
    <footer>
      <p>数据来自 GitHub REST API。本站独立运营，与 GitHub 无隶属或官方合作关系。</p>
      <p>快照日期 {snapshot}（UTC）。综合推荐仅供浏览参考。</p>
      {feedback ? <a href={feedback}>纠错与下架</a> : <p>纠错与下架渠道待配置。</p>}
    </footer>
  </main>;
}

