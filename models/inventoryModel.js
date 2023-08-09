const { ObjectId } = require("mongodb")
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

let userSchema = new Schema({
    email: String,
    password: String,
    cart: [{
        customerQuantity: Number,
        itemId: {
            type: Schema.Types.ObjectId,
            ref: Inventory
        },
        item: String,
        price: Number,
        quantity: Number,
        image: String
    }]
})

let User = model('user', userSchema)

module.exports = { Inventory, User }