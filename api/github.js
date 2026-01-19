export default async function handler(req, res) {
  if (!process.env.GITHUB_TOKEN) {
    return res.status(500).json({ error: 'GITHUB_TOKEN_NOT_SET' });
  }

  const response = await fetch('https://api.github.com/user/repos', {
    headers: {
      Authorization: `token ${process.env.GITHUB_TOKEN}`,
      'User-Agent': 'vercel-app'
    }
  });

  const repos = await response.json();

  // ⬇⬇⬇ INI BAGIAN PENTING YANG KAMU TANYA
  res.status(200).json(
    repos.map(r => ({
      full_name: r.full_name
    }))
  );
}
