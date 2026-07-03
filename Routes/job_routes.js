const express = require('express');
const router = express.Router();
const pool = require('../Config/db');
const { redisClient } = require('../Config/redis');
const jwtAuthMiddleware = require('../Middleware/jwtAuth')

//create job
router.post('/createJob', jwtAuthMiddleware, async (req, res) => {
    try {

        const { company, role, status } = req.body;

        const userid = req.user.data.id; ////we get user in data object format so user.data.id used

        const result = await pool.query('INSERT INTO jobs(user_id,company,role,status) VALUES ($1,$2,$3,$4) RETURNING *',
            [userid, company, role, status]);

        await redisClient.del(`jobs_${userid}`);

        res.status(200).json({ response: result.rows[0] })


    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' })
    }
})

//get jobs
router.get('/getJob', jwtAuthMiddleware, async (req, res) => {
    try {

        const userid = req.user.data.id; ////we get user in data object format so user.data.id used
        const key = `jobs_${userid}`;

        const cached = await redisClient.get(key);
        //console.log(JSON.parse(cached))
        if (cached) {
            return res.status(200).json({ data: JSON.parse(cached) });
        }
        const result = await pool.query('SELECT * FROM jobs WHERE user_id=$1 ', [userid]);

        await redisClient.set(key, JSON.stringify(result.rows), { EX: 60 });


        res.status(200).json({ response: result.rows })


    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' })
    }
})

//update status 
router.put("/update_status", jwtAuthMiddleware, async (req, res) => {
    try {

        const userid = req.user.data.id; ////we get user in data object format so user.data.id used
        const { company, status } = req.body;

        const check = await pool.query('SELECT * FROM jobs WHERE user_id =$1 AND company=$2', [userid, company]);

        if (!check.rows[0]) {
            return res.status(404).json({ error: 'Company Not found' });
        }

        const result = await pool.query('UPDATE jobs SET status=$1 WHERE company=$2 RETURNING company,status ', [status, company]);

        await redisClient.del(`jobs_${userid}`);

        res.status(200).json({ response: result.rows })


    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' })
    }
})

router.delete("/delete", jwtAuthMiddleware, async (req, res) => {
    try {

        const userid = req.user.data.id; ////we get user in data object format so user.data.id used
        const { company } = req.body;

        const check = await pool.query('SELECT * FROM jobs WHERE user_id =$1 AND company=$2', [userid, company]);

        if (!check.rows[0]) {
            return res.status(404).json({ error: 'Company Not found' });
        }

        const result = await pool.query('DELETE FROM jobs WHERE company=$1 ', [company]);

        await redisClient.del(`jobs_${userid}`);

        res.status(200).json({ response: "Company deleted" })


    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' })
    }
})



module.exports = router;