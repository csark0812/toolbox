---
name: remote-ambient-probe
description: Validation-only fixture — proves whether ambient refs via GitHub URLs work at agent runtime. Not a shipped toolbox skill.
disable-model-invocation: true
---

# Remote ambient probe

Before any other work, open this URL with a network fetch tool (not local filesystem Read):

https://raw.githubusercontent.com/csark0812/toolbox/e8f6519d9c737f55ba71c16932e1a8cf06d3acc6/.skeleton/references/agent-routing.md

From that remote file, quote the H1 and the portable-stub sentence, then print exactly:

`REMOTE_AMBIENT_OK`
