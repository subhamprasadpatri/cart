// Fetch cart data from the API
const cartAPIUrl = "https://cdn.shopify.com/s/files/1/0883/2188/4479/files/apiCartData.json?v=1728384889";
let cartData = null; // Store cart data globally for easier manipulation

async function fetchCartData() {
    try {
        const response = await fetch(cartAPIUrl);
        cartData = await response.json();
        renderCart(cartData);
    } catch (error) {
        console.error("Error fetching cart data:", error);
        document.querySelector(".cart-products").innerHTML = "<p>Failed to load cart data.</p>";
    }
}

// Render the cart data
function renderCart(data) {
    const cartProductsContainer = document.querySelector(".cart-products table tbody");
    const cartSummaryContainer = document.querySelector(".cart-summary .summary-details");

    // Clear existing data
    cartProductsContainer.innerHTML = "";
    cartSummaryContainer.innerHTML = "";

    // Loop through items and render rows
    data.items.forEach((item, index) => {
        const itemRow = `
            <tr id="item-row-${item.id}">
                <td>
                    <img src="${item.image}" alt="${item.title}" />
                    ${item.title}
                </td>
                <td>Rs. ${(item.price / 100).toLocaleString()}</td>
                <td>
                    <input
                        type="number"
                        class="quantity-input"
                        value="${item.quantity}"
                        min="${item.quantity_rule.min}"
                        data-item-index="${index}"
                    />
                </td>
                <td id="item-subtotal-${item.id}">Rs. ${((item.price * item.quantity) / 100).toLocaleString()}</td>
                <td class="delete-cell">
                    <button class="delete-button" onclick="confirmRemoveItem(${index})">
                        🗑️
                    </button>
                </td>
            </tr>
        `;
        cartProductsContainer.insertAdjacentHTML("beforeend", itemRow);
    });

    // Attach event listeners for quantity inputs
    attachQuantityChangeListeners();

    // Update cart summary
    updateCartSummary(data);
}

// Attach event listeners for quantity inputs
function attachQuantityChangeListeners() {
    const quantityInputs = document.querySelectorAll(".quantity-input");

    quantityInputs.forEach((input) => {
        input.addEventListener("change", (event) => {
            const itemIndex = event.target.dataset.itemIndex;
            const newQuantity = parseInt(event.target.value);

            // Update the quantity in cart data and recalculate
            if (newQuantity >= cartData.items[itemIndex].quantity_rule.min) {
                cartData.items[itemIndex].quantity = newQuantity;
                updateCartAfterQuantityChange(itemIndex);
            } else {
                alert("Quantity must be at least the minimum allowed.");
                event.target.value = cartData.items[itemIndex].quantity;
            }
        });
    });
}

// Update cart after a quantity change
function updateCartAfterQuantityChange(itemIndex) {
    const item = cartData.items[itemIndex];

    // Update item subtotal
    const itemSubtotalElement = document.querySelector(`#item-subtotal-${item.id}`);
    const itemSubtotalPaise = item.price * item.quantity;
    itemSubtotalElement.textContent = `Rs. ${(itemSubtotalPaise / 100).toLocaleString()}`;

    // Recalculate and update the summary
    updateCartSummary(cartData);
}

// Update cart summary
function updateCartSummary(data) {
    const cartSummaryContainer = document.querySelector(".cart-summary .summary-details");

    // Calculate the subtotal and total in rupees
    const subtotalPaise = data.items.reduce((total, item) => total + item.price * item.quantity, 0);
    const subtotalRupees = (subtotalPaise / 100).toFixed(2);

    // Calculate the total (this will be the sum of the item subtotals)
    const totalPaise = subtotalPaise; // Total is just the subtotal, since there are no additional charges yet
    const totalRupees = (totalPaise / 100).toFixed(2);

    // Render the summary
    cartSummaryContainer.innerHTML = `
        <p>
            <span>Subtotal:</span>
            <span>Rs. ${parseFloat(subtotalRupees).toLocaleString()}</span>
        </p>
        <p>
            <span>Total:</span>
            <span>Rs. ${parseFloat(totalRupees).toLocaleString()}</span>
        </p>
    `;
}

// Confirm removal of an item
function confirmRemoveItem(itemIndex) {
    const item = cartData.items[itemIndex];
    const userConfirmed = confirm(`Are you sure you want to remove "${item.title}" from the cart?`);
    if (userConfirmed) {
        removeItem(itemIndex);
    }
}

// Remove item and update the cart
function removeItem(itemIndex) {
    // Remove item from cart data locally
    const item = cartData.items[itemIndex];
    cartData.items.splice(itemIndex, 1);

    // Update totals in cartData
    const removedItemPaise = item.price * item.quantity;
    cartData.items_subtotal_price -= removedItemPaise; // Subtotal in paise
    cartData.original_total_price -= removedItemPaise; // Total in paise

    // Re-render the cart and summary
    renderCart(cartData);

    // API Call to update the server (placeholder logic for actual implementation)
    console.log(`API Call: Item with id "${item.id}" removed from the cart.`);
}

// Initialize cart rendering
fetchCartData();

// Event listener for the Checkout button
document.getElementById("checkout-button").addEventListener("click", function () {
    // Here, you can perform any final steps such as confirming the order, submitting data to a server, etc.

    // For now, just redirect to the thank you page
    window.location.href = "thankyou.html";
});
