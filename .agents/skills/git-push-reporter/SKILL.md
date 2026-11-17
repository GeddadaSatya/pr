---
name: git-push-reporter
description: Automated audit, documentation, and standalone interactive HTML report generator for every Git push with timeline-based naming.
---

# Git Push HTML Reporter Skill

This skill documents and audits code changes before and during git push actions.

## Workflow
1. Inspect the git diff and commit log: `git log -n 1 --stat` and `git diff HEAD~1`.
2. Extract:
   - Commit SHA, Branch name, Author, Timestamp.
   - Purpose & Business Rationale (Why).
   - Categorized file additions & modifications (What).
   - Code deep dive into primary files.
   - Security, dependencies, and build verification.
3. Generate the push audit report:
   - Save standalone **HTML Report** in `docs/push-reports/` using the Wealth Command luxury styling.
   - **Enforce naming convention:** `<month><day>on<hhmmss>_<branch>_<commit_summary>.html` (e.g., `nov17on003228_dev_native_mobile_setup.html`).
4. Present the report and file link to the user.
