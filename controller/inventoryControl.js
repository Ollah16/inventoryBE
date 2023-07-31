const { Inventory } = require("../models/inventoryModel")

const handle_AddGoods = async (req, res) => {
    let { item, quantity, price, detail, itemEdit, addItem, customerQuantity } = req.body
    if (req.error) {
        res.send(req.error.message)
    }
    else {
        let allGoods = Inventory({ item, quantity, image: req.file.filename, price, detail, itemEdit, addItem, customerQuantity })
        allGoods.save()
    }

}

const handle_AllItem = async (req, res) => {
    let allGoods = await Inventory.find({})
    res.json({ allGoods })
}

const handle_Viewmore = async (req, res) => {
    let { itemId } = req.params
    let viewed = await Inventory.findById(itemId)
    res.json({ viewed })
}

const handle_Edit = async (req, res) => {
    let { itemId } = req.params
    let findItem = await Inventory.findByIdAndUpdate(itemId, { itemEdit: false })
}

const handle_Done = async (req, res) => {
    let { itemId } = req.params
    let { item, price, detail, quantity } = req.body
    if (item) {
        let updateArea = { item, price, detail, quantity }
        let findItem = await Inventory.findByIdAndUpdate(itemId, { ...updateArea, itemEdit: true })
    }
    else {
        let findItem = await Inventory.findByIdAndUpdate(itemId, { itemEdit: true })
    }

}

const handle_Delete = async (req, res) => {
    let { itemId } = req.params
    let deleteItem = await Inventory.findByIdAndRemove(itemId)
}

const handle_CheckOut = async (req, res) => {
    let { allGoods } = req.body
    let updateQuantity = allGoods.map(async (item) => {
        const filter = { _id: item._id };
        const updQty = item.quantity -= item.customerQuantity;
        const update = { $set: { quantity: updQty } };
        return await Inventory.updateOne(filter, update)
    })

    const updateResults = await Promise.all(updateQuantity);
    let confirmUpdates = updateResults.every((result) => result.modifiedCount === 1)
    if (confirmUpdates) {
        res.send('payment successful')
    }
    else {
        res.send('payment unsuccessful')
    }
}

module.exports = { handle_AddGoods, handle_AllItem, handle_Viewmore, handle_Done, handle_Edit, handle_Delete, handle_CheckOut }