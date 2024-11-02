const { createToken, verifyPass } = require('../liberals/auth.js');

module.exports = {
	method: 'get',
	path: '/login',
	async execute(req, res) {
		if (typeof req.query['email'] !== 'string')
		if (typeof req.query['pass'] !== 'string') {
			return res.status(400);
		}
		
		if (await verifyPass(req.query['email'], req.query['pass'])) {
			const token = await createToken(req.query['email']);

			res.cookie('token', token, {
				maxAge: Date.now()+120000
			});
			return res.redirect('change');
		}
		
		return res.redirect('invalid');
	}
}
