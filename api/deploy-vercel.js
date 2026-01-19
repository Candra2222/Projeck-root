export default async function handler(req, res) {
  try {
    if (!process.env.GITHUB_TOKEN || !process.env.VERCEL_TOKEN) {
      return res.status(500).json({
        error: "ENV_NOT_SET",
        message: "GITHUB_TOKEN atau VERCEL_TOKEN belum diset"
      });
    }

    const { repoFullName } = req.body;
    // contoh: "Candra2222/Direck_linkkuu"

    if (!repoFullName) {
      return res.status(400).json({ error: "REPO_REQUIRED" });
    }

    // 1️⃣ Ambil info repo GitHub (UNTUK DAPAT repoId)
    const ghRes = await fetch(
      `https://api.github.com/repos/${repoFullName}`,
      {
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json"
        }
      }
    );

    const repoData = await ghRes.json();

    if (!repoData.id) {
      return res.status(400).json({
        error: "INVALID_REPO",
        detail: repoData
      });
    }

    // 2️⃣ Deploy ke Vercel (PAKAI repoId)
    const deployRes = await fetch(
      "https://api.vercel.com/v13/deployments",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: repoData.name,
          gitSource: {
            type: "github",
            repoId: repoData.id,
            ref: "main"
          }
        })
      }
    );

    const deployData = await deployRes.json();

    if (!deployRes.ok) {
      return res.status(500).json({
        error: "DEPLOY_FAILED",
        detail: deployData
      });
    }

    return res.json({
      success: true,
      url: `https://${deployData.url}`
    });

  } catch (err) {
    return res.status(500).json({
      error: "SERVER_ERROR",
      message: err.message
    });
  }
}
