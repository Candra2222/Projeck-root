export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { repo } = req.body;
  const token = process.env.NETLIFY_TOKEN;

  if (!repo || !token) {
    return res.status(400).json({ error: 'Missing data' });
  }

  const r = await fetch('https://api.netlify.com/api/v1/sites', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      repo: {
        provider: 'github',
        repo
      }
    })
  });

  const data = await r.json();

  if (!r.ok) return res.status(500).json(data);

  res.json({
    url: data.ssl_url || data.url
  });
}
