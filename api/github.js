export default async function handler(req, res) {
  if (!process.env.GITHUB_TOKEN) {
    return res.status(500).json({ error: 'GITHUB_TOKEN_NOT_SET' });
  }

  const r = await fetch('https://api.github.com/user/repos', {
    headers: {
      Authorization: `token ${process.env.GITHUB_TOKEN}`,
      'User-Agent': 'vercel-app'
    }
  });

  const data = await r.json();

  res.status(200).json(
    data.map(repo => ({
      full_name: repo.full_name
    }))
  );
}
