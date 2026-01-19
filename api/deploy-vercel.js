export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  }

  const { repoFullName } = req.body;

  if (!repoFullName) {
    return res.status(400).json({ error: 'REPO_REQUIRED' });
  }

  if (!process.env.VERCEL_TOKEN) {
    return res.status(500).json({ error: 'ENV_NOT_SET' });
  }

  // 👉 NAMA PROJECT RANDOM (AMAN)
  const projectName =
    'adult-' + Math.random().toString(36).substring(2, 8);

  const response = await fetch(
    'https://api.vercel.com/v13/deployments',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: projectName,
        gitSource: {
          type: 'github',
          repo: repoFullName,
          ref: 'main'
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
}
