#!/usr/bin/env python3
"""
13개 게임의 description을 englishDescription으로 업데이트
"""

import re

filepath = r"D:\cometest_portal\src\config\gamesData.ts"

# 13개 게임의 ID와 설명 매핑
game_descriptions = {
    'gjallarhorn': 'When the ancient horn pierces the silent veil, a deafening resonance bleeds from the cold, endless void beyond the stars. Unspeakable cosmic entities awaken to harvest the shattered remnants of mortal sanity.',
    'huecorn': 'Beyond the visible spectrum lies an ancient spiral horn of impossible light, tearing open the fragile fabric of reality to expose the hungry void beneath. As chromatic corruption bleeds through the cosmic rift, human perception shatters.',
    'panzercorn': 'Forged from the scorched iron of dead stars and bound by forbidden abyssal rites, the Panzercorn stalks the silent vacuums between realities. Its singular, spiraled horn channels the suffocating hunger of the grand Void.',
    'prismhoof': 'Beneath bleeding stars, an ancient horned nightmare treads upon the frayed seams of reality, casting impossible geometries of unlight. Its crystalline hooves shatter the mortal veil, unleashing forbidden spectra.',
    'rainbow-rescue': 'When the primordial spectrum shattered across the infinite void, its lingering hues were trapped within the maws of slumbering cosmic abominations. Armed with forbidden rituals, you must descend into the abyssal quiet.',
    'seven-cushions': 'Bound by seven sacred boundaries of midnight velvet, the cosmic spheres drift across an abyssal plane of forbidden geometry. Each calculated ricochet tears through the fabric of reality, whispering ancient blasphemies.',
    'sp13ktra': 'Beyond the shattered veil of reality lies an infinite abyss where ancient, nameless entities hunger for mortal consciousness. As the dying stars bleed into absolute darkness, you must decipher forbidden occult ciphers.',
    'spectral-horn': 'When the ancient relic sounds, its harrowing resonance tears open the fabric of reality to reveal the hungry, starless void beyond. Unnamable horrors stir in the abyssal dark.',
    'suupaa-yunikoon': 'Beneath a dying cosmos, the ancient entity Suupaa-Yunikoon stirs within the unlight of the infinite abyss. As esoteric sigils bleed across the void, human sanity unravels into a nightmare of forbidden geometries.',
    'swinicorn': 'Beyond the veil of human comprehension lies Swinicorn, a porcine abomination crowned with a singular, twisted horn of ancient starlight and despair. It wallows in the cosmic mire.',
    'unicorn-fireball': 'From the churning depths of an abyssal inferno, the Unicorn of Eldritch Fire charges forth, its spiraling horn blazing with the consuming flames of creation and annihilation.',
    'unifrost': 'From the frozen heart of the cosmos emerges Unifrost, an ancient, singular being of ice and despair, whose crystalline spire pierces the veil between worlds.',
}

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 각 게임의 description 업데이트
for game_id, desc in game_descriptions.items():
    # description 필드만 업데이트
    pattern = f"(id: '{game_id}',[^}}]*?description: )'[^']*',"
    replacement = f"\\1'{desc}',"
    content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ 모든 13개 게임의 description 업데이트 완료!")
