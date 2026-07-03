const express = require('express');
const router = express.Router();
const pool = require('../Config/db');
const { redisClient } = require('../Config/redis');
const jwtAuthMiddleware = require('../Middleware/jwtAuth')


//get jobs status
router.get('/getDashStatus', jwtAuthMiddleware, async (req, res) => {
    try {

        const userid = req.user.data.id; ////we get user in data object format so user.data.id used
        const key = `jobs_${userid}`;

        const cached = await redisClient.get(key);
        //console.log(JSON.parse(cached))
        if (cached) {
            return res.status(200).json({ data: JSON.parse(cached) });
        }
        const result = await pool.query('SELECT status,count(*) FROM jobs WHERE user_id=$1 GROUP BY status ', [userid]);
        //console.log(result.rows)
        if (!result.rows) {
            return res.status(404).json({ message: 'No data found' })
        }

        const dashboard = {
            totalJobs: 0,
            statusCounts: {}
        };

        result.rows.forEach((row) => {
            const count = Number(row.count);

            dashboard.statusCounts[row.status] = count;
            dashboard.totalJobs += count;
        })

        await redisClient.set(key, JSON.stringify(dashboard), { EX: 60 });


        res.status(200).json({ response: dashboard })


    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' })
    }
})

//get jobs through serach by status ,company and role
router.get('/search/status', jwtAuthMiddleware, async (req, res) => {
    try {

        const userid = req.user.data.id; ////we get user in data object format so user.data.id used
        const key = `search_${userid}`;

        const search = req.query.search || "";
        const status = req.query.status || "";
        // console.log(search ,status)
        let val = 1;
        const values = [userid]
        let query = `SELECT * FROM jobs WHERE user_id=$${val}`;


        if (status) {

            val++;
            query += ` AND (status=$${val})`;
            values.push(status);
        }

        if (search) {

            val++;
            query += ` AND (company ILIKE $${val} OR role ILIKE $${val})`;
            values.push(`%${search}%`);
        }
        //console.log(query)
        const result = await pool.query(query, values);

        res.status(200).json({ response: result.rows })


    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' })
    }
})

module.exports = router;