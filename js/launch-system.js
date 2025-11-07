/**
 * 🔥 QUEEN LUCY LAUNCH SYSTEM 👑
 * Ultimate hype machine for dynasty drops!
 */

class QueenLucyLaunchSystem {
    constructor() {
        this.config = {
            // Launch phases
            phases: {
                PRE_LAUNCH: 'pre_launch',     // 24h before drop
                LIVE_DROP: 'live_drop',       // 24h drop window
                DROP_ENDED: 'drop_ended'      // After drop ends
            },

            // Timing
            prelaunchDuration: 24 * 60 * 60 * 1000,  // 24 hours
            dropDuration: 24 * 60 * 60 * 1000,       // 24 hours

            // Storage keys
            storageKeys: {
                launchTime: 'queenLucyLaunchTime',
                dropEndTime: 'queenLucyDropEndTime',
                emailSignups: 'queenLucyEmailSignups',
                notificationsSent: 'queenLucyNotificationsSent'
            }
        };

        this.currentPhase = this.getCurrentPhase();
        this.countdowns = new Map();

        // Initialize the launch system
        this.init();

        console.log('👑 Queen Lucy Launch System activated!', { phase: this.currentPhase });
    }

    init() {
        // Set up countdown timers
        this.setupCountdowns();

        // Apply phase-specific UI changes
        this.applyPhaseUI();

        // Set up event listeners
        this.setupEventListeners();

        // Check for phase transitions
        this.startPhaseChecker();
    }

    /**
     * 🕐 PHASE MANAGEMENT
     */

    getCurrentPhase() {
        const launchTime = this.getLaunchTime();
        const dropEndTime = this.getDropEndTime();
        const now = Date.now();

        if (!launchTime) {
            return this.config.phases.PRE_LAUNCH;
        }

        if (now < launchTime) {
            return this.config.phases.PRE_LAUNCH;
        }

        if (now >= launchTime && now < dropEndTime) {
            return this.config.phases.LIVE_DROP;
        }

        return this.config.phases.DROP_ENDED;
    }

    setLaunchTime(timestamp) {
        localStorage.setItem(this.config.storageKeys.launchTime, timestamp.toString());
        localStorage.setItem(this.config.storageKeys.dropEndTime, (timestamp + this.config.dropDuration).toString());
    }

    getLaunchTime() {
        const stored = localStorage.getItem(this.config.storageKeys.launchTime);
        return stored ? parseInt(stored) : null;
    }

    getDropEndTime() {
        const stored = localStorage.getItem(this.config.storageKeys.dropEndTime);
        return stored ? parseInt(stored) : null;
    }

    // Set launch for 24 hours from now (when you announce)
    scheduleLaunch() {
        const launchTime = Date.now() + this.config.prelaunchDuration;
        this.setLaunchTime(launchTime);
        this.currentPhase = this.config.phases.PRE_LAUNCH;
        this.applyPhaseUI();
        this.setupCountdowns();

        console.log('🚀 Dynasty launch scheduled!', new Date(launchTime));
        return launchTime;
    }

    /**
     * ⏰ COUNTDOWN SYSTEM
     */

    setupCountdowns() {
        // Clear existing countdowns
        this.countdowns.forEach((interval, key) => {
            clearInterval(interval);
        });
        this.countdowns.clear();

        if (this.currentPhase === this.config.phases.PRE_LAUNCH) {
            this.setupDynastyCountdown();
        } else if (this.currentPhase === this.config.phases.LIVE_DROP) {
            this.setupDropCountdown();
        }
    }

    setupDynastyCountdown() {
        const targetTime = this.getLaunchTime();
        if (!targetTime) return;

        const updateCountdown = () => {
            const timeLeft = targetTime - Date.now();

            if (timeLeft <= 0) {
                this.transitionToLiveDrop();
                return;
            }

            const time = this.calculateTimeLeft(timeLeft);
            this.updateCountdownDisplays('dynasty', time, 'DYNASTY BEGINS IN');
        };

        updateCountdown(); // Initial call
        const interval = setInterval(updateCountdown, 1000);
        this.countdowns.set('dynasty', interval);
    }

