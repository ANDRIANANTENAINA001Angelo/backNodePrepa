const { results } = require('../utils/helper')
const jwt = require('jsonwebtoken')
const User = require('../models/users')
require('dotenv').config()

const authentification = async (req, res, next) => {
    try {
        const authToken = req.header('Authorization').replace('Bearer ', '')
        const key = process.env.keyTokens
        const decodedToken = jwt.verify(authToken, key)
        const user = await User.findOne({ _id: decodedToken._id, 'authTokens.authToken': authToken })

        if (!user) throw new Error

        req.user = user
        req.authToken = authToken

        next();
    } catch (e) {
        const message = "Merci de vous authentifier!"
        res.json(results(message, e))
        res.status(401)

    }

}

module.exports = authentification