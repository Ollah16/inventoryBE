const { Inventory, User } = require("../models/inventoryModel")

const handle_AddGoods = async (req, res) => {
    let { item, quantity, price, detail, itemEdit, addItem, customerQuantity } = req.body
    if (req.error) {
        res.send(req.error.message)
    }
    else {
        try {
            let allGoods = Inventory({ item, quantity, image: req.file.filename, price, detail, itemEdit, addItem, customerQuantity })
            allGoods.save()
        }
        catch (err) { console.error(err) }
    }

}

const handle_AllItem = async (req, res) => {
    // try {
    //     let allGoods = await Inventory.find({})
    //     res.json({ allGoods })
    // }
    // catch (err) { console.err(err) }
    res.send('hello goods')
}

const handle_Viewmore = async (req, res) => {
    let { itemId } = req.params
    try {
        let viewed = await Inventory.findById(itemId)
        res.json({ viewed })
    }
    catch (err) { console.error(err) }
}

const handle_Edit = async (req, res) => {
    try {
        let { itemId } = req.params
        let findItem = await Inventory.findByIdAndUpdate(itemId, { itemEdit: false })
    }
    catch (err) { console.error(err) }
}

const handle_Done = async (req, res) => {
    let { itemId } = req.params
    let { item, price, detail, quantity } = req.body
    if (item && req.file.filename) {
        try {
            let updateArea = { item, price, detail, quantity, image: req.file.filename }
            let findItem = await Inventory.findByIdAndUpdate(itemId, { ...updateArea, itemEdit: true })
        }
        catch (err) { console.error(err) }
    }
    else {
        try {
            let findItem = await Inventory.findByIdAndUpdate(itemId, { itemEdit: true })
        }
        catch (err) { console.error(err) }
    }

}

const handle_Delete = async (req, res) => {
    let { itemId } = req.params
    try {
        let deleteItem = await Inventory.findByIdAndRemove(itemId)
    }
    catch (err) { console.error(err) }
}

const handle_CheckOut = async (req, res) => {
    let { id } = req.userId
    let findUser = await User.findById(id)
    let { cart } = findUser
    let updatedInventory;
    try {
        for (const cartItem of cart) {
            const inventoryItemId = cartItem._id;
            const newQuantity = cartItem.quantity - cartItem.customerQuantity;
            updatedInventory = await Inventory.findByIdAndUpdate(inventoryItemId, { quantity: newQuantity });
        }
    }
    catch (err) { console.error(err) }
    if (updatedInventory) {
        try {
            await User.findByIdAndUpdate(id, { cart: [] })
            return res.send('payment successful')
        }
        catch (err) { console.error(err) }
    }
    return res.send('payment unsuccessfu')
}


module.exports = { handle_AddGoods, handle_AllItem, handle_Viewmore, handle_Done, handle_Edit, handle_Delete, handle_CheckOut }