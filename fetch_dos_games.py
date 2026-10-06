#!/usr/bin/env python3
"""
Fetch metadata for Internet Archive MS-DOS collection.
Saves titles, release years, identifiers, and descriptions to CSV.
"""

import csv
import json
import time
from typing import Optional, List, Dict
from datetime import datetime
import requests
from urllib.parse import urlencode

# Configuration
COLLECTION_ID = "softwarelibrary_msdos"
OUTPUT_FILE = "dos_games_catalog.csv"
API_BASE = "https://archive.org/advancedsearch.php"
ITEMS_PER_PAGE = 500  # Max items per request
RATE_LIMIT_DELAY = 1  # Seconds between requests

class DOSGamesFetcher:
    """Fetch MS-DOS games metadata from Internet Archive."""

    def __init__(self, output_file: str = OUTPUT_FILE):
        self.output_file = output_file
        self.items = []
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'DOS-Games-Fetcher/1.0 (+https://archive.org)'
        })

    def fetch_collection(self, verbose: bool = True) -> List[Dict]:
        """Fetch all items from the MS-DOS collection with pagination."""
        page = 0
        total_items = 0

        while True:
            start = page * ITEMS_PER_PAGE

            if verbose:
                print(f"Fetching items {start} to {start + ITEMS_PER_PAGE}...")

            params = {
                'q': f'collection:{COLLECTION_ID}',
                'fl': [
                    'identifier',
                    'title',
                    'date',
                    'description',
                    'year',
                    'creator',
                    'subject'
                ],
                'output': 'json',
                'rows': ITEMS_PER_PAGE,
                'start': start,
                'sort': 'identifier asc'
            }

            try:
                response = self.session.get(
                    API_BASE,
                    params=params,
                    timeout=30
                )
                response.raise_for_status()
                data = response.json()

                if 'response' not in data or 'docs' not in data['response']:
                    print("ERROR: Invalid API response format")
                    break

                docs = data['response']['docs']
                if not docs:
                    if verbose:
                        print("No more items found.")
                    break

                # Add items to collection
                for doc in docs:
                    item = self._extract_metadata(doc)
                    if item:
                        self.items.append(item)
                        total_items += 1

                if verbose:
                    print(f"  Fetched {len(docs)} items (Total: {total_items})")

                # Check if we've reached the end
                response_count = data['response'].get('numFound', 0)
                if start + len(docs) >= response_count:
                    if verbose:
                        print(f"Collection complete. Total items: {total_items}")
                    break

                page += 1
                time.sleep(RATE_LIMIT_DELAY)  # Rate limiting

            except requests.RequestException as e:
                print(f"ERROR fetching page {page}: {e}")
                if verbose:
                    print("Retrying in 5 seconds...")
                time.sleep(5)
                # Continue to retry
                continue
            except json.JSONDecodeError as e:
                print(f"ERROR parsing JSON response: {e}")
                break

        return self.items

    def _extract_metadata(self, doc: Dict) -> Optional[Dict]:
        """Extract relevant metadata from an archive.org document."""
        try:
            # Identifier is required
            identifier = doc.get('identifier', '').strip()
            if not identifier:
                return None

            # Extract fields with fallbacks
            title = doc.get('title', ['Unknown'])[0] if isinstance(doc.get('title'), list) else doc.get('title', 'Unknown')
            title = str(title).strip()

            # Extract year - try multiple fields
            year = None
            if 'year' in doc:
                year_val = doc['year']
                if isinstance(year_val, list):
                    year = year_val[0] if year_val else None
                else:
                    year = year_val

            if not year and 'date' in doc:
                date_val = doc['date']
                if isinstance(date_val, list):
                    date_val = date_val[0] if date_val else None
                if date_val:
                    try:
                        year = str(date_val)[:4]  # Extract YYYY
                    except:
                        pass

            # Description
            description = doc.get('description', '')
            if isinstance(description, list):
                description = description[0] if description else ''
            description = str(description).strip()[:1000]  # Limit length

            # Creator/Publisher
            creator = doc.get('creator', '')
            if isinstance(creator, list):
                creator = ', '.join(creator[:3])  # Limit to 3 creators
            creator = str(creator).strip()

            # Subject/Tags
            subjects = doc.get('subject', [])
            if isinstance(subjects, str):
                subjects = [subjects]
            subjects = [str(s).strip() for s in subjects[:5]]  # Limit to 5 subjects
            subjects_str = '; '.join(subjects)

            return {
                'identifier': identifier,
                'title': title,
                'year': year or '',
                'description': description,
                'creator': creator,
                'subjects': subjects_str,
                'url': f'https://archive.org/details/{identifier}'
            }

        except Exception as e:
            print(f"ERROR extracting metadata: {e}")
            return None

    def save_csv(self, verbose: bool = True) -> bool:
        """Save fetched items to CSV file."""
        if not self.items:
            print("ERROR: No items to save")
            return False

        try:
            fieldnames = [
                'identifier',
                'title',
                'year',
                'description',
                'creator',
                'subjects',
                'url'
            ]

            with open(self.output_file, 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(self.items)

            if verbose:
                print(f"\n✓ Saved {len(self.items)} items to {self.output_file}")
                print(f"  File size: {self._get_file_size(self.output_file)}")

            return True

        except Exception as e:
            print(f"ERROR saving CSV: {e}")
            return False

    @staticmethod
    def _get_file_size(filepath: str) -> str:
        """Get human-readable file size."""
        try:
            size = __import__('os').path.getsize(filepath)
            for unit in ['B', 'KB', 'MB']:
                if size < 1024:
                    return f"{size:.1f} {unit}"
                size /= 1024
            return f"{size:.1f} GB"
        except:
            return "unknown"

    def print_sample(self, count: int = 5):
        """Print sample of fetched items."""
        if not self.items:
            print("No items to display")
            return

        print(f"\n📦 Sample of {min(count, len(self.items))} items:")
        print("-" * 80)

        for i, item in enumerate(self.items[:count], 1):
            print(f"\n{i}. {item['title']}")
            print(f"   Identifier: {item['identifier']}")
            print(f"   Year: {item['year']}")
            if item['creator']:
                print(f"   Creator: {item['creator']}")
            if item['description']:
                desc = item['description'][:100] + ("..." if len(item['description']) > 100 else "")
                print(f"   Description: {desc}")
            print(f"   URL: {item['url']}")


def main():
    """Main entry point."""
    print("🕹️  Internet Archive MS-DOS Collection Fetcher")
    print("=" * 80)
    print(f"Collection: {COLLECTION_ID}")
    print(f"Output: {OUTPUT_FILE}")
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)
    print()

    # Create fetcher and start collection
    fetcher = DOSGamesFetcher(OUTPUT_FILE)

    print("Fetching collection metadata from Internet Archive...")
    print("(This may take a few minutes for large collections)\n")

    items = fetcher.fetch_collection(verbose=True)

    if items:
        # Save to CSV
        if fetcher.save_csv(verbose=True):
            # Print statistics
            print("\n📊 Statistics:")
            print(f"  Total items: {len(items)}")

            # Year range
            years = [int(item['year']) for item in items if item['year'] and item['year'].isdigit()]
            if years:
                print(f"  Year range: {min(years)} - {max(years)}")

            # Creators
            creators_set = set()
            for item in items:
                if item['creator']:
                    creators_set.update([c.strip() for c in item['creator'].split(',')])
            print(f"  Unique creators/publishers: {len(creators_set)}")

            # Show sample
            fetcher.print_sample(3)

            print(f"\n✓ Done! Collection saved to {OUTPUT_FILE}")
    else:
        print("ERROR: Failed to fetch any items")
        return 1

    return 0


if __name__ == '__main__':
    exit(main())
