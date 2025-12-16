/* Adaryus Deal Notification & Filtering System */

// ========================================
// User Preferences Model
// ========================================
class UserPreferences {
    constructor(data = {}) {
        this.userId = data.userId || 'guest';
        this.categories = data.categories || [];
        this.merchants = data.merchants || [];
        this.campusId = data.campusId || null;
        this.minDiscountPercentage = data.minDiscountPercentage || 5;
        this.notificationChannels = data.notificationChannels || ['push', 'email'];
        this.quietHours = data.quietHours || { start: 22, end: 7 }; // 10pm to 7am
        this.maxDailyNotifications = data.maxDailyNotifications || 10;
        this.maxWeeklyNotifications = data.maxWeeklyNotifications || 50;
        this.preferences = data.preferences || {
            instantPush: ['high_value', 'favorite_merchant'],
            dailyDigest: ['medium_value'],
            weeklyDigest: ['low_value']
        };
    }

    // Check if category is of interest
    interestedInCategory(category) {
        if (this.categories.length === 0) return true;
        return this.categories.includes(category);
    }

    // Check if merchant is of interest
    interestedInMerchant(merchantId) {
        if (this.merchants.length === 0) return true;
        return this.merchants.includes(merchantId);
    }

    // Check if discount meets minimum threshold
    meetsDiscountThreshold(discount) {
        if (discount.type === 'percentage') {
            return discount.value >= this.minDiscountPercentage;
        }
        // For fixed discounts, always pass (could add monetary threshold)
        return true;
    }

    // Check if current time is in quiet hours
    isQuietHours() {
        const hour = new Date().getHours();
        const { start, end } = this.quietHours;
        
        if (start < end) {
            // Normal case: e.g., 9am to 5pm - quiet during this range
            return hour >= start && hour < end;
        } else {
            // Overnight case: e.g., 10pm to 7am - quiet during these hours
            return hour >= start || hour < end;
        }
    }
}

