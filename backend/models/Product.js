class Product {
    constructor(product) {
        this.id = product.id;
        this.name = product.name;
        this.description = product.description || "";
        this.price = product.price;
        this.image = product.image || "";
        this.category = product.category || "";
        this.stock = product.stock || 0;
        this.featured = product.featured || false;
        this.rating = product.rating || 0;
        this.numReviews = product.numReviews || 0;
        this.isActive = product.isActive !== undefined ? product.isActive : true;
        this.createdAt = product.createdAt || new Date();
        this.updatedAt = product.updatedAt || new Date();
    }
}

module.exports =
    Product;