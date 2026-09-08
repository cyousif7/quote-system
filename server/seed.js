const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const pool = require("/config/db");

dotenv.config()

userDetails (async () => {
    
})();

const hash = await bcrypt.hash(plainTextPassword, 10);
