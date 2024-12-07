const express = require('express');
const Order = require('../models/order');

const router = express.Router();

// Place Order
router.post('/placeorder', async (req, res) => {
    const { userId, products, shippingDetails } = req.body;

    if (!userId || !products || !shippingDetails) {
        return res.status(400).json({ error: 'User ID, products, and shipping details are required.' });
    }

    try {
        const order = new Order({ userId, products, shippingDetails });
        await order.save();

        res.status(201).json({ message: 'Order placed successfully', orderId: order._id });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get All Orders
router.get('/getallorders', async (req, res) => {
    try {
        const orders = await Order.find().populate('products.productId');
        res.json({ orders });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Orders by Customer ID
router.get('/orders/customer/:customerId', async (req, res) => {
    const { customerId } = req.params;  // Extract customer ID from the URL params

    try {
        // Find orders where userId matches the customerId from the request
        const orders = await Order.find({ userId: customerId }).populate('products.productId');
        
        if (orders.length === 0) {
            return res.status(404).json({ error: 'No orders found for this customer.' });
        }

        res.json({ orders });
    } catch (err) {
        console.error("Error fetching orders for customer:", err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
