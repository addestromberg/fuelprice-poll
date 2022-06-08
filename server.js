'use strict';

import client from 'prom-client';
import express from 'express';
import fetch from 'node-fetch';

const server = express();
const register = client.register;
const args = process.argv.slice(2);
let interval = 60*60*3;

if(args[0] == '--interval') {
    interval = args[1];
}

console.log('Polling with interval: ' + interval + ' seconds.');

const Gauge = client.Gauge;
const g = new Gauge({
	name: 'fuelprices',
	help: 'Fuelprices at OK Fjarilsgatan Norrkoping ',
	labelNames: ['type'],
});


// Set metric values
// I know its a beginning of promise hell.
setInterval(() => {
    fetch('https://henrikhjelm.se/api/getdata.php?lan=ostergotlands-lan').then(response => {
        response.json().then(data => {
            const octane95 = data.ostergotlandslan_Circle_K_NorrkopingFjarilsgatan_23__95;
            const diesel = data.ostergotlandslan_Circle_K_NorrkopingFjarilsgatan_23__diesel;
            const etanol = data.ostergotlandslan_Circle_K_NorrkopingFjarilsgatan_23__etanol;
            g.set({ type: '95octane' }, Number(octane95));
            g.set({ type: 'diesel' }, Number(diesel));
            g.set({ type: 'etanol' }, Number(etanol));
            console.log(data);
        }).catch(new Error('Failed to read data from api.'));
    }).catch(err => {
        console.log(err);
        g.set({ type: '95octane' }, NaN);
        g.set({ type: 'diesel' }, NaN);
        g.set({ type: 'etanol' }, NaN);
    });
}, interval * 1000);



// Setup server to Prometheus scrapes:

server.get('/metrics', async (req, res) => {
	try {
		res.set('Content-Type', register.contentType);
		res.end(await register.metrics());
	} catch (ex) {
		res.status(500).end(ex);
	}
});

const port = process.env.PORT || 9641;
console.log(
	`Server listening to ${port}, metrics exposed on /metrics endpoint`,
);
server.listen(port)