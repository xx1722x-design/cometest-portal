#!/usr/bin/env python3
"""
Retroactively update all games in gamesData.ts with occult metadata, controls, and SEO keywords
"""

import re
import json
from pathlib import Path
from typing import Dict, List

# Game title to occult theme mapping
THEME_MAPPING = {
    # Cosmic/Space related
    'unifrost': 'cosmic-horror',
    'suupaa-yunikoon': 'cosmic-horror',
    'xx142-b2exe': 'cosmic-horror',

    # Dark/Mystery related
    'witchcat': 'necromancy-spirits',
    'whiskers-witch-adventure': 'alchemy-dark-magic',
    'black-cat-squadron': 'anomalous-physics',
    'ashes-of-ulthar': 'cosmic-horror',
    'echoes-of-nyx': 'cosmic-horror',

    # Anomalous/Physics related
    'non-mewtonian-cat': 'anomalous-physics',
    'sp13ktra-main': 'anomalous-physics',

    # Sacred/Geometric
    'celestial-paws': 'sacred-geometry',
    'spectral-horn': 'sacred-geometry',

    # Default (web games/interactive)
}

# Occult-themed story descriptions
STORY_TEMPLATES = {
    'cosmic-horror': "Ancient cosmic forces stir beyond the veil. Signals from the void pierce through dimensional rifts, hinting at incomprehensible geometries and entities that defy human perception. Delve into the abyss and uncover truths that challenge reality itself.",
    'necromancy-spirits': "The boundary between the living and the dead grows thin. Spectral energies linger in forgotten places, whispering secrets of lost souls. Navigate this ethereal realm where life and death intertwine in ways reality cannot fully comprehend.",
    'alchemy-dark-magic': "Hidden formulas unlock the transmutation of matter and mind. Forbidden alchemical secrets lie dormant, waiting for those bold enough to dabble in forces beyond conventional understanding. Experiment and transform the very essence of existence.",
    'anomalous-physics': "Laws of physics bend and shatter here. Gravity defies expectation, time flows irregularly, and matter exhibits impossible properties. Document these anomalies and question the foundation of natural law.",
    'sacred-geometry': "Perfect patterns weave through creation. Sacred geometric forms hold the keys to cosmic secrets, embedded in nature's design. Unlock the mathematical harmony underlying all existence.",
    'puzzle': "Reality becomes a puzzle to solve. Each enigma reveals deeper mysteries, layering complexity upon complexity. Your mind is the key to unraveling dimensional inconsistencies.",
    'web_games': "An experimental simulation blurs the line between game and reality. Interactive environments defy conventional logic, challenging your perception of what interactive entertainment can be.",
}

# Occult-themed SEO keywords
SEO_TEMPLATES = {
    'cosmic-horror': ['cosmic anomaly', 'dimensional entity', 'void exploration simulator', 'interdimensional phenomenon', 'cosmic mystery'],
    'necromancy-spirits': ['spirit summoning', 'spectral entity encounter', 'afterlife simulator', 'paranormal investigation', 'supernatural realm'],
    'alchemy-dark-magic': ['forbidden alchemy game', 'transmutation simulator', 'dark magic experiment', 'alchemical mystery', 'occult knowledge'],
    'anomalous-physics': ['anomalous physics', 'gravity anomaly game', 'impossible physics simulator', 'physics paradox', 'reality anomaly'],
    'sacred-geometry': ['sacred geometry game', 'cosmic pattern puzzle', 'mathematical harmony', 'geometric puzzle', 'sacred architecture'],
    'puzzle': ['dimensional puzzle', 'logic anomaly', 'reality puzzle game', 'cognitive challenge', 'dimensional enigma'],
    'web_games': ['interactive simulation', 'experimental gameplay', 'reality-bending game', 'unconventional mechanics', 'immersive experience'],
}

# Standard controls by category
CONTROLS_TEMPLATES = {
    'web_games': "⌨️ [WASD/Arrow Keys] Move | [Space] Jump/Interact | 🖱️ [Mouse] Look/Aim",
    'simulation': "🖱️ [Mouse] Navigate | [Click] Select | [Space] Pause | [R] Reset",
    'space_universe': "⌨️ [Arrow Keys] Navigate | 🖱️ [Click] Select | [Space] Zoom | [W] Warp",
}

def get_game_theme(game_id: str, category: str) -> str:
    """Determine occult theme for a game"""
    if game_id in THEME_MAPPING:
        return THEME_MAPPING[game_id]

    # Default themes by category pattern
    if 'cat' in game_id.lower():
        return 'necromancy-spirits'
    elif 'cosmic' in game_id.lower() or 'space' in game_id.lower() or 'star' in game_id.lower():
        return 'cosmic-horror'
    elif category == 'simulation':
        return 'anomalous-physics'
    else:
        return 'abyssal-frequencies'

