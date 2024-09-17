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
    // Get the MongoClient using the round-robin logic
    const client = getMongoClient();

    try {
        // Connect to the MongoDB host
        await client.connect();

        // Access the database and collection
        const database = client.db('helloworld');
        const messages = database.collection('messages');

        // Query the collection for all messages
        const allMessages = await messages.find({}).toArray();

        // Display all messages along with the host that served the request
        const hostUsed = mongoHosts[currentIndex === 0 ? mongoHosts.length - 1 : currentIndex - 1];
        const response = `Served by: ${hostUsed}<br><br>` + 
                         allMessages.map(msg => msg.message).join('<br>');

        // Send response
        res.send(response);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving messages');
    } finally {
        // Close the connection
        await client.close();
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
