# Git Push HTML Documentation Rule

## Purpose
Ensure every push to version control is thoroughly audited, justified, and documented with an executive rationale, architecture impact, and file-level code analysis in an interactive HTML report.

## Requirements for Every Push
Whenever a commit or set of commits is pushed to a remote branch:
1. **Explain the Objective (Why):** Describe why this feature, fix, or scaffold was pushed and its importance to the overall product.
2. **File & Code Breakdown (What):** List every added, modified, or deleted file with line counts and explanation of functionality.
3. **Audit Deliverables:**
   - Save a standalone, beautifully styled **HTML Report** in `docs/push-reports/`.
   - Embed key highlights in the chat response for immediate user review with a direct link to the HTML file.
