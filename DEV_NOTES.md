# Hope Music Community 开发笔记

## 图片闪现问题 (Image Flash Issue)

### 问题描述
每次修改任何子板块后，访问页面时会看到旧图片一闪而过，然后才显示正确的图片。

### 根本原因
有两处地方会从 localStorage 加载旧数据：

1. **`src/app/hope-studio/[id]/page.tsx`** - 顶部封面图使用 `item.image`，会从 `hope_studio_content` localStorage 加载
2. **各 Section 组件** - 如 `WelcomeSection.tsx` 等，使用各自的 localStorage key 加载数据

当修改板块内容时，localStorage 里的旧数据会先被加载，然后才显示代码里的默认值。

### 解决方案

#### 对于 [id]/page.tsx 顶部封面图：
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

#### 对于 Section 组件（推荐）：
直接硬编码图片，不使用 state 和 localStorage：

```typescript
const WELCOME_IMAGES = {
  image1: "/images/Welcome to Hope Music Community/Welcome to Hope Music Community 1.jpg",
  // ...
};

// 直接在组件里使用常量，不用 state
<Image src={WELCOME_IMAGES.image1} ... />
```

### 受影响的文件
- `src/app/hope-studio/page.tsx` - 二级页面列表
- `src/app/hope-studio/[id]/page.tsx` - 顶部封面图
- `src/components/hope-studio/WelcomeSection.tsx`
- `src/components/hope-studio/StudioSection.tsx`
- `src/components/hope-studio/JesseLiuSection.tsx`
- `src/components/hope-studio/ShangriLaSection.tsx`
- `src/components/hope-studio/CooperationSection.tsx`

### localStorage Keys
- `hope_studio_content` - 主内容数据
- `welcome_content` - Welcome 板块
- `studio_content` - Studio 板块
- `jesse_liu_content` - Jesse Liu 板块
- `shangri_la_content` - Shangri-La 板块
- `cooperation_content` - Cooperation 板块

### 预防措施
如果将来新建 Section 组件，**始终使用硬编码常量**，不要用 state 和 localStorage 来管理图片路径。
