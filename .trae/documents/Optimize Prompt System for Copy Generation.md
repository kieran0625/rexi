I have analyzed the codebase and identified that the prompt generation logic resides in `src/app/api/analyze/route.ts` within the `buildPrompt` function.

I will modify the `buildPrompt` function to implement your requirements for the Xiaohongshu copy generation.

### Plan: Update `src/app/api/analyze/route.ts`

1.  **Locate `buildPrompt` Function**:
    *   Target file: `src/app/api/analyze/route.ts`
    *   Target function: `buildPrompt`

2.  **Refine "Xiaohongshu Copy Requirements" Section**:
    *   **Content Depth**: Add explicit instruction for "comprehensive coverage" and "depth and breadth".
    *   **Structure**: Mandate "at least 3-5 core points" per topic.
    *   **Length**: Enforce "total word count not less than 300 words".
    *   **Emoji Control**: Implement strict rules:
        *   Only use when highly relevant.
        *   Maximum **2 emojis per paragraph**.
        *   Ensure accurate context matching.

3.  **Enhance "Validation Criteria (Self-Correction)" Section**:
    *   Add checks for "Topic Completeness" (3-5 points).
    *   Add checks for "Information Density" (>300 words).
    *   Add checks for "Emoji Usage Norms" (max 2/para, relevance).

4.  **Verification**:
    *   I will verify the changes by creating a test file or running the generation (if possible/permitted) or by carefully reviewing the generated prompt string to ensure all constraints are logically placed.

### Proposed Changes Preview

I will update the prompt string in `src/app/api/analyze/route.ts` to look something like this (conceptual):

```typescript
// ... inside buildPrompt ...
`
// ... existing image prompt sections ...

### 2. Xiaohongshu Copy Requirements
- **Goal**: Generate a high-quality, information-rich post with comprehensive topic coverage.
- **Content Standards**:
  - **Depth & Breadth**: Ensure the content is detailed and covers the topic thoroughly.
  - **Core Points**: Must include **3-5 distinct core key points**.
  - **Word Count**: Total length must be **at least 300 words**.
- **Strict Emoji Policy**:
  - **Usage**: Use emojis ONLY when they highly relevant and enhance expression.
  - **Frequency**: **Maximum 2 emojis per paragraph**.
  - **Context**: Ensure emojis accurately match the surrounding text meaning.
- **Tone & Voice**:
  - Professional yet authentic and engaging.
  - Aligned with brand tone and user reading habits.

### 3. Quality Assurance (Self-Correction)
- **Completeness Check**: Does the text exceed 300 words and cover 3-5 core points?
- **Emoji Check**: Are emojis used sparingly (max 2/para) and accurately?
- **Vibe Check**: Does it meet the high-quality standards of the platform?

// ... existing JSON structure ...
`
```
