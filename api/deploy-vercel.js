export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  }

  const { repoFullName } = req.body;

  if (!repoFullName) {
    return res.status(400).json({ error: 'REPO_REQUIRED' });
  }

  if (!process.env.GITHUB_TOKEN || !process.env.VERCEL_TOKEN) {
    return res.status(500).json({ error: 'ENV_NOT_SET' });
  }

  // 1️⃣ Ambil repoId dari GitHub
  const gh = await fetch(
    `https://api.github.com/repos/${repoFullName}`,
    {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
        'User-Agent': 'vercel-app'
      }
    }
  );

  const repo = await gh.json();

  if (!repo.id) {
    return res.status(500).json({ error: 'REPO_ID_FAILED', repo });
  }

  // 2️⃣ Nama project random (VALID)
  const projectName =
    'adult-' + Math.random().toString(36).substring(2, 8);

  // 3️⃣ Deploy ke Vercel
  const vr = await fetch(
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
          repoId: repo.id
        }
      })
    }
  );

  const deploy = await vr.json();

  // 4️⃣ URL fallback AMAN
  const url =
    deploy.url
      ? `https://${deploy.url}`
      : `https://${projectName}.vercel.app`;

  res.json({
    url,
    status: deploy.readyState || 'DEPLOYING'
  });
}
