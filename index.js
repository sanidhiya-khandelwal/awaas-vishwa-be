require('dotenv').config()//env 1
const express = require('express') //express1
const mongoose = require('mongoose')// db1
const cors = require('cors') //cors 1
const cookieParser = require('cookie-parser'); //cp1
const healthRoute = require('./routes/HealthRoute') //route1
const authRoutes = require('./routes/AuthRoutes')


/**
 * APP
 */

// var whitelist = ['http://localhost:5173', /** other domains if any */]
// var corsOptions = {
//     credentials: true,
//     origin: function (origin, callback) {
//         if (whitelist.indexOf(origin) !== -1) {
//             callback(null, true)
//         } else {
//             callback(new Error('Not allowed by CORS'))
//         }
//     }
// }
const app = express(); //express2
app.use(express.json());
app.use(cookieParser())//cp2
//app.use(cors()); //cors 2
// app.use(cors(corsOptions));
app.use(cors({
    credentials: true,
    // origin: ['http://localhost:5173', 'https://awaas-vishwa-av.vercel.app/'],
    origin: ['https://awaas-vishwa-av.vercel.app/'],
    // origin: 'http://localhost:5173'
}))


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