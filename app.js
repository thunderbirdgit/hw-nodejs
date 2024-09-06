const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017'; // Update this if using a different host or port
const dbName = 'helloworld';

async function main() {
    const client = new MongoClient(uri);

    try {
        // Connect to the MongoDB cluster
        await client.connect();

        // Access the database
        const database = client.db(dbName);
        const messages = database.collection('messages');

        // Query the collection
        const query = {};
        const message = await messages.findOne(query);

        // Print the message
        console.log(message.message);
    } catch (err) {
        console.error(err);
    } finally {
        // Close the connection
        await client.close();
    }
}

main().catch(console.error);
