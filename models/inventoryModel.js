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
    title: String,
    email: String,
    password: String,
    firstName: String,
    lastName: String,
    mobNumber: Number,
    alterNumber: Number,
    address: [{
        title: String,
        firstName: String,
        lastName: String,
        buildNum: Number,
        buildname: String,
        flatNum: Number,
        street: String,
        townStreet: String,
        county: String,
        addressNick: String,
        delInstruct: String,
        edit: Boolean
    }],

    cart: [{
        customerQuantity: Number,
        itemId: {
            type: Schema.Types.ObjectId,
            ref: Inventory
        },
        item: String,
        price: Number,
        image: String
    }],

    allOrders: [{
        date: String,
        showOrder: Boolean,
        cart: [{
            customerQuantity: Number,
            itemId: {
                type: Schema.Types.ObjectId,
                ref: Inventory
            },
            item: String,
            price: Number,
            image: String
        }]
    }]
})

let User = model('user', userSchema)

module.exports = { Inventory, User }