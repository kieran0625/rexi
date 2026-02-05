1.  **修改 `src/app/api/analyze/route.ts` 中的 `buildPrompt` 函数**：
    *   **提取主题文字**：要求 AI 从用户输入中提取或精炼出适合作为标题的简短“主题文字”（Keyword/Title）。
    *   **指定文字排版**：在图像生成提示词中明确要求“包含文字”，例如 `text overlay saying "KEYWORD"`，并描述文字风格（如：bold typography, minimalist font, elegant layout）。
    *   **留白构图**：要求生成具有“负空间”（Negative Space）的构图，以便于文字展示，避免画面过于拥挤。
    *   **强化小红书风格**：继续强调“高调（High-key）光照”、“低饱和度（Low saturation）”、“生活化（Lifestyle vibe）”等小红书美学特征。

2.  **验证逻辑**：
    *   确保 AI 返回的 `prompt` 中确实包含了关于“文字”和“留白”的描述。
    *   （可选）如果需要前端展示这个“主题文字”，也可以让 AI 返回 JSON 格式（包含 `prompt` 和 `title`），但这可能涉及前端修改。为了最小化改动，目前建议将文字要求直接融入 Image Generation Prompt 中，让 Gemini 生图时直接把字画上去（如果模型支持文本渲染能力较强），或者仅仅生成留白图方便后续 P 图。
    *   *注：Gemini 3 Pro Image (Imagen 3) 的文本渲染能力较强，直接要求生成带字图片是可行的。*

3.  **具体 Prompt 策略更新**：
    *   新增指令：`Extract a short, catchy English or Chinese title/keyword from the input (e.g., "Coffee Time", "OOTD", "City Walk").`
    *   新增指令：`Ensure the image features this title text clearly and stylishly integrated into the composition (e.g., on a wall, a sign, a notebook, or as a stylish overlay).`
    *   新增指令：`Use a composition with negative space (e.g., clear sky, clean wall, empty table surface) suitable for social media text overlays.`