# UI 参考清单

| 来源 | 可采用的交互 | 舍弃的设计 | 许可证核对 |
| --- | --- | --- | --- |
| [shadcn/ui Command](https://ui.shadcn.com/docs/components/command) | 搜索输入、键盘焦点、空结果、排序下拉。桌面和手机都保留可见输入框 | 全局命令面板和复杂分组 | [MIT](https://raw.githubusercontent.com/shadcn-ui/ui/main/LICENSE.md) |
| [GitHub Topics](https://github.com/topics) | 主题入口和简述层级。项目名优先，语言与 Star 放在同一行，窄屏可换行 | GitHub 全局导航、品牌和主题详情页 | 仅观察公开页面，未核实页面实现的复用许可 |
| [OSS Insight Collections](https://ossinsight.io/collections) | 先按主题浏览，再进入项目集合。桌面分类横排，手机端换行，项目用单列 | 趋势图、排名看板、多级导航 | [Apache-2.0](https://raw.githubusercontent.com/pingcap/ossinsight/main/LICENSE)，仅参考交互 |
| [Heroicons](https://heroicons.com/) | 搜索和外链使用一致的线性图标，保留文字标签 | 多种图标风格混排 | [MIT](https://raw.githubusercontent.com/tailwindlabs/heroicons/master/LICENSE) |

当前没有引入第三方源码。后续直接复用 MIT 组件或图标时保留原版权和许可证声明。移动端排版是本站拟采用方案，留待低保真阶段用真实数据验证。
