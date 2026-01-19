export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { repo } = req.body;

  if (!repo) {
    return res.status(400).json({ error: 'Repository tidak dikirim' });
  }

  const token = process.env.VERCE_TOKEN;
  const domain = process.env.SHORT_DOMAIN;

  if (!token || !domain) {
    return res.status(500).json({ error: 'ENV_NOT_SET' });
  }

  // repo: username/reponame
  const [owner, name] = repo.split('/');
  const projectName = `${owner}-${name}`.toLowerCase();

  // slug random
  const slug = Math.random().toString(36).substring(2, 8);

  const response = await fetch('https://api.vercel.com/v13/deployments', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: projectName,
      gitSource: {
        type: 'github',
        repo,
        ref: 'main'
      }
    })
  });

  const data = await response.json();

  if (!response.ok) {
    return res.status(500).json({
      error: 'DEPLOY_FAILED',
      detail: data
    });
  }

  res.json({
    short: `https://${domain}/${slug}`,
    target: `https://${data.url}`
  });
}
