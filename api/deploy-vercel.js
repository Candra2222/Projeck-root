export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { repo } = req.body;
  const token = process.env.VERCEL_TOKEN;

  if (!repo || !token) {
    return res.status(400).json({ error: 'Missing data' });
  }

  const [owner, name] = repo.split('/');
  const projectName = `${owner}-${name}`.toLowerCase();

  const r = await fetch('https://api.vercel.com/v13/deployments', {
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

  const data = await r.json();

  if (!r.ok) return res.status(500).json(data);

  res.json({
    url: `https://${data.url}`
  });
}
