@AGENTS.md

## 项目数据源现状（2026-06-22 更新）

### stage_productions → 全量走 Supabase

- 后台 admin/productions、前台首页 PerformanceSection、performance/[category]、performance/[category]/[slug] 全部从 Supabase 读取
- `src/lib/useSupabase.ts` 是数据访问层，包含 `useStageProductionsPublic`、`useStageProductionDetail`、`useStageProductionsForAdmin`、`useStageProductionsCount` 等 hook
- `StageProduction` 类型使用 snake_case（Supabase 规范），前台页面通过 `PublicProduction` 适配成 camelCase
- 注意：Supabase `stage_productions` 表没有 `city` 字段，前台 detail 页面 `item.city` 始终为 undefined

### News / Insights / Employees 后台 → 继续用 Convex

- `npx convex dev` 必须保持运行
- 相关 convex 函数在 `convex/admin.ts` 和 `convex/schema.ts`

### 为什么选 Supabase 而不是 Convex（stage_productions）

- Convex 有行数限制（约 1 万行），`stage_productions` 有 2.5 万行数据，超限
- Supabase 无行数限制，作为 stage_productions 的存储后端

### 旧 localStorage 数据

- 旧后台数据存在 `localStorage` 的 `admin_performance`，Supabase 迁移完成后可清除
