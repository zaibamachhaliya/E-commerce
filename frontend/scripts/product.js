(() => {
console.log(
    "Product page loaded successfully!"
);

// PRODUCT PAGE ELEMENTS
const productElements = {
    mainImage:
        document.getElementById(
            "main-product-image"
        ),

    qtyInput:
        document.getElementById(
            "product-qty"
        ),

    productCategory:
        document.getElementById(
            "product-category"
        ),

    productName:
        document.getElementById(
            "product-name"
        ),

    productPrice:
        document.getElementById(
            "product-price"
        ),

    productOriginalPrice:
        document.getElementById(
            "product-original-price"
        ),

    productDiscount:
        document.getElementById(
            "product-discount"
        ),

    productBrand:
        document.getElementById(
            "product-brand"
        ),

    productDescription:
        document.getElementById(
            "product-description"
        ),

    productStock:
        document.getElementById(
            "product-stock"
        ),

    variantStock:
        document.getElementById(
            "variant-stock"
        ),

    wishlistBtn:
        document.getElementById(
            "wishlist-btn"
        ),

    reviewForm:
        document.getElementById(
            "review-form"
        ),

    plusBtn:
        document.getElementById(
            "plus-btn"
        ),

    minusBtn:
        document.getElementById(
            "minus-btn"
        ),

    addToCartBtn:
        document.getElementById(
            "add-to-cart-btn"
        ),

    buyNowBtn:
        document.getElementById(
            "buy-now-btn"
        )
};

// PRODUCT STATE
let currentProductData =
    null;

// PRODUCT ID
const urlParams =
    new URLSearchParams(
        window.location.search
    );

const productId =
    parseInt(
        urlParams.get("id"),
        10
    );

// invalid id fallback
if (
    Number.isNaN(productId)
    ||
    productId <= 0
) {
    window.location.href =
        "shop.html";

    throw new Error(
        "Invalid product ID"
    );
}

// FALLBACK PRODUCT
function getFallbackProduct() {
    return {
        id: 1,

        brand:
            "AnthropicBots",

        name:
            "Nike Hoodie",

        category:
            "Fashion",

        price: 2999,

        image:
            "/assets/images/f1.jpg",

        description:
            "Premium cotton hoodie with modern fashion styling and comfortable fit.",

        stock: 12,

        rating: 4.5,

        discount_percent: 10
    };
}

// LOADING STATE
function showLoadingState() {
    document.body.classList.add(
        "loading"
    );
}

function hideLoadingState() {
    document.body.classList.remove(
        "loading"
    );
}

// FETCH PRODUCT
async function fetchProduct() {
    showLoadingState();
    try {
        const response =
            await AppUtils.apiRequest(
                `/products/${productId}`
            );

        if (
            response.success
            &&
            response.product
        ) {

            currentProductData =
                response.product;

            sessionStorage.setItem(
                `product-${productId}`,
                JSON.stringify(
                    response.product
                )
            );

        } else {
            console.warn(
                "Using fallback product"
            );

            currentProductData =
                getFallbackProduct();
        }

    } catch (error) {
        console.error(
            "PRODUCT FETCH ERROR:",
            error
        );

        let cached =
            null;

        try {
            cached =
                sessionStorage.getItem(
                    `product-${productId}`
                );

            cached =
                cached
                    ? JSON.parse(
                        cached
                    )
                    : null;

        } catch (
            storageError
        ) {
            console.error(
                "CACHE PARSE ERROR:",
                storageError
            );
        }

        currentProductData =
            cached ||
            getFallbackProduct();
    }
    initializeProductPage();
    hideLoadingState();
}

// INITIALIZE PAGE
function initializeProductPage() {
    const product =
        currentProductData;

    if (
        !product
    ) {
        return;
    }

    // disable actions if out of stock
    if (
        Number(
            product.stock
        ) <= 0
    ) {
        if (
            productElements.addToCartBtn
        ) {

            productElements.addToCartBtn.disabled =
                true;

            productElements.addToCartBtn.innerText =
                "Out of Stock";
        }

        if (
            productElements.buyNowBtn
        ) {

            productElements.buyNowBtn.disabled =
                true;
        }
    }

    // render product
    if (
        typeof renderProduct ===
        "function"
    ) {
        renderProduct(
            product
        );
    }

    // setup variants
    if (
        typeof setupVariants ===
        "function"
    ) {
        setupVariants(
            product
        );
    }

    // setup cart actions
    if (
        productElements.addToCartBtn
    ) {

        productElements.addToCartBtn.onclick =
            () => {

                let cart =
                    AppUtils.getCart();

                const existing =
                    cart.find(
                        item =>
                            Number(item.id)
                            === Number(product.id)
                    );

                if (existing) {

                    existing.qty =
                        (existing.qty || 1) + 1;

                } else {

                    cart.push({
                        ...product,
                        qty: 1
                    });
                }

                AppUtils.saveCart(cart);

                AppUtils.notify(
                    `${product.name} added to cart`,
                    "success"
                );

                if (
                    typeof updateCartCount ===
                    "function"
                ) {
                    updateCartCount();
                }
            };
    }

    // buy now
    if (
        productElements.buyNowBtn
    ) {
        productElements.buyNowBtn.onclick =
            () => {
                let cart =
                    AppUtils.getCart();

                const existing =
                    cart.find(
                        item =>
                            Number(item.id)
                            === Number(product.id)
                    );

                if (existing) {
                    existing.qty =
                        (existing.qty || 1) + 1;

                } else {
                    cart.push({
                        ...product,
                        qty: 1
                    });
                }
                AppUtils.saveCart(cart);
                window.location.href =
                    "cart.html";
            };
    }

    // load reviews
    if (
        typeof loadProductReviews ===
        "function"
    ) {
        loadProductReviews(
            product.id
        );
    }

    // related products
    if (
        typeof loadRelatedProducts ===
        "function"
    ) {
        loadRelatedProducts(
            product
        );
    }

    // recommendations
    if (
        typeof loadRecentlyViewedRecommendations ===
        "function"
    ) {
        loadRecentlyViewedRecommendations();
    }
    initializeImageZoom();
    initializeProductGallery(product);
}

// RENDER PRODUCT
function renderProduct(product) {

    if (!product) {
        return;
    }

    // main image
    if (
        productElements.mainImage
    ) {
        productElements.mainImage.src =
            product.image ||
            "/assets/images/f1.jpg";

        productElements.mainImage.onerror =
            () => {    
                productElements.mainImage.src =
                    "/assets/images/f1.jpg";
            };

        productElements.mainImage.alt =
            product.name;
    }

    // category
    if (
        productElements.productCategory
    ) {

        productElements.productCategory.innerText =
            product.category ||
            "Fashion";
    }

    // name
    if (
        productElements.productName
    ) {

        productElements.productName.innerText =
            product.name ||
            "Product Name";
    }

    // price
    if (
        productElements.productPrice
    ) {

        productElements.productPrice.innerText =
            `₹${Number(
                product.price || 0
            ).toFixed(2)}`;
    }

    // original price
    if (
        productElements.productOriginalPrice
    ) {
        const productPrice =
            parseFloat(product.price || 0);

        const originalPrice =
            productPrice + 1000;

        productElements.productOriginalPrice.innerText =
            `₹${originalPrice.toFixed(2)}`;
    }

    // discount
    if (
        productElements.productDiscount
    ) {

        productElements.productDiscount.innerText =
            "50% OFF";
    }

    // brand
    if (
        productElements.productBrand
    ) {

        productElements.productBrand.innerText =
            product.brand ||
            "Fashion";
    }

    // description
    if (
        productElements.productDescription
    ) {

        productElements.productDescription.innerText =
            product.description ||
            "Premium fashion product.";
    }

    // page title
    document.title =
        `${product.name} | AnthropicBots E-Commerce`;
    
        // stock
    if (
        productElements.productStock
    ) {

        productElements.productStock.innerText =
            Number(product.stock) > 0
                ? "In Stock"
                : "Out Of Stock";
    }
}

// IMAGE ZOOM
function initializeImageZoom() {
    if (
        !productElements.mainImage
    ) {
        return;
    }

    // avoid duplicate listeners
    if (
        productElements.mainImage.dataset.zoomReady
    ) {
        return;
    }

    productElements.mainImage.dataset.zoomReady =
        "true";

    productElements.mainImage.style.transition =
        "0.3s ease";

    productElements.mainImage.addEventListener(
        "mouseenter",
        () => {
            productElements.mainImage.style.transform =
                "scale(1.05)";
        }
    );

    productElements.mainImage.addEventListener(
        "mouseleave",
        () => {
            productElements.mainImage.style.transform =
                "scale(1)";
        }
    );
}

function initializeProductGallery(product) {

    const thumbnails =
        document.querySelectorAll(
            ".small-image"
        );

    if (!thumbnails.length) {
        return;
    }

    thumbnails.forEach((thumb) => {

        thumb.src =
            product.image ||
            "/assets/images/f1.jpg";

        thumb.onclick =
            () => {

                if (
                    productElements.mainImage
                ) {

                    productElements.mainImage.src =
                        thumb.src;
                }
            };
    });
}

// KEYBOARD ACCESSIBILITY
document.addEventListener(
    "keydown",
    (event) => {
        const activeTag =
            document.activeElement
                ?.tagName;

        if (
            ["INPUT", "TEXTAREA"]
                .includes(
                    activeTag
                )
        ) {
            return;
        }

        if (
            event.key === "+"
            &&
            productElements.plusBtn
        ) {
            productElements.plusBtn.click();
        }

        if (
            event.key === "-"
            &&
            productElements.minusBtn
        ) {
            productElements.minusBtn.click();
        }
    }
);

// INIT
document.addEventListener(
    "DOMContentLoaded",
    () => {
        fetchProduct();
        if (
            typeof updateCartCount ===
            "function"
        ) {
            updateCartCount();
        }
    }
);
})();