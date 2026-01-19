export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { repo } = req.body;
    const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

    if (!repo) {
      return res.status(400).json({ error: 'Repo kosong' });
    }

    if (!VERCEL_TOKEN || !GITHUB_TOKEN) {
      return res.status(500).json({ error: 'ENV_NOT_SET' });
    }

    /* ===============================
       1️⃣ DETEKSI DEFAULT BRANCH
       =============================== */
    const repoInfo = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json'
      }
    });

    const repoData = await repoInfo.json();

    if (!repoInfo.ok) {
      return res.status(500).json({
        error: 'GITHUB_REPO_ERROR',
        detail: repoData
      });
    }

    const branch = repoData.default_branch; // main / master / dll

    /* ===============================
       2️⃣ DEPLOY KE VERCEL
       =============================== */
    const deploy = await fetch(
      'https://api.vercel.com/v13/deployments',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${VERCEL_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: repo.split('/')[1],
          gitSource: {
            type: 'github',
            repo,
            ref: branch
          }
        })
      }
    );

    const deployData = await deploy.json();

    if (!deploy.ok) {
      return res.status(500).json({
        error: 'DEPLOY_FAILED',
        detail: deployData
      });
    }

    /* ===============================
       3️⃣ KIRIM URL HASIL DEPLOY
       =============================== */
    res.json({
      url: `https://${deployData.url}`,
      branch
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
