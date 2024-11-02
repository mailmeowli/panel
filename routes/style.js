const fs = require('node:fs');

module.exports = {
	method: 'get',
	path: '/style.css',
	async execute(req, res) {
		res.setHeader('Content-Type', 'text/css');
		fs.createReadStream('./assets/style.css').pipe(res);
	}
}