const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config();

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");

const clientDb = new DynamoDBClient({ region: process.env.AWS_REGION || "ap-south-1" });
const dynamoDb = DynamoDBDocumentClient.from(clientDb);
const TABLE_NAME = "fintech-k8s-transactions";

console.log("Fraud Worker: Connected to AWS DynamoDB");

function analyzeRisk(tx) {
    if (tx.amount > 500000) {
        return "HIGH_AMOUNT_FRAUD";
    } else if (tx.country !== "LK" && tx.amount > 100000) {
        return "LOCATION_FRAUD";
    }
    return "SAFE";
}

async function processPendingTransactions() {
    try {
        const params = {
            TableName: TABLE_NAME,
            FilterExpression: "#st = :pendingStatus",
            ExpressionAttributeNames: { "#st": "status" },
            ExpressionAttributeValues: { ":pendingStatus": "PENDING" }
        };

        const data = await dynamoDb.send(new ScanCommand(params));
        const pendingTxs = (data.Items || []).slice(0, 10);
        
        for (let tx of pendingTxs) {
            const newStatus = analyzeRisk(tx);
            
            const updateParams = {
                TableName: TABLE_NAME,
                Key: { txId: tx.txId },
                UpdateExpression: "SET #st = :newStatus",
                ExpressionAttributeNames: { "#st": "status" },
                ExpressionAttributeValues: { ":newStatus": newStatus }
            };

            await dynamoDb.send(new UpdateCommand(updateParams));
            
            if (newStatus !== "SAFE") {
                console.log(`FRAUD DETECTED! Tx: ${tx.txId} -> [${newStatus}]`);
            } else {
                console.log(`🛡️ Tx Verified Safe: ${tx.txId} -> [SAFE]`);
            }
        }
    } catch (err) {
        console.error("Error processing transactions:", err.message);
    }
}

console.log("Fraud Worker Started. Polling for transactions...");
setInterval(processPendingTransactions, 2000);