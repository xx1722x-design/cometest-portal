import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Query string로 테스트 국가 오버라이드 가능 (개발용)
    if (req.query.test_country) {
      const testCountry = (req.query.test_country as string).toUpperCase();
      return res.status(200).json({ country: testCountry });
    }

    // Vercel의 x-vercel-ip-country 헤더에서 국가 코드 읽기
    const country = (req.headers['x-vercel-ip-country'] as string || 'US').toUpperCase();

    res.status(200).json({ country });
  } catch (error) {
    console.error('Country detection error:', error);
    res.status(500).json({ error: 'Failed to detect country', country: 'US' });
  }
}