def get_story(theme: str, game_id: str) -> str:
    """Get story description for theme"""
    if theme in STORY_TEMPLATES:
        return STORY_TEMPLATES[theme]
    return STORY_TEMPLATES.get('web_games', 'An experimental simulation awaits discovery.')

def get_keywords(theme: str) -> List[str]:
    """Get SEO keywords for theme"""
    if theme in SEO_TEMPLATES:
        return SEO_TEMPLATES[theme]
    return SEO_TEMPLATES.get('web_games', ['experimental game', 'interactive simulation'])

def get_controls(category: str) -> str:
    """Get controls for category"""
    return CONTROLS_TEMPLATES.get(category, CONTROLS_TEMPLATES['web_games'])

def theme_to_emoji(theme: str) -> str:
    """Convert theme to emoji"""
    emojis = {
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
    return emojis.get(theme, '🎮')

def update_game_entry(game_dict: Dict, game_id: str, category: str) -> Dict:
    """Update a game entry with occult metadata"""
    theme = get_game_theme(game_id, category)

    game_dict['storyDescription'] = get_story(theme, game_id)
    game_dict['seoKeywords'] = get_keywords(theme)
    game_dict['controls'] = get_controls(category)
    game_dict['occultTheme'] = theme
    game_dict['thumbnail'] = theme_to_emoji(theme)
    game_dict['icon'] = theme_to_emoji(theme)

    return game_dict

def main():
    games_file = Path(r"D:\cometest_portal\src\config\gamesData.ts")

    # Read the entire file
    with open(games_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract the array content using regex
    match = re.search(r'export const GAMES_DATA: GameItem\[\] = \[(.*)\];', content, re.DOTALL)
    if not match:
        print("❌ Could not find GAMES_DATA array")
        return

    array_content = match.group(1)

    # Split by game entries (looking for patterns like "},\n  {")
    # This is a simplified approach - in production, use a proper parser

    # For now, let's use a simpler regex-based approach
    # Find all game objects and update them

    def replace_game(match_obj):
        game_str = match_obj.group(0)

        # Extract game_id
        id_match = re.search(r"id: '([^']+)'", game_str)
        if not id_match:
            return game_str

        game_id = id_match.group(1)

        # Extract category
        cat_match = re.search(r"category: '([^']+)'", game_str)
        category = cat_match.group(1) if cat_match else 'web_games'

        # Get new metadata
        theme = get_game_theme(game_id, category)
        story = get_story(theme, game_id)
        keywords = get_keywords(theme)
        controls = get_controls(category)
        emoji = theme_to_emoji(theme)

        # Build keywords array string
        keywords_str = ', '.join([f"'{kw}'" for kw in keywords])

        # Replace or add storyDescription
        if 'storyDescription:' in game_str:
            game_str = re.sub(
                r'storyDescription: "[^"]*"',
                f'storyDescription: "{story}"',
                game_str
            )
        else:
            # Add after controls
            game_str = re.sub(
                r'(controls: "[^"]*")',
                f'\\1,\n    storyDescription: "{story}"',
                game_str
            )

        # Replace or add seoKeywords
        if 'seoKeywords:' in game_str:
            game_str = re.sub(
                r'seoKeywords: \[[^\]]*\]',
                f'seoKeywords: [{keywords_str}]',
                game_str
            )
        else:
            game_str = re.sub(
                r'(storyDescription: "[^"]*")',
                f'\\1,\n    seoKeywords: [{keywords_str}]',
                game_str
            )

        # Replace or add controls
        if 'controls:' in game_str:
            game_str = re.sub(
                r'controls: "[^"]*"',
                f'controls: "{controls}"',
                game_str
            )
        else:
            # Add after id
            game_str = re.sub(
                r"(id: '[^']+')",
                f"\\1,\n    controls: \"{controls}\"",
                game_str
            )

        # Replace or add occultTheme
        if 'occultTheme:' in game_str:
            game_str = re.sub(
                r"occultTheme: '[^']*'",
                f"occultTheme: '{theme}'",
                game_str
            )
        else:
            # Add before thumbnail
            game_str = re.sub(
                r'(seoKeywords: \[[^\]]*\]),',
                f'\\1,\n    occultTheme: \'{theme}\',',
                game_str
            )

        # Update thumbnail and icon
        game_str = re.sub(r"thumbnail: '[^']*'", f"thumbnail: '{emoji}'", game_str)
        game_str = re.sub(r"icon: '[^']*'", f"icon: '{emoji}'", game_str)

        return game_str

    # Apply replacement to all game entries
    updated_content = re.sub(
        r'\{\s*id: [^}]*?\n  \}',
        replace_game,
        content,
        flags=re.DOTALL
    )

    # Write back
    with open(games_file, 'w', encoding='utf-8') as f:
        f.write(updated_content)

    print("✅ Updated gamesData.ts with occult metadata!")

if __name__ == '__main__':
    main()
