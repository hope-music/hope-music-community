# Hope Music Community 开发笔记

> 积累每日的开发经验，形成超越人类的知识库

---

## 一、图片闪现问题 (Image Flash Issue)

### 问题描述
每次修改任何子板块后，访问页面时会看到旧图片一闪而过，然后才显示正确的图片。

### 根本原因
**localStorage 的数据被加载后，React 的 useState/useEffect 会先渲染旧数据，然后再更新为新数据。**

有两处地方会从 localStorage 加载旧数据：

1. **`src/app/hope-studio/page.tsx`** - 二级页面列表，使用 `setItems()` 从 `hope_studio_content` 加载
2. **`src/app/hope-studio/[id]/page.tsx`** - 顶部封面图，使用 `setItem()` 从 `hope_studio_content` 加载
3. **各 Section 组件** - 如 `WelcomeSection.tsx` 等，使用各自的 localStorage key

当修改板块内容时，localStorage 里的旧数据会先被加载，然后才显示代码里的默认值。

### 解决方案

#### 方案一：完全移除 localStorage 逻辑（推荐用于静态内容）
```typescript
// 二级页面 - 直接使用常量，不用 state
const DEFAULT_ITEMS: ContentItem[] = [...];

export default function HopeStudioPage() {
  const items = DEFAULT_ITEMS; // 直接用，不用 useState
  return <>{/* render */}</>;
}
```

#### 方案二：检查数据有效性后再使用（用于需要 localStorage 持久化的场景）
```typescript
// 只使用 localStorage 数据当它有正确的图片路径时
if (defaultItem && defaultItem.image && defaultItem.image.includes("/images/Welcome")) {
  if (found.image && found.image.includes("/images/Welcome")) {
    setItem(found);
  }
  // 否则使用 DEFAULT_ITEMS
} else {
  setItem(found);
}
```

#### 方案三：Section 组件硬编码（推荐）
```typescript
// 直接硬编码图片，不使用 state 和 localStorage
const WELCOME_IMAGES = {
  image1: "/images/Welcome to Hope Music Community/Welcome to Hope Music Community 1.jpg",
  // ...
};

// 直接在组件里使用常量
<Image src={WELCOME_IMAGES.image1} ... />
```

### 经验总结
1. **localStorage 读取是异步的**，页面首次渲染时读到旧数据
2. **React 的 hydration** 发生在数据加载之后，导致闪烁
3. **预防措施**：如果内容不需要用户自定义，就不要用 localStorage
4. **关键洞察**：闪烁的本质是「旧数据先渲染 → 新数据后渲染」的时间差

---

## 二、Next.js Image 组件要点

### 基本用法
```tsx
<Image
  src="/images/xxx.jpg"
  alt="描述"
  width={800}
  height={600}
  className="w-full h-full object-cover"
/>
```

### 常见问题
- **LCP 警告**：首屏图片建议加 `priority`
- **本地图片**：需要放在 `public/` 目录下
- **外部图片**：需要在 `next.config.js` 配置 `images.remotePatterns`

---

## 三、localStorage 使用最佳实践

### 正确用法
```typescript
// 1. 初始化时设置默认值
const [data, setData] = useState(DEFAULT_DATA);

// 2. useEffect 中加载
useEffect(() => {
  const stored = localStorage.getItem("key");
  if (stored) {
    try {
      setData(JSON.parse(stored));
    } catch (e) {
      // 解析失败时保持默认值
    }
  }
}, []);

// 3. 保存时同步更新
const save = (newData) => {
  localStorage.setItem("key", JSON.stringify(newData));
  setData(newData);
};
```

### 避免的问题
- ❌ 页面加载时直接用 localStorage 初始化 state
- ❌ 没有 try-catch 处理 JSON.parse 错误
- ❌ 没有设置默认值的兜底逻辑

---

## 四、React 组件设计模式

### 静态内容组件
```typescript
// 不需要 state，直接导出 JSX
export function StaticBanner() {
  return <div className="banner">...</div>;
}
```

### 动态内容组件
```typescript
// 需要 state 和 useEffect
export function DynamicBanner() {
  const [data, setData] = useState(DEFAULT_DATA);
  
  useEffect(() => {
    loadData();
  }, []);
  
  return <div>{/* use data */}</div>;
}
```

### 选择原则
- 内容是管理员可配置的？→ 用 state + localStorage
- 内容是静态的？→ 直接硬编码常量
- 内容来自 API？→ 用 useEffect + fetch

---

## 五、调试技巧

### 查看 localStorage 内容
```javascript
// 浏览器控制台
localStorage.getItem("key")
JSON.parse(localStorage.getItem("key"))
```

### 清除 localStorage
```javascript
localStorage.clear()
```

### React DevTools
- Components 面板查看组件 state
- Profiler 查看渲染次数

---

## 六、项目架构记录

### 目录结构
```
src/
├── app/
│   ├── admin/hope-studio/page.tsx  # 管理后台
│   ├── hope-studio/
│   │   ├── page.tsx                # 二级页面列表
│   │   └── [id]/page.tsx           # 三级详情页
│   └── ...
├── components/
│   └── hope-studio/
│       ├── WelcomeSection.tsx      # Welcome 板块
│       ├── StudioSection.tsx       # Studio 板块
│       ├── JesseLiuSection.tsx     # Jesse Liu 板块
│       ├── ShangriLaSection.tsx     # Shangri-La 板块
│       └── CooperationSection.tsx   # Cooperation 板块
└── ...
```

### localStorage Keys
- `hope_studio_content` - 主内容数据（二级页面列表和顶部封面）
- `welcome_content` - Welcome 板块
- `studio_content` - Studio 板块
- `jesse_liu_content` - Jesse Liu 板块
- `shangri_la_content` - Shangri-La 板块
- `cooperation_content` - Cooperation 板块
- `hope_studio_comments` - 评论数据
- `hope_studio_banned_users` - 封禁用户

---

## 七、未来遇到类似问题

### 图片/内容闪烁问题排查清单
1. [ ] 检查组件是否使用了 useState + useEffect
2. [ ] 检查 useEffect 中是否有 localStorage.getItem
3. [ ] 检查 useState 初始值是否正确
4. [ ] 检查是否有 setInterval 每秒刷新
5. [ ] 尝试硬编码常量看是否解决问题

### localStorage 相关问题
1. [ ] 确认 storage key 名称
2. [ ] 检查 JSON.parse 是否有 try-catch
3. [ ] 确认默认值设置是否正确
4. [ ] 考虑是否真的需要 localStorage

---

*最后更新: 2026-06-14*
