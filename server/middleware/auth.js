const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
    try {
        const { token } = req.cookies;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Error, no token retrieved."
            });
        };

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;
        next();
    }

    catch(error) {
        console.log("ERROR: ", error.message);
        res.status(401).json({
            success: false,
            message: "Authentication error."
        });
    };
};

module.exports = authMiddleware;