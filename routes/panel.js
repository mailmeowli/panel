const fs = require('node:fs');
const { verifyToken, isUserAdministrative } = require('../liberals/auth.js');

module.exports = {
	method: 'get',
	path: '/panel',
	async execute(req, res) {
		const mail = await verifyToken(req.cookies['token']);
		let file;

		if (mail === false) {
			return res.redirect('invalid');
		}

		if (!isUserAdministrative(mail)) {
			file = fs.readFileSync('./assets/panelAdmin.html').toString();
		} else {
			file = fs.readFileSync('./assets/panelUser.html').toString();
		}

		file = file.replaceAll('MEOWLI_PANEL_MAIL_ADDRESS', mail);

		res.setHeader('Content-Type', 'text/html');
		res.write(file);
		res.end();
	}
}
