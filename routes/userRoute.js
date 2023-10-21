const express = require("express")
const { handleUserRegistration, handleUserLogin, handleUserCart, handleClearCart, handleRemoveItem, handleCartItem, addPersonalDetails, handleAddAddress, handleOrderRecords, handleFetchAddress, handleFetchPersonalDetails, handleVerifyPassword, handleAddressEdit, handleAddressDelete, } = require("../controller/userControl")
const router = express.Router()
const jwt = require('jsonwebtoken')
const jwtSecretKey = process.env.JWTSECRETKEY


const jwtMiddleWare = async (req, res, next) => {
    let { authorization } = req.headers
    let [, myJwt] = authorization.split(' ')
    const userId = jwt.verify(myJwt, jwtSecretKey)
    if (userId) {
        req.userId = userId
        next()
    }
}

router.post('/register', handleUserRegistration)
router.post('/login', handleUserLogin)
router.get('/fetchcart', jwtMiddleWare, handleUserCart)
router.post('/cart/:itemId', jwtMiddleWare, handleCartItem)
router.patch('/removeItem/:itemId', jwtMiddleWare, handleRemoveItem)
router.delete('/clearCart', jwtMiddleWare, handleClearCart)
router.post('/personalDetails', jwtMiddleWare, addPersonalDetails)
router.post('/addAddress', jwtMiddleWare, handleAddAddress)
router.get('/records', jwtMiddleWare, handleOrderRecords)
router.get('/getAddress', jwtMiddleWare, handleFetchAddress)
router.get('/getDetails', jwtMiddleWare, handleFetchPersonalDetails)
router.patch('/editAddress/:addressId', jwtMiddleWare, handleAddressEdit)
router.delete('/deleteAddress/:addressId', jwtMiddleWare, handleAddressDelete)
module.exports = router;