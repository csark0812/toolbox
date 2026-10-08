# Rendered verification recipe

<!-- source-of-truth: practical browser evidence for web interface completion. -->
<!-- doc-meta: owner=eng | last-reviewed=2026-10-07 -->

Use the project's browser test runner and served app. Replace the URL and selectors with the actual surface. These checks complement full-size screenshot review and manual keyboard inspection.

1. Reproduce one real working state and each reachable failure or recovery state. Keep sample data labeled.
2. At the smallest supported width and representative phone, tablet, and desktop widths, fail on document overflow and lost primary actions. Inspect local scroll regions separately; intentional scrolling is valid.
3. Drive the primary keyboard path. Assert a visible focus indication and the same reachable action as pointer use.
4. Emulate reduced motion and confirm content and final state remain visible. Check the normal motion path for interruption and dismissal.
5. Capture full-page screenshots after fonts and images settle. Compare hierarchy, wrapping, contrast, imagery, and control density by eye.
6. Run accessibility scans where available. Review names, reading order, zoom, forced colors, and targets manually. Record the browser, viewport, OS simulation, and skipped checks.

For a Playwright-based project, a focused test can start with this mechanical core:

```ts
for (const width of [320, 390, 768, 1440]) {
  await page.setViewportSize({ width, height: 900 })
  await page.goto(surfaceUrl)
  await page.locator(primaryAction).waitFor({ state: 'visible' })
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  )
  expect(overflow, `document overflow at ${width}px`).toBe(false)
}
await page.emulateMedia({ reducedMotion: 'reduce' })
await page.reload()
await expect(page.locator(primaryAction)).toBeVisible()
```

Test the check itself against a deliberately overflowing fixture before relying on it as a gate. Adapt the selector and expected states to the surface. A passing document-width check alone does not prove local containers, visual craft, or accessibility.
