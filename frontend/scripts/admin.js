// admin auth
const token =
    AppUtils.getToken();

// auth state
let currentAdmin =
    null;

// pagination state
let currentProductPage =
    1;

let currentOrderPage =
    1;

const PAGE_LIMIT =
    10;

// app state
let products = [];

let orders = [];

// require authentication
if (
    !token
) {

    redirectUnauthorized();
}

// secure admin verification
async function verifyAdminAccess() {

    try {

        const response =
            await AppUtils.apiRequest(
                "/auth/me"
            );

        if (
            !response.success
            ||
            !response.user
            ||
            response.user.role !== "admin"
        ) {

            redirectUnauthorized();

            return false;
        }

        currentAdmin =
            response.user;

        return true;

    } catch (error) {

        console.error(
            "ADMIN VERIFY ERROR:",
            error
        );

        redirectUnauthorized();

        return false;
    }
}

// unauthorized redirect
function redirectUnauthorized() {

    AppUtils.notify(
        "Admin access required",
        "error"
    );

    AppUtils.clearAuthData();

    setTimeout(
        () => {

            window.location.href =
                "signin.html";

        },
        1000
    );
}

// escape html
function escapeHTML(
    value
) {

    return String(
        value || ""
    )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );
}

// elements
const elements = {

    productForm:
        document.getElementById(
            "product-form"
        ),

    productTableBody:
        document.getElementById(
            "product-table-body"
        ),

    ordersTableBody:
        document.getElementById(
            "orders-table-body"
        ),

    totalOrders:
        document.getElementById(
            "total-orders"
        ),

    totalProducts:
        document.getElementById(
            "total-products"
        ),

    totalUsers:
        document.getElementById(
            "total-users"
        ),

    totalRevenue:
        document.getElementById(
            "total-revenue"
        ),

    productName:
        document.getElementById(
            "product-name"
        ),

    productCategory:
        document.getElementById(
            "product-category"
        ),

    productPrice:
        document.getElementById(
            "product-price"
        ),

    productDescription:
        document.getElementById(
            "product-description"
        ),

    productImage:
        document.getElementById(
            "product-image"
        ),

    productStock:
        document.getElementById(
            "product-stock"
        ),

    featuredProduct:
        document.getElementById(
            "featured-product"
        )
};

// loading state
function renderLoadingState() {

    if (
        elements.productTableBody
    ) {

        elements.productTableBody.innerHTML =
            `
                <tr>
                    <td colspan="6">
                        Loading products...
                    </td>
                </tr>
            `;
    }
}

// load initial data
async function loadInitialData() {

    renderLoadingState();

    try {

        const productsRes =
            await AppUtils.apiRequest(
                `/products?page=${currentProductPage}&limit=${PAGE_LIMIT}`
            );

        if (
            productsRes.success
        ) {

            products =
                AppUtils.safeArray(
                    productsRes.products
                );
        }

        const ordersRes =
            await AppUtils.apiRequest(
                `/orders?page=${currentOrderPage}&limit=${PAGE_LIMIT}`
            );

        if (
            ordersRes.success
        ) {

            orders =
                AppUtils.safeArray(
                    ordersRes.orders
                );
        }

        renderProducts();

        renderOrders();

        renderStats();

    } catch (error) {

        console.error(
            "ADMIN LOAD ERROR:",
            error
        );

        if (
            elements.productTableBody
        ) {

            elements.productTableBody.innerHTML =
                `
                    <tr>
                        <td colspan="6">
                            Failed to load products
                        </td>
                    </tr>
                `;
        }
    }
}

// render stats
function renderStats() {

    if (
        elements.totalOrders
    ) {

        elements.totalOrders.innerText =
            orders.length;
    }

    if (
        elements.totalProducts
    ) {

        elements.totalProducts.innerText =
            products.length;
    }

    if (
        elements.totalUsers
    ) {

        elements.totalUsers.innerText =
            localStorage.getItem(
                "visits"
            ) || 0;
    }

    const revenue =
        orders.reduce(
            (
                sum,
                order
            ) => {

                return (
                    sum +
                    (
                        parseFloat(
                            order.total
                        ) || 0
                    )
                );

            },
            0
        );

    if (
        elements.totalRevenue
    ) {

        elements.totalRevenue.innerText =
            AppUtils.formatPrice(
                revenue
            );
    }
}

// validate product
function validateProduct(
    product
) {

    if (
        !product.name.trim()
        ||
        !product.category.trim()
    ) {

        AppUtils.notify(
            "Product name and category are required.",
            "error"
        );

        return false;
    }

    if (
        product.price < 0
        ||
        product.stock < 0
    ) {

        AppUtils.notify(
            "Invalid price or stock.",
            "error"
        );

        return false;
    }

    return true;
}

