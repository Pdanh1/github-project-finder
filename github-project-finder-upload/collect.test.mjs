import test from 'node:test';
import assert from 'node:assert/strict';
import { select } from './collect.mjs';

test('filters ineligible repositories, deduplicates IDs and preserves matching summaries', () => {
  const repo = {
    id: 1, name: 'project', full_name: 'owner/project', html_url: 'https://github.com/owner/project',
    description: 'A project', private: false, fork: false, archived: false,
    stargazers_count: 100, forks_count: 5, updated_at: '2026-05-01',
    language: 'Python', topics: ['machine-learning', 'self-hosted', 'selfhosted'],
  };
  const variants = [
    { id: 2, fork: true }, { id: 3, private: true }, { id: 4, archived: true },
    { id: 5, description: ' ' }, { id: 6, stargazers_count: 99 },
    { id: 7, updated_at: '2024-01-01' }, { id: 8 },
    { id: 9, html_url: repo.html_url + '/releases' }, { id: 10, topics: [] },
  ].map(changes => ({ ...repo, ...changes }));
  const pages = [[...variants, repo, repo], [], [], [], [], [repo], [], []];
  const [project, ...rest] = select(pages, '2025-11-10', '2026-11-10', [8], [
    { github_id: 1, original_description: repo.description, summary_zh: '一个项目' },
  ]);
  assert.deepEqual(rest, []);
  assert.equal(project.github_id, 1);
  assert.equal(project.summary_zh, '一个项目');
  assert.deepEqual(project.tags, ['Python', '机器学习', '自托管']);
  assert.equal(project.license, null);
  assert.equal(select(pages, '2025-11-10', '2026-11-10')[0].summary_zh, null);
});
