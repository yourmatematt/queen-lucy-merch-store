/* 👑 QUEEN LUCY CUSTOM CURSOR COMPONENT 👑 */

class CustomCursor {
    constructor(options = {}) {
        this.options = {
            cursorSize: options.cursorSize || 20,
            followerSize: options.followerSize || 40,
            cursorColor: options.cursorColor || '#FFD700',
            followerColor: options.followerColor || 'rgba(255, 215, 0, 0.5)',
            cursorSpeed: options.cursorSpeed || 0.3,
            followerSpeed: options.followerSpeed || 0.1,
            hoverScale: options.hoverScale || 1.5,
            ...options
        };

        this.mouseX = 0;
        this.mouseY = 0;
        this.cursorX = 0;
        this.cursorY = 0;
        this.followerX = 0;
        this.followerY = 0;

        this.init();
    }

    init() {
        // Only initialize if not on mobile
        if (this.isMobile()) {
            document.body.style.cursor = 'auto';
            return;
        }

        this.createCursorElements();
        this.bindEvents();
        this.startAnimation();
    }

    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               window.innerWidth <= 768;
    }

    createCursorElements() {
        // Create main cursor
        this.cursor = document.createElement('div');
        this.cursor.className = 'custom-cursor';
        this.cursor.style.cssText = `
            width: ${this.options.cursorSize}px;
            height: ${this.options.cursorSize}px;
            border: 2px solid ${this.options.cursorColor};
            border-radius: 50%;
            position: fixed;
            pointer-events: none;
            z-index: 9999;
            transition: all 0.1s ease;
            mix-blend-mode: difference;
            transform: translate(-50%, -50%);
        `;

        // Create cursor follower
        this.follower = document.createElement('div');
        this.follower.className = 'custom-cursor-follower';
        this.follower.style.cssText = `
            width: ${this.options.followerSize}px;
            height: ${this.options.followerSize}px;
            border: 1px solid ${this.options.followerColor};
            border-radius: 50%;
            position: fixed;
            pointer-events: none;
            z-index: 9998;
            transition: all 0.3s ease;
            mix-blend-mode: difference;
            transform: translate(-50%, -50%);
        `;

        document.body.appendChild(this.cursor);
        document.body.appendChild(this.follower);

        // Hide default cursor
        document.body.style.cursor = 'none';
    }

    bindEvents() {
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });

        // Add hover effects to interactive elements
        this.addHoverEffects();

        // Hide cursor when leaving window
        document.addEventListener('mouseleave', () => {
            this.cursor.style.opacity = '0';
            this.follower.style.opacity = '0';
        });

        document.addEventListener('mouseenter', () => {
            this.cursor.style.opacity = '1';
            this.follower.style.opacity = '1';
        });
    }

    addHoverEffects() {
        const interactiveSelectors = [
            'a', 'button', '.icon-btn', '.product-card', '.category-card',
            '.social-image', '.filter-pill', '.cart-close', '.nav-links a',
            '.logo', '.btn', 'input', 'select', 'textarea', '[role="button"]',
            '.clickable', '.hover-effect'
        ];

        const interactiveElements = document.querySelectorAll(interactiveSelectors.join(', '));

        interactiveElements.forEach(element => {
            element.addEventListener('mouseenter', () => this.activateCursor());
            element.addEventListener('mouseleave', () => this.deactivateCursor());
        });

        // Use MutationObserver to handle dynamically added elements
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        const newInteractiveElements = node.querySelectorAll?.(interactiveSelectors.join(', '));
                        newInteractiveElements?.forEach(element => {
                            element.addEventListener('mouseenter', () => this.activateCursor());
                            element.addEventListener('mouseleave', () => this.deactivateCursor());
                        });

                        // Check if the node itself is interactive
                        if (interactiveSelectors.some(selector => node.matches?.(selector))) {
                            node.addEventListener('mouseenter', () => this.activateCursor());
                            node.addEventListener('mouseleave', () => this.deactivateCursor());
                        }
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    activateCursor() {
        this.cursor.style.transform = `translate(-50%, -50%) scale(${this.options.hoverScale})`;
        this.cursor.style.backgroundColor = this.options.cursorColor;
        this.cursor.style.borderColor = this.options.cursorColor;
    }

    deactivateCursor() {
        this.cursor.style.transform = 'translate(-50%, -50%) scale(1)';
        this.cursor.style.backgroundColor = 'transparent';
        this.cursor.style.borderColor = this.options.cursorColor;
    }

    startAnimation() {
        const animate = () => {
            // Smooth cursor movement
            this.cursorX += (this.mouseX - this.cursorX) * this.options.cursorSpeed;
            this.cursorY += (this.mouseY - this.cursorY) * this.options.cursorSpeed;

            // Smooth follower movement
            this.followerX += (this.mouseX - this.followerX) * this.options.followerSpeed;
            this.followerY += (this.mouseY - this.followerY) * this.options.followerSpeed;

            // Apply positions
            this.cursor.style.left = this.cursorX + 'px';
            this.cursor.style.top = this.cursorY + 'px';

            this.follower.style.left = this.followerX + 'px';
            this.follower.style.top = this.followerY + 'px';

            requestAnimationFrame(animate);
        };

        animate();
    }

    // Public methods
    show() {
        if (this.cursor) this.cursor.style.display = 'block';
        if (this.follower) this.follower.style.display = 'block';
    }

    hide() {
        if (this.cursor) this.cursor.style.display = 'none';
        if (this.follower) this.follower.style.display = 'none';
    }

    destroy() {
        if (this.cursor) this.cursor.remove();
        if (this.follower) this.follower.remove();
        document.body.style.cursor = 'auto';
    }

    updateOptions(newOptions) {
        this.options = { ...this.options, ...newOptions };

        if (this.cursor) {
            this.cursor.style.width = this.options.cursorSize + 'px';
            this.cursor.style.height = this.options.cursorSize + 'px';
            this.cursor.style.borderColor = this.options.cursorColor;
        }

        if (this.follower) {
            this.follower.style.width = this.options.followerSize + 'px';
            this.follower.style.height = this.options.followerSize + 'px';
            this.follower.style.borderColor = this.options.followerColor;
        }
    }

    // Special effects
    createTrail(color = '#ec4899', duration = 1000) {
        const trail = document.createElement('div');
        trail.style.cssText = `
            width: 6px;
            height: 6px;
            background: ${color};
            border-radius: 50%;
            position: fixed;
            pointer-events: none;
            z-index: 9997;
            transform: translate(-50%, -50%);
            left: ${this.cursorX}px;
            top: ${this.cursorY}px;
            animation: fadeOut ${duration}ms ease-out forwards;
        `;

        document.body.appendChild(trail);
        setTimeout(() => trail.remove(), duration);
    }

    // Add click ripple effect
    createClickRipple(x, y) {
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            width: 0;
            height: 0;
            border: 2px solid ${this.options.cursorColor};
            border-radius: 50%;
            position: fixed;
            pointer-events: none;
            z-index: 9997;
            transform: translate(-50%, -50%);
            left: ${x}px;
            top: ${y}px;
            animation: rippleOut 0.6s ease-out forwards;
        `;

        document.body.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    }
}

// Add required CSS animations
const cursorStyles = `
    @keyframes fadeOut {
        0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
    }

    @keyframes rippleOut {
        0% {
            width: 0;
            height: 0;
            opacity: 1;
        }
        100% {
            width: 50px;
            height: 50px;
            opacity: 0;
        }
    }

    /* Hide cursor on mobile */
    @media (max-width: 768px) {
        .custom-cursor,
        .custom-cursor-follower {
            display: none !important;
        }

        body {
            cursor: auto !important;
        }
    }
`;

// Add styles to document
const style = document.createElement('style');
style.textContent = cursorStyles;
document.head.appendChild(style);

// Auto-initialize cursor when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if cursor should be initialized (not on mobile)
    if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) &&
        window.innerWidth > 768) {

        window.customCursor = new CustomCursor();

        // Add click ripple effect
        document.addEventListener('click', (e) => {
            window.customCursor.createClickRipple(e.clientX, e.clientY);
        });
    }
});

// Export for external use
window.CustomCursor = CustomCursor;