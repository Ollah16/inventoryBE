const { User } = require('../models/inventoryModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const jwtSecretKey = process.env.JWTSECRETKEY

const handle_Registration = async (req, res) => {
    let { email, password, cart } = req.body
    let salt = await bcrypt.genSalt()
    let myPass = await bcrypt.hash(password, salt)
    let checkEmail = await User.findOne({ email })
    if (!checkEmail) {
        try {
            let newUser = await User({ email, password: myPass, cart })
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

        return res.send('incorrect email or password')

    }
    return res.send('incorrect email or password')
}

const handleUser_Cart = async (req, res) => {
    let { id } = req.userId
    let userCart = await User.findById(id)
    if (userCart) {
        let { cart } = userCart
        res.json({ cart })
    }
}

const handle_Cart = async (req, res) => {
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


module.exports = { handle_Registration, handle_Login, handleUser_Cart, handleClearCart, handleRemoveItem, handle_Cart }