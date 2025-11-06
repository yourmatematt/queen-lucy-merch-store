/* 👑 QUEEN LUCY CART SIDEBAR COMPONENT 👑 */

class CartSidebar {
    constructor() {
        this.cartState = {
            items: [],
            total: 0,
            count: 0
        };

        this.init();
    }

    init() {
        this.createCartHTML();
        this.bindEvents();
        this.loadCart();
    }

    createCartHTML() {
        // Create cart overlay
        const overlay = document.createElement('div');
        overlay.className = 'cart-overlay';
        overlay.id = 'cartOverlay';
        document.body.appendChild(overlay);

        // Create cart sidebar
        const sidebar = document.createElement('div');
        sidebar.className = 'cart-sidebar';
        sidebar.id = 'cartSidebar';
        sidebar.innerHTML = `
            <div class="cart-header">
                <h2>YOUR THRONE</h2>
                <button class="cart-close" id="cartClose">×</button>
            </div>
            <div class="cart-content" id="cartContent">
                <div class="cart-empty">
                    <div class="empty-icon">👑</div>
                    <h3>YOUR THRONE AWAITS</h3>
                    <p>Your legendary collection starts here</p>
                </div>
            </div>
            <div class="cart-footer">
                <div class="cart-total">
                    <span>TOTAL: $<span id="cartTotal">0</span> AUD</span>
                </div>
                <button class="cart-checkout-btn">CLAIM THRONE</button>
            </div>
        `;
        document.body.appendChild(sidebar);

        // Store references
        this.overlay = overlay;
        this.sidebar = sidebar;
        this.closeBtn = document.getElementById('cartClose');
        this.content = document.getElementById('cartContent');
        this.totalEl = document.getElementById('cartTotal');
    }

    bindEvents() {
        // Close cart events
        this.closeBtn.addEventListener('click', () => this.close());
        this.overlay.addEventListener('click', () => this.close());

        // Cart icon click (will be bound externally)
        this.onCartIconClick = () => this.open();
    }

    open() {
        this.sidebar.classList.add('active');
        this.overlay.classList.add('active');
        this.updateDisplay();
    }

    close() {
        this.sidebar.classList.remove('active');
        this.overlay.classList.remove('active');
    }

    addItem(product) {
        // Check if item already exists
        const existingIndex = this.cartState.items.findIndex(item => item.id === product.id);

        if (existingIndex !== -1) {
            this.cartState.items[existingIndex].quantity += 1;
        } else {
            this.cartState.items.push({ ...product, quantity: 1 });
        }

        this.cartState.count += 1;
        this.cartState.total += product.price;

        this.saveCart();
        this.updateDisplay();
        this.open();
        this.createConfetti();
    }

    removeItem(itemId) {
        const itemIndex = this.cartState.items.findIndex(item => item.id === itemId);
        if (itemIndex !== -1) {
            const item = this.cartState.items[itemIndex];
            this.cartState.count -= item.quantity;
            this.cartState.total -= item.price * item.quantity;
            this.cartState.items.splice(itemIndex, 1);

            this.saveCart();
            this.updateDisplay();
        }
    }

    updateQuantity(itemId, newQuantity) {
        const item = this.cartState.items.find(item => item.id === itemId);
        if (item && newQuantity > 0) {
            const oldQuantity = item.quantity;
            item.quantity = newQuantity;

            this.cartState.count += (newQuantity - oldQuantity);
            this.cartState.total += item.price * (newQuantity - oldQuantity);

            this.saveCart();
            this.updateDisplay();
        }
    }

    updateDisplay() {
        // Update cart badge
        this.updateCartBadge();

        // Update total
        this.totalEl.textContent = this.cartState.total.toFixed(0);

        // Update cart content
        if (this.cartState.items.length === 0) {
            this.content.innerHTML = `
                <div class="cart-empty">
                    <div class="empty-icon">👑</div>
                    <h3>YOUR THRONE AWAITS</h3>
                    <p>Your legendary collection starts here</p>
                </div>
            `;
        } else {
            this.content.innerHTML = this.cartState.items.map(item => `
                <div class="cart-item" data-id="${item.id}">
                    <div class="cart-item-image">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p>Size: ${item.size} | Color: ${item.color}</p>
                        <div class="cart-item-controls">
                            <button onclick="window.cartSidebar.updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                            <span>${item.quantity}</span>
                            <button onclick="window.cartSidebar.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                            <button onclick="window.cartSidebar.removeItem('${item.id}')" class="remove-btn">×</button>
                        </div>
                    </div>
                    <div class="cart-item-price">$${(item.price * item.quantity).toFixed(0)}</div>
                </div>
            `).join('');
        }
    }

    updateCartBadge() {
        const badge = document.getElementById('cartBadge');
        if (badge) {
            badge.textContent = this.cartState.count;
            badge.style.display = this.cartState.count > 0 ? 'flex' : 'none';
        }
    }

    loadCart() {
        const saved = localStorage.getItem('queenLucyCart');
        if (saved) {
            this.cartState = JSON.parse(saved);
            this.updateDisplay();
        }
    }

    saveCart() {
        localStorage.setItem('queenLucyCart', JSON.stringify(this.cartState));
    }

    createConfetti() {
        const colors = ['#ec4899', '#FFD700', '#8B00FF', '#00F0FF'];

        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = '-10px';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.zIndex = '10000';
            confetti.style.animation = 'confetti-fall 3s linear forwards';
            confetti.style.pointerEvents = 'none';
            document.body.appendChild(confetti);

            setTimeout(() => confetti.remove(), 3000);
        }
    }

    // Public API for adding products
    addProduct(productData) {
        this.addItem(productData);
    }

    // Get cart state
    getCartState() {
        return { ...this.cartState };
    }

    // Clear cart
    clearCart() {
        this.cartState = {
            items: [],
            total: 0,
            count: 0
        };
        this.saveCart();
        this.updateDisplay();
    }
}

// Initialize cart sidebar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cartSidebar = new CartSidebar();

    // Bind cart icon click if it exists
    const cartIcon = document.getElementById('cartIcon');
    if (cartIcon) {
        cartIcon.addEventListener('click', () => window.cartSidebar.open());
    }
});

// CSS for cart items (to be added to shared.css)
const cartItemStyles = `
    .cart-item {
        display: flex;
        gap: 12px;
        padding: 16px 0;
        border-bottom: 1px solid var(--border);
    }

    .cart-item-image {
        width: 60px;
        height: 60px;
        border-radius: 4px;
        overflow: hidden;
    }

    .cart-item-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .cart-item-details {
        flex: 1;
    }

    .cart-item-details h4 {
        font-size: 14px;
        margin-bottom: 4px;
        color: var(--white);
    }

    .cart-item-details p {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.7);
        margin-bottom: 8px;
    }

    .cart-item-controls {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .cart-item-controls button {
        width: 24px;
        height: 24px;
        border: 1px solid var(--border);
        background: var(--black);
        color: white;
        border-radius: 2px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
    }

    .cart-item-controls button:hover {
        border-color: var(--primary);
        background: var(--primary);
    }

    .cart-item-controls .remove-btn {
        background: var(--primary);
        border-color: var(--primary);
        margin-left: 8px;
    }

    .cart-item-price {
        font-weight: 700;
        color: var(--gold);
        font-size: 14px;
        white-space: nowrap;
    }
`;

// Add styles to document
const style = document.createElement('style');
style.textContent = cartItemStyles;
document.head.appendChild(style);