// product payload
function getProductPayload() {

    return {

        name:
            elements.productName.value.trim(),

        category:
            elements.productCategory.value.trim(),

        price:
            parseFloat(
                elements.productPrice.value
            ) || 0,

        description:
            elements.productDescription.value.trim(),

        image:
            elements.productImage.value.trim(),

        stock:
            parseInt(
                elements.productStock.value,
                10
            ) || 0,

        featured:
            elements.featuredProduct.checked
    };
}

// add product
if (
    elements.productForm
) {

    elements.productForm.addEventListener(
        "submit",
        async (
            event
        ) => {

            event.preventDefault();

            const productData =
                getProductPayload();

            if (
                !validateProduct(
                    productData
                )
            ) {

                return;
            }

            try {

                const response =
                    await AppUtils.apiRequest(
                        "/products",
                        {

                            method:
                                "POST",

                            body:
                                JSON.stringify(
                                    productData
                                )
                        }
                    );

                if (
                    response.success
                ) {

                    AppUtils.notify(
                        "Product added successfully!",
                        "success"
                    );

                    elements.productForm.reset();

                    await loadInitialData();

                } else {

                    AppUtils.notify(
                        response.message
                        ||
                        "Failed to add product.",
                        "error"
                    );
                }

            } catch (error) {

                console.error(
                    "ADD PRODUCT ERROR:",
                    error
                );

                AppUtils.notify(
                    "Failed to add product.",
                    "error"
                );
            }
        }
    );
}

// render products
function renderProducts() {

    if (
        !elements.productTableBody
    ) {

        return;
    }

    elements.productTableBody.innerHTML =
        "";

    if (
        !products.length
    ) {

        elements.productTableBody.innerHTML =
            `
                <tr>
                    <td colspan="6">
                        No products found
                    </td>
                </tr>
            `;

        return;
    }

    const fragment =
        document.createDocumentFragment();

    AppUtils.safeArray(
        products
    ).forEach(
        (
            product
        ) => {

            if (
                !product
                ||
                !product.id
            ) {

                return;
            }

            const row =
                document.createElement(
                    "tr"
                );

            row.innerHTML =
                `
                    <td>
                        ${escapeHTML(product.name || "Product")}
                    </td>

                    <td>
                        ${escapeHTML(product.category || "Category")}
                    </td>

                    <td>
                        ${AppUtils.formatPrice(product.price || 0)}
                    </td>

                    <td>
                        ${product.stock || 0}
                    </td>

                    <td>
                        ${
                            product.featured
                                ? "Featured"
                                : "—"
                        }
                    </td>

                    <td>
                        <button
                            type="button"
                            class="action-btn edit-btn"
                        >
                            Edit
                        </button>

                        <button
                            type="button"
                            class="action-btn delete-btn"
                        >
                            Delete
                        </button>
                    </td>
                `;

            row.querySelector(
                ".edit-btn"
            )?.addEventListener(
                "click",
                () => {

                    editProduct(
                        product.id
                    );
                }
            );

            row.querySelector(
                ".delete-btn"
            )?.addEventListener(
                "click",
                () => {

                    deleteProduct(
                        product.id
                    );
                }
            );

            fragment.appendChild(
                row
            );
        }
    );

    elements.productTableBody.appendChild(
        fragment
    );
}

// delete product
async function deleteProduct(
    id
) {

    const confirmed =
        confirm(
            "Delete this product permanently?"
        );

    if (
        !confirmed
    ) {

        return;
    }

    try {

        const response =
            await AppUtils.apiRequest(
                `/products/${id}`,
                {
                    method:
                        "DELETE"
                }
            );

        if (
            response.success
        ) {

            products =
                products.filter(
                    (
                        product
                    ) => {

                        return (
                            product.id !== id
                        );
                    }
                );

            renderProducts();

            renderStats();

            AppUtils.notify(
                "Product deleted successfully!",
                "success"
            );

        } else {

            AppUtils.notify(
                response.message
                ||
                "Failed to delete product.",
                "error"
            );
        }

    } catch (error) {

        console.error(
            "DELETE PRODUCT ERROR:",
            error
        );

        AppUtils.notify(
            "Failed to delete product.",
            "error"
        );
    }
}

