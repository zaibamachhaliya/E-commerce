(function(){
// cart storage
let cart =
    AppUtils.getCart();

// wishlist storage
let wishlist =
    AppUtils.getWishlist();

// save cart
function saveCart() {
    AppUtils.saveCart(
        cart
    );

    if (
        typeof updateCartCount ===
        "function"
    ) {
        updateCartCount();
    }
}

// save wishlist
function saveWishlist() {
    AppUtils.saveWishlist(
        wishlist
    );
}

// add to cart
function addToCart(
    product
) {
    if (
        !product
        ||
        !product.id
    ) {
        return;
    }

    const existing =
        cart.find(
            (item) =>
                String(item.id)
                === String(product.id)
        );

    if (
        existing
    ) {
        existing.qty =
            Math.max(
                1,
                Number(
                    existing.qty || 1
                ) + 1
            );

    } else {
        cart.push({
            ...product,
            qty: 1
        });
    }

    saveCart();

    AppUtils.notify(
        `${product.name} added to cart`,
        "success"
    );
}

// add to wishlist
function toggleWishlist(
    product
) {
    if (
        !product
        ||
        !product.id
    ) {
        return;
    }

    const exists =
        wishlist.some(
            (item) =>
                String(item.id)
                === String(product.id)
        );

    if (
        exists
    ) {
        wishlist =
            wishlist.filter(
                (item) =>
                    String(item.id)
                    !== String(product.id)
            );

        AppUtils.notify(
            "Removed from wishlist",
            "info"
        );
    } else {
        wishlist.push(
            product
        );

        AppUtils.notify(
            "Added to wishlist",
            "success"
        );
    }
    saveWishlist();
}

// get product by id
function getProductById(
    id,
    products = []
) {
    return products.find(
        (product) =>
            String(product.id)
            === String(id)
    );
}

// action delegation
document.addEventListener(
    "click",
    (event) => {
        const addCartBtn =
            event.target.closest(
                ".add-cart-btn"
            );

        const wishlistBtn =
            event.target.closest(
                ".wishlist-btn"
            );

        const viewBtn =
            event.target.closest(
                ".view-product-btn"
            );

        // add cart
        if (
            addCartBtn
        ) {
            event.preventDefault();

            const id =
                addCartBtn.dataset.id;

            if (
                !id
            ) {
                return;
            }

            const product =
                getProductById(
                    id,
                    window.allProducts || []
                );

            if (
                product
            ) {
                addToCart(
                    product
                );
            }
        }

        // wishlist
        if (
            wishlistBtn
        ) {
            event.preventDefault();

            const id =
                wishlistBtn.dataset.id;

            if (
                !id
            ) {
                return;
            }

            const product =
                getProductById(
                    id,
                    window.allProducts || []
                );

            if (
                product
            ) {
                toggleWishlist(
                    product
                );
            }
        }

        // product page
        if (
            viewBtn
        ) {
            event.preventDefault();

            const id =
                viewBtn.dataset.id;

            if (
                !id
            ) {
                return;
            }

            window.location.href =
                `product.html?id=${id}`;
        }
    }
);

// expose globally
window.addToCart =
    addToCart;

window.toggleWishlist =
    toggleWishlist;
})()