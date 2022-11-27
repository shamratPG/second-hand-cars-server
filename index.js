const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.pra9xm3.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        const database = client.db('secondHandCars');
        const userCollection = database.collection('userCollection');

        app.get('/users', async (req, res) => {
            const role = req.query.role;
            const query = { role: role };
            const users = await userCollection.find(query).toArray();
            res.send(users)
        })

        // Checks if user already exist
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await userCollection.findOne(query);
            res.send(user)
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user?.email }
            console.log(query)
            const alreadyUser = await userCollection.find(query).toArray();
            console.log(alreadyUser.length)
            if (alreadyUser.length) {
                return res.send({ acknowledged: false });
            }
            const newUser = await userCollection.insertOne(user);
            console.log(newUser)
            res.send(newUser);
        })
    }
    finally {

    }
}
run().catch(console.log)



app.get('/', async (req, res) => {
    res.send('Second Hand Cars Server is Running.')
})

app.listen(port, () => console.log(`Second Hand Cars Server is running on ${port}`))