const express = require("express")
const { handle_Registration, handle_Login, handleUser_Cart, handleClearCart, handleRemoveItem, handle_CartItem, } = require("../controller/userControl")
const router = express.Router()
const jwt = require('jsonwebtoken')
const { handle_Cart } = require("../controller/inventoryControl")
const jwtSecretKey = process.env.JWTSECRETKEY


const jwtMiddleWare = async (req, res, next) => {
    let { authorization } = req.headers
    let [, myJwt] = authorization.split(' ')
    let userId = jwt.verify(myJwt, jwtSecretKey)
    if (userId) {
        req.userId = userId
        next()
    }
}

router.post('/register', handle_Registration)
router.post('/login', handle_Login)
router.get('/fetchcart', jwtMiddleWare, handleUser_Cart)
router.post('/cart', jwtMiddleWare, handle_CartItem)
router.patch('/removeItem/:itemId', jwtMiddleWare, handleRemoveItem)
router.delete('/clearCart', jwtMiddleWare, handleClearCart)
module.exports = router;