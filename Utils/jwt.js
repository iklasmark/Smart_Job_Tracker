const jwt = require('jsonwebtoken');


const GenerateToken = (data) => {
        return jwt.sign({ data }, process.env.SECRET_KEY, { expiresIn: 1000 });
}


module.exports = GenerateToken;