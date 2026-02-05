# ✨ Rexi - AI 小红书内容生成器

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-3.0-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Prisma-5.0-2D3748?style=flat-square&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/Gemini-AI-4285F4?style=flat-square&logo=google" alt="Gemini" />
</p>

<p align="center">
  <b>专为小红书创作者打造的 AI 内容生成工具</b><br/>
  一键生成吸睛文案、潮流配图和爆款排版
</p>

---

## 🚀 功能特性

| 功能 | 描述 |
|------|------|
| 📝 **智能文案** | 基于 Gemini AI 生成符合小红书调性的标题和正文 |
| 🎨 **风格转换** | 支持 3D 黏土、玻璃拟态、胶片质感等多种风格 |
| 🔗 **链接解析** | 自动解析文章链接，提取关键内容 |
| 📱 **智能排版** | 自动平衡文字与视觉元素的布局 |
| 💾 **历史记录** | 保存生成记录，方便回顾和复用 |

## 📸 预览

![首页截图](./docs/screenshot.png)

## 🛠️ 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS + Radix UI
- **AI**: Google Gemini API
- **数据库**: PostgreSQL (Neon) + Prisma ORM
- **部署**: Vercel

## 📦 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/YOUR_USERNAME/rexi.git
cd rexi
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

创建 `.env` 文件：

```env
# Neon PostgreSQL 数据库
DATABASE_URL="postgresql://username:password@ep-xxx.neon.tech/neondb?sslmode=require"

# Google Gemini API Key
GEMINI_API_KEY="your-gemini-api-key"
```

### 4. 初始化数据库

```bash
npx prisma db push
```

### 5. 启动开发服务器

```bash
npm run dev
```

访问 <http://localhost:3000> 🎉

## ☁️ 部署到 Vercel

```bash
npm i -g vercel
vercel
```

在 Vercel 控制台添加环境变量 `DATABASE_URL` 和 `GEMINI_API_KEY`。

## 📁 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── (app)/             # 主应用页面
│   └── api/               # API 路由
│       ├── analyze/       # 内容分析
│       ├── generate/      # AI 生成
│       ├── history/       # 历史记录
│       ├── parse-link/    # 链接解析
│       └── rewrite/       # 文案改写
├── components/            # React 组件
│   ├── feature/          # 功能组件
│   └── ui/               # UI 基础组件
├── lib/                   # 工具函数
└── prisma/               # 数据库模型
```

## 🔑 获取 API Key

1. **Gemini API**: 访问 [Google AI Studio](https://makersuite.google.com/app/apikey) 获取
2. **Neon 数据库**: 访问 [Neon](https://neon.tech) 免费创建

## 📄 License

MIT © 2025

---

<p align="center">
  Made with ❤️ for Xiaohongshu Creators
</p>
