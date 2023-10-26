const { User, Inventory, Cart, Address, Record } = require('../models/inventoryModel')
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
                mobNumber
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
                res.json({ accessToken, message: 'login successful' });
            } else {
                return res.json({ message: 'Invalid email or password. Please try again.' });
            }
        } else if (!user) {
            return res.json({ message: 'Invalid email or password. Please try again.' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Login failed' });
    }
};

const handlePullCart = async (req, res) => {
    try {
        const { id } = req.userId;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const cart = await Cart.find({ userId: id });
        return res.json({ cart });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error fetching user cart' });
    }
};


const handleCartChanges = async (req, res) => {
    try {
        const { id } = req.userId;
        const { itemId } = req.params;
        const { userQuantity } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const itemExist = await Cart.findOne({ itemId, userId: id });

        const inventoryItem = await Inventory.findById(itemId);

        if (!inventoryItem) {
            return res.status(404).json({ message: 'Inventory item not found' });
        }

        const { price, item, image } = inventoryItem;
        if (!itemExist) {
            const cart = new Cart({
                userQuantity,
                cost: userQuantity * price,
                price,
                item,
                image,
                itemId,
                userId: id,
                addItem: true,
            });
            await cart.save();
        } else if (itemExist && userQuantity != 0) {
            await Cart.updateOne(
                { itemId, userId: id },
                {
                    userQuantity,
                    cost: userQuantity * price,
                }
            );
        } else if (itemExist && userQuantity == 0) {
            await Cart.findOneAndDelete({ itemId, userId: id });
        }

        res.status(200).json({ message: 'Cart item updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating cart item' });
    }
};



const handleClearCart = async (req, res) => {
    try {
        const { id } = req.userId;
        await Cart.deleteMany({ userId: id });
        return res.status(200).json({ message: 'The cart has been cleared successfully.' });

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
        const removedCartItem = await Cart.findOneAndDelete({ userId: id, itemId });

        if (!removedCartItem) {
            return res.status(404).json({ message: 'Cart item not found.' });
        }
        res.status(200).json({ message: 'Cart item has been removed successfully.' });

    } catch (error) {
        console.error('Error removing item from cart:', error);
        res.status(500).send('Internal Server Error');
    }
};

const handleUpdateDetails = async (req, res) => {
    try {
        const { id } = req.userId;
        const { title, firstName, lastName, email, existingPassword, newPassword, mobileNumber, alternativeNumber } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const isPasswordValid = await bcrypt.compare(existingPassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Incorrect password.' });
        }

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await User.findByIdAndUpdate(id, {
            title, email, firstName, password: hashedPassword, lastName, mobileNumber, alternativeNumber
        });

        res.status(200).json({ message: 'User details updated successfully.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'An error occurred while processing the request.' });
    }
};

const handleAddAddress = async (req, res) => {
    try {
        const { id } = req.userId;
        const { data: { title, firstName, lastName, buildingNumber, buildingName, flatNumber, street, county, addressName, editId } } = req.body;

        console.log(req.body, id)
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        console.log(editId)
        if (!editId) {
            const address = new Address({
                title,
                firstName,
                lastName,
                buildingNumber,
                buildingName,
                flatNumber,
                street,
                county,
                addressName,
                userId: id
            });
            await address.save();
            res.status(200).json({ message: 'New Address added successfully' });
        } else {
            await Address.findOneAndUpdate({ userId: id }, {
                title,
                firstName,
                lastName,
                buildingNumber,
                buildingName,
                flatNumber,
                street,
                county,
                addressName,
                userId: id
            })
            res.status(200).json({ message: 'Address changes completed' });
        }
    } catch (error) {
        console.error('Error adding/updating address:', error);
        res.status(500).json({ message: 'An error occurred while processing the request.' });
    }
};


const handleOrderRecords = async (req, res) => {
    try {
        const { id } = req.userId;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const uniqueRecords = await Record.aggregate([
            {
                $group: {
                    _id: "$cartId",
                    userId: { $first: "$userId" },
                    date: { $first: "$date" },
                    cartId: { $first: "$cartId" }
                }
            }
        ]).exec();


        if (uniqueRecords.length > 0) {
            return res.status(200).json({ records: uniqueRecords });
        } else {
            return res.status(200).json({ message: 'No order records found.' });
        }
    } catch (error) {
        console.error("Error during aggregation: ", error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


const handleGetCartRecord = async (req, res) => {
    try {
        const { id } = req.userId;
        const { recordId } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const cartRecord = await Record.find({ cartId: recordId });
        if (cartRecord.length > 0) {
            res.json({ cartRecord });
        } else {
            return res.status(200).json({ message: 'No cart records found.' });
        }
    } catch (error) {
        console.error("Error during cart record retrieval: ", error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};



const handleFetchAddress = async (req, res) => {
    const { id } = req.userId;
    try {
        const address = await Address.find({ userId: id });

        if (!address) {
            return res.status(404).json({ message: '"User does not have an associated address."' });
        }
        return res.status(200).json({ address });
    } catch (error) {
        console.error('Error fetching user address:', error);
        res.status(500).send('Internal Server Error');
    }
};

const handleFetchPersonalDetails = async (req, res) => {
    const { id } = req.userId;
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        return res.status(200).json({ user });
    } catch (error) {
        console.error('Error fetching user personal details:', error);
        res.status(500).send('Internal Server Error');
    }
};

const handleAddressDelete = async (req, res) => {
    try {
        const { id } = req.userId;
        const { addressId } = req.params;
        const user = await User.findById(id);
        if (!user) return res.json({ message: 'user not found' })
        await Address.findOneAndDelete({ _id: addressId });
        res.json({ message: 'Deletion of the address was successful.' })

    } catch (error) {
        console.error('Error deleting user address:', error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = {
    handleAddressDelete,
    handleFetchAddress,
    handleFetchPersonalDetails,
    handleUserRegistration,
    handleUserLogin,
    handlePullCart,
    handleClearCart,
    handleRemoveItem,
    handleCartChanges,
    handleUpdateDetails,
    handleAddAddress,
    handleOrderRecords,
    handleGetCartRecord
}