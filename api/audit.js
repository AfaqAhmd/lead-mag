import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST requests allowed' });

  const { domain } = req.body;
  const api_key = process.env.ADYNTEL_API_KEY;
  const email = process.env.ADYNTEL_EMAIL;

  if (!domain || !api_key || !email) return res.status(400).json({ error: 'Missing fields' });

  try {
    const meta = await axios.post('https://api.adyntel.com/facebook', { company_domain: domain, api_key, email });
    const google = await axios.post('https://api.adyntel.com/google', { company_domain: domain, api_key, email });

    return res.status(200).json({
      meta: {
        page_id: meta.data.page_id,
        page_url: meta.data?.results?.[0]?.[0]?.snapshot?.page_profile_uri || 'N/A',
        number_of_ads: meta.data.number_of_ads || 0
      },
      google: {
        total_ad_count: google.data.total_ad_count || 0
      }
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    return res.status(500).json({ error: 'Failed to audit domain' });
  }
}
