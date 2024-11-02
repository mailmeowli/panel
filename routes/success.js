const fs = require('node:fs');
const { verifyToken } = require('../liberals/auth.js');

module.exports = {
	method: 'get',
	path: '/success',
	async execute(req, res) {
		if (typeof req?.cookies?.token !== 'string') {
			return res.redirect('unauthorised');
		}
	
		const mail = await verifyToken(req.cookies['token']);
	
		if (mail === false) {
			return res.redirect('invalid');
		}
	
		res.setHeader('Content-Type', 'text/html');
		fs.createReadStream('./assets/success.html').pipe(res);
	}
}