// ========================================
// Notification Decision Engine
// ========================================
class NotificationDecisionEngine {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.userPreferences = new Map();
        this.notificationCounts = new Map();
        this.batchQueue = new Map();
        this.batchInterval = 300000; // 5 minutes
        this.startBatchProcessor();
    }

    // Register user preferences
    registerUser(userId, preferences) {
        this.userPreferences.set(userId, new UserPreferences({
            userId,
            ...preferences
        }));

        if (!this.notificationCounts.has(userId)) {
            this.notificationCounts.set(userId, {
                daily: { count: 0, resetAt: this._getNextMidnight() },
                weekly: { count: 0, resetAt: this._getNextSunday() }
            });
        }
    }

    // Process deal change event
    async processDealChange(event, deal) {
        const decisions = [];

        for (const [userId, prefs] of this.userPreferences.entries()) {
            const decision = await this._evaluateNotification(userId, prefs, event, deal);
            if (decision) {
                decisions.push(decision);
            }
        }

        return decisions;
    }

    async _evaluateNotification(userId, prefs, event, deal) {
        // Check basic filters
        if (!prefs.interestedInCategory(deal.category)) {
            return null;
        }

        if (!prefs.interestedInMerchant(deal.merchant.id)) {
            return null;
        }

        if (!prefs.meetsDiscountThreshold(deal.discount)) {
            return null;
        }

        // Calculate deal value/priority
        const dealValue = this._calculateDealValue(deal, event);

        // Check notification fatigue limits
        if (!this._checkFatigueLimits(userId, dealValue)) {
            return null;
        }

        // Determine notification strategy
        const strategy = this._determineStrategy(prefs, event, dealValue, deal);

        if (strategy === 'instant') {
            // Immediate notification
            if (!prefs.isQuietHours()) {
                this._incrementCount(userId);
                return {
                    userId,
                    strategy: 'instant',
                    channel: 'push',
                    event,
                    deal,
                    priority: 'high'
                };
            } else {
                // Queue for next available time
                this._addToBatch(userId, { event, deal, priority: 'high' });
                return null;
            }
        } else if (strategy === 'batch') {
            // Add to batch queue
            this._addToBatch(userId, { event, deal, priority: dealValue });
            return null;
        }

        return null;
    }

    _calculateDealValue(deal, event) {
        let value = 0;

        // Base value on discount
        if (deal.discount.type === 'percentage') {
            value += deal.discount.value / 10; // 50% = 5 points
        } else if (deal.discount.type === 'fixed') {
            value += deal.discount.value / 20; // $100 = 5 points
        } else {
            value += 3; // BOGO gets default 3 points
        }

        // Quality score
        value += deal.getQualityScore() * 3;

        // Event type multipliers
        if (event.type === 'deal.created') {
            value *= 1.2;
        } else if (event.type === 'deal.updated' && event.changes?.includes('price_drop')) {
            value *= 1.5;
        }

        // Expiry urgency
        if (deal.expiry) {
            const hoursUntilExpiry = (deal.expiry - Date.now()) / (1000 * 60 * 60);
            if (hoursUntilExpiry < 24) {
                value *= 1.3;
            }
        }

        return value;
    }

    _determineStrategy(prefs, event, dealValue, deal) {
        // High value deals get instant notification
        if (dealValue > 8) {
            return 'instant';
        }

        // Favorite merchants get instant
        if (prefs.merchants.includes(deal.merchant.id)) {
            return 'instant';
        }

        // Price drops on watched deals get instant
        if (event.type === 'deal.updated' && event.changes?.includes('price_drop')) {
            return 'instant';
        }

        // Medium value goes to batch
        if (dealValue > 4) {
            return 'batch';
        }

        // Low value might not notify at all or go to weekly digest
        return 'batch';
    }

    _checkFatigueLimits(userId, dealValue) {
        const counts = this.notificationCounts.get(userId);
        if (!counts) return true;

        // Reset counters if needed
        const now = Date.now();
        if (now >= counts.daily.resetAt) {
            counts.daily.count = 0;
            counts.daily.resetAt = this._getNextMidnight();
        }
        if (now >= counts.weekly.resetAt) {
            counts.weekly.count = 0;
            counts.weekly.resetAt = this._getNextSunday();
        }

        const prefs = this.userPreferences.get(userId);

        // High value deals can exceed limits
        if (dealValue > 9) {
            return true;
        }

        // Check daily limit
        if (counts.daily.count >= prefs.maxDailyNotifications) {
            return false;
        }

        // Check weekly limit
        if (counts.weekly.count >= prefs.maxWeeklyNotifications) {
            return false;
        }

        return true;
    }

    _incrementCount(userId) {
        const counts = this.notificationCounts.get(userId);
        if (counts) {
            counts.daily.count++;
            counts.weekly.count++;
        }
    }

    _addToBatch(userId, item) {
        if (!this.batchQueue.has(userId)) {
            this.batchQueue.set(userId, []);
        }
        this.batchQueue.get(userId).push({
            ...item,
            addedAt: Date.now()
        });
    }

    startBatchProcessor() {
        setInterval(() => {
            this._processBatches();
        }, this.batchInterval);
    }

    async _processBatches() {
        for (const [userId, items] of this.batchQueue.entries()) {
            if (items.length === 0) continue;

            const prefs = this.userPreferences.get(userId);
            if (!prefs) continue;

            // Don't send during quiet hours
            if (prefs.isQuietHours()) continue;

            // Check fatigue limits
            if (!this._checkFatigueLimits(userId, 0)) continue;

            // Sort by priority and take top items
            const sorted = items.sort((a, b) => b.priority - a.priority);
            const toSend = sorted.slice(0, 5); // Max 5 per batch

            // Send batch notification
            await this._sendBatchNotification(userId, toSend);

            // Clear sent items
            this.batchQueue.set(userId, items.filter(item => !toSend.includes(item)));
            
            this._incrementCount(userId);
        }
    }

    async _sendBatchNotification(userId, items) {
        console.log(`Sending batch notification to user ${userId}:`, items);
        
        // Emit notification event
        if (this.eventBus) {
            await this.eventBus.publish({
                version: 'v1',
                type: 'notification.sent',
                userId,
                notificationType: 'batch',
                items: items.map(i => ({ dealId: i.deal.id, event: i.event.type })),
                timestamp: Date.now()
            });
        }
    }

    _getNextMidnight() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        return tomorrow.getTime();
    }

    _getNextSunday() {
        const date = new Date();
        const daysUntilSunday = (7 - date.getDay()) % 7 || 7;
        date.setDate(date.getDate() + daysUntilSunday);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
    }
}

// ========================================
// WebSocket Real-Time Updates (Simulation)
// ========================================
class DealUpdateChannel {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.connections = new Map();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Subscribe to deal events
        this.eventBus.subscribe('deal.created', (event) => {
            this._broadcastUpdate(event);
        });

        this.eventBus.subscribe('deal.updated', (event) => {
            this._broadcastUpdate(event);
        });

