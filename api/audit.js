import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests are allowed' });
  }

  const { domain } = req.body;
  const api_key = process.env.ADYNTEL_API_KEY;
  const email = process.env.ADYNTEL_EMAIL;

  if (!domain || !api_key || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const metaResponse = await axios.post('https://api.adyntel.com/facebook', {
      company_domain: domain,
      api_key,
      email
    });

    const googleResponse = await axios.post('https://api.adyntel.com/google', {
      company_domain: domain,
      api_key,
      email
    });

    res.status(200).json({
      meta: {
        page_id: metaResponse.data.page_id || null,
        page_url: metaResponse.data.results?.[0]?.[0]?.snapshot?.page_profile_uri || 'N/A',
        number_of_ads: metaResponse.data.number_of_ads || 0
      },
      google: {
        total_ad_count: googleResponse.data.total_ad_count || 0
      }
    });
  } catch (error) {
    console.error(error?.response?.data || error.message);
    res.status(500).json({ error: 'Failed to audit domain' });
  }
}
