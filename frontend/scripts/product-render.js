// product render helpers
function renderStars(
    rating = 0
) {
    let stars = "";
    for (
        let index = 0;
        index < 5;
        index++
    ) {
        stars +=
            index < rating
                ? `
                    <i class="fas fa-star"></i>
                `
                : `
                    <i class="far fa-star"></i>
                `;
    }
    return stars;
}

// product card
function renderProductCard(
    product,
    container
) {
    if (
        !product ||
        !container
    ) {
        return;
    }
    const card =
        document.createElement(
            "div"
        );

    card.classList.add(
        "pro"
    );

    card.innerHTML = `
        <div class="product-image-wrapper">
            <img
                src="${
                    AppUtils.defaultImage(
                        product.image
                    )
                }"
                alt="${
                    product.name
                }"
            >
        </div>

        <div class="des">
            <span>
                ${
                    product.brand
                    || "Fashion"
                }
            </span>

            <h5>
                ${
                    product.name
                }
            </h5>

            <div class="star">
                ${
                    renderStars(
                        product.rating || 4
                    )
                }
            </div>

            <h4>
                ${
                    AppUtils.formatPrice(
                        product.price || 0
                    )
                }
            </h4>
        </div>

        <div class="product-actions">
            <a
                href="product.html?id=${product.id}"
                class="view-btn"
            >
                View
            </a>

            <button
                class="add-cart-btn"
                data-id="${product.id}"
            >
                Add Cart
            </button>        
        </div>
    `;

    container.appendChild(
        card
    );
}

// gallery
function renderProductGallery(
    product
) {
    if (
        !window.mainImage
    ) {
        return;
    }

    const galleryImages =
        Array.isArray(
            product.images
        )
        &&
        product.images.length
            ? product.images
            : [product.image];

    window.mainImage.src =
        AppUtils.defaultImage(
            galleryImages[0]
        );

    const imageGroup =
        document.querySelector(
            ".small-image-group"
        );

    if (!imageGroup) {
        return;
    }

    const thumbs =
        document.querySelectorAll(
            ".small-image"
        );

    if (
        galleryImages.length <= 1
    ) {
        imageGroup.style.display =
            "none";

        return;
    }

    imageGroup.style.display =
        "flex";

    thumbs.forEach(
        (image, index) => {
            image.src =
                AppUtils.defaultImage(
                    galleryImages[index]
                    || galleryImages[0]
                );

            image.onclick =
                () => {

                    window.mainImage.src =
                        AppUtils.defaultImage(
                            galleryImages[index]
                            || galleryImages[0]
                        );
                };
        }
    );
}

// rating
function renderProductRating(
    product
) {
    const ratingContainer =
        document.querySelector(
            ".product-rating"
        );

    if (
        !ratingContainer
    ) {
        return;
    }

    ratingContainer.innerHTML = `
        ${
            renderStars(
                Math.round(
                    Number(
                        product.rating || 4.5
                    )
                )
            )
        }

        <span id="product-rating-text">
            (
                ${
                    product.rating || 4.5
                }
                Ratings
            )
        </span>
    `;
}

// recently viewed
function updateRecentlyViewed(
    product
) {
    let viewed =
        AppUtils.getJSON(
            "recentlyViewed",
            []
        );

    viewed =
        viewed.filter(
            (item) =>
                item.id !== product.id
        );

    viewed.unshift({
        id: product.id,
        name: product.name,
        brand: product.brand,
        category: product.category,
        price: product.price,
        image: product.image
    });

    viewed =
        viewed.slice(0, 8);

    AppUtils.setJSON(
        "recentlyViewed",
        viewed
    );
}

// main render
function renderProduct(
    product
) {
    if (!product) {
        return;
    }

    if (
        window.productCategory
    ) {
        window.productCategory.innerText =
            `Home / ${
                product.category
                || "Category"
            }`;
    }

    if (
        window.productName
    ) {
        window.productName.innerText =
            product.name
            || "Product";
    }

    if (
        window.productPrice
    ) {
        const discountedPrice =
            Number(
                product.price || 0
            ) *
            (
                1 -
                (
                    Number(
                        product.discount_percent || 0
                    ) / 100
                )
            );

        window.productPrice.innerText =
            AppUtils.formatPrice(
                discountedPrice
            );
    }

    if (
        window.productOriginalPrice
    ) {
        window.productOriginalPrice.innerText =
            AppUtils.formatPrice(
                product.original_price
                || product.price
            );
    }

    if (
        window.productDiscount
    ) {
        window.productDiscount.innerText =
            `${
                product.discount_percent || 0
            }% OFF`;
    }

    if (
        window.productBrand
    ) {
        window.productBrand.innerText =
            product.brand
            || "Brand";
    }

    if (
        window.productDescription
    ) {
        window.productDescription.innerText =
            product.description
            || "Premium quality product.";
    }

    if (
        window.productStock
    ) {
        window.productStock.innerText =
            Number(
                product.stock
            ) > 0
                ? `${product.stock} Available`
                : "Out Of Stock";
    }

    if (
        window.mainImage
    ) {
        window.mainImage.src =
            AppUtils.defaultImage(
                product.image
            );
    }

    renderProductGallery(
        product
    );

    renderProductRating(
        product
    );

    updateRecentlyViewed(
        product
    );
}

// expose globally
window.renderProduct =
    renderProduct;

window.renderProductCard =
    renderProductCard;

window.renderProductGallery =
    renderProductGallery;

window.renderProductRating =
    renderProductRating;

window.updateRecentlyViewed =
    updateRecentlyViewed;