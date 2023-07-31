const { connect, model, Schema } = require("mongoose")
connect(process.env.MONGODB_URI)
    .then(res => console.log('success'))
    .catch(err => console.error(err))

let inventorySchema = new Schema({
    item: String,
    quantity: Number,
    image: String,
    price: Number,
    detail: String,
    itemEdit: Boolean,
    addItem: Boolean,
    customerQuantity: Number
})

let Inventory = model('allGood', inventorySchema)

module.exports = { Inventory }