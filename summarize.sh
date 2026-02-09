#!/bin/bash
echo "=== Summary ==="
python3 -c "
import re
with open('/tmp/test_raw2.log') as f:
    content = f.read()

sections = re.split(r'===== RAW (\w+[\w+ ]*) RESPONSE =====', content)
for i in range(1, len(sections), 2):
    lang = sections[i].strip()
    json_str = sections[i+1].strip()
    if json_str.startswith('{'):
        import json
        # Find the end of JSON
        brace_count = 0
        end = 0
        for idx, ch in enumerate(json_str):
            if ch == '{': brace_count += 1
            elif ch == '}': brace_count -= 1
            if brace_count == 0:
                end = idx + 1
                break
        data = json.loads(json_str[:end])
        p = data['data']['passed']
        t = data['data']['total']
        print(f'{lang}: {p}/{t} passed')
"
