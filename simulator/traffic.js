const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const axios = require('axios');
require('dotenv').config();

const API_URL = process.env.API_URL || 'http://localhost:5001/api/transactions';
const countries = ['LK', 'LK', 'LK', 'LK', 'RU', 'US', 'IN'];

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function sendFakeTransaction() {
    const isFraudAttempt = Math.random() < 0.15; 
    const amount = isFraudAttempt ? getRandomInt(500000, 1000000) : getRandomInt(1000, 50000);
    const country = countries[Math.floor(Math.random() * countries.length)];
    const txId = 'TX-' + getRandomInt(10000, 99999);
    const userId = 'U-' + getRandomInt(100, 999);

    try {
        await axios.post(API_URL, { txId, userId, amount, country });
        console.log(`Sent Payment: ${txId} | Rs.${amount} | ${country}`);
    } catch (error) {
        console.log("API not reachable. Is Ingestion API running?");
    }
}

console.log("Starting Traffic Simulator...");
setInterval(sendFakeTransaction, 25);