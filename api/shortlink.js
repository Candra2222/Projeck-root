const DB = {};


export default function handler(req, res) {
const { slug } = req.query;


if (!DB[slug]) {
return res.status(404).send('Not found');
}


res.writeHead(302, { Location: DB[slug] });
res.end();
}
