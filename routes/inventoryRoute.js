const express = require("express")
const multer = require('multer')
const jwt = require('jsonwebtoken')
const jwtSecretKey = process.env.JWTSECRETKEY

const jwtMiddleWare = async (req, res, next) => {
    let { authorization } = req.headers
    let [, myJwt] = authorization.split(' ')
    let userId = jwt.verify(myJwt, jwtSecretKey)
    if (userId) {
        req.userId = userId
        next();
    }
}

const storage = multer.memoryStorage()


const fileFilter = (req, file, cb) => {
    if (['image/jpeg', 'image/jpg', 'image/png'].includes(file.mimetype)) {
        cb(null, true);
    } else {
        req.error = { message: 'File not supported' };
    }
};


const myStorage = multer({ storage, fileFilter })

const { handleAddGoods, handleGetGoods, handleViewMore, handleEditItem, handleSaveChanges, handleDeleteItem, handleCheckout, handleSearch, handleCancelChanges } = require("../controller/inventoryControl")
const router = express.Router()
router.post('/addGoods', myStorage.single('image'), handleAddGoods)
router.get('/getgoods', handleGetGoods)
router.get('/viewmore/:itemId', handleViewMore)
router.patch('/edit/:itemId', handleEditItem)
router.post('/save/:itemId', myStorage.single('image'), handleSaveChanges)
router.delete('/delete/:itemId', handleDeleteItem)
router.patch('/cancel/:itemId', handleCancelChanges)
router.post('/checkout', jwtMiddleWare, handleCheckout)
router.get('/searchItem/:event', handleSearch)

module.exports = router;