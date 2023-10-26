const express = require("express")
const { handleUserRegistration, handleUserLogin, handlePullCart, handleClearCart, handleRemoveItem, handleCartChanges, handleUpdateDetails, handleAddAddress, handleOrderRecords, handleFetchAddress, handleFetchPersonalDetails, handleAddressDelete, handleGetCartRecord, } = require("../controller/userControl")
const router = express.Router()
const jwt = require('jsonwebtoken')
const { User, Record } = require("../models/inventoryModel")
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
router.get('/pullCart', jwtMiddleWare, handlePullCart)
router.post('/cart/:itemId', jwtMiddleWare, handleCartChanges)
router.patch('/removeItem/:itemId', jwtMiddleWare, handleRemoveItem)
router.delete('/clearCart', jwtMiddleWare, handleClearCart)
router.post('/updateDetails', jwtMiddleWare, handleUpdateDetails)
router.post('/addAddress', jwtMiddleWare, handleAddAddress)
router.get('/records', jwtMiddleWare, handleOrderRecords)
router.get('/getcartRecord/:recordId', jwtMiddleWare, handleGetCartRecord)
router.get('/getAddress', jwtMiddleWare, handleFetchAddress)
router.get('/getDetails', jwtMiddleWare, handleFetchPersonalDetails)
router.delete('/deleteAddress/:addressId', jwtMiddleWare, handleAddressDelete)





module.exports = router;