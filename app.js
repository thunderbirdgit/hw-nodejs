const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3000;

// Replace the following with your MongoDB connection string
const uri = 'mongodb://a6f1f94094a0a44029f88f3ce887a24b-773113474.us-west-2.elb.amazonaws.com:27017'; // Update this if using a different host or port
const dbName = 'helloworld';

app.get('/', async (req, res) => {
    const client = new MongoClient(uri);

    try {
        // Connect to the MongoDB cluster
        await client.connect();

        // Access the database
        const database = client.db(dbName);
        const messages = database.collection('messages');

        // Query the collection
        const message = await messages.findOne({});

        // Send the message as a response
        res.send(message ? message.message : 'No message found');
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
