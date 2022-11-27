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
        const productCollection = database.collection('productCollection');

        // Get all users 
        app.get('/users', async (req, res) => {
            const query = {};
            const users = await userCollection.find(query).toArray();
            res.send(users)
        })

        // Get all user by their role
        app.get('/users/:info', async (req, res) => {
            const info = req.params.info;
            if (info.includes('@')) {
                console.log(info)
                const query = { email: info };
                const user = await userCollection.findOne(query);
                return res.send(user);
            }
            console.log(info)
            const query = { role: info };
            const users = await userCollection.find(query).toArray();
            res.send(users)
        })

        // Get single user by email
        // app.get('/users', async (req, res) => {
        //     const email = req.params.email;
        //     const query = { email };
        //     const user = await userCollection.findOne(query);
        //     res.send(user)
        // })

        // Add New User
        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user?.email }
            const alreadyUser = await userCollection.find(query).toArray();
            if (alreadyUser.length) {
                return res.send({ acknowledged: false });
            }
            const newUser = await userCollection.insertOne(user);
            res.send(newUser);
        })


        // Get Products (by categories also)
        app.get('/products', async (req, res) => {
            const categoryId = req?.query?.categoryId;
            if (categoryId) {
                const query = { categoryId };
                const products = await productCollection.find(query).toArray();
                return res.send(products)
            }
            const query = {};
            const products = await productCollection.find(query).toArray();
            res.send(products)
        })

        // Get product of all seller
        app.get('/products/:email', async (req, res) => {
            const email = req.params.email;
            const query = { sellerEmail: email };
            const product = await productCollection.find(query).toArray();
            res.send(product)
        })

        // Add New Product
        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productCollection.insertOne(product);
            res.send(result);
        });
    }
    finally {

    }
}
run().catch(console.log)



app.get('/', async (req, res) => {
    res.send('Second Hand Cars Server is Running.')
})

app.listen(port, () => console.log(`Second Hand Cars Server is running on ${port}`))