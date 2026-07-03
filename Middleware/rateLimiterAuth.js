const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, //15 minute
    limit: 5,

    message: {
        message: 'Too many attempts. Try again after 15 Minutes.'
    }
})


module.exports = authLimiter;