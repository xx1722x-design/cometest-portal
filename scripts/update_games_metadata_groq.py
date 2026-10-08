#!/usr/bin/env python3
"""
Retroactively update all games in gamesData.ts with Groq AI-generated occult metadata
"""

import re
import json
from pathlib import Path
from dotenv import load_dotenv
from groq import Groq
import os
import sys

# Fix encoding for Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Load environment variables
load_dotenv(Path(__file__).parent.parent / ".env")

# Initialize Groq client
groq_api_key = os.getenv("GROQ_API_KEY")
if not groq_api_key:
    print("GROQ_API_KEY not found in .env file")
    exit(1)

client = Groq(api_key=groq_api_key)

# Game-to-theme mapping
OCCULT_THEME_MAP = {
    'witchcat': 'necromancy-spirits',
    'whiskers-witch-adventure': 'alchemy-dark-magic',
    'triska-the-ninja-cat': 'anomalous-physics',
    'non-mewtonian-cat': 'anomalous-physics',
    'kuro-neko-market': 'sacred-geometry',
    'kittens-united': 'sacred-geometry',
    'echoes-of-nyx': 'cosmic-horror',
    'celestial-paws': 'sacred-geometry',
    'catculus': 'anomalous-physics',
    'black-cat-squadron': 'anomalous-physics',
    'ashes-of-ulthar': 'cosmic-horror',
    'unifrost': 'cosmic-horror',
    'unicorn-fireball': 'anomalous-physics',
    'swinicorn': 'sacred-geometry',
    'suupaa-yunikoon': 'cosmic-horror',
    'spectral-horn': 'sacred-geometry',
    'sp13ktra-main': 'anomalous-physics',
    'seven-cushions': 'abyssal-frequencies',
    'rainbow-rescue': 'illusions-hallucinations',
    'prismhoof': 'sacred-geometry',
    'gjallarhorn': 'abyssal-frequencies',
    'at-both-ends': 'breach-anomalies',
    'xx142-b2exe': 'cosmic-horror',
    'underrun': 'breach-anomalies',
    'systems-offline': 'cosmic-horror',
    'panzercorn': 'forbidden-specimens',
    'merlin-vs-alfonso': 'alchemy-dark-magic',
    'huecorn': 'sacred-geometry',
    'edge-not-found': 'breach-anomalies',
    'dying-dreams': 'necromancy-spirits',
    'coup-ahoo': 'illusions-hallucinations',
    'cat-survivors': 'necromancy-spirits',
    'bounce-back': 'anomalous-physics',
    'beat-rocks': 'anomalous-physics',
}

EMOJI_MAP = {
    'cosmic-horror': '👁️',
    'necromancy-spirits': '💀',
    'alchemy-dark-magic': '⚗️',
    'anomalous-physics': '⚡',
    'sacred-geometry': '✨',
    'abyssal-frequencies': '🔮',
    'forbidden-specimens': '🧬',
    'illusions-hallucinations': '🎭',
    'breach-anomalies': '🌌',
    'unidentified-artifacts': '📿',
}

