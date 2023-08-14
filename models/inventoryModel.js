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
    firstName: String,
    lastName: String,
    address: {
        title: String,
        firstName: String,
        lastName: String,
        buildNum: Number,
        buildname: Number,
        flatNum: Number,
        street: String,
        townStreet: String,
        county: String,
        addressNick: String
    },
    personalDetails: {
        title: String,
        firstName: String,
        lastName: String,
        email: String,
        password: String,
        mobileNumber: Number,
        alterNumber: Number
    },
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
        item: String,
        customerQuantity: Number,
        cost: Number,
        price: Number
    }]
})

let User = model('user', userSchema)

module.exports = { Inventory, User }