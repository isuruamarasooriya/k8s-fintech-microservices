const request = require('supertest');
const express = require('express');

jest.mock("@aws-sdk/client-dynamodb", () => {
  return { DynamoDBClient: jest.fn(() => ({})) };
});

jest.mock("@aws-sdk/lib-dynamodb", () => {
  return {
    DynamoDBDocumentClient: {
      from: jest.fn(() => ({
        send: jest.fn(async (command) => {
          if (command._isPut) {
            return { $metadata: { httpStatusCode: 200 } };
          }
          if (command._isScan) {
            return {
              Items: [
                { txId: 'TX-11111', userId: 'U-100', amount: 250, country: 'LK', status: 'PENDING', timestamp: new Date().toISOString() }
              ]
            };
          }
          return { Items: [] };
        }),
      })),
    },
    PutCommand: jest.fn((params) => ({ ...params, _isPut: true })),
    ScanCommand: jest.fn((params) => ({ ...params, _isScan: true })),
  };
});

const app = express();
app.use(express.json());

const { DynamoDBDocumentClient, PutCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const dynamoDb = DynamoDBDocumentClient.from({});
const TABLE_NAME = "fintech-k8s-transactions";

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
        const params = { TableName: TABLE_NAME, Item: newTx };
        await dynamoDb.send(new PutCommand(params));
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

describe('Ingestion API Endpoints (Transactions)', () => {

    it('should create a new transaction successfully (POST /api/transactions)', async () => {
        const payload = { txId: 'TX-99999', amount: 1500, country: 'LK' };
        
        const res = await request(app)
            .post('/api/transactions')
            .send(payload);

        expect(res.statusCode).toEqual(201);
        expect(res.body.txId).toBe('TX-99999');
        expect(res.body.amount).toBe(1500);
        expect(res.body.status).toBe('PENDING');
    });

    it('should fetch transactions list successfully (GET /api/transactions)', async () => {
        const res = await request(app).get('/api/transactions');

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0].txId).toBe('TX-11111');
    });

});