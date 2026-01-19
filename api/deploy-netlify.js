export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  }

  const { repoFullName } = req.body;

  if (!repoFullName) {
    return res.status(400).json({ error: 'REPO_REQUIRED' });
  }

  if (!process.env.NETLIFY_TOKEN || !process.env.GITHUB_TOKEN) {
    return res.status(500).json({ error: 'ENV_NOT_SET' });
  }

  const siteName =
    'site-' + Math.random().toString(36).substring(2, 8);

  const response = await fetch(
    'https://api.netlify.com/api/v1/sites',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.NETLIFY_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: siteName,
        repo: {
          provider: 'github',
          repo: repoFullName,
          branch: 'main'
        }
      })
    }
  );

  const data = await response.json();

  if (!data.url) {
    return res.status(500).json({
      error: 'DEPLOY_FAILED',
      detail: data
    });
  }

  res.json({
    url: data.url,
    site: siteName
  });
}
