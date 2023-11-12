const { Inventory, User, Cart, Record } = require("../models/inventoryModel");
const { handleS3Upload, handles3Delete } = require("../s3Service");

const handleAddGoods = async (req, res) => {
    try {
        const { item, quantity, price, description } = req.body;
        if (req.error) {
            return res.send(req.error.message);
        }
        await handleS3Upload(req.file)
        const inventory = Inventory({
            item,
            quantity,
            image: req.file.originalname,
            price,
            description,
            editItem: false,
        });
        await inventory.save();
        res.json({ message: 'Goods added successfully' });

    } catch (error) {
        console.error('Error adding goods:', error);
        res.status(500).send('Internal Server Error');
    }
};

const handleGetGoods = async (req, res) => {
    try {
        const goods = await Inventory.find();
        res.json({ goods });
    } catch (error) {
        console.error('Error retrieving all items:', error);
        res.status(500).send('Internal Server Error');
    }
};

const handleViewMore = async (req, res) => {
    try {
        const { itemId } = req.params;
        const viewed = await Inventory.findById(itemId);
        res.json({ viewed });
    } catch (error) {
        console.error('Error viewing item descriptions:', error);
        res.status(500).send('Internal Server Error');
    }
};

const handleEditItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        await Inventory.findByIdAndUpdate(itemId, { editItem: true });
        res.status(200).json({ message: 'Item edited successfully' });
    } catch (error) {
        console.error('Error editing item:', error);
        res.status(500).send('Internal Server Error');
    }
};

const handleSaveChanges = async (req, res) => {
    const { itemId } = req.params;
    const { item, price, description, quantity } = req.body;
    try {
        await handleS3Upload(req.file)
        const updateArea = { item, price, description, quantity, image: req.file.originalname };
        await Inventory.findByIdAndUpdate(itemId, { ...updateArea, editItem: false });
        res.status(200).json({ message: 'Item updated successfully' });
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).send('Internal Server Error');
    }
};

const handleCancelChanges = async (req, res) => {
    const { itemId } = req.params;
    try {
        await Inventory.findByIdAndUpdate(itemId, { editItem: false });
        res.status(200).json({ message: 'Item updated successfully' });
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).send('Internal Server Error');
    }
};

const handleDeleteItem = async (req, res) => {
    const { itemId } = req.params;
    try {
        const deletedItem = await Inventory.findByIdAndRemove(itemId);
        const fileToDelete = deletedItem.image;
        console.log('hi')
        await handles3Delete({ file: fileToDelete });
        res.status(200).send({ message: 'Item deleted successfully' });
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).send('Internal Server Error');
    }
}

const handleCheckout = async (req, res) => {
    const { id } = req.userId;
    const cart = await Cart.find({ userId: id });
    let updatedInventory;
    let itemId;
    try {
        for (const cartItem of cart) {
            itemId = cartItem.itemId;
            let item = await Inventory.findById(itemId)
            if (itemId == cartItem.itemId) {
                let { quantity } = item;
                quantity -= cartItem.userQuantity;
                updatedInventory = await Inventory.findByIdAndUpdate(itemId, { quantity });
            }
        }
    } catch (err) {
        console.error(err);
    }
    if (updatedInventory) {
        try {
            const cart = await Cart.find({ userId: id });
            const cartId = await Cart.findOne({ userId: id });
            for (const cartItem of cart) {
                const { item, userId, userQuantity, image, price, itemId, cost } = cartItem;
                const currentDate = new Date();
                const formattedDate = `${currentDate.getFullYear()}/${currentDate.getMonth() + 1}/${currentDate.getDate()} ${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`;
                const records = new Record({ date: formattedDate, showOrder: false, userId, item, userQuantity, image, price, itemId, cost, cartId });
                await records.save();
            }
            await Cart.deleteMany({ userId: id });


            res.status(200).json({ message: 'Payment successful' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    } else {
        res.status(500).json({ message: 'Payment unsuccessful' });
    }
}

const handleSearch = async (req, res) => {
    try {
        const { event } = req.params;
        const searchItem = event.charAt(0).toUpperCase() + event.slice(1);
        const regex = new RegExp(`^${searchItem}`, 'i');
        const items = await Inventory.find({ item: regex });
        if (items.length > 0) {
            return res.status(200).json({ items });
        }

        return res.status(404).json({ message: 'No matching items found' });
    } catch (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
    }
};


module.exports = { handleAddGoods, handleGetGoods, handleViewMore, handleEditItem, handleSaveChanges, handleCancelChanges, handleDeleteItem, handleCheckout, handleSearch }
