const { verifyToken, logoutToken } = require('../liberals/auth.js');

module.exports = {
	method: 'get',
	path: '/signout',
	async execute(req, res) {
		const mail = await verifyToken(req.cookies['token']);

		if (mail === false) {
			return res.redirect('/');
		}

		logoutToken(req.cookies['token']);
		return res.redirect('/');
	}
}
