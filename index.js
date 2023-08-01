require('dotenv').config()//env 1
const express = require('express') //express1
const mongoose = require('mongoose')// db1
const cors = require('cors') //cors 1
const healthRoute = require('./routes/HealthRoute') //route1
const authRoutes = require('./routes/AuthRoutes')


/**
 * APP
 */
const app = express(); //express2
app.use(express.json());
app.use(cors()); //cors 2


/*
 * DATABASE CONNECTION
*/
mongoose.connect(process.env.DATABASE_URL) //db2 //env2
mongoose.connection.once('connected', () => console.log('DB connected'))
mongoose.connection.on('error', (er) => console.log("Database Error : ", er))


/**
 * ROUTES
 */
app.use('/health', healthRoute)
app.use('/api/v1/auth', authRoutes)


/**
 * SERVER LISTEN and //env2
*/
app.listen(process.env.SERVER_PORT, () => console.log(`App server started at ${process.env.SERVER_PORT}`)) //express3