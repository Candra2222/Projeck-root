export default async function handler(req, res) {
const { repo, slug } = req.body;


const response = await fetch('https://api.netlify.com/api/v1/sites', {
method: 'POST',
headers: {
Authorization: `Bearer ${process.env.NETLIFY_TOKEN}`,
'Content-Type': 'application/json'
},
body: JSON.stringify({ name: repo })
});


const data = await response.json();


res.json({
short: `https://${process.env.SHORT_DOMAIN}/${slug}`,
target: `https://${data.name}.netlify.app`
});
}