def get_ai_metadata(game_id: str, theme: str) -> dict:
    """Call Groq API to generate metadata for a game"""
    try:
        prompt = f"""Generate metadata for a game with ID "{game_id}" and occult theme "{theme}".

Respond with EXACTLY this JSON format (no extra text):
{{
  "storyDescription": "3-4 sentence immersive story",
  "seoKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "controls": "1-2 lines of controls description"
}}

Theme context: {theme.replace('-', ' ')} game in an occult mystery portal."""

        message = client.messages.create(
            model="mixtral-8x7b-32768",
            max_tokens=300,
            messages=[{"role": "user", "content": prompt}]
        )

        response_text = message.content[0].text

        # Try to extract JSON
        json_match = re.search(r'\{[^{}]*\}', response_text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
        else:
            return None
    except Exception as e:
        return None

def get_default_metadata(theme: str, game_id: str) -> dict:
    """Get default metadata when API fails"""
    stories = {
        'cosmic-horror': f'Signals from the cosmic void pierce through dimensional rifts. Ancient entities stir beyond comprehension. {game_id} holds secrets that defy reality itself.',
        'necromancy-spirits': f'The boundary between life and death grows thin. Spectral energies whisper forgotten secrets in {game_id}. Navigate this ethereal realm where souls linger.',
        'alchemy-dark-magic': f'Forbidden formulas unlock transmutation in {game_id}. Dabble in forces beyond convention. Transform matter and mind through forbidden arts.',
        'anomalous-physics': f'Laws of physics bend and shatter in {game_id}. Gravity defies, time flows irregularly, matter behaves impossibly. Document these anomalies.',
        'sacred-geometry': f'Perfect patterns weave through {game_id}. Sacred geometric forms unlock cosmic secrets. Uncover mathematical harmony in creation.',
        'abyssal-frequencies': f'Mysterious signals emanate from the abyss in {game_id}. Frequencies from unknown dimensions echo through reality. Decode the void.',
        'forbidden-specimens': f'Forbidden archives in {game_id} house unknown life forms. Research anomalous specimens and uncover biological mysteries.',
        'illusions-hallucinations': f'Reality blurs in {game_id}. Mental laboratory where illusion and truth intertwine. Explore consciousness boundaries.',
        'breach-anomalies': f'{game_id} tracks dimensional anomalies. Rifts between realities spread catastrophe. Study the breach phenomenon.',
        'unidentified-artifacts': f'Ancient artifacts in {game_id} defy explanation. Interpret traces of unknown civilizations.',
    }

    keywords = {
        'cosmic-horror': ['cosmic anomaly', 'dimensional entity', 'void exploration', 'interdimensional', 'cosmic mystery'],
        'necromancy-spirits': ['spirit summoning', 'spectral entity', 'afterlife simulator', 'paranormal', 'supernatural realm'],
        'alchemy-dark-magic': ['forbidden alchemy', 'transmutation', 'dark magic', 'alchemical', 'occult knowledge'],
        'anomalous-physics': ['anomalous physics', 'gravity anomaly', 'impossible physics', 'physics paradox', 'reality anomaly'],
        'sacred-geometry': ['sacred geometry', 'cosmic pattern', 'mathematical harmony', 'geometric puzzle', 'sacred architecture'],
        'abyssal-frequencies': ['abyssal signals', 'dimensional frequency', 'void communication', 'abyss explorer', 'frequency anomaly'],
        'forbidden-specimens': ['forbidden research', 'anomalous biology', 'unknown specimens', 'biological anomaly', 'entity research'],
        'illusions-hallucinations': ['consciousness explorer', 'mental realm', 'illusion simulator', 'reality blur', 'mind anomaly'],
        'breach-anomalies': ['dimensional breach', 'reality rupture', 'anomaly tracker', 'breach simulation', 'rift explorer'],
        'unidentified-artifacts': ['ancient artifacts', 'unknown civilization', 'artifact analysis', 'classified archive', 'artifact mystery'],
    }

    controls = "WASD/Arrow Keys Navigate | Mouse Interact | Space Action | R Reset"

    return {
        'storyDescription': stories.get(theme, f'Explore the mysteries of {game_id} in this occult experience.'),
        'seoKeywords': keywords.get(theme, ['mysterious game', 'occult simulator', 'interactive mystery']),
        'controls': controls,
    }

def update_games_file():
    """Update gamesData.ts with Groq AI metadata"""
    games_file = Path(r"D:\cometest_portal\src\config\gamesData.ts")

    print("[*] Reading gamesData.ts...")
    with open(games_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find all game entries
    game_pattern = r'\{\s*id:\s*[\'"]([^\'"]+)[\'"].*?\}'
    games = list(re.finditer(game_pattern, content, re.DOTALL))

    total_games = len(games)
    print(f"[*] Found {total_games} games to update\n")

    updated_content = content

    for idx, game_match in enumerate(games, 1):
        game_id = game_match.group(1)
        full_match = game_match.group(0)

        theme = OCCULT_THEME_MAP.get(game_id, 'abyssal-frequencies')
        emoji = EMOJI_MAP.get(theme, '🎮')

        print(f"[{idx}/{total_games}] Updating {game_id}...")

        # Try to get AI metadata
        ai_metadata = get_ai_metadata(game_id, theme)
        metadata = ai_metadata if ai_metadata else get_default_metadata(theme, game_id)

        # Build updated game entry
        updated_entry = full_match

        # Add/update fields
        if 'storyDescription:' not in updated_entry:
            story = metadata['storyDescription'].replace('"', '\\"')
            updated_entry = re.sub(
                r'(controls: "[^"]*")',
                f'\\1,\n    storyDescription: "{story}"',
                updated_entry
            )

        if 'seoKeywords:' not in updated_entry:
            keywords_str = ', '.join([f"'{kw}'" for kw in metadata['seoKeywords']])
            updated_entry = re.sub(
                r'(storyDescription: "[^"]*")',
                f'\\1,\n    seoKeywords: [{keywords_str}]',
                updated_entry
            )

        if 'occultTheme:' not in updated_entry:
            updated_entry = re.sub(
                r'(seoKeywords: \[[^\]]*\])',
                f'\\1,\n    occultTheme: \'{theme}\'',
                updated_entry
            )

        # Update thumbnail and icon
        updated_entry = re.sub(r"thumbnail: '[^']*'", f"thumbnail: '{emoji}'", updated_entry)
        updated_entry = re.sub(r"icon: '[^']*'", f"icon: '{emoji}'", updated_entry)

        # Replace in content
        updated_content = updated_content.replace(full_match, updated_entry, 1)

        if (idx % 5 == 0):
            print(f"[+] {idx} games updated...\n")

    print("\n[*] Writing updated gamesData.ts...")
    with open(games_file, 'w', encoding='utf-8') as f:
        f.write(updated_content)

    print("[+] All games updated with occult metadata!")

if __name__ == '__main__':
    update_games_file()
