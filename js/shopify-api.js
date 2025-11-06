/**
 * 🔥 QUEEN LUCY SHOPIFY API INTEGRATION 👑
 * Ultimate automated dropshipping system
 * Zero manual labor post-launch!
 */

class QueenLucyShopifyAPI {
    constructor(config) {
        this.config = {
            shopDomain: config.shopDomain || 'your-store.myshopify.com',
            accessToken: config.accessToken || '',
            apiVersion: '2024-10',
            cacheExpiry: 60 * 60 * 1000, // 1 hour
            syncInterval: 30 * 60 * 1000, // 30 minutes
            maxRetries: 3,
            rateLimit: 40, // Shopify allows 40 requests per app per store per second
            ...config
        };

        this.cache = new Map();
        this.syncStatus = {
            lastSync: null,
            isRunning: false,
            errors: [],
            totalProducts: 0,
            syncedProducts: 0
        };

        this.baseURL = `https://${this.config.shopDomain}/admin/api/${this.config.apiVersion}`;

        // Initialize automatic sync
        this.startAutoSync();

        console.log('🔥 Queen Lucy Shopify API initialized! Dynasty automation active 👑');
    }

    /**
     * 🚀 CORE API METHODS
     */

    async makeRequest(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            'X-Shopify-Access-Token': this.config.accessToken,
            'Content-Type': 'application/json',
            ...options.headers
        };

        try {
            const response = await fetch(url, {
                method: options.method || 'GET',
                headers,
                body: options.body ? JSON.stringify(options.body) : null
            });

            if (!response.ok) {
                throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('🚨 Shopify API request failed:', error);
            this.logError(error);
            throw error;
        }
    }

    /**
     * 👑 PRODUCT MANAGEMENT
     */

    async getAllProducts(options = {}) {
        const cacheKey = 'all_products';

        // Check cache first
        if (this.isCached(cacheKey) && !options.forceRefresh) {
            console.log('⚡ Loading products from cache...');
            return this.getFromCache(cacheKey);
        }

        console.log('🔄 Fetching products from Shopify...');

        try {
            let allProducts = [];
            let hasNextPage = true;
            let pageInfo = '';

            while (hasNextPage) {
                const query = this.buildProductQuery(pageInfo, options);
                const response = await this.makeRequest(`/products.json?${query}`);

                allProducts = allProducts.concat(response.products);

                // Check for pagination
                const linkHeader = response.headers?.get?.('Link');
                hasNextPage = linkHeader && linkHeader.includes('rel="next"');

                if (hasNextPage) {
                    const nextPageMatch = linkHeader.match(/page_info=([^&>]+)/);
                    pageInfo = nextPageMatch ? nextPageMatch[1] : '';
                }

                // Rate limiting
                await this.respectRateLimit();
            }

            // Transform products for Queen Lucy format
            const transformedProducts = allProducts.map(product => this.transformProduct(product));

            // Cache the results
            this.setCache(cacheKey, transformedProducts);

            console.log(`✅ Successfully fetched ${transformedProducts.length} products`);
            return transformedProducts;

        } catch (error) {
            console.error('💥 Failed to fetch products:', error);

            // Fallback to cache if available
            if (this.cache.has(cacheKey)) {
                console.log('🛡️ Using cached data as fallback');
                return this.getFromCache(cacheKey);
            }

            throw error;
        }
    }

    async getProductById(productId, options = {}) {
        const cacheKey = `product_${productId}`;

        if (this.isCached(cacheKey) && !options.forceRefresh) {
            return this.getFromCache(cacheKey);
        }

        try {
            const response = await this.makeRequest(`/products/${productId}.json`);
            const transformedProduct = this.transformProduct(response.product);

            this.setCache(cacheKey, transformedProduct);
            return transformedProduct;
        } catch (error) {
            console.error(`💥 Failed to fetch product ${productId}:`, error);

            // Fallback to cache
            if (this.cache.has(cacheKey)) {
                return this.getFromCache(cacheKey);
            }

            throw error;
        }
    }

    async getProductsByCollection(collectionId) {
        try {
            const response = await this.makeRequest(`/collections/${collectionId}/products.json`);
            return response.products.map(product => this.transformProduct(product));
        } catch (error) {
            console.error(`💥 Failed to fetch collection ${collectionId}:`, error);
            throw error;
        }
    }

    async searchProducts(query, options = {}) {
        const searchParams = new URLSearchParams({
            limit: options.limit || 50,
            'fields': 'id,title,handle,images,variants,tags,product_type,vendor'
        });

        if (query) {
            searchParams.append('title', query);
        }

        try {
            const response = await this.makeRequest(`/products.json?${searchParams}`);
            return response.products.map(product => this.transformProduct(product));
        } catch (error) {
            console.error('💥 Product search failed:', error);
            throw error;
        }
    }

    /**
     * 🎯 PRODUCT TRANSFORMATION
     * Convert Shopify format to Queen Lucy format
     */

