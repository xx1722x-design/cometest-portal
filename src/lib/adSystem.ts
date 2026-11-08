// Advertising system for monetization - Adsterra Smart Links Only

// Adsterra Links (5)
const AD_LINKS = [
  'https://asiafilm.org/4/67f85b9984fffe2cc773a2aa6ba74550',
  'https://asiafilm.org/4/bff26ca04065dbbfa36dcee7776780ab',
  'https://asiafilm.org/4/935a5b936cb4b6c0027a9d48b0051d73',
  'https://asiafilm.org/4/d75b5a9ea5aa11e8f07dbaca14a011c3',
  'https://asiafilm.org/4/2017236decc3fe62e65ec74f66a04c01',
];

export function triggerAdPopup(): void {
  const randomIndex = Math.floor(Math.random() * AD_LINKS.length);
  const adLink = AD_LINKS[randomIndex];

  if (typeof window !== 'undefined') {
    window.open(adLink, '_blank', 'noopener,noreferrer');
  }
}

export function triggerTripleAds(): void {
  // Triple ad bombardment with 3 distinct random links, staggered by 100ms
  if (typeof window !== 'undefined') {
    // Generate 3 distinct random indices
    const indices: number[] = [];
    while (indices.length < 3) {
      const randomIndex = Math.floor(Math.random() * AD_LINKS.length);
      if (!indices.includes(randomIndex)) {
        indices.push(randomIndex);
      }
    }

    // Open 3 distinct ads with staggered timing
    indices.forEach((index, idx) => {
      setTimeout(() => {
        window.open(AD_LINKS[index], '_blank', 'noopener,noreferrer');
      }, idx * 100);
    });
  }
}

export function getNextAdLink(): string {
  const randomIndex = Math.floor(Math.random() * AD_LINKS.length);
  return AD_LINKS[randomIndex];
}
