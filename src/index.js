const fs = require('node:fs');
const path = require('node:path');

const express = require('express');
const mt = require('microtime');
const mp = require('mutex-promise');
const cp = require('cookie-parser');

const app = express();

app.use(cp());

let a = [];
const aMP = new mp("a", {
	timeout: 1e10
});

const { loadAccounts, saveAccounts, refashion } = require('../liberals/auth.js');

globalThis.loadRoutes = () => {
	const routesDirectory = fs.readdirSync('./routes');

	process.stdout.write('Loading routes:\n');

	for (let i = 0; i < routesDirectory.length; i++) {
		const routeFile = path.join(process.cwd(), 'routes', routesDirectory[i]);
		const routeModule = require(routeFile);

		if (typeof routeModule !== 'object') throw new TypeError('routeModule is not an object!');
		if (typeof routeModule.method !== 'string') throw new TypeError('routeModule.method is not a string!');
		if (typeof routeModule.path !== 'string') throw new TypeError('routeModule.path is not a string!');
		if (typeof routeModule.execute !== 'function') throw new TypeError('routeModule.execute is not a function!');

		app[routeModule.method](routeModule.path, routeModule.execute);

		process.stdout.write(`\t${routeFile} -> ${routeModule.method.toUpperCase()} ${routeModule.path} \n`);
	}

	process.stdout.write('\n');

	return;
}
globalThis.loadRoutes();

(async () => {
	await loadAccounts();
	await saveAccounts();
})();

app.use((req, res, next) => {
	req.__recv = mt.now();

	res.on('close', async () => {
		const delay = mt.now()-req.__recv;

		process.stdout.write(`${new Date()} | ${req.ip} -> ${req.method} ${req.path} ${res.statusCode} (${delay}µs)\n`);
	});
	next();
});

app.all('*', async (req, res) => {
	res.status(403);
	res.setHeader('Content-Type', 'text/html');

	fs.createReadStream('./src/unauthorised.html').pipe(res);
});

app.listen(8000, async () => {
	process.stdout.write('OK\n');
});

refashion();
setInterval(refashion, 15000);
