const express = require("express")
const multer = require('multer')

let storage = multer.diskStorage({
    filename: (req, file, cb) => {
        let fileName = file.originalname
        let splitFileName = fileName.split('.')
        ext = splitFileName[splitFileName.length - 1]
        cb(null, splitFileName[0] + Date.now() + '.' + ext)
    },
    destination: (req, file, cb) => {
        cb(null, 'images/')
    }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
        cb(null, true)
    }

    else {
        req.error = { message: 'file not supported' }
    }
}
let myStorage = multer({ storage, fileFilter })
const { handle_AddGoods, handle_AllItem, handle_Viewmore, handle_Edit, handle_Done, handle_Delete, handle_CheckOut } = require("../controller/inventoryControl")

const router = express.Router()
router.post('/addGoods', myStorage.single('image'), handle_AddGoods)
router.get('/getAllgoods', handle_AllItem)
router.get('/viewmore/:itemId', handle_Viewmore)
router.patch('/editItem/:itemId', handle_Edit)
router.post('/editDone/:itemId', myStorage.single('image'), handle_Done)
router.delete('/deleteItem/:itemId', handle_Delete)
router.post('/checkout', handle_CheckOut)
module.exports = router;