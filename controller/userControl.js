const { User } = require('../models/inventoryModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const jwtSecretKey = process.env.JWTSECRETKEY

const handle_Registration = async (req, res) => {
    let { email, password, firstName, lastName, address, personalDetails, cart, allOrders } = req.body
    let salt = await bcrypt.genSalt()
    let myPass = await bcrypt.hash(password, salt)
    let checkEmail = await User.findOne({ email })

    if (!checkEmail) {
        try {
            let newUser = await User({ email, password: myPass, firstName, lastName, address, personalDetails: { email, firstName, lastName }, allOrders, cart })
            newUser.save()
            res.send('registration successful')
        }
        catch (err) { console.error(err) }
    }
    else {
        res.send('user already exist')
    }


}

const handle_Login = async (req, res) => {
    let { email, password } = req.body
    let checkEmail = await User.findOne({ email })
    if (checkEmail) {
        checkPass = await bcrypt.compare(password, checkEmail.password)
        if (checkPass) {
            let { id } = checkEmail
            let myAccessToken = await jwt.sign({ id }, jwtSecretKey)
            return res.json({ id, myAccessToken })
        }

        return res.send('That email or password doesn’t look right. Please try again')

    }
    return res.send('That email or password doesn’t look right. Please try again')
}

const handleUser_Cart = async (req, res) => {
    let { id } = req.userId
    let userCart = await User.findById(id)
    if (userCart) {
        let { cart } = userCart
        res.json({ cart })
    }
}

const handle_CartItem = async (req, res) => {
    let { id } = req.userId
    let { quantity, customerQuantity, _id, item, price, image } = req.body
    let user = await User.findById(id)
    let { cart } = user
    let newCartItem = { quantity, customerQuantity, _id, item, price, image }

    if (user) {
        let ifExist = user.cart.some((good) => good._id == _id)

        if (ifExist) {
            try {
                let updateCart = cart.map(item => item._id == _id ?
                    ({
                        ...item,
                        customerQuantity: item.customerQuantity = customerQuantity
                    })
                    : item)

                await User.findByIdAndUpdate(id, { cart: updateCart })
            }
            catch (err) { console.log(err) }
        }

        else {
            try {
                let updateArea = { $push: { cart: newCartItem } };
                let updateCart = await User.findByIdAndUpdate(id, updateArea);
            }
            catch (err) { console.log(err) }
        }
    }

}

const handleClearCart = async (req, res) => {
    let { id } = req.userId
    try {
        let updateCart = await User.findByIdAndUpdate(id, { cart: [] })
    }
    catch (err) { console.log(err) }
}

const handleRemoveItem = async (req, res) => {

    try {
        const { itemId } = req.params;
        const { id } = req.userId;

        let user = await User.findById(id)
        let { cart } = user
        let foundItem = cart.filter(item => item._id != itemId)
        const updateResult = await User.findByIdAndUpdate(id, { cart: foundItem });

    }
    catch (error) {
        console.error('Error removing item from cart:', error);
        res.status(500).send('Internal Server Error');
    }
}

const handleAddPDetails = async (req, res) => {
    let { id } = req.userId
    let { title, firstName, lastName, email, password, mobileNumber, alterNumber } = req.body
    try {
        let foundUser = await User.findByIdAndUpdate(id, { personalDetails: { title, firstName, lastName, email, password, mobileNumber, alterNumber } })
        let findUser = await User.findById(id)
        let { personalDetails } = findUser
        res.json({ personalDetails })
    }
    catch (err) { console.error(err) }
}

const handleAddAddress = async (req, res) => {
    let { id } = req.userId
    let { title, firstName, lastName, buildNum, buildname, flatNum, street, townStreet, county, addressNick } = req.body
    try {
        let foundUser = await User.findByIdAndUpdate(id, { address: { title, firstName, lastName, buildNum, buildname, flatNum, street, townStreet, county, addressNick } })
        let findUser = await User.findById(id)
        let { address } = findUser
        res.json({ address })
    }
    catch (err) { console.error(err) }
}

const handle_FetchAllOrders = async (req, res) => {
    let { id } = req.userId
    try {
        let pastOrders = await User.findById(id)
        let { allOrders } = pastOrders
        res.json({ allOrders })
    }
    catch (err) { console.err(err) }

}

module.exports = { handle_Registration, handle_Login, handleUser_Cart, handleClearCart, handleRemoveItem, handle_CartItem, handleAddPDetails, handleAddAddress, handle_FetchAllOrders }