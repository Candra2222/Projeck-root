export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { repo } = req.body;
    const token = process.env.VERCE_TOKEN;

    if (!repo) {
      return res.status(400).json({ error: 'Repo kosong' });
    }

    if (!token) {
      return res.status(500).json({ error: 'VERCEL_TOKEN_NOT_SET' });
    }

    const response = await fetch(
      'https://api.vercel.com/v13/deployments',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: repo.split('/')[1],
          gitSource: {
            type: 'github',
            repo
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        error: 'DEPLOY_FAILED',
        detail: data
      });
    }

    res.json({
      url: `https://${data.url}`
    });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
