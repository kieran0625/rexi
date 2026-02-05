# 测试计划：生成页面状态保持功能

为了确保“生成页面状态保持”功能的稳定性，我们需要验证在各种用户操作和异常场景下，创作数据都能正确保存和恢复。

由于当前项目尚未配置自动化测试框架（如 Jest 或 Vitest），以下提供了**手动验证清单**以及**建议的自动化测试代码**（供未来集成使用）。

## 1. 手动验证清单 (Manual Verification Checklist)

请按照以下步骤在浏览器中进行验证：

### 场景 A：基本导航切换
1.  **输入数据**：在“生成页面”输入一段灵感文字（例如：“测试自动保存”）。
2.  **生成内容**：点击“解析”或“生成”，等待出现提示词或图片。
3.  **切换页面**：点击左侧导航栏的“我的作品”。
4.  **返回页面**：点击左侧导航栏的“生成页面”。
5.  **验证**：
    *   [ ] 输入框中的文字是否为“测试自动保存”？
    *   [ ] 之前生成的图片/提示词是否依然显示？
    *   [ ] 控制台是否有报错？

### 场景 B：页面刷新 (Hard Reload)
1.  **状态准备**：确保页面上有正在编辑的内容。
2.  **刷新页面**：点击浏览器的刷新按钮 (Cmd+R / F5)。
3.  **验证**：
    *   [ ] 页面重新加载后，内容是否自动恢复？
    *   [ ] `sessionStorage` 中是否存在 `rexi:draft-state` 数据？（可在 DevTools -> Application -> Session Storage 查看）

### 场景 C：新标签页打开
1.  **复制链接**：复制当前生成页面的 URL。
2.  **新标签页**：在一个新的标签页中打开该 URL。
3.  **验证**：
    *   [ ] **注意**：`sessionStorage` 是基于标签页（Tab）隔离的。新标签页**不应该**继承旧标签页的草稿（除非使用 `localStorage`，但本方案采用 `sessionStorage` 以避免多窗口混淆）。
    *   [ ] 预期结果：新标签页应该是空的（或者是初始状态）。

### 场景 D：编辑模式 vs 草稿模式
1.  **编辑模式**：从“我的作品”列表点击某个作品进入（URL 带有 `editId`）。
2.  **修改内容**：修改一些文字。
3.  **切换再回来**：切换到别的页面再通过**浏览器后退**或点击具体作品链接回来。
4.  **验证**：应该显示编辑中的内容（依赖现有的 `rexi:edit-work` 逻辑）。
5.  **草稿模式**：点击导航栏“生成页面”（清除 URL 参数）。
6.  **验证**：应该显示你在场景 A 中保存的草稿，而不是刚才编辑的旧作品。

## 2. 自动化测试用例 (Jest + React Testing Library)

如果未来引入测试框架，可以使用以下代码进行覆盖率测试。

### `src/components/feature/__tests__/GeneratorApp.test.tsx`

```tsx
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GeneratorApp from '../GeneratorApp';

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

describe('GeneratorApp State Persistence', () => {
  beforeEach(() => {
    sessionStorageMock.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should load initial state from sessionStorage if available', () => {
    // Setup initial draft
    const draftState = {
      inputText: 'Restored Draft Content',
      generatedPrompt: 'Restored Prompt',
    };
    sessionStorageMock.setItem('rexi:draft-state', JSON.stringify(draftState));

    render(<GeneratorApp />);

    // Verify input value
    expect(screen.getByDisplayValue('Restored Draft Content')).toBeInTheDocument();
  });

  it('should auto-save state to sessionStorage on change', async () => {
    render(<GeneratorApp />);

    const input = screen.getByPlaceholderText(/例如：周末在阳光明媚/i);
    
    // User types something
    await act(async () => {
        await userEvent.type(input, 'New Draft Content');
    });

    // Fast-forward debounce timer (1000ms)
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Verify sessionStorage
    const saved = JSON.parse(sessionStorageMock.getItem('rexi:draft-state') || '{}');
    expect(saved.inputText).toContain('New Draft Content');
  });

  it('should NOT load draft if editId is provided', () => {
    const draftState = { inputText: 'Draft Content' };
    sessionStorageMock.setItem('rexi:draft-state', JSON.stringify(draftState));

    // Render with editId (simulating Edit Mode)
    render(<GeneratorApp editId="123" />);

    // Should NOT show draft content (it might show empty or edit content if mocked)
    expect(screen.queryByDisplayValue('Draft Content')).not.toBeInTheDocument();
  });
});
```

## 3. 边界情况测试 (Edge Cases)

1.  **Storage Quota Exceeded**: 模拟 `sessionStorage.setItem` 抛出异常，验证程序不会崩溃（已在代码中添加 `try-catch`）。
2.  **Malformed JSON**: 手动在 Application 面板修改 `rexi:draft-state` 为非法 JSON，刷新页面，验证页面是否正常加载（默认值）且控制台有错误日志但无白屏。
