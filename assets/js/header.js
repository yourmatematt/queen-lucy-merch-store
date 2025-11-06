/* 👑 QUEEN LUCY HEADER COMPONENT 👑 */

class QueenLucyHeader {
    constructor(options = {}) {
        this.options = {
            showPromoBar: options.showPromoBar !== false, // Default true
            currentPage: options.currentPage || 'home',
            ...options
        };

        this.init();
    }

    init() {
        this.createPromoBar();
        this.createHeader();
        this.bindEvents();
    }

    createPromoBar() {
        if (!this.options.showPromoBar) return;

        const promoBar = document.createElement('div');
        promoBar.className = 'promo-bar';
        promoBar.innerHTML = `
            <p class="promo-text">♕ QUEEN LUCY REIGNS ♕ LIMITED THRONE DROP LIVE ♕ FREE SHIPPING ON $100+</p>
        `;

        // Add promo bar styles
        const promoStyles = `
            .promo-bar {
                background: linear-gradient(90deg, var(--primary-dark) 0%, var(--primary) 50%, var(--primary-dark) 100%);
                background-size: 200% 100%;
                animation: shimmer 3s infinite;
                padding: 10px;
                text-align: center;
                position: relative;
                overflow: hidden;
            }

            .promo-bar::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
                animation: shine 3s infinite;
            }

            @keyframes shine {
                0% { left: -100%; }
                100% { left: 200%; }
            }

            .promo-text {
                font-size: 13px;
                font-weight: 700;
                letter-spacing: 3.9px;
                color: var(--white);
                text-transform: uppercase;
            }
        `;

        this.addStyles(promoStyles);
        document.body.insertBefore(promoBar, document.body.firstChild);
    }

    createHeader() {
        const header = document.createElement('header');
        header.className = 'header';
        header.id = 'header';

        header.innerHTML = `
            <div class="header-container">
                <a href="queen-lucy-merch-store.html" class="logo">
                    <span class="crown">♕</span>
                    <span>QUEEN LUCY</span>
                    <span class="crown">♕</span>
                </a>

                <nav>
                    <ul class="nav-links">
                        <li><a href="shop-all-products.html">SHOP ALL</a></li>
                        <li><a href="shop-all-products.html?category=hoodies">HOODIES & CREWS</a></li>
                        <li><a href="shop-all-products.html?category=tees">TEES & LONG SLEEVES</a></li>
                        <li><a href="shop-all-products.html?category=accessories">ACCESSORIES</a></li>
                        <li><a href="shop-all-products.html?category=stickers">STICKERS</a></li>
                    </ul>
                </nav>

                <div class="header-icons">
                    <button class="icon-btn" id="searchIcon">🔍</button>
                    <button class="icon-btn" id="accountIcon">👤</button>
                    <button class="icon-btn" id="wishlistIcon">❤️</button>
                    <button class="icon-btn" id="cartIcon">
                        🛒<span id="cartBadge" class="cart-badge">0</span>
                    </button>
                </div>
            </div>
        `;

        // Insert header after promo bar or at beginning of body
        const promoBar = document.querySelector('.promo-bar');
        if (promoBar) {
            promoBar.insertAdjacentElement('afterend', header);
        } else {
            document.body.insertBefore(header, document.body.firstChild);
        }

        this.header = header;
    }

    bindEvents() {
        // Scroll effect
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                this.header.classList.add('scrolled');
            } else {
                this.header.classList.remove('scrolled');
            }
        });

        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    addStyles(css) {
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    }

    // Update active navigation based on current page
    setActiveNav(page) {
        const navLinks = document.querySelectorAll('.nav-links a');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.href.includes(page)) {
                link.classList.add('active');
            }
        });
    }

    // Show/hide search overlay (to be implemented)
    toggleSearch() {
        // Implementation for search overlay
        console.log('Search toggle - to be implemented');
    }

    // Navigate to account page (to be implemented)
    goToAccount() {
        // Implementation for account navigation
        console.log('Account navigation - to be implemented');
    }

    // Toggle wishlist (to be implemented)
    toggleWishlist() {
        // Implementation for wishlist
        console.log('Wishlist toggle - to be implemented');
    }
}

// Breadcrumb component
class Breadcrumb {
    constructor(items = []) {
        this.items = items;
        this.create();
    }

    create() {
        // Remove existing breadcrumb
        const existing = document.querySelector('.breadcrumb');
        if (existing) {
            existing.remove();
        }

        if (this.items.length === 0) return;

        const breadcrumb = document.createElement('nav');
        breadcrumb.className = 'breadcrumb';

        const breadcrumbHTML = this.items.map((item, index) => {
            if (index === this.items.length - 1) {
                // Last item - not a link
                return `<span>${item.name}</span>`;
            } else {
                // Regular link
                return `<a href="${item.url}">${item.name}</a><span>></span>`;
            }
        }).join('');

        breadcrumb.innerHTML = breadcrumbHTML;

        // Insert after header
        const header = document.querySelector('.header');
        if (header) {
            header.insertAdjacentElement('afterend', breadcrumb);
        }
    }

    update(items) {
        this.items = items;
        this.create();
    }
}

// Auto-initialize header when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Get page-specific options
    const currentPage = document.body.dataset.page || 'home';
    const showPromoBar = document.body.dataset.showPromo !== 'false';

    // Initialize header
    window.queenLucyHeader = new QueenLucyHeader({
        currentPage: currentPage,
        showPromoBar: showPromoBar
    });

    // Initialize breadcrumb if data exists
    const breadcrumbData = document.body.dataset.breadcrumb;
    if (breadcrumbData) {
        try {
            const items = JSON.parse(breadcrumbData);
            window.breadcrumb = new Breadcrumb(items);
        } catch (e) {
            console.warn('Invalid breadcrumb data:', e);
        }
    }
});

// Export for external use
window.QueenLucyHeader = QueenLucyHeader;
window.Breadcrumb = Breadcrumb;