const fs = require('node:fs');
const { verifyToken } = require('../liberals/auth.js');

module.exports = {
	method: 'get',
	path: '/change',
	async execute(req, res) {
		let file = new fs.readFileSync('./assets/change.html').toString();
		const mail = await verifyToken(req.cookies['token']);

		if (mail === false) {
			return res.redirect('invalid');
		}

		file = file.replaceAll('MEOWLI_PANEL_MAIL_ADDRESS', mail);

		res.setHeader('Content-Type', 'text/html');
		res.write(file);
		res.end();
	}
}
