# Internet Archive MS-DOS Collection Fetcher

A robust Python script to fetch and catalog all MS-DOS games from the Internet Archive's `softwarelibrary_msdos` collection.

## Features

✅ **Full Collection Fetching**: Retrieves all items from the MS-DOS collection with automatic pagination
✅ **Rich Metadata Extraction**: Captures titles, years, identifiers, descriptions, creators, and subject tags
✅ **Error Handling**: Retry logic for network failures and malformed responses
✅ **Rate Limiting**: Respects Internet Archive's server with configurable delays
✅ **CSV Export**: Clean, UTF-8 encoded CSV output for easy analysis
✅ **Progress Reporting**: Real-time feedback on fetch progress and statistics

## Installation

### Requirements
- Python 3.6+
- `requests` library

### Setup

```bash
# Install dependencies
pip install requests

# Or with conda
conda install requests
```

## Usage

### Basic Usage

```bash
python fetch_dos_games.py
```

This will:
1. Fetch all items from the MS-DOS collection
2. Extract metadata (title, year, description, creator, etc.)
3. Save results to `dos_games_catalog.csv`
4. Display statistics and sample items

### Output File

**Filename**: `dos_games_catalog.csv`

**Columns**:
- `identifier` - Unique Internet Archive identifier
- `title` - Game title
- `year` - Release year (extracted from date or year field)
- `description` - Game description (up to 1000 chars)
- `creator` - Publisher/Developer (up to 3 listed)
- `subjects` - Tags/Categories (up to 5 listed)
- `url` - Direct link to Internet Archive item page

**Example Row**:
```
doom,Doom,1993,The ultimate experience in fright,id Software,games; action; first-person,https://archive.org/details/doom
```

## Configuration

Edit the script to customize:

```python
COLLECTION_ID = "softwarelibrary_msdos"  # Collection identifier
OUTPUT_FILE = "dos_games_catalog.csv"    # Output filename
API_BASE = "https://archive.org/advancedsearch.php"  # API endpoint
ITEMS_PER_PAGE = 500  # Items fetched per request (max 500)
RATE_LIMIT_DELAY = 1  # Seconds between requests
```

## Features in Detail

### Pagination
- Automatically fetches all items in chunks (500 per request)
- Continues until entire collection is retrieved
- Shows progress for each page

### Error Handling
- Network timeout protection (30 seconds)
- JSON parsing error recovery
- Retry logic with 5-second delay on failures
- Graceful handling of malformed metadata

### Metadata Extraction
- Extracts year from multiple fields (year, date)
- Handles list-type fields (title, description, creator)
- Limits description length to prevent bloat
- Truncates lists to reasonable counts

### Rate Limiting
- Delays between requests to avoid server strain
- Customizable via `RATE_LIMIT_DELAY`
- User-Agent header identification

## Example Output

```
🕹️  Internet Archive MS-DOS Collection Fetcher
================================================================================
Collection: softwarelibrary_msdos
Output: dos_games_catalog.csv
Started: 2024-01-15 14:32:00
================================================================================

Fetching collection metadata from Internet Archive...
(This may take a few minutes for large collections)

Fetching items 0 to 500...
  Fetched 500 items (Total: 500)
Fetching items 500 to 1000...
  Fetched 500 items (Total: 1000)
...

✓ Saved 2847 items to dos_games_catalog.csv
  File size: 12.3 MB

📊 Statistics:
  Total items: 2847
  Year range: 1981 - 2002
  Unique creators/publishers: 847

📦 Sample of 3 items:

1. Doom
   Identifier: doom
   Year: 1993
   Creator: id Software
   Description: The ultimate experience in fright. Almost 600 new monsters...
   URL: https://archive.org/details/doom

2. Prince of Persia
   Identifier: princeofpersia
   Year: 1989
   Creator: Broderbund
   Description: Step into the role of the Prince, an adventurer on a quest...
   URL: https://archive.org/details/princeofpersia

✓ Done! Collection saved to dos_games_catalog.csv
```

## Troubleshooting

### "No module named 'requests'"
```bash
pip install requests
```

### "Connection timeout"
- Internet Archive servers may be slow
- Increase timeout: Edit `timeout=30` in the script
- Run during off-peak hours

### "Invalid API response format"
- Internet Archive API may have changed
- Check: https://archive.org/advancedsearch.php
- Report issue with API documentation link

### "UnicodeEncodeError"
- Usually fixed automatically (uses UTF-8)
- If persists, check system encoding: `python -c "import sys; print(sys.getdefaultencoding())"`

## Performance

- **Network time**: 2-10 minutes depending on collection size
- **Processing**: ~2 seconds per 500 items
- **Output file**: ~12-15 MB for full MS-DOS collection

## API Details

Uses Internet Archive's Advanced Search API:
- **Endpoint**: `https://archive.org/advancedsearch.php`
- **Format**: JSON
- **Fields queried**: identifier, title, date, description, year, creator, subject
- **Rate limit**: None specified, but using 1-second delays for safety

## License

This script is provided as-is for educational and research purposes.

## References

- Internet Archive: https://archive.org
- MS-DOS Collection: https://archive.org/details/softwarelibrary_msdos
- Advanced Search API: https://archive.org/advancedsearch.php

---

**Created**: 2024
**Maintained for**: Internet Archive MS-DOS Collection research and curation
