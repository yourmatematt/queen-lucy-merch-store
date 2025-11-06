/* 👑 QUEEN LUCY MAIN COMPONENT LOADER 👑 */

class QueenLucyApp {
    constructor(options = {}) {
        this.options = {
            enableCursor: options.enableCursor !== false,
            enableHeader: options.enableHeader !== false,
            enableCart: options.enableCart !== false,
            currentPage: options.currentPage || 'home',
            showPromoBar: options.showPromoBar !== false,
            breadcrumbItems: options.breadcrumbItems || null,
            ...options
        };

        this.components = {};
        this.init();
    }

    init() {
        this.loadSharedStyles();
        this.initComponents();
        this.bindGlobalEvents();
    }

    loadSharedStyles() {
        // Check if shared styles are already loaded
        if (!document.querySelector('link[href*="shared.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'assets/css/shared.css';
            document.head.appendChild(link);
        }
    }

    initComponents() {
        // Initialize cursor
        if (this.options.enableCursor) {
            this.initCursor();
        }

        // Initialize header
        if (this.options.enableHeader) {
            this.initHeader();
        }

        // Initialize cart
        if (this.options.enableCart) {
            this.initCart();
        }

        // Initialize breadcrumb
        if (this.options.breadcrumbItems) {
            this.initBreadcrumb();
        }
    }

    initCursor() {
        // Custom cursor is automatically initialized by cursor.js
        // We just store the reference
        this.components.cursor = window.customCursor;
    }

    initHeader() {
        // Header is automatically initialized by header.js
        this.components.header = window.queenLucyHeader;

        // Set active navigation based on current page
        if (this.components.header) {
            this.components.header.setActiveNav(this.options.currentPage);
        }
    }

    initCart() {
        // Cart manager and sidebar are automatically initialized
        this.components.cartManager = window.cartManager;
        this.components.cartSidebar = window.cartSidebar;

        // Connect cart manager to sidebar
        if (this.components.cartManager && this.components.cartSidebar) {
            this.components.cartManager.subscribe((state) => {
                this.components.cartSidebar.cartState = state;
                this.components.cartSidebar.updateDisplay();
            });
        }
    }

    initBreadcrumb() {
        if (window.Breadcrumb) {
            this.components.breadcrumb = new window.Breadcrumb(this.options.breadcrumbItems);
        }
    }

    bindGlobalEvents() {
        // Loading screen management
        this.handleLoadingScreen();

        // Smooth scrolling for all anchor links
        this.enableSmoothScrolling();

        // Performance monitoring
        this.monitorPerformance();

        // Error handling
        this.setupErrorHandling();
    }

    handleLoadingScreen() {
        window.addEventListener('load', () => {
            const loadingScreen = document.getElementById('loadingScreen');
            if (loadingScreen) {
                setTimeout(() => {
                    loadingScreen.classList.add('hidden');
                    // Remove from DOM after animation
                    setTimeout(() => {
                        loadingScreen.remove();
                    }, 500);
                }, 1500);
            }
        });
    }

    enableSmoothScrolling() {
        document.addEventListener('click', (e) => {
            const target = e.target.closest('a[href^="#"]');
            if (target) {
                e.preventDefault();
                const targetElement = document.querySelector(target.getAttribute('href'));
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    }

    monitorPerformance() {
        // Monitor page load performance
        window.addEventListener('load', () => {
            if ('performance' in window) {
                const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
                console.log(`🚀 Queen Lucy page loaded in ${loadTime}ms`);

                // Track if we're meeting our performance goals
                if (loadTime > 3000) {
                    console.warn('⚠️ Page load time exceeds 3 seconds. Consider optimization.');
                }
            }
        });
    }

    setupErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('👑 Queen Lucy Error:', e.error);
            // In production, you might want to send this to an error tracking service
        });

        window.addEventListener('unhandledrejection', (e) => {
            console.error('👑 Queen Lucy Promise Rejection:', e.reason);
            e.preventDefault();
        });
    }

    // Public API methods

    // Add product to cart with Queen Lucy styling
    addToCart(product) {
        if (this.components.cartManager) {
            this.components.cartManager.addItem(product);

            // Show cart sidebar
            if (this.components.cartSidebar) {
                this.components.cartSidebar.open();
            }

            // Create confetti effect
            this.createConfetti();

            return true;
        }
        return false;
    }

    // Open cart
    openCart() {
        if (this.components.cartSidebar) {
            this.components.cartSidebar.open();
        }
    }

    // Close cart
    closeCart() {
        if (this.components.cartSidebar) {
            this.components.cartSidebar.close();
        }
    }

    // Get cart state
    getCartState() {
        return this.components.cartManager ? this.components.cartManager.getState() : null;
    }

    // Update breadcrumb
    updateBreadcrumb(items) {
        if (this.components.breadcrumb) {
            this.components.breadcrumb.update(items);
        } else if (window.Breadcrumb) {
            this.components.breadcrumb = new window.Breadcrumb(items);
        }
    }

    // Create confetti effect
    createConfetti(count = 50, duration = 3000) {
        const colors = ['#ec4899', '#FFD700', '#8B00FF', '#00F0FF'];

        for (let i = 0; i < count; i++) {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                left: ${Math.random() * 100}%;
                top: -10px;
                width: 10px;
                height: 10px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                z-index: 10000;
                pointer-events: none;
                animation: confetti-fall ${2 + Math.random() * 2}s linear forwards;
            `;
            document.body.appendChild(confetti);

            setTimeout(() => confetti.remove(), duration);
        }
    }

    // Show notification
    showNotification(message, type = 'success', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `queen-lucy-notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'var(--primary)' : type === 'error' ? '#dc2626' : 'var(--gold)'};
            color: white;
            padding: 16px 24px;
            border-radius: 4px;
            font-weight: 700;
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Animate out and remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }

    // Initialize loading screen
    createLoadingScreen() {
        const loadingScreen = document.createElement('div');
        loadingScreen.className = 'loading-screen';
        loadingScreen.id = 'loadingScreen';
        loadingScreen.innerHTML = `
            <div class="loader"></div>
            <div class="loading-text">LOADING THE THRONE</div>
        `;

        const loadingStyles = `
            .loading-screen {
                position: fixed;
                inset: 0;
                background: var(--black);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
                gap: 30px;
                transition: opacity 0.5s, visibility 0.5s;
            }

            .loading-screen.hidden {
                opacity: 0;
                visibility: hidden;
            }

            .loader {
                width: 80px;
                height: 80px;
                position: relative;
            }

            .loader::before,
            .loader::after {
                content: '';
                position: absolute;
                inset: 0;
                border: 3px solid transparent;
                border-top: 3px solid var(--accent);
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }

            .loader::after {
                border-top: 3px solid var(--primary);
                animation: spin 1.5s linear infinite reverse;
            }

            .loading-text {
                font-family: 'Bebas Neue', sans-serif;
                font-size: 24px;
                letter-spacing: 4px;
                color: var(--accent);
                animation: pulse 1.5s infinite;
            }
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = loadingStyles;
        document.head.appendChild(style);

        // Add to DOM
        document.body.insertBefore(loadingScreen, document.body.firstChild);
    }

    // Get component reference
    getComponent(name) {
        return this.components[name];
    }

    // Destroy all components
    destroy() {
        Object.values(this.components).forEach(component => {
            if (component && typeof component.destroy === 'function') {
                component.destroy();
            }
        });
        this.components = {};
    }
}

// Auto-initialize based on page data attributes
document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const options = {
        currentPage: body.dataset.page || 'home',
        enableCursor: body.dataset.enableCursor !== 'false',
        enableHeader: body.dataset.enableHeader !== 'false',
        enableCart: body.dataset.enableCart !== 'false',
        showPromoBar: body.dataset.showPromo !== 'false'
    };

    // Parse breadcrumb data if available
    if (body.dataset.breadcrumb) {
        try {
            options.breadcrumbItems = JSON.parse(body.dataset.breadcrumb);
        } catch (e) {
            console.warn('Invalid breadcrumb data:', e);
        }
    }

    // Initialize Queen Lucy app
    window.queenLucyApp = new QueenLucyApp(options);

    // Add loading screen if it doesn't exist
    if (!document.getElementById('loadingScreen')) {
        window.queenLucyApp.createLoadingScreen();
    }
});

// Export for external use
window.QueenLucyApp = QueenLucyApp;