// edit product
async function editProduct(
    id
) {

    const product =
        products.find(
            (
                p
            ) => {

                return p.id === id;
            }
        );

    if (
        !product
    ) {

        return;
    }

    const newName =
        prompt(
            "Edit Product Name",
            product.name
        );

    const newPrice =
        prompt(
            "Edit Product Price",
            product.price
        );

    const newStock =
        prompt(
            "Edit Product Stock",
            product.stock
        );

    if (
        !newName?.trim()
        ||
        isNaN(
            newPrice
        )
        ||
        isNaN(
            newStock
        )
    ) {

        AppUtils.notify(
            "Invalid product details.",
            "error"
        );

        return;
    }

    const updatedData = {

        name:
            newName.trim(),

        description:
            product.description || "",

        price:
            parseFloat(
                newPrice
            ) || 0,

        image:
            product.image || "",

        category:
            product.category || "",

        stock:
            parseInt(
                newStock,
                10
            ) || 0,

        featured:
            product.featured || false
    };

    try {

        const response =
            await AppUtils.apiRequest(
                `/products/${id}`,
                {

                    method:
                        "PUT",

                    body:
                        JSON.stringify(
                            updatedData
                        )
                }
            );

        if (
            response.success
        ) {

            Object.assign(
                product,
                updatedData
            );

            renderProducts();

            renderStats();

            AppUtils.notify(
                "Product updated successfully!",
                "success"
            );

        } else {

            AppUtils.notify(
                response.message
                ||
                "Failed to update product.",
                "error"
            );
        }

    } catch (error) {

        console.error(
            "EDIT PRODUCT ERROR:",
            error
        );

        AppUtils.notify(
            "Failed to update product.",
            "error"
        );
    }
}

// render orders
function renderOrders() {

    if (
        !elements.ordersTableBody
    ) {

        return;
    }

    elements.ordersTableBody.innerHTML =
        "";

    if (
        !orders.length
    ) {

        elements.ordersTableBody.innerHTML =
            `
                <tr>
                    <td colspan="3">
                        No orders found
                    </td>
                </tr>
            `;

        return;
    }

    const fragment =
        document.createDocumentFragment();

    AppUtils.safeArray(
        orders
    ).forEach(
        (
            order
        ) => {

            if (
                !order
            ) {

                return;
            }

            const row =
                document.createElement(
                    "tr"
                );

            row.innerHTML =
                `
                    <td>
                        ${escapeHTML(order.id || "-")}
                    </td>

                    <td>
                        ${escapeHTML(order.created_at || "-")}
                    </td>

                    <td>
                        ${AppUtils.formatPrice(order.total || 0)}
                    </td>
                `;

            fragment.appendChild(
                row
            );
        }
    );

    elements.ordersTableBody.appendChild(
        fragment
    );
}

// init
document.addEventListener(
    "DOMContentLoaded",
    async () => {

        const hasAccess =
            await verifyAdminAccess();

        if (
            !hasAccess
        ) {

            return;
        }

        await loadInitialData();
    }
);

// Tab Switching
document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active-admin-tab'));
        tab.classList.add('active-admin-tab');
        
        const target = tab.getAttribute('data-tab');
        document.querySelectorAll('.admin-section').forEach(sec => sec.style.display = 'none');
        document.querySelector('.admin-stats').style.display = 'none';
        
        if (target === 'dashboard') {
            document.querySelector('.admin-stats').style.display = 'grid';
            document.getElementById('section-dashboard').style.display = 'grid';
            loadAdminDashboard();
        } else if (target === 'users') {
            document.getElementById('section-users').style.display = 'block';
            loadAdminUsers(1);
        } else if (target === 'products') {
            document.getElementById('section-products-form').style.display = 'block';
            document.getElementById('section-products-list').style.display = 'block';
        } else if (target === 'orders') {
            document.getElementById('section-orders').style.display = 'block';
        }
    });
});

let revenueChartInstance = null;
let orderStatusChartInstance = null;

window.loadAdminDashboard = async function() {
    try {
        const response = await AppUtils.apiRequest("/admin/dashboard");
        if (!response.success) return;
        
        const data = response.data;
        // Update stats
        if (elements.totalOrders) elements.totalOrders.innerText = data.stats.totalOrders;
        if (elements.totalRevenue) elements.totalRevenue.innerText = AppUtils.formatPrice(data.stats.totalRevenue);
        if (elements.totalUsers) elements.totalUsers.innerText = data.stats.totalUsers;
        if (elements.totalProducts) elements.totalProducts.innerText = data.stats.totalProducts;

        // Render Charts
        const revCtx = document.getElementById('revenueChart');
        if (revCtx) {
            if (revenueChartInstance) revenueChartInstance.destroy();
            revenueChartInstance = new Chart(revCtx, {
                type: 'line',
                data: {
                    labels: data.charts.revenue.map(r => r.date.split('T')[0]),
                    datasets: [{
                        label: 'Revenue (₹)',
                        data: data.charts.revenue.map(r => r.revenue),
                        borderColor: '#088178',
                        tension: 0.1,
                        fill: true,
                        backgroundColor: 'rgba(8, 129, 120, 0.1)'
                    }]
                }
            });
        }

        const statusCtx = document.getElementById('orderStatusChart');
        if (statusCtx) {
            if (orderStatusChartInstance) orderStatusChartInstance.destroy();
            orderStatusChartInstance = new Chart(statusCtx, {
                type: 'doughnut',
                data: {
                    labels: data.charts.orderStatus.map(s => s.status),
                    datasets: [{
                        data: data.charts.orderStatus.map(s => s.count),
                        backgroundColor: ['#28a745', '#ffc107', '#dc3545', '#17a2b8', '#6c757d']
                    }]
                }
            });
        }
    } catch (e) {
        console.error("Dashboard Load Error", e);
    }
};

