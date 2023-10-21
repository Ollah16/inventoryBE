const { User, Inventory } = require('../models/inventoryModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const jwtSecretKey = process.env.JWTSECRETKEY

const handleUserRegistration = async (req, res) => {
    try {
        const { email, title, password, firstName, lastName, mobNumber } = req.body;

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);

        const checkEmail = await User.findOne({ email });

        if (!checkEmail) {
            const newUser = new User({
                email,
                title,
                password: hashedPassword,
                firstName,
                lastName,
                mobNumber,
                address: [],
                allOrders: [],
                cart: [],
            });

            await newUser.save();

            res.json({ message: 'Registration successful' });
        } else {
            res.send({ message: 'User already exists' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Registration failed' });
    }
};

const handleUserLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user) {
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (isPasswordValid) {
                const { id } = user;
                const accessToken = jwt.sign({ id }, jwtSecretKey);
                const response = { accessToken, mesage: 'login successful' }
                res.json({ response });
            } else {
                return res.json({ message: 'Invalid email or password. Please try again.' });
            }
        } else {
            return res.status(401).json({ message: 'Invalid email or password. Please try again.' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Login failed' });
    }
};

const handleUserCart = async (req, res) => {
    try {
        const { id } = req.userId;
        const userCart = await User.findById(id);

        if (userCart) {
            const { cart } = userCart;
            return res.json({ cart });
        } else {
            return res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send('Error fetching user cart');
    }
};

const handleCartItem = async (req, res) => {
    try {
        const { id } = req.userId;
        const { itemId } = req.params;
        const { newCustomerQuantity } = req.body;
        const user = await User.findById(id);
        const { cart } = user;
        const ifExist = cart.find((good) => good.id == itemId);

        if (ifExist) {
            const updateCart = cart.map((item) =>
                item.id == itemId
                    ? {
                        ...item,
                        customerQuantity: newCustomerQuantity,
                    }
                    : item
            );

            const updatedCart = updateCart.filter((item) => item.customerQuantity >= 1);
            await User.findByIdAndUpdate(id, { cart: updatedCart });
        } else if (!ifExist) {
            const findItem = await Inventory.findById(itemId);
            const { customerQuantity, item, price, image, id } = findItem;
            const newItem = {
                customerQuantity: newCustomerQuantity,
                item,
                price,
                image,
                id,
            };
            const updatedCart = [...cart, newItem];
            await User.findByIdAndUpdate(id, { cart: updatedCart });
        }

        res.status(200).json({ message: 'Cart item updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating cart item');
    }
};

const handleClearCart = async (req, res) => {
    try {
        const { id } = req.userId;
        const clearCart = await User.findByIdAndUpdate(id, { cart: [] });

        if (clearCart) {
            return res.status(200).json({ message: 'Cart cleared successfully.' });
        } else {
            return res.status(404).json({ message: 'User not found.' });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'An error occurred while clearing the cart.' });
    }
};


const handleRemoveItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { id } = req.userId;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        const { cart } = user;
        const updatedCart = cart.filter(item => item.id !== itemId);

        await User.findByIdAndUpdate(id, { cart: updatedCart });
        const updatedUserCart = await User.findById(id);

        if (!updatedUserCart) {
            return res.status(500).json({ message: 'Failed to update user cart.' });
        }

        return res.status(200).json({ newCart: updatedUserCart.cart });
    } catch (error) {
        console.error('Error removing item from cart:', error);
        res.status(500).send('Internal Server Error');
    }
};


const addPersonalDetails = async (req, res) => {
    try {
        const { id } = req.userId;
        const {
            title, firstName, lastName, email, epassword, newPassword, mobNumber, alterNumber
        } = req.body;

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: 'User not found.' });
        const validatePassword = await bcrypt.compare(epassword, user.password);
        if (!validatePassword) return res.status(401).json({ message: 'Incorrect password.' });
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        const updateArea = {
            title, email, firstName, password: hashedPassword, lastName, mobNumber, alterNumber
        };
        await User.findByIdAndUpdate(id, updateArea);
        const findUser = await User.findById(id);
        if (findUser) {
            const { title, email, firstName, lastName, mobileNumber, alterNumber } = findUser;
            res.status(200).json({ title, email, firstName, lastName, mobileNumber, alterNumber });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'An error occurred while processing the request.' });
    }
};

