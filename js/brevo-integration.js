/**
 * 📧 BREVO EMAIL SERVICE INTEGRATION
 * Handles email signups and launch notifications through Brevo API
 */

class BrevoEmailService {
    constructor(apiKey, listId) {
        this.apiKey = apiKey;
        this.listId = listId; // Your "Queen Lucy Launch List" ID from Brevo
        this.baseUrl = 'https://api.brevo.com/v3';

        console.log('📧 Brevo Email Service initialized');
    }

    /**
     * Add email to Brevo contact list
     */
    async addToLaunchList(email, source = 'website') {
        try {
            const response = await fetch(`${this.baseUrl}/contacts`, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'api-key': this.apiKey,
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    email: email.toLowerCase(),
                    attributes: {
                        FIRSTNAME: 'Queen Lucy Fan',
                        SOURCE: source,
                        SIGNUP_DATE: new Date().toISOString(),
                        DYNASTY_LAUNCH: true
                    },
                    listIds: [this.listId],
                    updateEnabled: false // Don't update if already exists
                })
            });

            const data = await response.json();

            if (response.ok) {
                console.log('✅ Email added to Brevo:', email);

                // Also store locally as backup
                this.storeLocalBackup(email, source);

                return {
                    success: true,
                    message: '👑 You\'re in! We\'ll notify you when the dynasty begins!'
                };
            } else {
                // Handle duplicate contact (error code 400)
                if (data.code === 'duplicate_parameter') {
                    return {
                        success: true,
                        message: '👑 You\'re already on the list, legend!'
                    };
                }

                throw new Error(data.message || 'Failed to add to list');
            }

        } catch (error) {
            console.error('Brevo signup error:', error);

            // Fallback to local storage
            this.storeLocalBackup(email, source);

            return {
                success: true,
                message: '✅ Email saved! You\'ll be notified when the dynasty begins!',
                fallback: true
            };
        }
    }

    /**
     * Send launch notification to all contacts
     */
    async sendLaunchNotification() {
        try {
            const response = await fetch(`${this.baseUrl}/smtp/email`, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'api-key': this.apiKey,
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    sender: {
                        name: "Queen Lucy",
                        email: "no-reply@queenlucy.com" // Replace with your domain
                    },
                    to: [
                        {
                            email: "{{contact.EMAIL}}", // Brevo template variable
                            name: "{{contact.FIRSTNAME}}"
                        }
                    ],
                    subject: "🔥 DYNASTY IS LIVE! The drop has begun! 👑",
                    htmlContent: this.getLaunchEmailTemplate(),
                    params: {
                        STORE_URL: window.location.origin,
                        DYNASTY_NAME: "QUEEN LUCY LEGENDARY DROP"
                    }
                })
            });

            if (response.ok) {
                console.log('📧 Launch notifications sent via Brevo!');
                return true;
            } else {
                throw new Error('Failed to send notifications');
            }

        } catch (error) {
            console.error('Failed to send Brevo notifications:', error);

            // Fallback to showing success message locally
            this.showLocalNotificationFallback();
            return false;
        }
    }

    /**
     * Email template for launch notifications
     */
    getLaunchEmailTemplate() {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>👑 DYNASTY IS LIVE!</title>
        </head>
        <body style="margin: 0; padding: 0; background: #0A0A0A; color: #FFFFFF; font-family: 'Arial', sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">

                <!-- Header -->
                <div style="text-align: center; margin-bottom: 40px;">
                    <h1 style="font-size: 48px; margin: 0; background: linear-gradient(45deg, #ec4899, #FFD700); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-transform: uppercase; letter-spacing: 2px;">
                        👑 DYNASTY IS LIVE! 👑
                    </h1>
                    <p style="font-size: 18px; color: #ec4899; margin: 10px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">
                        The drop has officially begun!
                    </p>
                </div>

                <!-- CTA Button -->
                <div style="text-align: center; margin: 40px 0;">
                    <a href="{{params.STORE_URL}}"
                       style="display: inline-block; background: linear-gradient(45deg, #ec4899, #FFD700); color: #000; text-decoration: none; padding: 20px 40px; border-radius: 8px; font-weight: bold; font-size: 18px; text-transform: uppercase; letter-spacing: 2px; box-shadow: 0 10px 30px rgba(236, 72, 153, 0.4);">
                        🔥 SHOP THE DYNASTY 🔥
                    </a>
                </div>

                <!-- Urgency Message -->
                <div style="background: rgba(236, 72, 153, 0.1); padding: 24px; border-radius: 12px; text-align: center; margin: 30px 0; border: 1px solid rgba(236, 72, 153, 0.3);">
                    <h2 style="color: #FFD700; margin: 0 0 12px 0; font-size: 24px;">⚡ LIMITED TIME ONLY ⚡</h2>
                    <p style="margin: 0; font-size: 16px; color: rgba(255, 255, 255, 0.9);">
                        This drop ends in 24 hours. Don't cry when it's sold out!
                    </p>
                </div>

                <!-- Footer -->
                <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                    <p style="color: rgba(255, 255, 255, 0.6); margin: 0; font-size: 14px;">
                        You're receiving this because you signed up for Queen Lucy dynasty alerts.
                    </p>
                    <p style="color: rgba(255, 255, 255, 0.4); margin: 10px 0 0 0; font-size: 12px;">
                        Queen Lucy Merch | Where Asian heritage meets street royalty
                    </p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Local storage backup
     */
    storeLocalBackup(email, source) {
        const existing = JSON.parse(localStorage.getItem('queenLucyEmailSignups') || '[]');
        const signup = {
            email: email.toLowerCase(),
            timestamp: Date.now(),
            source: source,
            notified: false,
            brevoBackup: true
        };

        if (!existing.find(s => s.email === signup.email)) {
            existing.push(signup);
            localStorage.setItem('queenLucyEmailSignups', JSON.stringify(existing));
        }
    }

    /**
     * Fallback notification display
     */
    showLocalNotificationFallback() {
        const notification = document.createElement('div');
        notification.className = 'launch-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">📧</span>
                <span>Dynasty launch activated! (Email service temporarily unavailable)</span>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    /**
     * Get signup count from Brevo
     */
    async getSignupCount() {
        try {
            const response = await fetch(`${this.baseUrl}/contacts/lists/${this.listId}`, {
                headers: {
                    'accept': 'application/json',
                    'api-key': this.apiKey
                }
            });

            if (response.ok) {
                const data = await response.json();
                return data.totalSubscribers || 0;
            }
        } catch (error) {
            console.log('Could not fetch Brevo count, using local backup');
        }

        // Fallback to local count
        const local = JSON.parse(localStorage.getItem('queenLucyEmailSignups') || '[]');
        return local.length;
    }
}

// Global instance - will be initialized when Brevo credentials are set
window.BrevoEmailService = BrevoEmailService;
window.brevoService = null;

console.log('📧 Brevo integration loaded! Set credentials to activate.');