const express = require('express') //express1
const mongoose = require('mongoose')// db1
require('dotenv').config()//env 1
const healthRoute = require('./routes/HealthRoute') //route1


/**
 * APP
 */
const app = express(); //express2
app.use(express.json());


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


/**
 * SERVER LISTEN and //env2
*/
app.listen(process.env.SERVER_PORT, () => console.log(`App server started at ${process.env.SERVER_PORT}`)) //express3