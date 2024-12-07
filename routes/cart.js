const express = require('express');
const Cart = require('../models/cart');
const Product = require('../models/product');

const router = express.Router();

// Add Product to Cart
router.post('/add', async (req, res) => {
    const { userId, productId, quantity } = req.body;

    if (!userId || !productId || !quantity) {
        return res.status(400).json({ error: 'User ID, product ID, and quantity are required.' });
    }

    try {
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }

        const existingItem = cart.items.find(item => item.productId.toString() === productId);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({ productId, quantity });
        }

        await cart.save();
        res.json({ message: 'Product added to cart', cart });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update Cart
router.put('/update', async (req, res) => {
    const { userId, productId, quantity } = req.body;

    try {
        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found.' });
        }

        const item = cart.items.find(item => item.productId.toString() === productId);
        if (!item) {
            return res.status(404).json({ error: 'Product not found in cart.' });
        }

        if (quantity === 0) {
            cart.items = cart.items.filter(item => item.productId.toString() !== productId);
        } else {
            item.quantity = quantity;
        }

        await cart.save();
        res.json({ message: 'Cart updated', cart });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Delete Product from Cart
router.delete('/delete', async (req, res) => {
    const { userId, productId } = req.body;

    // Validate that both userId and productId are provided
    if (!userId || !productId) {
        return res.status(400).json({ error: 'User ID and product ID are required.' });
    }

    try {
        // Find the user's cart
        const cart = await Cart.findOne({ userId });

        // If the cart does not exist, return an error
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found.' });
        }

        // Find the index of the product in the cart
        const productIndex = cart.items.findIndex(item => item.productId.toString() === productId);

        // If the product is not found in the cart
        if (productIndex === -1) {
            return res.status(404).json({ error: 'Product not found in cart.' });
        }

        // Remove the product from the cart
        cart.items.splice(productIndex, 1);

        // Save the updated cart
        await cart.save();

        // Respond with the updated cart details
        res.json({
            message: 'Product removed from cart successfully.',
            cart: cart
        });
    } catch (err) {
        console.error('Error deleting product from cart:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Get Cart
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const cart = await Cart.findOne({ userId }).populate('items.productId');
        if (!cart || cart.items.length === 0) {
            return res.status(404).json({ error: 'Cart is empty.' });
        }

        res.json({ cart });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
