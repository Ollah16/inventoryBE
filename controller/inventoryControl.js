const { Inventory, User } = require("../models/inventoryModel");
const { handleS3Upload } = require("../s3Service");

exports.handleAddGoods = async (req, res) => {
    try {
        const { item, quantity, price, detail, itemEdit, addItem, customerQuantity } = req.body;
        if (req.error) {
            return res.send(req.error.message);
        }
        await handleS3Upload(req.file)
        console.log(req)
        const allGoods = Inventory({
            item,
            quantity,
            image: req.originalname,
            price,
            detail,
            itemEdit,
            addItem,
            customerQuantity,
        });

        await allGoods.save();
        res.send('Goods added successfully');
    } catch (error) {
        console.error('Error adding goods:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.handleGetGoods = async (req, res) => {
    try {
        const allGoods = await Inventory.find({});
        res.json({ allGoods });
    } catch (error) {
        console.error('Error retrieving all items:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.handleViewMore = async (req, res) => {
    try {
        const { itemId } = req.params;
        const viewedItem = await Inventory.findById(itemId);
        res.json({ viewedItem });
    } catch (error) {
        console.error('Error viewing item details:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.handleEditItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        await Inventory.findByIdAndUpdate(itemId, { itemEdit: false });
        res.status(200).json({ message: 'Item edited successfully' });
    } catch (error) {
        console.error('Error editing item:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.handleSaveChanges = async (req, res) => {
    const { itemId } = req.params;
    const { item, price, detail, quantity } = req.body;
    await handleS3Upload(req.file)

    try {
        const updateArea = { item, price, detail, quantity, image: req.originalname };
        await Inventory.findByIdAndUpdate(itemId, { ...updateArea, itemEdit: true });
        res.status(200).json({ message: 'Item updated successfully' });
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.handleCancelChanges = async (req, res) => {
    const { itemId } = req.params;

    try {
        await Inventory.findByIdAndUpdate(itemId, { itemEdit: false });
        res.status(200).json({ message: 'Item updated successfully' });
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.handleDeleteItem = async (req, res) => {
    const { itemId } = req.params;
    try {
        await Inventory.findByIdAndRemove(itemId);
        res.status(200).send({ message: 'Item deleted successfully' });
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.handleCheckout = async (req, res) => {
    const { userId } = req;
    const { id } = userId;
    const user = await User.findById(id);
    const { cart } = user;
    let updatedInventory;
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const day = currentDate.getDate();
    const hours = currentDate.getHours();
    const minutes = currentDate.getMinutes();
    const seconds = currentDate.getSeconds();

    try {
        for (const cartItem of cart) {
            const inventoryItemId = cartItem._id;
            const itemQuantity = await Inventory.findById(inventoryItemId).select('quantity');
            const { quantity } = itemQuantity;
            quantity -= cartItem.customerQuantity;
            updatedInventory = await Inventory.findByIdAndUpdate(inventoryItemId, { quantity: quantity });
        }
    } catch (err) {
        console.error(err);
    }

    if (updatedInventory) {
        const user = await User.findById(id);
        const { allOrders } = user;
        allOrders = [...allOrders, { date: `${year}/${month}/${day}   ${hours}:${minutes}:${seconds}`, showOrder: false, cart }];

        try {
            await User.findByIdAndUpdate(id, { allOrders, cart: [] });
            res.status(200).json({ message: 'Payment successful' });
        } catch (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        }
    } else {
        res.status(400).json({ message: 'Payment unsuccessful' });
    }
};

exports.handleSearch = async (req, res) => {
    try {
        const { itemId } = req.params;
        const searchItem = itemId.charAt(0).toUpperCase() + itemId.slice(1);
        const item = await Inventory.findOne({ item: searchItem });

        if (findItem) {
            return res.status(200).json({ item });
        }

        return res.status(404).send('Item not found');
    } catch (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
    }
};
