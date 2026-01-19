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
  const ghRes = await fetch(
    `https://api.github.com/repos/${repoFullName}`,
    {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
        'User-Agent': 'vercel-app'
      }
    }
  );

  const repo = await ghRes.json();

  if (!repo.id) {
    return res.status(500).json({ error: 'REPO_FETCH_FAILED', repo });
  }

  // 2️⃣ Nama project valid (lowercase)
  const projectName =
    'auto-' + Math.random().toString(36).substring(2, 8);

  // 3️⃣ DEPLOY (Vercel akan AUTO-BUAT PROJECT)
  const deployRes = await fetch(
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
        },
        projectSettings: {
          framework: null
        }
      })
    }
  );

  const deploy = await deployRes.json();

  if (!deployRes.ok) {
    return res.status(500).json({
      error: 'DEPLOY_FAILED',
      detail: deploy
    });
  }

  const url = deploy.url
    ? `https://${deploy.url}`
    : `https://${projectName}.vercel.app`;

  res.json({
    url,
    status: deploy.readyState || 'DEPLOYING',
    project: projectName
  });
}
  const projectRes = await fetch(
    'https://api.vercel.com/v9/projects',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: projectName,
        framework: null,
        gitRepository: {
          type: 'github',
          repoId: repo.id
        }
      })
    }
  );

  const project = await projectRes.json();

  if (!project.id) {
    return res.status(500).json({
      error: 'PROJECT_CREATE_FAILED',
      detail: project
    });
  }

  // 4️⃣ DEPLOY KE PROJECT TERSEBUT
  const deployRes = await fetch(
    'https://api.vercel.com/v13/deployments',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        projectId: project.id,
        gitSource: {
          type: 'github',
          repoId: repo.id
        }
      })
    }
  );

  const deploy = await deployRes.json();

  const url = deploy.url
    ? `https://${deploy.url}`
    : `https://${projectName}.vercel.app`;

  res.json({
    url,
    status: deploy.readyState || 'DEPLOYING',
    project: projectName
  });
}