    transformProduct(shopifyProduct) {
        const mainVariant = shopifyProduct.variants?.[0] || {};
        const mainImage = shopifyProduct.images?.[0];

        return {
            id: shopifyProduct.id.toString(),
            handle: shopifyProduct.handle,
            name: shopifyProduct.title,
            description: this.stripHTML(shopifyProduct.body_html || ''),
            price: parseFloat(mainVariant.price || 0),
            compareAtPrice: parseFloat(mainVariant.compare_at_price || 0),
            currency: 'AUD', // Default to AUD for Queen Lucy
            images: (shopifyProduct.images || []).map(img => ({
                src: img.src,
                alt: img.alt || shopifyProduct.title,
                width: img.width,
                height: img.height
            })),
            variants: (shopifyProduct.variants || []).map(variant => ({
                id: variant.id.toString(),
                title: variant.title,
                price: parseFloat(variant.price),
                compareAtPrice: parseFloat(variant.compare_at_price || 0),
                available: variant.available,
                inventory: variant.inventory_quantity || 0,
                sku: variant.sku,
                weight: variant.weight,
                options: {
                    size: variant.option1,
                    color: variant.option2,
                    material: variant.option3
                }
            })),
            tags: shopifyProduct.tags ? shopifyProduct.tags.split(', ') : [],
            category: shopifyProduct.product_type || 'general',
            vendor: shopifyProduct.vendor,
            available: mainVariant.available || false,
            inventory: mainVariant.inventory_quantity || 0,
            sku: mainVariant.sku,
            weight: mainVariant.weight,
            createdAt: shopifyProduct.created_at,
            updatedAt: shopifyProduct.updated_at,
            seo: {
                title: shopifyProduct.title,
                description: this.stripHTML(shopifyProduct.body_html || '').substring(0, 160)
            },
            // Queen Lucy specific fields
            badge: this.determineBadge(shopifyProduct),
            isNew: this.isNewProduct(shopifyProduct.created_at),
            isLimited: shopifyProduct.tags?.includes('limited') || false,
            queenLucyCategory: this.mapToQueenLucyCategory(shopifyProduct.product_type, shopifyProduct.tags)
        };
    }

    determineBadge(product) {
        const tags = (product.tags || '').toLowerCase();
        const createdDate = new Date(product.created_at);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        if (tags.includes('limited')) return 'LIMITED';
        if (createdDate > weekAgo) return 'NEW';
        if (tags.includes('restocked')) return 'RESTOCKED';
        if (tags.includes('sale')) return 'SALE';
        return null;
    }

    isNewProduct(createdAt) {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return new Date(createdAt) > weekAgo;
    }

    mapToQueenLucyCategory(productType, tags) {
        const type = (productType || '').toLowerCase();
        const tagList = (tags || '').toLowerCase();

        if (type.includes('hoodie') || type.includes('sweatshirt')) return 'hoodies';
        if (type.includes('t-shirt') || type.includes('tee') || type.includes('shirt')) return 'tees';
        if (type.includes('hat') || type.includes('beanie') || type.includes('cap')) return 'hats';
        if (type.includes('sticker') || tagList.includes('sticker')) return 'stickers';
        if (type.includes('accessory') || type.includes('bag')) return 'accessories';

        return 'general';
    }

    stripHTML(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    }

    /**
     * ⚡ CACHING SYSTEM
     */

    setCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            expiry: Date.now() + this.config.cacheExpiry
        });
    }

    getFromCache(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;

        if (Date.now() > cached.expiry) {
            this.cache.delete(key);
            return null;
        }

        return cached.data;
    }

    isCached(key) {
        return this.getFromCache(key) !== null;
    }

    clearCache() {
        this.cache.clear();
        console.log('🧹 Cache cleared!');
    }

    /**
     * 🔄 AUTOMATIC SYNC SYSTEM
     */

    startAutoSync() {
        console.log(`🚀 Starting auto-sync every ${this.config.syncInterval / 1000 / 60} minutes`);

        // Initial sync
        this.syncProducts();

        // Set up interval
        this.syncTimer = setInterval(() => {
            this.syncProducts();
        }, this.config.syncInterval);
    }

    async syncProducts() {
        if (this.syncStatus.isRunning) {
            console.log('⏳ Sync already in progress, skipping...');
            return;
        }

        console.log('🔄 Starting product sync...');
        this.syncStatus.isRunning = true;
        this.syncStatus.errors = [];

        try {
            const products = await this.getAllProducts({ forceRefresh: true });

            this.syncStatus.totalProducts = products.length;
            this.syncStatus.syncedProducts = products.length;
            this.syncStatus.lastSync = new Date();

            // Update displays
            this.updateProductDisplays(products);

            // Trigger custom event for other parts of the app
            window.dispatchEvent(new CustomEvent('queenLucyProductsSync', {
                detail: { products, syncStatus: this.syncStatus }
            }));

            console.log(`✅ Sync complete! ${products.length} products synced`);

        } catch (error) {
            console.error('💥 Sync failed:', error);
            this.logError(error);
        } finally {
            this.syncStatus.isRunning = false;
        }
    }

    stopAutoSync() {
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
            this.syncTimer = null;
            console.log('⏹️ Auto-sync stopped');
        }
    }

    /**
     * 📊 INVENTORY & PRICING UPDATES
     */

    async checkInventoryUpdates() {
        try {
            const products = await this.getAllProducts({ forceRefresh: true });
            const outOfStock = products.filter(p => !p.available || p.inventory <= 0);

            if (outOfStock.length > 0) {
                console.log(`⚠️ ${outOfStock.length} products are out of stock:`, outOfStock.map(p => p.name));

                // Trigger out of stock event
                window.dispatchEvent(new CustomEvent('queenLucyInventoryAlert', {
                    detail: { outOfStock }
                }));
            }

            return { total: products.length, outOfStock: outOfStock.length };
        } catch (error) {
            console.error('💥 Inventory check failed:', error);
            throw error;
        }
    }

    /**
     * 🛠️ UTILITY METHODS
     */

    buildProductQuery(pageInfo, options = {}) {
        const params = new URLSearchParams({
            limit: options.limit || 250,
            fields: 'id,title,handle,body_html,images,variants,tags,product_type,vendor,created_at,updated_at'
        });

        if (pageInfo) {
            params.append('page_info', pageInfo);
        }

        if (options.collection_id) {
            params.append('collection_id', options.collection_id);
        }

        if (options.product_type) {
            params.append('product_type', options.product_type);
        }

        return params.toString();
    }

    async respectRateLimit() {
        // Simple rate limiting - wait 25ms between requests
        return new Promise(resolve => setTimeout(resolve, 25));
    }

    logError(error) {
        this.syncStatus.errors.push({
            message: error.message,
            timestamp: new Date(),
            stack: error.stack
        });

        // Keep only last 10 errors
        if (this.syncStatus.errors.length > 10) {
            this.syncStatus.errors = this.syncStatus.errors.slice(-10);
        }
    }

    /**
     * 🎨 UPDATE PRODUCT DISPLAYS
     */

    updateProductDisplays(products) {
        // Update main store products
        this.updateMainStoreProducts(products);

        // Update shop all products
        this.updateShopAllProducts(products);

        // Update any cached product details
        this.updateProductDetails(products);
    }

    updateMainStoreProducts(products) {
        const mainGrid = document.querySelector('.products-grid');
        if (!mainGrid) return;

        // Take first 4-6 products for main store display
        const featuredProducts = products.slice(0, 6);

        mainGrid.innerHTML = featuredProducts.map(product => this.createProductCard(product)).join('');
    }

    updateShopAllProducts(products) {
        // This will be handled by the shop-all page JavaScript
        if (window.updateShopAllProducts) {
            window.updateShopAllProducts(products);
        }
    }

    updateProductDetails(products) {
        // Update individual product pages if they're open
        const productId = new URLSearchParams(window.location.search).get('id');
        if (productId) {
            const product = products.find(p => p.id === productId || p.handle === productId);
            if (product && window.updateProductDetail) {
                window.updateProductDetail(product);
            }
        }
    }

    createProductCard(product) {
        const badge = product.badge ? `<div class="product-badge badge-${product.badge.toLowerCase()}">${product.badge}</div>` : '';
        const mainImage = product.images[0] || { src: 'https://via.placeholder.com/400x426?text=No+Image', alt: product.name };

        return `
            <a href="queen-lucy-product-detail.html?id=${product.handle}" class="product-card" style="text-decoration: none; color: inherit;">
                <div class="product-image">
                    <img src="${mainImage.src}" alt="${mainImage.alt || product.name}">
                    ${badge}
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-meta">
                        <span class="price">$${product.price.toFixed(2)} AUD</span>
                        <span class="colors">${product.variants.length} variant${product.variants.length !== 1 ? 's' : ''}</span>
                    </div>
                </div>
            </a>
        `;
    }

    /**
     * 📊 STATUS & MONITORING
     */

    getSyncStatus() {
        return {
            ...this.syncStatus,
            cacheSize: this.cache.size,
            nextSync: this.syncTimer ? new Date(Date.now() + this.config.syncInterval) : null
        };
    }

    getHealthCheck() {
        return {
            apiConnected: !!this.config.accessToken,
            cacheActive: this.cache.size > 0,
            autoSyncRunning: !!this.syncTimer,
            lastSync: this.syncStatus.lastSync,
            errorCount: this.syncStatus.errors.length,
            status: this.syncStatus.errors.length === 0 ? 'healthy' : 'has-errors'
        };
    }

    // Test API connection
    async testConnection() {
        try {
            await this.makeRequest('/shop.json');
            console.log('✅ Shopify API connection successful!');
            return true;
        } catch (error) {
            console.error('❌ Shopify API connection failed:', error);
            return false;
        }
    }
}

// Global instance - will be initialized with config
window.QueenLucyShopifyAPI = QueenLucyShopifyAPI;

console.log('👑 Queen Lucy Shopify API loaded! Ready to automate the dynasty! 🔥');