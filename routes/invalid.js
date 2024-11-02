const fs = require('node:fs');

module.exports = {
	method: 'get',
	path: '/invalid',
	async execute(req, res) {
		res.setHeader('Content-Type', 'text/html');
		fs.createReadStream('./assets/invalid.html').pipe(res);
	}
}