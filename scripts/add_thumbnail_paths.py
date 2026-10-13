#!/usr/bin/env python3
"""
13개 게임의 image 필드를 추가 또는 업데이트
"""

import re

filepath = r"D:\cometest_portal\src\config\gamesData.ts"

# 13개 게임 ID
game_ids = [
    'at-both-ends', 'gjallarhorn', 'huecorn', 'panzercorn', 'prismhoof',
    'rainbow-rescue', 'seven-cushions', 'sp13ktra', 'spectral-horn',
    'suupaa-yunikoon', 'swinicorn', 'unicorn-fireball', 'unifrost'
]

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 각 게임에 image 필드 추가
for game_id in game_ids:
    # pattern: thumbnail 필드 찾아서 그 뒤에 image 필드 추가
    pattern = f"(id: '{game_id}',[^}}]*?thumbnail: '🎮',)"
    replacement = f"\\1\n    image: '/thumbnails/{game_id}.png',"

    # image가 이미 있으면 스킵
    if f"image: '/thumbnails/{game_id}.png'" not in content:
        content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ 13개 게임의 image 필드 추가 완료!")
