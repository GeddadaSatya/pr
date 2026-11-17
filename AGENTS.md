<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Mandatory Git Push Protocol: Detailed HTML Push Report Requirement

For EVERY git push operation to any branch:
1. **Rationale (Why):** Clearly state the business objective and technical necessity for pushing these changes.
2. **Code & Architecture Breakdown (What):** Detail every modified or added file, explaining what code was introduced, functions added, and architectural significance.
3. **Artifact Deliverable:**
   - Generate a self-contained, interactive **HTML Report** saved in `docs/push-reports/<TIMESTAMP>_<BRANCH>_<COMMIT_TITLE>.html`.
   - Provide a direct clickable link to the HTML report in chat along with key highlights.
