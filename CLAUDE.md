@AGENTS.md

## 项目开发笔记（持续更新）

### 首页 PerformanceSection 卡片不显示数据的根因与解法

**问题现象**：新增子板块（Opera、Musical、Classical...）的二级页面有数据，但首页 Performance 区块对应卡片空白。

**根本原因**：`src/components/home/PerformanceSection.tsx` 中的 `loadCategoryData()` 函数维护着一个"新路径白名单"。只有进入白名单的分类才会去读 `/data/ticketmaster/{CategoryName}/data.json`（Ticketmaster API 原始数据），其余分类仍走旧的 `/data/ticketmaster/{slug}/events.json` 路径。

旧路径的文件从未被创建过，所以会 404，卡片空白。

**解法**：将新分类加入白名单（同时补上通用的大小写转换逻辑）：

```typescript
// Before
if (category === "opera" || category === "musical") {
  const fileName = category === "opera" ? "Opera" : "Musical";

// After
if (category === "opera" || category === "musical" || category === "classical") {
  const fileName = category.charAt(0).toUpperCase() + category.slice(1);
```

注意：`Image` 组件的 `unoptimized` 属性也需要同步更新，否则外站图片加载失败：
```typescript
unoptimized={category === "opera" || category === "musical" || category === "classical"}
```

**已加入白名单**：opera、musical、classical、music
**待处理**（已有文件夹但未入白名单）：dance、electronic、other、pop-rock、performance-art
