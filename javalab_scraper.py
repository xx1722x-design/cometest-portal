#!/usr/bin/env python3
"""
JavaLab Simulation Scraper
Extracts all simulations from JavaLab.org/ko/ across all categories and pages
"""

import requests
from bs4 import BeautifulSoup
import csv
import time
from urllib.parse import urljoin
import sys

BASE_URL = "https://javalab.org/ko/"
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

def get_page(url):
    """Fetch a page with retry logic"""
    for attempt in range(3):
        try:
            response = requests.get(url, headers=HEADERS, timeout=10)
            response.encoding = 'utf-8'
            if response.status_code == 200:
                return response.text
            time.sleep(1)
        except Exception as e:
            print(f"Error fetching {url} (attempt {attempt+1}): {e}", file=sys.stderr)
            if attempt < 2:
                time.sleep(2)
    return None

def get_main_categories():
    """Extract main category links from homepage"""
    html = get_page(BASE_URL)
    if not html:
        return []

    soup = BeautifulSoup(html, 'html.parser')
    categories = []

    # Look for category links in navigation/menu
    # JavaLab structure: categories are linked from main page
    nav_links = soup.find_all('a', class_=['nav-link', 'category-link', 'menu-item'])

    # Fallback: look for common category patterns
    if not nav_links:
        nav_links = soup.find_all('a')

    for link in nav_links:
        href = link.get('href', '')
        text = link.get_text(strip=True)

        # Filter for Korean text (likely categories)
        if href and '/ko/' in href and text and any('가' <= c <= '힯' for c in text):
            full_url = urljoin(BASE_URL, href)
            if full_url not in [c[1] for c in categories]:
                categories.append((text, full_url))

    print(f"Found {len(categories)} potential categories")
    return categories

def scrape_simulations_from_page(url, category_name):
    """Extract simulations from a single page"""
    html = get_page(url)
    if not html:
        return []

    soup = BeautifulSoup(html, 'html.parser')
    simulations = []

    # Look for simulation cards - common patterns:
    # 1. div with class containing 'card', 'item', 'simulation'
    # 2. article tags
    # 3. li tags in lists

    cards = soup.find_all(['div', 'article', 'li'], class_=lambda x: x and any(term in x.lower() for term in ['card', 'item', 'simulation', 'lab', 'content']))

    if not cards:
        # Fallback: look for links with title and description pattern
        cards = soup.find_all('a', href=lambda x: x and '/ko/' in x)

    for card in cards:
        # Try multiple title extraction patterns
        title = None
        description = None
        sim_url = None

        # Pattern 1: Title in h3/h4/h2, description in p
        title_tag = card.find(['h3', 'h4', 'h2'])
        if title_tag:
            title = title_tag.get_text(strip=True)
        elif card.get_text():
            title = card.get_text(strip=True)[:100]

        # Extract description
        desc_tag = card.find(['p', 'span', 'div'], class_=lambda x: x and 'desc' in x.lower() if x else False)
        if desc_tag:
            description = desc_tag.get_text(strip=True)
        else:
            # Try second text node
            texts = card.find_all(string=True)
            if len(texts) > 1:
                description = texts[1].strip()

        # Extract URL
        link = card.find('a', href=True)
        if not link:
            link = card.find_parent('a', href=True) if card.name != 'a' else card

        if link:
            sim_url = link.get('href', '')
            if sim_url and not sim_url.startswith('http'):
                sim_url = urljoin(BASE_URL, sim_url)
        else:
            sim_url = card.get('href', '') if card.name == 'a' else None

        # Only add if we have at least title and URL
        if title and sim_url and '/ko/' in sim_url:
            if not description:
                description = ""
            simulations.append({
                'category': category_name,
                'title': title,
                'description': description,
                'url': sim_url
            })

    return simulations

def scrape_all_simulations():
    """Main scraping function - extract from all categories and pages"""
    all_simulations = []

    # Start with homepage to get category structure
    print("Fetching JavaLab homepage...")
    html = get_page(BASE_URL)
    if not html:
        print("Failed to fetch homepage")
        return all_simulations

    soup = BeautifulSoup(html, 'html.parser')

    # Extract all category pages by looking for category-specific URLs
    # Common pattern: /ko/category/ or direct category pages
    category_urls = set()

    for link in soup.find_all('a', href=True):
        href = link.get('href')
        if href and '/ko/' in href and href != '/ko/':
            # Filter out common non-category pages
            if not any(x in href for x in ['admin', 'login', 'register', 'profile', '.css', '.js', 'cdn']):
                category_urls.add(href)

    print(f"\nFound {len(category_urls)} category/simulation URLs")
    print("Starting extraction (this may take several minutes)...\n")

    processed_urls = set()
    page_count = 0

    for url in sorted(category_urls):
        if url in processed_urls:
            continue

        processed_urls.add(url)
        full_url = urljoin(BASE_URL, url)

        # Extract category name from URL
        parts = url.strip('/').split('/')
        category = parts[-1] if parts else "Other"

        print(f"Scraping: {full_url[:60]}... ", end='', flush=True)

        sims = scrape_simulations_from_page(full_url, category)
        if sims:
            all_simulations.extend(sims)
            print(f"✓ Found {len(sims)} simulations")
            page_count += 1
        else:
            print("(no simulations)")

        # Rate limiting
        time.sleep(0.5)

    print(f"\n{'='*60}")
    print(f"Total simulations extracted: {len(all_simulations)}")
    print(f"Pages processed: {page_count}")

    return all_simulations

def save_to_csv(simulations, filename):
    """Save simulations to CSV file"""
    if not simulations:
        print("No simulations to save")
        return False

    try:
        with open(filename, 'w', newline='', encoding='utf-8-sig') as f:
            writer = csv.DictWriter(f, fieldnames=['Category', 'Title', 'Description', 'URL'])
            writer.writeheader()
            writer.writerows([
                {
                    'Category': sim['category'],
                    'Title': sim['title'],
                    'Description': sim['description'],
                    'URL': sim['url']
                }
                for sim in simulations
            ])

        print(f"✅ Saved {len(simulations)} simulations to {filename}")
        return True
    except Exception as e:
        print(f"Error saving CSV: {e}")
        return False

def main():
    print("="*60)
    print("JavaLab Simulation Scraper")
    print("="*60)

    output_file = "javalab_simulations_full.csv"

    # Run scraper
    simulations = scrape_all_simulations()

    if simulations:
        # Save to CSV
        save_to_csv(simulations, output_file)

        # Print summary
        print(f"\n{'='*60}")
        print("Extraction Summary:")
        print(f"{'='*60}")
        print(f"Total simulations: {len(simulations)}")

        # Group by category
        by_category = {}
        for sim in simulations:
            cat = sim['category']
            by_category[cat] = by_category.get(cat, 0) + 1

        print(f"\nBreakdown by category:")
        for cat, count in sorted(by_category.items(), key=lambda x: -x[1]):
            print(f"  {cat}: {count}")

        print(f"\nOutput file: {output_file}")
    else:
        print("Failed to extract any simulations")

if __name__ == '__main__':
    main()
