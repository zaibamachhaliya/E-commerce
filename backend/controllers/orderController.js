const db = require("../config/db");

// Create order
const createOrder = (req, res) => {
    const { customer, address, paymentMethod, items, total } = req.body;
        if (
            !customer ||
            !customer.name ||
            !customer.email ||
            !address ||
            !address.fullAddress ||
            !items ||
            items.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid order data"
            });
        }
        if (
            isNaN(total) ||
            total <= 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid order total"
            });    
        }
    const query = `INSERT INTO orders (customer_name, customer_email, customer_phone, city, state, zip, full_address, payment_method, total) VALUES (?,?,?,?,?,?,?,?,?)`;
    db.query(query, [customer.name, customer.email, customer.phone, address.city, address.state, address.zip, address.fullAddress, paymentMethod, total], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        const orderId = result.insertId;
        // Insert order items and update stock
        items.forEach(item => {
            const itemQuery = `INSERT INTO order_items (order_id, product_id, name, price, qty, color, size) VALUES (?,?,?,?,?,?,?)`;
            db.query(itemQuery, [orderId, item.id || null, item.name, item.price, item.qty, item.color || null, item.size || null], (err2) => {
                if (err2) console.error("Error inserting order item:", err2.message);
            });
            if (item.id) {
                const stockQuery = `
                    UPDATE products
                    SET stock = stock - ?
                    WHERE id = ? AND stock >= ?
                `;
                db.query(stockQuery, [item.qty, item.id, item.qty], (err3, result3) => {
                    if (err3) {
                        console.error("Error updating stock for product ID", item.id, ":", err3.message);
                    }
                    if (result3 && result3.affectedRows === 0) {
                        console.warn(`Insufficient stock for product ID ${item.id}`);
                    }
                });
            }
        });
        res.status(201).json({ success: true, message: "Order placed successfully", orderId });
    });
};

// Get all orders
const getOrders = (req, res) => {
    const query = `SELECT * FROM orders ORDER BY id DESC`;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.status(200).json({ success: true, orders: results });
    });
};

// Get order by ID
const getOrderById = (req, res) => {
    const { id } = req.params;
    const query = `SELECT * FROM orders WHERE id = ?`;
    db.query(query, [id], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        if (results.length === 0) return res.status(404).json({ success: false, message: "Order not found" });
        res.status(200).json({ success: true, order: results[0] });
    });
};

// Update order status
const updateOrderStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
        const validStatuses =
            [
                "pending",
                "processing",
                "shipped",
                "delivered",
                "cancelled"
            ];
        if (
            !status ||
            !validStatuses.includes(status)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid order status"
            });    
        }
    const query = `UPDATE orders SET status = ? WHERE id = ?`;
    db.query(query, [status, id], (err) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.status(200).json({ success: true, message: "Order status updated" });
    });
};

module.exports = { createOrder, getOrders, getOrderById, updateOrderStatus };