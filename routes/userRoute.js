const express = require("express")
const { handle_Registration, handle_Login, handleUser_Cart, handleClearCart, handleRemoveItem, handle_CartItem, handleAddPDetails, handleAddAddress, handle_FetchAllOrders, handle_Fetch_Address, handle_Fetch_Personal_Details, handle_Verify_Password, handle_Address_Edit, handle_Address_Delete, } = require("../controller/userControl")
const router = express.Router()
const jwt = require('jsonwebtoken')
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
router.post('/cart/:itemId', jwtMiddleWare, handle_CartItem)
router.patch('/removeItem/:itemId', jwtMiddleWare, handleRemoveItem)
router.delete('/clearCart', jwtMiddleWare, handleClearCart)
router.post('/personalDetails', jwtMiddleWare, handleAddPDetails)
router.post('/addAddress', jwtMiddleWare, handleAddAddress)
router.get('/fetchAllOrders', jwtMiddleWare, handle_FetchAllOrders)
router.get('/getAddress', jwtMiddleWare, handle_Fetch_Address)
router.get('/getDetails', jwtMiddleWare, handle_Fetch_Personal_Details)
router.patch('/editAddress/:addressId', jwtMiddleWare, handle_Address_Edit)
router.delete('/deleteAddress/:addressId', jwtMiddleWare, handle_Address_Delete)
module.exports = router;