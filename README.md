# AppShot — App Store 截图生成器

上传任意尺寸的 iPhone 截图，套上手机外壳与精美背景，导出符合 App Store Connect 尺寸要求的宣传图。全部在浏览器本地完成，截图不会上传。

在线使用：https://ker-ten-ebon.vercel.app/

## 功能

- **拖拽上传** — 支持批量导入 PNG/JPG 截图，任意 iPhone 尺寸均可
- **设备外壳** — 自动套上 iPhone 边框与渐变背景
- **实时预览** — 所见即所得的截图编辑体验
- **批量导出** — 支持 PNG/JPEG 单张导出，或一键打包 ZIP
- **预设尺寸** — 内置 App Store Connect 要求的 6.5" 和 6.9" 尺寸
- **本地处理** — 所有操作在浏览器中完成，数据不上传服务器

## 技术栈

- React 19 + TypeScript
- Vite 6
- Tailwind CSS 4
- Canvas API（图片渲染）
- JSZip（批量导出）

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 导出尺寸

| 尺寸 | 分辨率 | 用途 |
|------|--------|------|
| 6.9" | 1320×2868 | iPhone 14 Pro Max / 15 Pro Max 宣传截图 |
| 6.5" | 1242×2688 | iPhone 11 Pro Max / XS Max 宣传截图 |
