const express = require('express');
const { MongoClient, ReadPreference } = require('mongodb');

const app = express();
const port = 3000;

// MongoDB connection string with replica set hosts
const uri = 'mongodb://mongodb-0.mongodb.qa-mongodb.svc.cluster.local:27017,mongodb-1.mongodb.qa-mongodb.svc.cluster.local:27017,mongodb-2.mongodb.qa-mongodb.svc.cluster.local:27017';
const dbName = 'helloworld';

app.get('/', async (req, res) => {
    const client = new MongoClient(uri, {
        readPreference: ReadPreference.NEAREST // You can also try ReadPreference.SECONDARY_PREFERRED
    });

    try {
        // Connect to the MongoDB cluster
        await client.connect();

        // Access the database
        const database = client.db(dbName);
        const messages = database.collection('messages');

        // Query the collection for a message
        const message = await messages.findOne({});

        // Get details of the server currently serving the connection
        const adminDb = database.admin();
        const serverInfo = await adminDb.command({ isMaster: 1 });
        const mongoHost = serverInfo.me; // "me" contains the host serving the request

        // Display message and MongoDB host in the browser
        res.send(`
            <h1>Message from MongoDB:</h1>
            <p>${message ? message.message : 'No message found'}</p>
            <h2>Connected to MongoDB Host:</h2>
            <p>${mongoHost}</p>
        `);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving message');
    } finally {
        // Close the connection
        await client.close();
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
