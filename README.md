# 聚合工作台（AggregationPlatform）

一个基于 Vue 3 + Vite + Ant Design Vue 的链接聚合面板，支持菜单分组、拖拽排序、导入导出、本地偏好缓存等功能。

## 功能特点
- 新增/编辑/删除菜单与链接，菜单名称必填且 1-4 个字。
- 可选开关控制拖拽，开启后支持菜单与链接拖拽排序。
- 链接卡片支持点击标题复制文本、展示标签与描述，标签自动分配高对比色。
- 设置抽屉可切换主题、列数、紧凑模式、显示描述/菜单数量，并支持导入导出/清除缓存。
- 本地缓存：状态、配置保存在浏览器 `localStorage`，支持一键恢复默认。

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
