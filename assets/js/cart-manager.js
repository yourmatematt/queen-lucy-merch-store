/* 👑 QUEEN LUCY CART STATE MANAGEMENT SYSTEM 👑 */

class CartManager {
    constructor() {
        this.storageKey = 'queenLucyCart';
        this.state = {
            items: [],
            total: 0,
            count: 0,
            lastUpdated: new Date().toISOString()
        };

        this.subscribers = [];
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.bindStorageEvents();
    }

    // Load cart state from localStorage
    loadFromStorage() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                const parsedData = JSON.parse(saved);
                this.state = {
                    items: parsedData.items || [],
                    total: parsedData.total || 0,
                    count: parsedData.count || 0,
                    lastUpdated: parsedData.lastUpdated || new Date().toISOString()
                };
                this.notifySubscribers();
            }
        } catch (error) {
            console.warn('Failed to load cart from storage:', error);
            this.state = {
                items: [],
                total: 0,
                count: 0,
                lastUpdated: new Date().toISOString()
            };
        }
    }

    // Save cart state to localStorage
    saveToStorage() {
        try {
            this.state.lastUpdated = new Date().toISOString();
            localStorage.setItem(this.storageKey, JSON.stringify(this.state));
            this.notifySubscribers();
        } catch (error) {
            console.error('Failed to save cart to storage:', error);
        }
    }

    // Listen for storage changes (for multi-tab sync)
    bindStorageEvents() {
        window.addEventListener('storage', (e) => {
            if (e.key === this.storageKey) {
                this.loadFromStorage();
            }
        });
    }

    // Subscribe to cart changes
    subscribe(callback) {
        this.subscribers.push(callback);
        // Immediately call with current state
        callback(this.getState());
    }

    // Unsubscribe from cart changes
    unsubscribe(callback) {
        this.subscribers = this.subscribers.filter(sub => sub !== callback);
    }

    // Notify all subscribers of state changes
    notifySubscribers() {
        this.subscribers.forEach(callback => {
            try {
                callback(this.getState());
            } catch (error) {
                console.error('Error in cart subscriber:', error);
            }
        });
    }

    // Get current cart state (read-only)
    getState() {
        return {
            items: [...this.state.items],
            total: this.state.total,
            count: this.state.count,
            lastUpdated: this.state.lastUpdated
        };
    }

    // Add item to cart
    addItem(product) {
        const productId = this.generateProductId(product);
        const existingIndex = this.state.items.findIndex(item => item.id === productId);

        if (existingIndex !== -1) {
            // Item exists, increase quantity
            this.state.items[existingIndex].quantity += 1;
        } else {
            // New item
            this.state.items.push({
                id: productId,
                productId: product.productId || product.id,
                name: product.name,
                price: product.price,
                size: product.size,
                color: product.color,
                image: product.image,
                quantity: 1,
                addedAt: new Date().toISOString()
            });
        }

        this.recalculateCart();
        this.saveToStorage();

        return this.getState();
    }

    // Remove item from cart
    removeItem(itemId) {
        const itemIndex = this.state.items.findIndex(item => item.id === itemId);

        if (itemIndex !== -1) {
            this.state.items.splice(itemIndex, 1);
            this.recalculateCart();
            this.saveToStorage();
        }

        return this.getState();
    }

    // Update item quantity
    updateQuantity(itemId, newQuantity) {
        if (newQuantity <= 0) {
            return this.removeItem(itemId);
        }

        const item = this.state.items.find(item => item.id === itemId);
        if (item) {
            item.quantity = newQuantity;
            this.recalculateCart();
            this.saveToStorage();
        }

        return this.getState();
    }

    // Clear entire cart
    clearCart() {
        this.state = {
            items: [],
            total: 0,
            count: 0,
            lastUpdated: new Date().toISOString()
        };
        this.saveToStorage();
        return this.getState();
    }

    // Recalculate cart totals
    recalculateCart() {
        this.state.count = this.state.items.reduce((count, item) => count + item.quantity, 0);
        this.state.total = this.state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // Generate unique product ID based on product + variant
    generateProductId(product) {
        const baseId = product.productId || product.id || product.name.toLowerCase().replace(/\s+/g, '-');
        const size = product.size || 'default';
        const color = product.color || 'default';
        return `${baseId}-${size}-${color}`;
    }

    // Get item count for a specific product
    getItemCount(productId) {
        const item = this.state.items.find(item => item.productId === productId);
        return item ? item.quantity : 0;
    }

    // Check if product is in cart
    hasProduct(productId) {
        return this.state.items.some(item => item.productId === productId);
    }

    // Get cart summary
    getSummary() {
        return {
            itemCount: this.state.count,
            totalPrice: this.state.total,
            itemTypes: this.state.items.length,
            isEmpty: this.state.items.length === 0,
            lastUpdated: this.state.lastUpdated
        };
    }

    // Get items by category
    getItemsByCategory() {
        const categories = {};
        this.state.items.forEach(item => {
            // Extract category from product ID or name
            let category = 'other';
            if (item.productId.includes('hoodie') || item.productId.includes('crew')) {
                category = 'hoodies';
            } else if (item.productId.includes('tee') || item.productId.includes('shirt')) {
                category = 'tees';
            } else if (item.productId.includes('beanie') || item.productId.includes('hat')) {
                category = 'accessories';
            } else if (item.productId.includes('sticker')) {
                category = 'stickers';
            }

            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(item);
        });
        return categories;
    }

    // Apply discount code (placeholder for future implementation)
    applyDiscount(code) {
        // This would integrate with a discount system
        console.log('Discount code:', code);
        return {
            success: false,
            message: 'Discount system not implemented yet'
        };
    }

    // Validate cart before checkout
    validateCart() {
        const issues = [];

        if (this.state.items.length === 0) {
            issues.push('Cart is empty');
        }

        this.state.items.forEach(item => {
            if (!item.name || !item.price || !item.quantity) {
                issues.push(`Invalid item: ${item.id}`);
            }
            if (item.quantity <= 0) {
                issues.push(`Invalid quantity for: ${item.name}`);
            }
            if (item.price <= 0) {
                issues.push(`Invalid price for: ${item.name}`);
            }
        });

        return {
            isValid: issues.length === 0,
            issues: issues
        };
    }

    // Prepare cart data for checkout
    prepareCheckoutData() {
        const validation = this.validateCart();
        if (!validation.isValid) {
            throw new Error(`Cart validation failed: ${validation.issues.join(', ')}`);
        }

        return {
            items: this.state.items.map(item => ({
                productId: item.productId,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                size: item.size,
                color: item.color,
                subtotal: item.price * item.quantity
            })),
            summary: {
                subtotal: this.state.total,
                tax: this.calculateTax(),
                shipping: this.calculateShipping(),
                total: this.state.total + this.calculateTax() + this.calculateShipping()
            },
            metadata: {
                itemCount: this.state.count,
                cartId: this.generateCartId(),
                timestamp: new Date().toISOString()
            }
        };
    }

    // Calculate tax (placeholder)
    calculateTax() {
        // This would integrate with a tax calculation service
        return Math.round(this.state.total * 0.1); // 10% tax for demo
    }

    // Calculate shipping (placeholder)
    calculateShipping() {
        // Free shipping over $100
        return this.state.total >= 100 ? 0 : 15;
    }

    // Generate unique cart ID for checkout
    generateCartId() {
        return 'cart_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Export cart data
    exportCart() {
        return {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            cart: this.getState()
        };
    }

    // Import cart data
    importCart(cartData) {
        try {
            if (cartData.version === '1.0' && cartData.cart) {
                this.state = {
                    items: cartData.cart.items || [],
                    total: cartData.cart.total || 0,
                    count: cartData.cart.count || 0,
                    lastUpdated: new Date().toISOString()
                };
                this.recalculateCart(); // Recalculate to ensure consistency
                this.saveToStorage();
                return { success: true };
            } else {
                throw new Error('Invalid cart data format');
            }
        } catch (error) {
            console.error('Failed to import cart:', error);
            return { success: false, error: error.message };
        }
    }
}

// Global cart manager instance
window.cartManager = new CartManager();

// Helper functions for easy access
window.addToCart = (product) => window.cartManager.addItem(product);
window.removeFromCart = (itemId) => window.cartManager.removeItem(itemId);
window.updateCartQuantity = (itemId, quantity) => window.cartManager.updateQuantity(itemId, quantity);
window.clearCart = () => window.cartManager.clearCart();
window.getCartState = () => window.cartManager.getState();
window.getCartSummary = () => window.cartManager.getSummary();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CartManager;
}