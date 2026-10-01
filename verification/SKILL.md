---
name: verification
description: Create or maintain an executable repository-specific verification recipe and feature index. Run mapped user workflows and distinguish product regressions from harness or environment failures.
---

# Verification

<!-- source-of-truth: Create or maintain an executable repository-specific verification recipe and feature index -->
<!-- doc-meta: owner=eng | last-reviewed=2026-09-30 -->

Select create or maintain. Inspect repository operations and test ownership first; reuse existing launch/doctor/runtime mechanisms. Read [recipe.md](references/recipe.md) to generate a consumer-local verify-<app> skill with helpers only when needed. Generic Toolbox owns no app-specific runtime or product policy.

Creation: map supported features, implement prerequisites/actions/expected result/evidence/cleanup, and actually run the recipe. Have an independent fresh-context agent replay it when delegation is authorized. A generated file alone is not verified capability.

Maintenance: compare source changes to mapped behaviors and run every mapped pilot flow. Classify docs drift, harness defect, product regression or unavailable environment. List uncovered new behavior; do not claim exhaustive product coverage. Fix recipe/helper drift in scope. Product repair needs its own scope. Preserve expected behavior when a regression fails.

Discover consumer recipes and authorized operations through host/repository evidence. Respect exclusive runtime ownership and test data. Retain evidence before cleaning only owned resources. Report actual build/input fingerprints, commands and observed outcomes; distinguish mocks from authoritative persistence.
