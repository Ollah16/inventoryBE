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
    description: String,
    editItem: Boolean,
    addItem: Boolean,
    userQuantity: Number
})

let Inventory = model('allGood', inventorySchema)

let userSchema = new Schema({
    title: String,
    email: String,
    password: String,
    firstName: String,
    lastName: String,
    mobileNumber: Number,
    alternativeNumber: Number
})

const recordSchema = new Schema({
    date: String,
    item: String,
    userQuantity: Number,
    image: String,
    price: Number,
    cost: Number,
    cartId: {
        type: Schema.Types.ObjectId,
        ref: Inventory
    },
    itemId: {
        type: Schema.Types.ObjectId,
        ref: Inventory
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: Inventory
    }
})
const cartSchema = new Schema({
    addItem: Boolean,
    userQuantity: Number,
    item: String,
    cost: Number,
    image: String,
    price: Number,
    itemId: {
        type: Schema.Types.ObjectId,
        ref: Inventory
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: Inventory
    }
})

const addressSchema = new Schema({
    title: String,
    firstName: String,
    lastName: String,
    buildingNumber: Number,
    buildingName: String,
    flatNumber: Number,
    street: String,
    townStreet: String,
    county: String,
    addressName: String,
    userId: {
        type: Schema.Types.ObjectId,
        ref: Inventory
    }
})


const User = model('user', userSchema)
const Address = model('address', addressSchema)
const Cart = model('cart', cartSchema)
const Record = model('records', recordSchema)


module.exports = { Inventory, User, Cart, Address, Record }