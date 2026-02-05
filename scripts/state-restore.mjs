import assert from "node:assert/strict";
import puppeteer from "puppeteer";

const baseUrl = process.env.BASE_URL || "http://localhost:3000";

async function clickNav(page, { href, label }) {
  await page.evaluate(
    ({ h, t }) => {
      const byHref = h ? document.querySelector(`a[href="${h}"]`) : null;
      const byTitle = t ? document.querySelector(`a[title="${t}"]`) : null;
      const byText = t
        ? Array.from(document.querySelectorAll("a")).find((a) => (a.textContent || "").includes(t))
        : null;
      const el = byHref || byTitle || byText;
      if (!el) throw new Error(`nav link not found: href=${h || ""} label=${t || ""}`);
      el.click();
    },
    { h: href, t: label }
  );
}

async function waitPath(page, pathname) {
  await page.waitForFunction((p) => location.pathname === p, {}, pathname);
}

async function scenarioTypingRestoresAfterNav(page) {
  await page.goto(`${baseUrl}/generate`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("textarea");
  await page.focus("textarea");
  await page.keyboard.type("测试状态保持-typing-123");

  await clickNav(page, { href: "/works", label: "我的作品" });
  await waitPath(page, "/works");

  await clickNav(page, { href: "/generate", label: "生成页面" });
  await waitPath(page, "/generate");

  await page.waitForSelector("textarea");
  const value = await page.$eval("textarea", (el) => el.value);
  assert.ok(value.includes("测试状态保持-typing-123"), "textarea content should be restored");
}

async function scenarioSeededFullStateRestores(page) {
  const img =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/Ur9m5wAAAAASUVORK5CYII=";

  await page.goto(`${baseUrl}/generate`, { waitUntil: "domcontentloaded" });

  await page.evaluate((seed) => {
    const key = "rexi:edit-state:test-work";
    sessionStorage.setItem(
      key,
      JSON.stringify({
        version: 1,
        workId: "test-work",
        savedAt: Date.now(),
        inputText: "seeded input",
        sourceCharCount: 11,
        inputUrl: "https://example.com",
        generatedPrompt: "seeded prompt",
        imagePrompts: [{ id: 1, text: "p1" }],
        selectedPromptIndex: 0,
        xhsContent: { title: "seeded title", content: "seeded content" },
        analysisError: "",
        warningMsg: "",
        generatedImages: [seed.img],
        displayImage: seed.img,
        isLinkDialogOpen: true,
        isPreviewOpen: false,
        isImageViewerOpen: false,
        isPromptOpen: true,
        isStyleDialogOpen: true,
        selectedStyle: "Oil Painting (油画)",
        showStyleConfirm: true,
        currentWorkId: "test-work",
      })
    );
    sessionStorage.setItem("rexi:generate:last-state-key", key);
  }, { img });

  await page.reload({ waitUntil: "domcontentloaded" });

  await page.waitForFunction(() => document.body.innerText.includes("seeded title"));
  await page.waitForFunction(() => document.body.innerText.includes("选择艺术风格"));
  await page.waitForFunction(() => document.body.innerText.includes("AI 绘画提示词"));
  await page.waitForFunction(() => document.body.innerText.includes("确认重绘"));

  await clickNav(page, { href: "/works", label: "我的作品" });
  await waitPath(page, "/works");

  await clickNav(page, { href: "/generate", label: "生成页面" });
  await waitPath(page, "/generate");

  await page.waitForFunction(() => document.body.innerText.includes("seeded title"));
  const value = await page.$eval("textarea", (el) => el.value);
  assert.equal(value, "seeded input", "seeded input should be restored after navigation");
}

async function main() {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  page.setDefaultTimeout(60_000);

  await scenarioTypingRestoresAfterNav(page);
  await scenarioSeededFullStateRestores(page);

  await browser.close();
  console.log("state-restore: OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
