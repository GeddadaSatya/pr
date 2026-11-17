import subprocess
import datetime
import os
import sys

def get_git_info():
    commit_sha = subprocess.check_output(["git", "rev-parse", "--short", "HEAD"]).decode().strip()
    full_sha = subprocess.check_output(["git", "rev-parse", "HEAD"]).decode().strip()
    branch = subprocess.check_output(["git", "rev-parse", "--abbrev-ref", "HEAD"]).decode().strip()
    subject = subprocess.check_output(["git", "log", "-1", "--format=%s"]).decode().strip()
    author = subprocess.check_output(["git", "log", "-1", "--format=%an"]).decode().strip()
    date_str = subprocess.check_output(["git", "log", "-1", "--format=%cd", "--date=iso"]).decode().strip()
    stat = subprocess.check_output(["git", "diff", "--stat", "HEAD~1"]).decode().strip()
    
    return {
        "short_sha": commit_sha,
        "full_sha": full_sha,
        "branch": branch,
        "subject": subject,
        "author": author,
        "date_str": date_str,
        "stat": stat
    }

def get_timeline_filename(branch, summary_slug):
    now = datetime.datetime.now()
    # Format: oct24on102332 (lowercase month + day + 'on' + HHMMSS)
    timeline = now.strftime("%b%don%H%M%S").lower()
    clean_slug = "".join(c if c.isalnum() else "_" for c in summary_slug).strip("_").lower()
    return f"{timeline}_{branch}_{clean_slug}.html"

if __name__ == "__main__":
    print("HTML Report generator ready. Timeline convention enforced.")