const handleAddAddress = async (req, res) => {
    const userId = req.userId.id;

    try {
        const {
            data: {
                title,
                firstName,
                lastName,
                buildNum,
                buildname,
                flatNum,
                street,
                townStreet,
                county,
                addressNick,
                delInstruct,
                id,
            },
        } = req.body;

        const updateArea = {
            title,
            firstName,
            lastName,
            buildNum,
            buildname,
            flatNum,
            street,
            townStreet,
            county,
            addressNick,
            delInstruct,
            edit: false,
        };

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        const { address } = user;
        if (!id) {
            const addNewAddress = [...address, updateArea];
            await User.findByIdAndUpdate(userId, { address: addNewAddress });

            const allAddress = await User.findById(userId);
            return res.status(200).json({ address: allAddress.address });
        } else if (id) {
            const updateAddress = address.map((addy) =>
                addy.id === id
                    ? {
                        ...addy,
                        title,
                        firstName,
                        lastName,
                        buildNum,
                        buildname,
                        flatNum,
                        street,
                        townStreet,
                        county,
                        addressNick,
                        delInstruct,
                        edit: false,
                    }
                    : addy
            );

            await User.findByIdAndUpdate(userId, { address: updateAddress });

            const allAddress = await User.findById(userId);
            return res.status(200).json({ address: allAddress.address });
        }
    } catch (error) {
        console.error('Error adding/updating address:', error);
        res.status(500).send('Internal Server Error');
    }
};

const handleOrderRecords = async (req, res) => {
    const userId = req.userId.id;
    try {
        const user = await User.findById(userId);
        console.log(user)
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        const { allOrders } = user;
        return res.status(200).json({ allOrders });
    } catch (error) {
        console.error('Error fetching all orders:', error);
        res.status(500).send('Internal Server Error');
    }
};

const handleFetchAddress = async (req, res) => {
    const userId = req.userId.id;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        const { address } = user;
        return res.status(200).json({ address });
    } catch (error) {
        console.error('Error fetching user address:', error);
        res.status(500).send('Internal Server Error');
    }
};

const handleFetchPersonalDetails = async (req, res) => {
    const userId = req.userId.id;
    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        return res.status(200).json({ user });
    } catch (error) {
        console.error('Error fetching user personal details:', error);
        res.status(500).send('Internal Server Error');
    }
};

const handleAddressEdit = async (req, res) => {
    const { id } = req.userId;
    const { addressId } = req.params;

    try {
        let user = await User.findById(id);
        const { address } = user;

        if (addressId !== 'cancel') {
            const updateAddress = address.map((addr) =>
                addr.id == addressId ? { ...addr, edit: true } : addr
            );
            await User.findByIdAndUpdate(id, { address: updateAddress });
        } else {
            const updateAddress = address.map((addr) => ({ ...addr, edit: false }));
            await User.findByIdAndUpdate(id, { address: updateAddress });
        }
        const newAddress = await User.findById(id);
        return res.json({ address: newAddress.address });
    } catch (error) {
        console.error('Error editing user address:', error);
        return res.status(500).send('Internal Server Error');
    }
};

const handleAddressDelete = async (req, res) => {
    try {
        const { id } = req.userId;
        const { addressId } = req.params;

        const user = await User.findById(id);
        const { address } = user;

        const updateAddress = address.filter((addy) => addy.id != addressId);

        await User.findByIdAndUpdate(id, { address: updateAddress });

        const newAddress = await User.findById(id);

        res.json({ address: newAddress.address });
    } catch (error) {
        console.error('Error deleting user address:', error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = {
    handleAddressDelete,
    handleAddressEdit,
    handleFetchAddress,
    handleFetchPersonalDetails,
    handleUserRegistration,
    handleUserLogin,
    handleUserCart,
    handleClearCart,
    handleRemoveItem,
    handleCartItem,
    addPersonalDetails,
    handleAddAddress,
    handleOrderRecords
}