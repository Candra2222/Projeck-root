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

  // 1️⃣ AMBIL repoId DARI GITHUB
  const ghRes = await fetch(
    `https://api.github.com/repos/${repoFullName}`,
    {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
        'User-Agent': 'vercel-app'
      }
    }
  );

  const repoData = await ghRes.json();

  if (!repoData.id) {
    return res.status(500).json({
      error: 'FAILED_GET_REPO_ID',
      detail: repoData
    });
  }

  // 2️⃣ NAMA PROJECT RANDOM (AMAN)
  const projectName =
    'deploy-' + Math.random().toString(36).substring(2, 8);
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

  // 1️⃣ AMBIL repoId DARI GITHUB
  const ghRes = await fetch(
    `https://api.github.com/repos/${repoFullName}`,
    {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
        'User-Agent': 'vercel-app'
      }
    }
  );

  const repoData = await ghRes.json();

  if (!repoData.id) {
    return res.status(500).json({
      error: 'FAILED_GET_REPO_ID',
      detail: repoData
    });
  }

  // 2️⃣ NAMA PROJECT RANDOM (AMAN)
  const projectName =
    'adult-' + Math.random().toString(36).substring(2, 8);

  // 3️⃣ DEPLOY KE VERCEL (FORMAT BENAR)
  const vercelRes = await fetch(
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
          repoId: repoData.id
        }
      })
    }
  );

  const deployData = await vercelRes.json();

  if (!vercelRes.ok) {
    return res.status(500).json({
      error: 'DEPLOY_FAILED',
      detail: deployData
    });
  }

  res.json({
    url: `https://${deployData.url}`
  });
}

  // 3️⃣ DEPLOY KE VERCEL (FORMAT BENAR)
  const vercelRes = await fetch(
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
          repoId: repoData.id
        }
      })
    }
  );

  const deployData = await vercelRes.json();

  if (!vercelRes.ok) {
    return res.status(500).json({
      error: 'DEPLOY_FAILED',
      detail: deployData
    });
  }

  res.json({
    url: `https://${deployData.url}`
  });
}
