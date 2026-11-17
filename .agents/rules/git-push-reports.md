# Git Push HTML Documentation Rule

## Purpose
Ensure every push to version control is thoroughly audited, justified, and documented with an executive rationale, architecture impact, and file-level code analysis in an interactive HTML report stored in a single unified directory with a 12-hour timeline naming convention.

## Requirements for Every Push
Whenever a commit or set of commits is pushed to a remote branch:
1. **Explain the Objective (Why):** Describe why this feature, fix, or scaffold was pushed and its importance to the overall product.
2. **File & Code Breakdown (What):** List every added, modified, or deleted file with line counts and explanation of functionality.
3. **Dedicated Directory & 12-Hour Timeline Naming Scheme:**
   - **Directory:** Store all HTML push reports inside: `docs/push-reports/`
   - **Filename Format:** `<month><day>on<hhmmss>_<branch>_<commit_summary>.html`
   - **12-Hour Clock:** The time portion uses the 12-hour clock (01-12 hours, minutes, seconds) at the moment of the push.
   - **Examples:**
     - `nov17on102519_dev_native_mobile_setup.html` (for push at 10:25:19 AM)
     - `oct24on102332_dev_supabase_auth.html` (for push at 10:23:32 AM)
4. **Deliverable Notification:**
   - Embed key highlights in the chat response for immediate user review with a direct clickable link to the HTML file.
