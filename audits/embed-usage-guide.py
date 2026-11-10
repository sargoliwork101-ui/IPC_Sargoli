"""Embed the offline usage manual so preview popup rules or a missing sibling file cannot break help."""
import json,re
from pathlib import Path
page=Path('IPC-7352/tool.html')
guide=Path('IPC-7352/usage.html').read_text()
guide=guide.replace('href="tool.html"','href="#selection"').replace('بازگشت به برنامه','ابتدای راهنما')
block='<script id="usageGuideData" type="application/json">'+json.dumps(guide,ensure_ascii=False).replace('</','<\\/')+'</script>'
s=page.read_text()
if 'id="usageGuideData"' in s:
 s=re.sub(r'<script id="usageGuideData" type="application/json">.*?</script>',lambda _:block,s,count=1,flags=re.S)
else:s=s.replace('<script id="referenceFootprintData"',block+'\n<script id="referenceFootprintData"',1)
page.write_text(s)
