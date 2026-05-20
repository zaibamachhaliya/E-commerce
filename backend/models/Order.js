class Order {
    constructor(order) {
        this.id = order.id;
        this.customerName = order.customerName;
        this.customerEmail = order.customerEmail;
        this.customerPhone = order.customerPhone;
        this.city = order.city;
        this.state = order.state;
        this.zip = order.zip;
        this.fullAddress = order.fullAddress;
        this.paymentMethod = order.paymentMethod;
        this.total = order.total || 0;
        this.status = order.status || "pending";
        this.items = order.items || [];
        this.isPaid = order.isPaid || false;
        this.paidAt = order.paidAt || null;
        this.isDelivered = order.isDelivered || false;
        this.deliveredAt = order.deliveredAt || null;
        this.createdAt = order.createdAt || new Date();
        this.updatedAt = order.updatedAt || new Date();
    }
}

module.exports =
    Order;