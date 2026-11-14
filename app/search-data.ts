import repositories from '../repos.json';
import { projectSubcategory, subcategories } from './subcategories';

export type Repository = (typeof repositories)[number];
export type Filters = { q: string; category: string; subcategory: string; tag: string };
export type Sort = 'relevance' | 'stars' | 'updated_at';
export const allRepositories = repositories;
export const categories = Object.keys(subcategories);

export function categoryCount(category: string, subcategory = '') {
  return repositories.filter(project => project.primary_category === category &&
    (!subcategory || projectSubcategory(category, project.full_name) === subcategory)).length;
}

export function categoryChildren(category: string) {
  const names = subcategories[category]?.map(group => group.name) || [];
  return categoryCount(category, '其他') ? [...names, '其他'] : names;
}

export function searchUrl(filters: Filters) {
  const params = new URLSearchParams();
  if (filters.q.trim()) params.set('q', filters.q.trim());
  if (filters.category) params.set('category', filters.category);
  if (filters.subcategory && filters.category) params.set('subcategory', filters.subcategory);
  if (filters.tag) params.set('tag', filters.tag);
  return `/search/${params.size ? `?${params}` : ''}`;
}

function normalize(value: string) {
  return value.normalize('NFKC').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function distance(left: string, right: string, limit: number) {
  if (Math.abs(left.length - right.length) > limit) return limit + 1;
  let previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 1; i <= left.length; i++) {
    const current = [i];
    for (let j = 1; j <= right.length; j++)
      current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + +(left[i - 1] !== right[j - 1]));
    if (Math.min(...current) > limit) return limit + 1;
    previous = current;
  }
  return previous[right.length];
}

function scoreTerm(term: string, value: string, weight: number) {
  const field = normalize(value);
  if (!field) return 0;
  if (field === term) return weight * 12;
  if (field.startsWith(term)) return weight * 9;
  if (field.includes(term)) return weight * 6;
  if (!/^[a-z0-9]{4,}$/.test(term)) return 0;
  const limit = term.length >= 5 ? 2 : 1;
  return (field.match(/[a-z0-9]+/g) || []).some(word =>
    Math.abs(word.length - term.length) <= limit && distance(term, word, limit) <= limit) ? weight * 2 : 0;
}

function relevance(project: Repository, terms: string[]) {
  if (!terms.length) return 1;
  const fields: [string, number][] = [
    [project.full_name, 6], [project.full_name.split('/').pop() || '', 8],
    [project.primary_category, 3], [projectSubcategory(project.primary_category, project.full_name), 4],
    ...project.tags.map(tag => [tag, 4] as [string, number]),
    [project.summary_zh || '', 2], [project.original_description || '', 2], [project.primary_language || '', 1],
  ];
  let total = 0;
  for (const term of terms) {
    const best = Math.max(0, ...fields.map(([value, weight]) => scoreTerm(term, value, weight)));
    if (!best) return 0;
    total += best;
  }
  return total;
}

export function searchProjects(filters: Filters, sort: Sort = 'relevance') {
  const terms = normalize(filters.q).split(/\s+/).filter(Boolean);
  return repositories.filter(project => (!filters.category || project.primary_category === filters.category)
    && (!filters.subcategory || projectSubcategory(project.primary_category, project.full_name) === filters.subcategory)
    && (!filters.tag || project.tags.some(tag => normalize(tag) === normalize(filters.tag))))
    .map(project => ({ project, score: relevance(project, terms) })).filter(result => result.score > 0)
    .sort((a, b) => {
      const comparison = sort === 'stars' ? b.project.stars - a.project.stars
        : sort === 'updated_at' ? b.project.updated_at.localeCompare(a.project.updated_at)
          : b.score - a.score || b.project.recommendation_score - a.project.recommendation_score;
      return comparison || a.project.full_name.localeCompare(b.project.full_name);
    });
}
