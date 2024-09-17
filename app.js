const { MongoClient } = require('mongodb');
const express = require('express');

const app = express();
const port = 3000;

// List of MongoDB hosts in the replica set
const mongoHosts = [
    'mongodb://mongodb-0.mongodb.qa-mongodb.svc.cluster.local:27017',
    'mongodb://mongodb-1.mongodb.qa-mongodb.svc.cluster.local:27017',
    'mongodb://mongodb-2.mongodb.qa-mongodb.svc.cluster.local:27017'
];

// Round-robin index for rotating through hosts
let currentIndex = 0;

const getMongoClient = () => {
    const host = mongoHosts[currentIndex];
    currentIndex = (currentIndex + 1) % mongoHosts.length;  // Round-robin logic
    return new MongoClient(host);
};

app.get('/', async (req, res) => {
    const client = getMongoClient();  // Get client from the round-robin host
    const mongoHost = client.options.srvHost || client.s.url;  // Get the MongoDB host

    try {
        // Connect to MongoDB
        await client.connect();

        const database = client.db('helloworld');
        const messages = database.collection('messages');

        const message = await messages.findOne({});

        // Send the message and MongoDB host as a response
        res.send(message ? 
            `Message: ${message.message} (from MongoDB host: ${mongoHost})` : 
            `No message found (from MongoDB host: ${mongoHost})`
        );
    } catch (err) {
        console.error(err);
        res.status(500).send(`Error retrieving message (from MongoDB host: ${mongoHost})`);
    } finally {
        await client.close();
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
