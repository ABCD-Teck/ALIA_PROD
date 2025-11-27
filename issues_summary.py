import json
from pathlib import Path
from textwrap import shorten
issues = json.loads(Path('open_issues.json').read_text())
for issue in issues:
    title = issue['title']
    number = issue['number']
    labels = [lbl['name'] for lbl in issue.get('labels', [])]
    issue_type = (issue.get('type') or {}).get('name', '')
    body = (issue.get('body') or '').replace('\r', ' ').replace('\n', ' ')
    snippet = shorten(body, width=120, placeholder='...')
    print(f"#{number} [{issue_type}] {title} :: labels={labels}\n    {snippet}\n")
