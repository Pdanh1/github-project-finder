'use client';

import { useState } from 'react';
import repositories from '../repos.json';

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
  const [tag, setTag] = useState('');
  const [sort, setSort] = useState<Sort>('recommendation_score');
  const terms = keyword.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const matches = repositories.filter(project => {
    const searchable = [project.full_name, project.original_description, project.summary_zh,
      project.primary_category, ...project.tags].join(' ').toLowerCase();
    return (!category || project.primary_category === category)
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
    setTag('');
  }

  return <main>
    <header>
      <h1>GitHub 开源项目查找器</h1>
      <p>按分类、标签或关键词查找开源项目。</p>
    </header>
    <section aria-label="查找项目">
      <label htmlFor="keyword">搜索项目</label>
      <input id="keyword" type="search" placeholder="项目名、简介、分类或标签"
        value={keyword} onChange={event => setKeyword(event.target.value)} />
      <div className="categories" role="group" aria-label="项目分类">
        {['', ...categories].map(value => <button key={value} type="button"
          aria-pressed={category === value} onClick={() => setCategory(value)}>{value || '全部'}</button>)}
      </div>
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
          <span>{project.primary_category}</span>
          {project.tags.slice(0, 5).map(value => <button key={value} type="button"
            aria-pressed={tag.toLowerCase() === value.toLowerCase()}
            onClick={() => setTag(tag.toLowerCase() === value.toLowerCase() ? '' : value)}>{value}</button>)}
        </div>
        <div className="details">
          <span>{project.primary_language || '语言未标注'} · {project.license || '未检测到许可证'} · ★ {number.format(project.stars)} · <time dateTime={project.updated_at}>{project.updated_at.slice(0, 10)}</time></span>
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
