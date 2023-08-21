const { User, Inventory } = require('../models/inventoryModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const jwtSecretKey = process.env.JWTSECRETKEY

const handle_Registration = async (req, res) => {
    let allOrders = []
    let address = []
    let cart = []
    let { email, title, password, firstName, lastName, mobNumber } = req.body

    let salt = await bcrypt.genSalt()
    let myPass = await bcrypt.hash(password, salt)
    let checkEmail = await User.findOne({ email })
    if (!checkEmail) {
        try {
            let newUser = await User({ email, title, password: myPass, firstName, lastName, mobNumber, address, allOrders, cart })
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
            return res.json({ myAccessToken })
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
    let { itemId } = req.params
    let { newCustomerQuantity } = req.body
    let user = await User.findById(id)
    let { cart } = user
    let ifExist = cart.find((good) => good._id == itemId);

    if (ifExist) {
        try {
            let updateCart = cart.map(item => item._id == itemId
                ? ({
                    ...item,
                    customerQuantity: item.customerQuantity = newCustomerQuantity
                })
                : item
            );

            updateCart.filter(item => item.customerQuantity != 0)

            await User.findByIdAndUpdate(id, { cart: updateCart });
        } catch (err) {
            console.log(err);
        }
    }

    else if (!ifExist) {
        try {
            let findItem = await Inventory.findById(itemId);
            let { customerQuantity, item, price, image, _id } = findItem;
            let newItem = {
                customerQuantity: newCustomerQuantity,
                item,
                price,
                image,
                _id
            };
            let updatedCart = [...cart, newItem];
            await User.findByIdAndUpdate(id, { cart: updatedCart });
        }
        catch (err) {
            console.error(err);
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
        let updateResult = await User.findByIdAndUpdate(id, { cart: foundItem });
        let newCart = await User.findById(id)
        json.send({ newCart: newCart.cart })

    }
    catch (error) {
        console.error('Error removing item from cart:', error);
        res.status(500).send('Internal Server Error');
    }
}

const handleAddPDetails = async (req, res) => {
    let { id } = req.userId
    let { title, firstName, lastName, email, epassword, newPassword, mobNumber, alterNumber } = req.body
    let checkPass = await User.findById(id)
    let validatePassword = await bcrypt.compare(epassword, checkPass.password)
    if (validatePassword) {
        let salt = await bcrypt.genSalt()
        let nPassword = await bcrypt.hash(newPassword, salt)
        let updateArea = { title, email, firstName, password: nPassword, lastName, mobNumber, alterNumber }
        try {
            let foundUser = await User.findByIdAndUpdate(id, updateArea)
            let findUser = await User.findById(id)
            let { title, email, firstName, lastName, mobileNumber, alterNumber } = findUser
            res.json({ title, email, firstName, lastName, mobileNumber, alterNumber })
        }
        catch (err) { console.error(err) }
    }
    else { res.send('incorrect password') }
}

const handleAddAddress = async (req, res) => {
    let userId = req.userId.id
    let { data: { title, firstName, lastName, buildNum, buildname, flatNum, street, townStreet, county, addressNick, delInstruct, id } } = req.body
    let updateArea = { title, firstName, lastName, buildNum, buildname, flatNum, street, townStreet, county, addressNick, delInstruct, edit: false }
    try {
        let findUser = await User.findById(userId)
        let { address } = findUser
        if (!id) {
            let addNewAddress = [...address, updateArea]
            await User.findByIdAndUpdate(userId, { address: addNewAddress })
            let findAllAdress = await User.findById(userId)
            return res.json({ address: findAllAdress.address })
        }
        else if (id) {
            let newUpdate = address.map((addy) => addy._id == id ? ({
                ...addy,
                title: addy.title = title,
                firstName: addy.firstName = firstName,
                lastName: addy.lastName = lastName,
                buildNum: addy.buildNum = buildNum,
                buildname: addy.buildname = buildname,
                flatNum: addy.flatNum = flatNum,
                street: addy.street = street,
                townStreet: addy.townStreet = townStreet,
                county: addy.county = county,
                addressNick: addy.addressNick = addressNick,
                delInstruct: addy.delInstruct = delInstruct,
                edit: addy.edit = false
            }) : addy)

            await User.findByIdAndUpdate(userId, {
                address: newUpdate
            })
            let findAllAdress = await User.findById(userId)
            console.log(findAllAdress.address)
            return res.json({ address: findAllAdress.address })
        }

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

const handle_Fetch_Address = async (req, res) => {
    let { id } = req.userId
    try {
        let foundUser = await User.findById(id)
        let { address } = foundUser
        res.json({ address })
    }
    catch (err) { console.error(err) }
}

const handle_Fetch_Personal_Details = async (req, res) => {
    let { id } = req.userId
    try {
        let foundUser = await User.findById(id)
        let { title, email, firstName, lastName, mobNumber, alterNumber } = foundUser
        res.json({ title, email, firstName, lastName, mobNumber, alterNumber })
    }
    catch (err) { console.error(err) }
}

const handle_Address_Edit = async (req, res) => {
    let { id } = req.userId
    let { addressId } = req.params
    if (addressId != 'cancel') {
        try {
            let findUser = await User.findById(id)
            let { address } = findUser
            let updateAddress = address.map((addr) => addr._id == addressId ? ({
                ...addr,
                edit: addr.edit = true
            }) : addr)
            await User.findByIdAndUpdate(id, { address: updateAddress })

            let newListAddress = await User.findById(id)
            res.json({ address: newListAddress.address })
        }
        catch (err) { console.error(err) }
        return
    }

    else if (addressId === 'cancel') {
        try {
            let findUser = await User.findById(id)
            let { address } = findUser
            let updateAddress = address.map((addr) => ({
                ...addr,
                edit: addr.edit = false
            }))

            await User.findByIdAndUpdate(id, { address: updateAddress })

            let newListAddress = await User.findById(id)
            res.json({ address: newListAddress.address })
        }
        catch (err) { console.error(err) }
        return
    }
}

const handle_Address_Delete = async (req, res) => {
    let { id } = req.userId
    let { addressId } = req.params
    try {
        let findUser = await User.findById(id)
        let { address } = findUser
        let updateAddress = address.filter((addy) => addy._id != addressId)
        let confirmUpdate = await User.findByIdAndUpdate(id, { address: updateAddress })
        let allNewAddress = await User.findById(id)
        res.json({ address: allNewAddress.address })
    }
    catch (err) { console.error(err) }
}

module.exports = { handle_Address_Delete, handle_Address_Edit, handle_Fetch_Address, handle_Fetch_Personal_Details, handle_Registration, handle_Login, handleUser_Cart, handleClearCart, handleRemoveItem, handle_CartItem, handleAddPDetails, handleAddAddress, handle_FetchAllOrders }