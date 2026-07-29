const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const client = require('prom-client');
require('dotenv').config();
const PORT = process.env.PORT || 5001;

const app = express();
app.use(cors());
app.use(express.json());

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register });

const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI).then(() => console.log("Ingestion API: MongoDB Connected"));

const TxSchema = new mongoose.Schema({
    txId: String,
    userId: String,
    amount: Number,
    country: String,
    status: { type: String, default: "PENDING" },
    timestamp: { type: Date, default: Date.now }
});
const Transaction = mongoose.model('Transaction', TxSchema);

app.post('/api/transactions', async (req, res) => {
    try {
        const newTx = new Transaction(req.body);
        await newTx.save();
        console.log(`Received Tx: ${newTx.txId} [PENDING]`);
        res.status(201).json(newTx);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/transactions', async (req, res) => {
    const txs = await Transaction.find().sort({ timestamp: -1 }).limit(20);
    res.json(txs);
});

app.get('/metrics', async (req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
});

app.listen(PORT, () => console.log(`Ingestion API running on PORT ${PORT}`));