    setupDropCountdown() {
        const targetTime = this.getDropEndTime();
        if (!targetTime) return;

        const updateCountdown = () => {
            const timeLeft = targetTime - Date.now();

            if (timeLeft <= 0) {
                this.transitionToDropEnded();
                return;
            }

            const time = this.calculateTimeLeft(timeLeft);
            this.updateCountdownDisplays('drop', time, 'DROP ENDS IN');
        };

        updateCountdown(); // Initial call
        const interval = setInterval(updateCountdown, 1000);
        this.countdowns.set('drop', interval);
    }

    calculateTimeLeft(milliseconds) {
        const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
        const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);

        return { days, hours, minutes, seconds };
    }

    updateCountdownDisplays(type, time, title) {
        const displays = document.querySelectorAll(`.countdown-${type}`);

        displays.forEach(display => {
            // Update title
            const titleElement = display.querySelector('.countdown-title');
            if (titleElement) {
                titleElement.textContent = title;
            }

            // Update time units
            const daysElement = display.querySelector('.countdown-days .countdown-value');
            const hoursElement = display.querySelector('.countdown-hours .countdown-value');
            const minutesElement = display.querySelector('.countdown-minutes .countdown-value');
            const secondsElement = display.querySelector('.countdown-seconds .countdown-value');

            if (daysElement) daysElement.textContent = time.days.toString().padStart(2, '0');
            if (hoursElement) hoursElement.textContent = time.hours.toString().padStart(2, '0');
            if (minutesElement) minutesElement.textContent = time.minutes.toString().padStart(2, '0');
            if (secondsElement) secondsElement.textContent = time.seconds.toString().padStart(2, '0');
        });
    }

    /**
     * 🔄 PHASE TRANSITIONS
     */

    transitionToLiveDrop() {
        console.log('🔥 DYNASTY IS LIVE! Drop has begun!');

        this.currentPhase = this.config.phases.LIVE_DROP;
        this.applyPhaseUI();
        this.setupCountdowns();

        // Send notifications to signups
        this.sendDropLiveNotifications();

        // Trigger confetti celebration
        this.triggerLaunchCelebration();

        // Update all pages
        this.updateAllPages();
    }

    transitionToDropEnded() {
        console.log('⏰ Drop has ended! Thanks for participating in the dynasty!');

        this.currentPhase = this.config.phases.DROP_ENDED;
        this.applyPhaseUI();

        // Clear countdowns
        this.countdowns.forEach((interval, key) => {
            clearInterval(interval);
        });
        this.countdowns.clear();

        // Update all pages
        this.updateAllPages();
    }

    startPhaseChecker() {
        // Check for phase changes every 30 seconds
        setInterval(() => {
            const newPhase = this.getCurrentPhase();
            if (newPhase !== this.currentPhase) {
                this.currentPhase = newPhase;
                this.applyPhaseUI();
                this.setupCountdowns();
            }
        }, 30000);
    }

    /**
     * 🎨 UI MANAGEMENT
     */

    applyPhaseUI() {
        const body = document.body;

        // Remove existing phase classes
        body.classList.remove('phase-pre-launch', 'phase-live-drop', 'phase-drop-ended');

        // Add current phase class
        body.classList.add(`phase-${this.currentPhase.replace('_', '-')}`);

        // Show/hide elements based on phase
        this.togglePhaseElements();

        // Update navigation and CTAs
        this.updateNavigationForPhase();
    }

    togglePhaseElements() {
        // Pre-launch elements
        const prelaunchElements = document.querySelectorAll('.prelaunch-only');
        const dropElements = document.querySelectorAll('.drop-only');
        const endedElements = document.querySelectorAll('.ended-only');

        // Hide all first
        [...prelaunchElements, ...dropElements, ...endedElements].forEach(el => {
            el.style.display = 'none';
        });

        // Show relevant elements
        if (this.currentPhase === this.config.phases.PRE_LAUNCH) {
            prelaunchElements.forEach(el => el.style.display = '');
        } else if (this.currentPhase === this.config.phases.LIVE_DROP) {
            dropElements.forEach(el => el.style.display = '');
        } else {
            endedElements.forEach(el => el.style.display = '');
        }
    }

    updateNavigationForPhase() {
        const shopLinks = document.querySelectorAll('a[href*="shop-all"], a[href*="product-detail"]');

        if (this.currentPhase === this.config.phases.PRE_LAUNCH) {
            // Disable shopping during pre-launch
            shopLinks.forEach(link => {
                link.style.pointerEvents = 'none';
                link.style.opacity = '0.5';
                link.title = 'Dynasty begins soon! Sign up for notifications.';
            });
        } else if (this.currentPhase === this.config.phases.LIVE_DROP) {
            // Enable shopping during drop
            shopLinks.forEach(link => {
                link.style.pointerEvents = '';
                link.style.opacity = '';
                link.title = '';
            });
        } else {
            // Drop ended - disable again
            shopLinks.forEach(link => {
                link.style.pointerEvents = 'none';
                link.style.opacity = '0.5';
                link.title = 'This drop has ended. Stay tuned for the next dynasty drop!';
            });
        }
    }

    updateAllPages() {
        // Trigger custom event for other pages to listen to
        window.dispatchEvent(new CustomEvent('queenLucyPhaseChange', {
            detail: {
                phase: this.currentPhase,
                launchTime: this.getLaunchTime(),
                dropEndTime: this.getDropEndTime()
            }
        }));
    }

    /**
     * 📧 EMAIL SIGNUP SYSTEM
     */

    async addEmailSignup(email, source = 'website') {
        if (!this.isValidEmail(email)) {
            throw new Error('Invalid email address');
        }

        // Try Brevo first if available
        if (window.brevoService) {
            console.log('📧 Using Brevo for email signup...');
            const result = await window.brevoService.addToLaunchList(email, source);

            if (result.success) {
                console.log('✅ Email added via Brevo:', email);
                return { email, source, timestamp: Date.now(), service: 'brevo' };
            }
        }

        // Fallback to localStorage
        console.log('💾 Using localStorage for email signup...');
        const signups = this.getEmailSignups();
        const signup = {
            email: email.toLowerCase(),
            timestamp: Date.now(),
            source: source,
            notified: false,
            service: 'localStorage'
        };

        // Check for duplicates
        if (signups.find(s => s.email === signup.email)) {
            throw new Error('Email already registered');
        }

        signups.push(signup);
        localStorage.setItem(this.config.storageKeys.emailSignups, JSON.stringify(signups));

        console.log('✅ Email signup added to localStorage:', email);
        return signup;
    }

    getEmailSignups() {
        const stored = localStorage.getItem(this.config.storageKeys.emailSignups);
        return stored ? JSON.parse(stored) : [];
    }

    isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    /**
     * 🔔 NOTIFICATION SYSTEM
     */

    async sendDropLiveNotifications() {
        // Try Brevo first if available
        if (window.brevoService) {
            console.log('📧 Sending launch notifications via Brevo...');
            const success = await window.brevoService.sendLaunchNotification();

            if (success) {
                console.log('✅ Launch notifications sent via Brevo!');

                // Mark local signups as notified
                this.markLocalSignupsNotified();

                // Get count from Brevo or local backup
                const count = await window.brevoService.getSignupCount();
                this.showNotificationSuccess(count, 'Brevo');
                return;
            }
        }

        // Fallback to localStorage simulation
        console.log('💾 Using localStorage simulation for notifications...');
        const signups = this.getEmailSignups();
        const unnotified = signups.filter(s => !s.notified);

        if (unnotified.length === 0) {
            console.log('📧 No unnotified signups found');
            return;
        }

        console.log(`📧 Simulating drop notifications to ${unnotified.length} subscribers`);

        // Mark as notified
        signups.forEach(signup => {
            if (!signup.notified) {
                signup.notified = true;
                signup.notifiedAt = Date.now();
                signup.notificationMethod = 'localStorage_simulation';
            }
        });

        localStorage.setItem(this.config.storageKeys.emailSignups, JSON.stringify(signups));

        // Show success message
        this.showNotificationSuccess(unnotified.length, 'localStorage');
    }

    markLocalSignupsNotified() {
        const signups = this.getEmailSignups();
        signups.forEach(signup => {
            if (!signup.notified) {
                signup.notified = true;
                signup.notifiedAt = Date.now();
                signup.notificationMethod = 'brevo';
            }
        });
        localStorage.setItem(this.config.storageKeys.emailSignups, JSON.stringify(signups));
    }

    showNotificationSuccess(count, service = 'localStorage') {
        const serviceEmoji = service === 'Brevo' ? '📧' : '💾';
        const serviceText = service === 'Brevo' ? 'via Brevo!' : '(simulated)';

        // Create success notification
        const notification = document.createElement('div');
        notification.className = 'launch-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${serviceEmoji}</span>
                <span>Dynasty drop notifications sent to ${count} loyal subjects ${serviceText}</span>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    /**
     * 🎉 CELEBRATION EFFECTS
     */

    triggerLaunchCelebration() {
        // Massive confetti explosion
        this.createConfettiExplosion(300);

        // Update page title
        document.title = '🔥 DYNASTY IS LIVE - QUEEN LUCY MERCH';

        // Flash the favicon (if possible)
        this.flashFavicon();
    }

    createConfettiExplosion(count = 100) {
        const colors = ['#ec4899', '#FFD700', '#8B00FF', '#00F0FF', '#10b981'];

        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'launch-confetti';
                confetti.style.position = 'fixed';
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.top = '-10px';
                confetti.style.width = Math.random() * 10 + 5 + 'px';
                confetti.style.height = confetti.style.width;
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
                confetti.style.pointerEvents = 'none';
                confetti.style.zIndex = '10000';
                confetti.style.animation = 'launchConfetti 4s linear forwards';

                document.body.appendChild(confetti);

                setTimeout(() => confetti.remove(), 4000);
            }, i * 10);
        }
    }

    flashFavicon() {
        // Simple favicon flash effect
        const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';

        // Flash between normal and gold
        let isGold = false;
        const flash = setInterval(() => {
            link.href = isGold ? '/favicon-gold.ico' : '/favicon.ico';
            isGold = !isGold;
        }, 500);

        // Stop flashing after 10 seconds
        setTimeout(() => clearInterval(flash), 10000);

        document.getElementsByTagName('head')[0].appendChild(link);
    }

    /**
     * 🛠️ UTILITY METHODS
     */

    setupEventListeners() {
        // Listen for page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                // Page is visible again, check for phase changes
                const newPhase = this.getCurrentPhase();
                if (newPhase !== this.currentPhase) {
                    this.currentPhase = newPhase;
                    this.applyPhaseUI();
                    this.setupCountdowns();
                }
            }
        });
    }

    // Admin functions
    resetLaunch() {
        localStorage.removeItem(this.config.storageKeys.launchTime);
        localStorage.removeItem(this.config.storageKeys.dropEndTime);
        localStorage.removeItem(this.config.storageKeys.notificationsSent);

        this.currentPhase = this.config.phases.PRE_LAUNCH;
        this.applyPhaseUI();

        console.log('🔄 Launch system reset');
    }

    getStatus() {
        return {
            currentPhase: this.currentPhase,
            launchTime: this.getLaunchTime(),
            dropEndTime: this.getDropEndTime(),
            emailSignups: this.getEmailSignups().length,
            timeUntilLaunch: this.getLaunchTime() ? this.getLaunchTime() - Date.now() : null,
            timeUntilDropEnd: this.getDropEndTime() ? this.getDropEndTime() - Date.now() : null
        };
    }
}

// CSS for confetti animation
const style = document.createElement('style');
style.textContent = `
    @keyframes launchConfetti {
        0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
        }
    }

    .launch-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(45deg, #ec4899, #FFD700);
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 10px 30px rgba(236, 72, 153, 0.4);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
    }

    .notification-content {
        display: flex;
        align-items: center;
        gap: 12px;
        font-weight: 700;
    }

    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Global instance
window.QueenLucyLaunchSystem = QueenLucyLaunchSystem;

console.log('🚀 Queen Lucy Launch System loaded! Ready to create dynasty hype! 👑');