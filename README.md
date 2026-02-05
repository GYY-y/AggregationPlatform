# 聚合工作台（AggregationPlatform）

一个基于 Vue 3 + Vite + Ant Design Vue 的链接聚合面板，支持菜单分组、拖拽排序、导入导出、本地偏好缓存等功能。

## 功能特点
- 新增/编辑/删除菜单与链接，菜单名称必填且 1-4 个字。
- 可选开关控制拖拽，开启后支持菜单与链接拖拽排序。
- 链接卡片支持点击标题复制文本、展示标签与描述，标签自动分配高对比色。
- 设置抽屉可切换主题、列数、紧凑模式、显示描述/菜单数量，并支持导入导出/清除缓存。
- 本地缓存：状态、配置保存在浏览器 `localStorage`，支持一键恢复默认。

## 解决的痛点
- 常用链接散落在浏览器书签、聊天记录或文档里，难以快速找到：集中到单一面板，按菜单/标签分组，搜索即达。
- 团队成员不熟悉链接路径：导出配置分享给同事，导入即可复用同一套入口。
- 排序/分组调整频繁：开启拖拽后直接拖动菜单和链接即可调整顺序，随用随排。
- 深夜/白天不同场景：支持主题切换与紧凑模式，适配暗光和多信息密度需求。

## 预置友情链接
- Skill 创作小说：预览 https://novelplatform-one.vercel.app/ ｜ GitHub https://github.com/GYY-y/novelPlatform
- 春节小游戏：预览 https://minigame-delta-inky.vercel.app/ ｜ GitHub https://github.com/GYY-y/mini-game
- 聚合工作台：预览 https://aggregation-platform.vercel.app/ ｜ GitHub https://github.com/GYY-y/AggregationPlatform

## 目录结构（关键部分）
```
src/
  App.vue                # 主页面，负责状态与业务逻辑
  assets/main.scss       # 全局样式
  assets/images/altr.png # 左上角品牌 Logo
  components/
    MenuList.vue         # 菜单列表（拖拽、编辑/删除）
    LinkGrid.vue         # 链接卡片网格（复制标题、拖拽）
    LinkFormModal.vue    # 链接表单弹窗
    MenuFormModal.vue    # 菜单表单弹窗
    SettingsDrawer.vue   # 配置抽屉
  composables/useTheme.js# 主题切换与变量注入
```

## 本地开发
```bash
npm install
npm run dev
```
在浏览器打开 Vite 提示的本地地址即可预览。

## 构建
```bash
npm run build
```
产物输出到 `dist/`。

## 使用提示
- 拖拽需先开启“允许拖拽”开关，默认关闭。
- 导出会包含菜单/链接/设置等状态；导入时选择 JSON 文件即可恢复。
- Logo 位置在左侧品牌区，如需替换可覆盖 `src/assets/images/altr.png`。 
