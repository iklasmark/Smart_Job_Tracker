const bcrypt = require('bcrypt');

const hashPassword = (password) => {
    return bcrypt.hash(password, 10);
}


const comparePassword = (password, user_pass) => {
    return bcrypt.compare(password, user_pass);
}

module.exports = { hashPassword, comparePassword };