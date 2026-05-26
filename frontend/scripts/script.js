(function(){
// global state
let allProducts = [];

// containers
const featuredContainer =
    document.getElementById(
        "featured-products"
    );

const adminFeaturedContainer =
    document.getElementById(
        "featured-products-container"
    );

const arrivalsContainer =
    document.getElementById(
        "new-arrivals-container"
    );

// fetch products
async function fetchAllProducts() {
    try {
        const data =
            await AppUtils.apiRequest(
                "/products"
            );

        if (
            data.success
        ) {
            allProducts =
                Array.isArray(
                    data.products
                )
                    ? data.products
                    : [];

            window.allProducts =
                allProducts;

            renderHomepageProducts();
        }

    } catch (error) {
        console.error(
            "PRODUCT FETCH ERROR:",
            error
        );
        renderEmptyState();
    }
}

fetchAllProducts();

// render homepage products
function renderHomepageProducts() {

    if (
        !allProducts.length
    ) {
        renderEmptyState();
        return;
    }

    // featured
    if (
        featuredContainer
    ) {
        renderProducts(
            featuredContainer,
            allProducts.slice(0, 8)
        );
    }

    // admin featured
    if (
        adminFeaturedContainer
    ) {
        const featuredOnly =
            allProducts.filter(
                (product) =>
                    product.featured
            );

        renderProducts(
            adminFeaturedContainer,
            featuredOnly.slice(0, 8)
        );
    }

    // new arrivals
    if (
        arrivalsContainer
    ) {
        renderProducts(
            arrivalsContainer,
            [...allProducts]
                .reverse()
                .slice(0, 8)
        );
    }
}

// empty state
function renderEmptyState() {
    const containers = [
        featuredContainer,
        adminFeaturedContainer,
        arrivalsContainer
    ];

    containers.forEach(
        (container) => {
            if (
                container
            ) {
                container.innerHTML = `
                    <p class="empty-products">
                        No products available.
                    </p>
                `;
            }
        }
    );
}

// render products
function renderProducts(
    container,
    products = []
) {
    if (
        !container
    ) {
        return;
    }

    container.innerHTML =
        "";

    const fragment =
        document.createDocumentFragment();

    products.forEach(
        (product, index) => {

            const card =
                document.createElement(
                    "div"
                );

            card.innerHTML =
                createProductCard(
                    product
                );

            const productElement =
                card.firstElementChild;

            if (
                productElement
            ) {

                fragment.appendChild(
                    productElement
                );
            }
        }
    );

    container.appendChild(
        fragment
    );
    initializeProductCardFeatures();
}

// product card features
function initializeProductCardFeatures() {
    const productCards =
        document.querySelectorAll(
            ".pro"
        );

    // quick view modal
    productCards.forEach(
        (card) => {
            const img =
                card.querySelector(
                    "img"
                );

            if (
                !img
            ) {
                return;
            }

            img.addEventListener(
                "click",
                () => {
                    const modal =
                        document.createElement(
                            "div"
                        );

                    modal.style.cssText = `
                        position: fixed;
                        inset: 0;
                        background: rgba(0,0,0,0.7);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 9999;
                        padding: 20px;
                    `;

                    modal.setAttribute(
                        "role",
                        "dialog"
                    );

                    modal.setAttribute(
                        "aria-modal",
                        "true"
                    );

                    const box =
                        document.createElement(
                            "div"
                        );

                    box.style.cssText = `
                        background: white;
                        padding: 20px;
                        border-radius: 12px;
                        max-width: 420px;
                        width: 100%;
                        text-align: center;
                    `;

                    const big =
                        document.createElement(
                            "img"
                        );

                    big.src =
                        img.src;

                    big.alt =
                        img.alt ||
                        "Product Image";

                    big.style.cssText = `
                        width: 100%;
                        max-height: 450px;
                        object-fit: contain;
                    `;

                    box.appendChild(
                        big
                    );

                    modal.appendChild(
                        box
                    );

                    document.body.appendChild(
                        modal
                    );

                    document.body.style.overflow =
                        "hidden";

                    function closeModal() {
                        document.body.style.overflow =
                            "";

                        modal.remove();

                        document.removeEventListener(
                            "keydown",
                            handleEscape
                        );
                    }

                    function handleEscape(
                        event
                    ) {
                        if (
                            event.key ===
                            "Escape"
                        ) {
                            closeModal();
                        }
                    }

                    modal.addEventListener(
                        "click",
                        (event) => {
                            if (
                                event.target === modal
                            ) {
                                closeModal();
                            }
                        }
                    );

                    document.addEventListener(
                        "keydown",
                        handleEscape
                    );
                }
            );
        }
    );
}
})()