const jwt = require('jsonwebtoken');

const jwtAuthMiddleware = (req, res, next) => {

    //first check authorizaion in req header
    const authorization = req.headers.authorization;

    if (!authorization) {
        return res.status(401).json({ error: 'Token not found' })
    }

    //extract token from req header
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Token Unauthorized' });
    }

    try {
        //verify jwt
        const decoded = jwt.verify(token, process.env.SECRET_KEY);

        //attach to request user object
        req.user = decoded;

        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({ error: 'Invalid Token' })
    }
}


module.exports = jwtAuthMiddleware;