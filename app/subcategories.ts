// Curated by project purpose. Newly collected projects fall into “其他” until reviewed.
export const subcategories: Record<string, { name: string; projects: string[] }[]> = {
  'AI 与机器学习': [
    { name: '模型与训练', projects: ['tensorflow', 'transformers', 'pytorch', 'unsloth'] },
    { name: '文档与检索', projects: ['tesseract', 'quivr', 'serviette'] },
    { name: '智能体', projects: ['openhuman'] },
  ],
  'Web 开发': [
    { name: '前端框架', projects: ['react'] },
    { name: '构建与服务', projects: ['vite', 'caddy'] },
    { name: 'API 与规范', projects: ['json-server', 'front-end-checklist', 'awesome-cheatsheets'] },
  ],
  '移动与桌面应用': [
    { name: '跨端框架', projects: ['expo', 'ionic-framework', 'tauri', 'pake'] },
    { name: 'AI 桌面工具', projects: ['cc-switch', 'open-design', 'cc-haha'] },
    { name: '桌面实用应用', projects: ['pear-desktop', 'responsively-app', 'bongocat', 'ab-download-manager', 'nuclear', 'listen1_desktop'] },
  ],
  '开发者工具': [
    { name: 'AI 编码与技能', projects: ['taste-skill', 'ecc', 'ponytail', 'graphify', 'archify', 'openhands', 'rtk', 'dsh-our-free-model', 'i-have-adhd', 'herdr', 'agentic-awesome-skills'] },
    { name: '开发与调试', projects: ['it-tools', 'devtoys', 'puppeteer', 'hoppscotch'] },
    { name: '数据采集', projects: ['easyspider'] },
  ],
  '数据与数据库': [
    { name: '数据库与缓存', projects: ['supabase', 'redis', 'etcd', 'clickhouse', 'duckdb', 'tidb'] },
    { name: '检索与分析', projects: ['openbb', 'meilisearch', 'metabase'] },
    { name: '建模与工具', projects: ['dbeaver', 'orm', 'drawdb'] },
  ],
  '运维与自托管': [
    { name: '部署与平台', projects: ['dokploy', 'coolify', 'gitea', 'appwrite'] },
    { name: '自动化与监控', projects: ['netdata', 'n8n', 'uptime-kuma'] },
    { name: '自托管应用', projects: ['open-webui', 'immich', 'stirling-pdf', 'memos', 'new-api'] },
  ],
  '安全与隐私': [
    { name: '安全测试', projects: ['sqlmap', 'web-check'] },
    { name: '去广告与清理', projects: ['win11debloat', 'cleanyourtv', 'adguardhome', 'hosts', 'dns-blocklists'] },
    { name: '隐私与加密', projects: ['searxng', 'ente', 'keepassxc', 'analytics', 'setup-ipsec-vpn'] },
  ],
  '学习与资源': [
    { name: 'AI 学习', projects: ['prompts.chat', 'llms-from-scratch', 'ml-for-beginners', 'llm-course', 'ai-engineering-from-scratch', 'awesome-claude-skills'] },
    { name: '编程课程', projects: ['cs-video-courses', '30-days-of-python', 'build-your-own-x', 'computer-science', '30-seconds-of-code', 'java-design-patterns'] },
    { name: '技术资源导航', projects: ['awesome-scalability', 'githubdaily', 'awesome-mac', 'awesome-selfhosted', 'awesome', 'awesome-python', 'awesome-go', 'free-for-dev', 'awesome-design-md', 'awesome-for-beginners', 'awesome-react', 'awesome-cpp', 'awesome-nodejs'] },
  ],
};

export function projectSubcategory(category: string, fullName: string) {
  const name = fullName.split('/').pop()?.toLowerCase();
  return subcategories[category]?.find(group => group.projects.includes(name || ''))?.name || '其他';
}