let currentUsersPage = 1;
window.loadAdminUsers = async function(page = 1) {
    currentUsersPage = page;
    const search = document.getElementById('user-search').value;
    const status = document.getElementById('user-status-filter').value;
    
    try {
        const response = await AppUtils.apiRequest(`/admin/users?page=${page}&limit=20&search=${search}&status=${status}`);
        if (!response.success) return;
        
        const tbody = document.getElementById('users-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';
        
        response.users.forEach(u => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><input type="checkbox" class="user-select-cb" value="${u.id}"></td>
                <td>${escapeHTML(u.name)}</td>
                <td>${escapeHTML(u.email)}</td>
                <td><span class="badge">${u.role}</span></td>
                <td><span class="badge ${u.is_active ? 'active' : 'blocked'}">${u.is_active ? 'Active' : 'Blocked'}</span></td>
                <td>${new Date(u.created_at).toLocaleDateString()}</td>
                <td>
                    ${u.role !== 'admin' ? `
                    <button class="normal" style="padding:4px 8px; font-size:12px; border:none; border-radius:4px; cursor:pointer; background: ${u.is_active ? '#dc3545' : '#28a745'}; color: white;" 
                            onclick="toggleUserStatus(${u.id}, '${u.is_active ? 'blocked' : 'active'}')">
                        ${u.is_active ? 'Block' : 'Unblock'}
                    </button>
                    ` : ''}
                </td>
            `;
            tbody.appendChild(tr);
        });
        
    } catch (e) {
        console.error("Users Load Error", e);
    }
};

window.toggleUserStatus = async function(id, newStatus) {
    if (!confirm(`Are you sure you want to ${newStatus} this user?`)) return;
    try {
        const res = await AppUtils.apiRequest(`/admin/users/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status: newStatus })
        });
        if (res.success) {
            AppUtils.notify(res.message, 'success');
            loadAdminUsers(currentUsersPage);
        } else {
            AppUtils.notify(res.message, 'error');
        }
    } catch (e) {}
};

const userSearch = document.getElementById('user-search');
if (userSearch) userSearch.addEventListener('input', AppUtils.debounce(() => loadAdminUsers(1), 500));

const userStatusFilter = document.getElementById('user-status-filter');
if (userStatusFilter) userStatusFilter.addEventListener('change', () => loadAdminUsers(1));

window.bulkUserAction = async function(newStatus) {
    const selected = Array.from(document.querySelectorAll('.user-select-cb:checked')).map(cb => cb.value);
    if (!selected.length) {
        AppUtils.notify("Select at least one user", 'error');
        return;
    }
    if (!confirm(`Are you sure you want to ${newStatus} ${selected.length} user(s)?`)) return;
    
    try {
        const res = await AppUtils.apiRequest('/admin/users/bulk-status', {
            method: 'POST',
            body: JSON.stringify({ userIds: selected, status: newStatus })
        });
        if (res.success) {
            AppUtils.notify(res.message, 'success');
            loadAdminUsers(currentUsersPage);
            document.getElementById('user-select-all').checked = false;
        } else {
            AppUtils.notify(res.message, 'error');
        }
    } catch (e) {}
};

const bulkBlockBtn = document.getElementById('user-bulk-block');
if (bulkBlockBtn) bulkBlockBtn.addEventListener('click', () => bulkUserAction('blocked'));

const bulkUnblockBtn = document.getElementById('user-bulk-unblock');
if (bulkUnblockBtn) bulkUnblockBtn.addEventListener('click', () => bulkUserAction('active'));

const selectAllCb = document.getElementById('user-select-all');
if (selectAllCb) {
    selectAllCb.addEventListener('change', (e) => {
        document.querySelectorAll('.user-select-cb').forEach(cb => cb.checked = e.target.checked);
    });
}

// Ensure the dashboard loads its data on init
setTimeout(() => {
    loadAdminDashboard();
}, 500);