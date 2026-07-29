const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI).then(() => console.log("Fraud Worker: MongoDB Connected"));

const TxSchema = new mongoose.Schema({
    txId: String,
    userId: String,
    amount: Number,
    country: String,
    status: String,
    timestamp: Date
});
const Transaction = mongoose.model('Transaction', TxSchema);

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
        const pendingTxs = await Transaction.find({ status: "PENDING" }).limit(10);
        
        for (let tx of pendingTxs) {
            const newStatus = analyzeRisk(tx);
            tx.status = newStatus;
            await tx.save();
            
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