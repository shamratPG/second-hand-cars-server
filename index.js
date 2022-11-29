const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const bookingCollection = database.collection('bookingCollection');

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
                const query = { email: info };
                const user = await userCollection.findOne(query);
                return res.send(user);
            }
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

        //Delete User
        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await userCollection.deleteOne(query);
            res.send(result);
        })

        //Update Seller Verification
        app.put('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const options = { upsert: true }
            const updateUser = {
                $set: {
                    verified: true
                }
            }
            const result = await userCollection.updateOne(query, updateUser, options);
            res.send(result);
        })

        //Update user to make him as an admin
        app.put('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            console.log(id)
            const updateUser = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await userCollection.updateOne(query, updateUser);
            res.send(result);
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


        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) };
            const result = await productCollection.findOne(query)
            res.send(result)
        })

        // Get product of a seller
        app.get('/products/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { sellerEmail: email };
            const product = await productCollection.find(query).toArray();
            res.send(product)
        })

        //Getting All the Advertised Items
        app.get('/products/ads', async (req, res) => {
            const query = { status: 'advertised' };
            const result = await productCollection.find(query).toArray();
            res.send(result)
        })

        // Add New Product
        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productCollection.insertOne(product);
            res.send(result);
        });

        //Update Product Status
        app.put('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const updatedProduct = {
                $set: {
                    status: 'advertised'
                }
            }
            const result = await productCollection.updateOne(query, updatedProduct);
            res.send(result);
        })

        //Stop Advertise 
        app.put('/products/stopads/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const updatedProduct = {
                $set: {
                    status: 'unsold'
                }
            }
            const result = await productCollection.updateOne(query, updatedProduct);
            res.send(result);
        })


        //Delete One Product
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            res.send(result);
        })

        //Get All the bookings
        app.get('/bookings/:email', async (req, res) => {
            const email = req.params.email;
            const query = { buyerEmail: email };
            const result = await bookingCollection.find(query).toArray();
            res.send(result);
        })

        // Add A Booking
        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            result = await bookingCollection.insertOne(booking);
            res.send(result);
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