# 第一阶段采集

## 本地网站

使用 Node.js 24 和 pnpm 11.25.0。在本目录运行 `pnpm install --frozen-lockfile`，然后运行 `pnpm dev`，打开命令显示的本地地址。`pnpm build` 生成可静态托管的 `out/`。网站直接使用 `repos.json`，浏览操作在浏览器内完成。

## GitHub Pages 发布

将本目录作为仓库根目录推送到 `main`，在仓库设置中启用 Issues，并将 Pages 的构建来源设为 GitHub Actions。仓库需要允许工作流写入 `main`，以保存成功采集的快照。工作流使用 GitHub 自动提供的 `GITHUB_TOKEN`。

准备上线时，在仓库的 Actions 变量中将 `ENABLE_PAGES` 设为 `true`。首次发布可在 Actions 运行「Refresh and deploy directory」，保留默认设置即可用现有快照发布。确认仓库 Issues 可用于纠错与下架，并从发布网址检查桌面和手机入口。需要实测采集时可勾选 `refresh`。定时任务按北京时间每天 02:17 计划运行，GitHub 可能延后执行。采集失败会跳过发布并保留线上版本，失败详情可在 Actions 查看。

本地生产构建已在 1280px 和 390px 的 Edge 浏览器视口验证搜索、分类、标签、三种排序、空结果、外链和请求行为。已验证 Pages 子路径构建，以及触发预算上限时保留快照。线上入口与连续 7 天更新记录须在仓库接入后验收。

## 数据采集

在本目录用 Node.js 22 或更新版本运行 `node collect.mjs`。可在运行环境设置 `GITHUB_TOKEN`，前端无需令牌。脚本通过 [GitHub 官方搜索接口](https://docs.github.com/en/rest/search/search) 按八个主题各请求一页，每页 100 条，最多选 13 条。按固定类别顺序解决重叠，以 GitHub ID 去重。可选 `excluded-ids.json` 接受数字 ID 数组。

每天按 UTC 计数，每次请求前写入本地预算。同一目录的采集互斥，跨日仍遵守限流等待时间。记录状态与剩余额度，使用 ETag 缓存。八类查询全部成功且达到 100 条才替换 `repos.json`。部署自动更新时须保留预算和缓存状态，并串行运行。进程异常退出留下锁文件时，确认没有采集进程后再移除锁。

样本使用 GitHub 仓库网页地址与原始简介。中文简介留空，可人工填入，原始简介变化时会清空。分类按显式主题，标签把主要语言、分类主题和其他仓库主题合并去重，最多五项。

运行 `node --test collect.test.mjs` 可离线验证过滤、排除名单、去重、仓库链接和标签归一。实际采集另用 `node collect.mjs` 验证。

调整分类或标签规则后，用 `node collect.mjs --offline` 从本地完整搜索缓存重建。该操作保留快照采集时间，消耗 0 次 API 请求。每个搜索主题最多选 13 条，按主用途重新归类后各类数量可以不同。
