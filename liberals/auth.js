const fs = require('node:fs');

const bcrypt = require('bcrypt');
const bdb = require('burgerdatabase');
const mp = require('mutex-promise');

const db = new bdb({ path: './data.json', noGzip: true });

const aMP = new mp('meowliAccountsLock', {
	timeout: 6e4
});


let a = [];


async function loadAccounts() {
	await aMP.promise();
	aMP.lock();

	const x = fs.readFileSync('./accounts/accounts').toString().split('\n');

	for (let i = 0; i < x.length; i++) {
		const y = x[i].split(':');
		if (y.length === 7) {
			a.push(x[i].split(':'));
		}
	}

	aMP.unlock();
}

function saveAccounts() {
	const x = [];

	for (let i = 0; i < a.length; i++) {
		x.push(a[i].join(':'));
	}

	fs.writeFileSync('./accounts/accounts', x.join('\n'));
}

async function verifyPass(mail, password) {
	for (let i = 0; i < a.length; i++) {
		const b = a[i];

		if (b[0] === mail) {
			const c = await bcrypt.compare(password, b[1]);
			
			if (c) {
				return true;
			} else {
				return false;
			}
		}
	}

	return false;
}

async function createToken(mail) {
	const token = require('crypto').randomBytes(64).toString('hex');

	await aMP.promise();
	aMP.lock();

	const tokens = db.get('tokens');

	tokens.push([
		mail,
		Date.now()+480000,
		token
	]);

	db.set('tokens', tokens);

	aMP.unlock();
	return token;
}

async function verifyToken(token) {
	await aMP.promise();
	aMP.lock();

	console.log(token);

	const tokens = db.get('tokens');
	for (let i = 0; i < tokens.length; i++) {
		if (tokens[i][2] === token) {
			if (tokens[i][1] > Date.now()) {
				aMP.unlock();
				return tokens[i][0];
			}

			aMP.unlock();
			return false;
		}
	}

	aMP.unlock();
	return false;
}

async function changePass(mail, password) {
	await aMP.promise();
	aMP.lock();

	for (let i = 0; i < a.length; i++) {
		if (a[i][0] === mail) {

			const c = await bcrypt.hash(password, 10);

			a[i][1] = c;

			saveAccounts();

			aMP.unlock();
			return 1;
		}
	}

	aMP.unlock();
	return 0;
}

async function refashion() {
	await aMP.promise();
	aMP.lock();

	let clean = 0;

	const tokens = db.get('tokens');
	let tokensNew = [];

	for (let i = 0; i < tokens.length; i++) {
		if (Date.now() > tokens[i][1]) {
			delete tokens[i];
		}
	}

	for (let i = 0; i < tokens.length; i++) {
		if (tokens[i] === undefined) {
			clean++;
			continue;
		}

		tokensNew.push(tokens[i]);
	}

	db.set('tokens', tokensNew);

	if (clean !== 0) {
		process.stdout.write(`Refashioned ${clean} tokens\n`);
	}

	aMP.unlock();
}

async function logoutToken(token) {
	await aMP.promise();
	aMP.lock();

	let clean = 0;

	const tokens = db.get('tokens');
	let tokensNew = [];

	for (let i = 0; i < tokens.length; i++) {
		if (tokens[i][2] === token) {
			delete tokens[i];
			break;
		}
	}

	for (let i = 0; i < tokens.length; i++) {
		if (tokens[i] === undefined) {
			console.log('!');
			continue;
		}

		tokensNew.push(tokens[i]);
	}

	db.set('tokens', tokensNew);

	aMP.unlock();

	return true;
}

async function isUserAdministrative(user) {
	const a = db.get(`admin_${require('crypto').createHash('sha512').update(user).digest('hex')}`);

	console.log(a);

	if (a === undefined) {
		return false;
	}

	return true;
}

module.exports = {
	loadAccounts,
	saveAccounts,
	verifyPass,
	changePass,
	verifyToken,
	createToken,
	logoutToken,
	refashion,
	isUserAdministrative
}
