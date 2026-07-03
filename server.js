const express = require('express');
const app = express();
const { connectRedis } = require('./Config/redis');
const pool = require('./Config/db')
const bodyparser = require('body-parser');
require('dotenv').config();
app.use(bodyparser.json()); //req.body

const PORT = process.env.PORT || 5001;


const authRouter = require('./Routes/auth_routes');
const jobRouter = require('./Routes/job_routes');
const getDashBoardStatus = require('./Routes/dashboard');


app.use('/auth_router', authRouter);
app.use('/job_router', jobRouter);
app.use('/status', getDashBoardStatus);



const start_server = async () => {
    try {
        await connectRedis();

        app.listen(PORT, () => {
            console.log("listening on port 5001")
        })
    } catch (error) {
        console.log(error)
    }
}


start_server();