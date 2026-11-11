import { readFileSync, writeFileSync, renameSync, openSync, closeSync, unlinkSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const root = fileURLToPath(new URL('.', import.meta.url));
const groups = [
  ['AI 与机器学习', 'machine-learning', '机器学习'],
  ['Web 开发', 'frontend', '前端'],
  ['移动与桌面应用', 'desktop-app', '桌面应用'],
  ['开发者工具', 'developer-tools', '开发工具'],
  ['数据与数据库', 'database', '数据库'],
  ['运维与自托管', 'self-hosted', '自托管'],
  ['安全与隐私', 'privacy', '隐私'],
  ['学习与资源', 'awesome-list', '资源清单'],
];
const aliases = new Map(groups.map(([, topic, tag]) => [topic, tag]));
aliases.set('selfhosted', '自托管');
aliases.set('docker', 'Docker');
aliases.set('windows', 'Windows');
aliases.set('c-plus-plus', 'C++');
aliases.set('cpp', 'C++');
aliases.set('monitor', '监控');
aliases.set('monitoring', '监控');
const ignoredTopics = new Set([
  'hacktoberfest', 'awesome', 'cross-platform', 'unicorns', 'contributions-welcome',
]);
const categoryOverrides = new Map([
  ['caddyserver/caddy', 1], ['netdata/netdata', 5], ['openbq-org/openbb', 4],
  ['leonxlnx/taste-skill', 3], ['expo/expo', 2], ['ionic-team/ionic-framework', 2],
  ['dokploy/dokploy', 5], ['sqlmapproject/sqlmap', 6], ['unslothai/unsloth', 0],
  ['tinyhumansai/openhuman', 0], ['pathwaycom/serviette', 0],
  ['the-vibe-company/quivr', 0], ['devtoys-app/devtoys', 3],
  ['naibowang/easyspider', 3], ['corentinth/it-tools', 3],
  ['githubdaily/githubdaily', 7], ['rasbt/llms-from-scratch', 7],
  ['microsoft/ml-for-beginners', 7], ['rohitg00/ai-engineering-from-scratch', 7],
  ['asabeneh/30-days-of-python', 7],
]);

function classify(repo, fallback) {
  const override = categoryOverrides.get(repo.full_name.toLowerCase());
  if (override !== undefined) return groups[override];
  if (repo.topics.includes('awesome-list') ||
      /^(?:an? )?(?:curated )?list of\b|^course\b/i.test(repo.description.trim())) {
    return groups[7];
  }
  return groups[fallback];
}
const path = name => join(root, name);

function read(name, fallback) {
  try {
    return JSON.parse(readFileSync(path(name), 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return fallback;
    throw error;
  }
}

function save(name, data) {
  writeFileSync(path(name + '.tmp'), JSON.stringify(data, null, 2) + '\n');
  renameSync(path(name + '.tmp'), path(name));
}

export function select(pages, cutoff, now, excluded = [], previous = []) {
  const seen = new Set(excluded);
  const old = new Map(previous.map(project => [project.github_id, project]));
  return groups.flatMap(([, topic], index) => {
    const rows = [];
    for (const repo of pages[index]) {
      const updated = Date.parse(repo.updated_at);
      if (seen.has(repo.id) || repo.private !== false || repo.fork !== false ||
          repo.archived !== false || repo.disabled || !(repo.stargazers_count >= 100) ||
          !repo.description?.trim() || !(updated >= Date.parse(cutoff)) ||
          !repo.topics?.includes(topic) || !/^[\w.-]+\/[\w.-]+$/.test(repo.full_name) ||
          repo.html_url !== 'https://github.com/' + repo.full_name) continue;
      seen.add(repo.id);
      const [category, categoryTopic] = classify(repo, index);
      const tags = [repo.language, ...(repo.topics.includes(categoryTopic) ? [categoryTopic] : []), ...repo.topics]
        .filter(tag => tag && !ignoredTopics.has(tag.toLowerCase()))
        .map(tag => aliases.get(tag.toLowerCase()) ?? tag);
      const license = repo.license?.spdx_id;
      const score = 0.4 * Math.min(1, Math.log10(repo.stargazers_count + 1) / 6)
        + 0.35 * Math.max(0, Math.min(1, (updated - Date.parse(cutoff)) / (Date.parse(now) - Date.parse(cutoff))))
        + 0.15 * Number(Boolean(license && license !== 'NOASSERTION'))
        + 0.1 * Math.min(1, Math.log10(repo.forks_count + 1) / 5);
      const prior = old.get(repo.id);
      rows.push({
        github_id: repo.id, name: repo.name, full_name: repo.full_name,
        html_url: repo.html_url, original_description: repo.description,
        summary_zh: prior?.original_description === repo.description ? prior.summary_zh ?? null : null,
        primary_category: category, tags: [...new Map(tags.map(tag => [tag.toLowerCase(), tag])).values()].slice(0, 5),
        primary_language: repo.language, stars: repo.stargazers_count, forks: repo.forks_count,
        license: license === 'NOASSERTION' ? null : license ?? null,
        updated_at: repo.updated_at, recommendation_score: Number(score.toFixed(6)),
        collected_at: now,
      });
      if (rows.length === 13) break;
    }
    return rows;
  });
}

async function collect() {
  const now = new Date().toISOString();
  const day = now.slice(0, 10);
  const year = Number(day.slice(0, 4)) - 1;
  const cutoff = year + day.slice(4).replace('-02-29', new Date(Date.UTC(year, 1, 29)).getUTCMonth() === 1 ? '-02-29' : '-02-28');
  const budget = read('.budget.json', { day, count: 0, resumeAt: 0 });
  if (budget.day !== day) Object.assign(budget, { day, count: 0 });
  const cache = read('.search-cache.json', {});
  const nextCache = {};
  const pages = [];
  for (const [, topic] of groups) {
    if (pages.length && !process.env.GITHUB_TOKEN) await delay(8_000);
    if (budget.count >= 50 || budget.resumeAt > Date.now()) throw new Error('Request budget or cooldown reached');
    const params = new URLSearchParams({
      q: 'topic:' + topic + ' is:public archived:false fork:false stars:>=100 pushed:>=' + cutoff,
      per_page: '100', sort: 'stars',
    });
    const key = params.toString();
    const cached = cache[key];
    const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'github-project-finder' };
    if (process.env.GITHUB_TOKEN) headers.Authorization = 'Bearer ' + process.env.GITHUB_TOKEN;
    if (cached?.etag) headers['If-None-Match'] = cached.etag;
    budget.count++;
    save('.budget.json', budget);
    const response = await fetch('https://api.github.com/search/repositories?' + key, {
      headers, signal: AbortSignal.timeout(30_000), redirect: 'error',
    });
    const remaining = response.headers.get('x-ratelimit-remaining');
    const reset = Number(response.headers.get('x-ratelimit-reset')) * 1000;
    console.log(JSON.stringify({ topic, request: budget.count, status: response.status,
      limit: response.headers.get('x-ratelimit-limit'), remaining, reset }));
    if ([403, 429].includes(response.status) || (remaining !== null && Number(remaining) <= 1)) {
      budget.resumeAt = Math.max(Date.now() + 60_000, reset,
        Date.now() + (Number(response.headers.get('retry-after')) || 0) * 1000);
      save('.budget.json', budget);
      if ([403, 429].includes(response.status)) throw new Error('GitHub rate limit or access restriction');
    }
    if (response.status === 304 && cached) {
      pages.push(cached.items);
      nextCache[key] = cached;
      continue;
    }
    if (!response.ok) throw new Error('GitHub HTTP ' + response.status);
    const result = await response.json();
    if (result.incomplete_results || !Array.isArray(result.items)) throw new Error('Incomplete search for ' + topic);
    const items = result.items.map(({ id, name, full_name, html_url, description, private: hidden,
      fork, archived, disabled, updated_at, stargazers_count, forks_count, language, topics, license }) => ({
      id, name, full_name, html_url, description, private: hidden, fork, archived, disabled,
      updated_at, stargazers_count, forks_count, language, topics, license: { spdx_id: license?.spdx_id },
    }));
    nextCache[key] = { etag: response.headers.get('etag'), items };
    pages.push(items);
  }
  const repos = select(pages, cutoff, now, read('excluded-ids.json', []), read('repos.json', []));
  if (repos.length < 100) throw new Error('Only ' + repos.length + ' eligible projects');
  save('.search-cache.json', nextCache);
  save('repos.json', repos);
  console.log('Saved ' + repos.length + ' projects');
}

function rebuild() {
  const entries = Object.entries(read('.search-cache.json', {}));
  const pages = groups.map(([, topic]) => entries.find(([key]) =>
    new URLSearchParams(key).get('q')?.startsWith('topic:' + topic + ' ')));
  if (pages.some(page => !page)) throw new Error('Missing complete search cache');
  const cutoff = new URLSearchParams(pages[0][0]).get('q').split('pushed:>=')[1];
  const previous = read('repos.json', []);
  const now = previous[0]?.collected_at;
  if (!now || !cutoff) throw new Error('Missing snapshot dates');
  const repos = select(pages.map(([, page]) => page.items), cutoff, now, read('excluded-ids.json', []), previous);
  if (repos.length < 100) throw new Error('Only ' + repos.length + ' eligible projects');
  save('repos.json', repos);
  console.log('Rebuilt ' + repos.length + ' projects from cache');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const lock = openSync(path('.collect.lock'), 'wx');
  try {
    if (process.argv[2] === '--offline') rebuild();
    else await collect();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    closeSync(lock);
    unlinkSync(path('.collect.lock'));
  }
}
