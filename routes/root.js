const fs = require('node:fs');

module.exports = {
	method: 'get',
	path: '/',
	async execute(req, res) {
		res.setHeader('Content-Type', 'text/html');
		fs.createReadStream('./assets/index.html').pipe(res);
	}
}