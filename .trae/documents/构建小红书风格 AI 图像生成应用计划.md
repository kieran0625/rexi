此计划旨在从零开始构建一个专注于生成小红书风格图像的全栈网页应用。

### 1. 技术栈选择 (Technology Stack)

* **框架**: [Next.js](https://nextjs.org/) (React) - 支持全栈开发，拥有强大的 API 路由功能。

* **语言**: TypeScript - 保证代码健壮性。

* **样式**: Tailwind CSS - 快速构建现代 UI。

* **UI 组件库**: shadcn/ui - 提供高质量、可定制的组件（如按钮、输入框、卡片等）。

* **AI 集成**:

  * **文本分析 & 提示词生成**: Google Gemini API (`@google/generative-ai`)。

  * **图像生成**: 默认接入 OpenAI DALL-E 3 或 Replicate (Stable Diffusion) 接口，设计为可插拔架构。

* **数据存储**: Prisma + SQLite (本地开发) - 用于存储历史记录。

### 2. 核心功能模块 (Core Features)

#### A. 前端用户界面 (Frontend UI)

1. **主页 (Home)**:

   * **输入区**: 支持文本输入和 `.txt` 文件上传读取。

   * **风格控制面板**: 提供“小红书”特色预设（如：明亮生活、精致摆拍、胶片滤镜、极简构图）。

   * **高级设置**: 自定义宽高比（默认 3:4 竖屏）、生成数量。
2. **生成页 (Generation View)**:

   * **智能分析展示**: 显示 Gemini 优化后的绘画提示词（支持用户二次编辑）。

   * **生成结果**: 高清图片展示，支持缩放查看。

   * **操作栏**: 下载图片、复制提示词、一键分享。
3. **历史记录 (History)**:

   * 瀑布流展示过往生成作品。

   * 支持删除和重新生成。

#### B. 后端 API 服务 (Backend Services)

1. **`/api/analyze`**:

   * 接收用户文本。

   * 调用 Gemini，通过专门设计的 System Prompt 将文本转化为符合小红书审美的英文绘画提示词（包含光影、构图、色彩关键词）。
2. **`/api/generate`**:

   * 接收提示词。

   * 调用图像生成服务（DALL-E 3 或其他）生成图片。
3. **`/api/history`**:

   * 管理用户的生成记录（保存提示词和图片链接）。

### 3. 实施步骤 (Implementation Steps)

1. **初始化项目**: 创建 Next.js 项目，配置 Tailwind 和 Prisma。
2. **搭建 UI 骨架**: 实现布局、导航栏和基础组件。
3. **集成 Gemini**: 编写 Prompt Engineering 逻辑，确保生成的提示词具备“小红书味”（如：high key lighting, photorealistic, lifestyle, vibrant colors）。
4. **集成绘图服务**: 实现图像生成接口调用。
5. **串联流程**: 连接前端与后端，实现“输入 -> 优化 -> 生成 -> 展示”的完整链路。
6. **完善细节**: 添加加载动画、错误处理、图片下载功能。

### 4. 待确认事项

* 您是否已有 Google Gemini 和图像生成服务（如 OpenAI）的 API Key？如果没有，我将预留环境变量配置位置。

* 我们将默认使用本地 SQLite 数据库存储历史记录，无需额外配置数据库服务。

