const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const cors = require('cors');
const client = require('prom-client');
require('dotenv').config();

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");

const PORT = process.env.PORT || 5001;
const app = express();
app.use(cors());
app.use(express.json());

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register });

const clientDb = new DynamoDBClient({ region: process.env.AWS_REGION || "ap-south-1" });
const dynamoDb = DynamoDBDocumentClient.from(clientDb);
const TABLE_NAME = "fintech-k8s-transactions";

console.log("Ingestion API: Connected to AWS DynamoDB");

app.post('/api/transactions', async (req, res) => {
    try {
        const { txId, userId, amount, country } = req.body;
        
        const newTx = {
            txId: txId || 'TX-' + Math.floor(Math.random() * 90000 + 10000),
            userId: userId || 'U-100',
            amount: Number(amount),
            country: country || 'LK',
            status: "PENDING",
            timestamp: new Date().toISOString()
        };

        const params = {
            TableName: TABLE_NAME,
            Item: newTx
        };

        await dynamoDb.send(new PutCommand(params));
        console.log(`Received Tx: ${newTx.txId} [PENDING]`);
        res.status(201).json(newTx);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/transactions', async (req, res) => {
    try {
        const params = { TableName: TABLE_NAME };
        const data = await dynamoDb.send(new ScanCommand(params));
        const sortedTxs = (data.Items || []).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 20);
        res.json(sortedTxs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/metrics', async (req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
});

app.listen(PORT, () => console.log(`Ingestion API running on PORT ${PORT}`));