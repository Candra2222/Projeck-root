const crypto = require('crypto');

module.exports = async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
    }

    const { raw_url, github } = req.body || {};

    let html;

    // ===============================
    // 1️⃣ AMBIL HTML DARI GITHUB
    // ===============================
    if (raw_url) {
      const r = await fetch(raw_url);
      if (!r.ok) {
        return res.status(400).json({ error: 'FAILED_FETCH_RAW_HTML' });
      }
      html = await r.text();
    } else if (github) {
      const { owner, repo, path, branch = 'main' } = github;

      if (!owner || !repo || !path) {
        return res.status(400).json({
          error: 'GITHUB_DATA_INCOMPLETE',
          example: {
            github: {
              owner: "user",
              repo: "repo",
              path: "index.html",
              branch: "main"
            }
          }
        });
      }

      const raw = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
      const r = await fetch(raw);

      if (!r.ok) {
        return res.status(400).json({ error: 'FAILED_FETCH_GITHUB_HTML' });
      }

      html = await r.text();
    } else {
      return res.status(400).json({
        error: 'HTML_SOURCE_REQUIRED',
        example: {
          raw_url: "https://raw.githubusercontent.com/user/repo/main/index.html"
        }
      });
    }

    // ===============================
    // 2️⃣ NETLIFY TOKEN
    // ===============================
    const NETLIFY_TOKEN = process.env.NETLIFY_TOKEN;
    if (!NETLIFY_TOKEN) {
      return res.status(500).json({ error: 'NETLIFY_TOKEN_MISSING' });
    }

    // ===============================
    // 3️⃣ CREATE SITE
    // ===============================
    const siteRes = await fetch(
      'https://api.netlify.com/api/v1/sites',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${NETLIFY_TOKEN}`
        }
      }
    );

    const site = await siteRes.json();
    if (!site.id) {
      return res.status(500).json(site);
    }

    // ===============================
    // 4️⃣ HASH FILE
    // ===============================
    const hash = crypto
      .createHash('sha1')
      .update(html)
      .digest('hex');

    // ===============================
    // 5️⃣ CREATE DEPLOY
    // ===============================
    const deployRes = await fetch(
      `https://api.netlify.com/api/v1/sites/${site.id}/deploys`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${NETLIFY_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          files: {
            'index.html': hash
          }
        })
      }
    );

    const deploy = await deployRes.json();
    if (!deploy.id) {
      return res.status(500).json(deploy);
    }

    // ===============================
    // 6️⃣ UPLOAD FILE
    // ===============================
    await fetch(
      `https://api.netlify.com/api/v1/deploys/${deploy.id}/files/index.html`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${NETLIFY_TOKEN}`,
          'Content-Type': 'text/html'
        },
        body: html
      }
    );

    return res.json({
      url: site.ssl_url || site.url,
      source: raw_url ? 'raw_url' : 'github',
      state: 'ready'
    });

  } catch (e) {
    return res.status(500).json({
      error: 'SERVER_ERROR',
      message: e.message
    });
  }
};
