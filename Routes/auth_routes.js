const express = require('express');
const router = express.Router();
const pool = require('../Config/db')
const { hashPassword, comparePassword } = require('../Utils/hash');
const GenerateToken = require('../Utils/jwt')
const authLimiter = require('../Middleware/rateLimiterAuth')

//for register
router.post("/register", async (req, res) => {
    try {
        const { email, password } = req.body;

        const hashed = await hashPassword(password);

        const result = await pool.query(
            " INSERT INTO users(email,password) VALUES($1,$2) RETURNING id,email"
            , [email, hashed]);

        res.status(200).json({ response: result.rows })

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' })
    }
})

//for login
router.post("/login", authLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await pool.query(
            " SELECT * FROM users WHERE email=$1"
            , [email]);

        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({ error: 'user not found' });
        }

        const check = await comparePassword(password, user.password);

        if (!check) {
            return res.status(401).json({ error: 'wrong password' });
        }

        //generate token
        const payload = {
            id: user.id,
            email: user.email
        }

        const token = GenerateToken(payload);

        res.status(200).json({ Message: "Login sucess", Token: token });


    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' })
    }
})


module.exports = router;