        this.eventBus.subscribe('deal.expired', (event) => {
            this._broadcastUpdate(event);
        });
    }

    // Simulate WebSocket connection
    connect(userId, filters = {}) {
        const connectionId = `${userId}_${Date.now()}`;
        
        this.connections.set(connectionId, {
            userId,
            filters,
            connectedAt: Date.now(),
            lastActivity: Date.now()
        });

        console.log(`User ${userId} connected for real-time updates`);

        return {
            connectionId,
            disconnect: () => this.disconnect(connectionId),
            updateFilters: (newFilters) => this.updateFilters(connectionId, newFilters)
        };
    }

    disconnect(connectionId) {
        this.connections.delete(connectionId);
        console.log(`Connection ${connectionId} disconnected`);
    }

    updateFilters(connectionId, filters) {
        const conn = this.connections.get(connectionId);
        if (conn) {
            conn.filters = { ...conn.filters, ...filters };
        }
    }

    _broadcastUpdate(event) {
        for (const [connectionId, conn] of this.connections.entries()) {
            if (this._matchesFilters(event, conn.filters)) {
                this._sendToConnection(connectionId, event);
            }
        }
    }

    _matchesFilters(event, filters) {
        if (filters.campusId && event.deal?.campusIds) {
            if (!event.deal.campusIds.includes(filters.campusId)) {
                return false;
            }
        }

        if (filters.categories && event.deal?.category) {
            if (!filters.categories.includes(event.deal.category)) {
                return false;
            }
        }

        return true;
    }

    _sendToConnection(connectionId, event) {
        const conn = this.connections.get(connectionId);
        if (conn) {
            conn.lastActivity = Date.now();
            console.log(`Sending update to ${connectionId}:`, event.type);
            
            // In a real implementation, this would use WebSocket.send()
            // For now, we'll use custom events
            window.dispatchEvent(new CustomEvent('deal-update', {
                detail: { connectionId, event }
            }));
        }
    }

    // Get connection stats
    getStats() {
        return {
            activeConnections: this.connections.size,
            connections: Array.from(this.connections.entries()).map(([id, conn]) => ({
                id,
                userId: conn.userId,
                connectedFor: Date.now() - conn.connectedAt,
                lastActivity: Date.now() - conn.lastActivity
            }))
        };
    }
}

// ========================================
// Offline-First Cache Manager
// ========================================
class DealCacheManager {
    constructor() {
        this.cacheKey = 'adaryus_deals_cache';
        this.metadataKey = 'adaryus_deals_metadata';
        this.maxCacheAge = 24 * 60 * 60 * 1000; // 24 hours
    }

    // Save deals to cache
    saveDeals(deals) {
        try {
            const data = {
                deals: deals.map(d => this._serializeDeal(d)),
                timestamp: Date.now(),
                version: '1.0'
            };

            localStorage.setItem(this.cacheKey, JSON.stringify(data));
            this._updateMetadata({ lastUpdate: Date.now(), count: deals.length });
            
            console.log(`Cached ${deals.length} deals`);
        } catch (error) {
            console.error('Failed to cache deals:', error);
        }
    }

    // Load deals from cache
    loadDeals() {
        try {
            const cached = localStorage.getItem(this.cacheKey);
            if (!cached) return { deals: [], isStale: true };

            const data = JSON.parse(cached);
            const age = Date.now() - data.timestamp;
            const isStale = age > this.maxCacheAge;

            const deals = data.deals.map(d => this._deserializeDeal(d));

            return { deals, isStale, age };
        } catch (error) {
            console.error('Failed to load cached deals:', error);
            return { deals: [], isStale: true };
        }
    }

    // Get cache metadata
    getMetadata() {
        try {
            const metadata = localStorage.getItem(this.metadataKey);
            return metadata ? JSON.parse(metadata) : null;
        } catch (error) {
            return null;
        }
    }

    _updateMetadata(updates) {
        try {
            const current = this.getMetadata() || {};
            const updated = { ...current, ...updates };
            localStorage.setItem(this.metadataKey, JSON.stringify(updated));
        } catch (error) {
            console.error('Failed to update metadata:', error);
        }
    }

    _serializeDeal(deal) {
        return {
            id: deal.id,
            merchant: deal.merchant,
            discount: deal.discount,
            terms: deal.terms,
            category: deal.category,
            source: deal.source,
            expiry: deal.expiry,
            campusIds: deal.campusIds,
            location: deal.location,
            verificationScore: deal.verificationScore,
            createdAt: deal.createdAt,
            updatedAt: deal.updatedAt
        };
    }

    _deserializeDeal(data) {
        return new window.DealSystem.Deal(data);
    }

    // Clear old cache
    clearCache() {
        localStorage.removeItem(this.cacheKey);
        localStorage.removeItem(this.metadataKey);
        console.log('Cache cleared');
    }
}

// ========================================
// Export for use in other modules
// ========================================
window.NotificationSystem = {
    UserPreferences,
    NotificationDecisionEngine,
    DealUpdateChannel,
    DealCacheManager
};
