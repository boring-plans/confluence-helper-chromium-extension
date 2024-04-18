#!/bin/bash
cd popup/t.md && pnpm build && cd ../..
dist_name=t.md-chromium-extension_$(date +%Y-%m-%d).zip
zip -r $dist_name icons popup/dist content.js content.css manifest.json
