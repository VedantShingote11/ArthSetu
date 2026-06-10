const mongoose = require('mongoose');

const uri = 'mongodb://localhost:27017/microfinance';

async function run() {
    try {
        await mongoose.connect(uri);
        console.log("Connected to MongoDB.");

        const db = mongoose.connection.db;
        const users = await db.collection('users').find({ email: 'ved@gmail.com' }).toArray();
        console.log("Users:", JSON.stringify(users, null, 2));

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await mongoose.disconnect();
    }
}
run();
