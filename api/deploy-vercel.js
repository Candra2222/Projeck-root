export default async function handler(req, res) {
const { repo, slug } = req.body;


const response = await fetch('https://api.vercel.com/v13/deployments', {
method: 'POST',
headers: {
Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
'Content-Type': 'application/json'
},
body: JSON.stringify({
name: repo,
gitSource: { type: 'github', repo }
})
});


const data = await response.json();


res.json({
short: `https://${process.env.SHORT_DOMAIN}/${slug}`,
target: `https://${data.url}`
});
}
