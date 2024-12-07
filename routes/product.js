const express = require('express');
const Product = require('../models/product');

const router = express.Router();

// Add Product
router.post('/addproduct', async (req, res) => {
    const { name, description, price, category } = req.body;

    if (!name || !price) {
        return res.status(400).json({ error: 'Name and price are required.' });
    }

    try {
        const product = new Product({ name, description, price, category });
        await product.save();

        res.status(201).json({ message: 'Product added successfully', productId: product._id });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update Product
router.put('/updateproduct/:productId', async (req, res) => {
    const { productId } = req.params;

    try {
        const product = await Product.findByIdAndUpdate(productId, req.body, { new: true });
        if (!product) {
            return res.status(404).json({ error: 'Product not found.' });
        }

        res.json({ message: 'Product updated successfully', product });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete Product
router.delete('/deleteproduct/:productId', async (req, res) => {
    const { productId } = req.params;

    try {
        const product = await Product.findByIdAndDelete(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found.' });
        }

        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get All Products
router.get('/products', async (req, res) => {
    try {
        const products = await Product.find();
        if (products.length === 0) {
            return res.status(404).json({ error: 'No products found.' });
        }

        res.json({ products });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
