const fs = require('node:fs');
const { verifyToken, changePass } = require('../liberals/auth.js');

module.exports = {
	method: 'get',
	path: '/passchg',
	async execute(req, res) {
		console.log(req.query.pass);
		console.log(req.cookies.token);

		if (typeof req?.query?.pass !== 'string') {
			return res.redirect('unauthorised');
		}
		if (typeof req?.cookies?.token !== 'string') {
			return res.redirect('unauthorised');
		}

		const mail = await verifyToken(req.cookies['token']);

		if (mail === false) {
			return res.redirect('invalid');
		}

		await changePass(mail, req.query['pass']);
		return res.redirect('success');
	}
}
