/* Adaryus Deal Aggregation System - Event-Driven Architecture */

// ========================================
// Event Schema Versioning System
// ========================================
const EventSchemaRegistry = {
    version: '1.0.0',
    schemas: {
        'v1': {
            'deal.created': {
                version: 'v1',
                required: ['id', 'merchant', 'discount', 'source', 'timestamp'],
                optional: ['terms', 'expiry', 'category', 'verificationScore']
            },
            'deal.updated': {
                version: 'v1',
                required: ['id', 'changes', 'timestamp'],
                optional: ['previousValues', 'reason']
            },
            'deal.expired': {
                version: 'v1',
                required: ['id', 'timestamp'],
                optional: ['reason', 'replacement']
            },
            'deal.verified': {
                version: 'v1',
                required: ['id', 'verificationScore', 'timestamp'],
                optional: ['verifier', 'comments']
            }
        }
    },

    // Validate event against schema
    validate(event) {
        const schema = this.schemas[event.version]?.[event.type];
        if (!schema) {
            console.warn(`Unknown event schema: ${event.version}/${event.type}`);
            return false;
        }

        // Check required fields
        for (const field of schema.required) {
            if (!(field in event)) {
                console.error(`Missing required field '${field}' in event ${event.type}`);
                return false;
            }
        }

        return true;
    },

    // Transform event from old version to new version
    transform(event, targetVersion) {
        if (event.version === targetVersion) return event;
        
        // Implement version-specific transformations
        let transformed = { ...event };
        
        // Example: v1 to v2 transformation (when v2 is added)
        // if (event.version === 'v1' && targetVersion === 'v2') {
        //     transformed.newField = transformed.oldField || defaultValue;
        //     delete transformed.oldField;
        // }
        
        transformed.version = targetVersion;
        console.log(`Transformed event from ${event.version} to ${targetVersion}`);
        
        // Re-validate after transformation
        if (!this.validate(transformed)) {
            console.error('Transformation resulted in invalid schema');
            return null;
        }
        
        return transformed;
    }
};

// ========================================
// Deal Data Models & Normalization
// ========================================
class Deal {
    constructor(data) {
        this.id = data.id || this._generateId();
        this.merchant = data.merchant; // { name, domain, location }
        this.discount = data.discount; // { type: 'percentage'|'fixed'|'bogo', value, description }
        this.terms = data.terms || '';
        this.category = data.category || 'general';
        this.source = data.source; // { provider, priority, verificationScore }
        this.expiry = data.expiry || null;
        this.campusIds = data.campusIds || [];
        this.location = data.location || null; // { lat, lng, radius }
        this.verificationScore = data.verificationScore || 0.5;
        this.successRate = data.successRate || null;
        this.reportCount = data.reportCount || 0;
        this.createdAt = data.createdAt || Date.now();
        this.updatedAt = data.updatedAt || Date.now();
        this.metadata = data.metadata || {};
    }

    _generateId() {
        return `deal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Generate hash for deduplication
    getDeduplicationHash() {
        const key = `${this.merchant.name}:${this.discount.type}:${this.discount.value}:${this.terms}`;
        return this._simpleHash(key.toLowerCase());
    }

    _simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString(36);
    }

    // Check if deal is expired
    isExpired() {
        if (!this.expiry) return false;
        return Date.now() > this.expiry;
    }

    // Calculate quality score
    getQualityScore() {
        let score = this.verificationScore * 0.4;
        
        if (this.successRate !== null) {
            score += this.successRate * 0.3;
        } else {
            score += 0.15; // neutral if unknown
        }

        // Penalize for reports
        const reportPenalty = Math.min(this.reportCount * 0.05, 0.3);
        score -= reportPenalty;

        return Math.max(0, Math.min(1, score));
    }
}

// ========================================
// Provider Configuration & Management
// ========================================
const ProviderConfig = {
    providers: {
        'student-beans': {
            name: 'Student Beans',
            type: 'webhook',
            priority: 9,
            rateLimit: { requests: 1000, window: 3600 },
            metadata: {
                updatePattern: 'monday_morning',
                averageChangeRate: 0.15,
                reliability: 0.95
            }
        },
        'unidays': {
            name: 'UNiDAYS',
            type: 'webhook',
            priority: 9,
            rateLimit: { requests: 500, window: 3600 },
            metadata: {
                updatePattern: 'daily',
                averageChangeRate: 0.12,
                reliability: 0.93
            }
        },
        'onthehub': {
            name: 'OnTheHub',
            type: 'polling',
            priority: 10, // Higher priority for software deals
            pollingInterval: 3600000, // 1 hour
            rateLimit: { requests: 100, window: 3600 },
            metadata: {
                updatePattern: 'weekly',
                averageChangeRate: 0.05,
                reliability: 0.98,
                category: 'software'
            }
        },
        'generic-aggregator': {
            name: 'Generic Aggregator',
            type: 'polling',
            priority: 5,
            pollingInterval: 7200000, // 2 hours
            rateLimit: { requests: 200, window: 3600 },
            metadata: {
                updatePattern: 'irregular',
                averageChangeRate: 0.20,
                reliability: 0.70
            }
        }
    },

    getProvider(providerId) {
        return this.providers[providerId];
    },

    getPollingProviders() {
        return Object.entries(this.providers)
            .filter(([_, config]) => config.type === 'polling')
            .map(([id, config]) => ({ id, ...config }));
    },

    getWebhookProviders() {
        return Object.entries(this.providers)
            .filter(([_, config]) => config.type === 'webhook')
            .map(([id, config]) => ({ id, ...config }));
    }
};

// ========================================
// Intelligent Polling Strategy
// ========================================
class AdaptivePollingManager {
    constructor() {
        this.pollingState = new Map();
        this.historyWindow = 30 * 24 * 60 * 60 * 1000; // 30 days
        this.minInterval = 600000; // 10 minutes
        this.maxInterval = 86400000; // 24 hours
    }

    // Initialize polling state for a provider
    initProvider(providerId) {
        if (!this.pollingState.has(providerId)) {
            const provider = ProviderConfig.getProvider(providerId);
            this.pollingState.set(providerId, {
                lastPoll: 0,
                lastChange: 0,
                consecutiveNoChanges: 0,
                changeHistory: [],
                currentInterval: provider.pollingInterval || 3600000,
                nextPollTime: Date.now()
            });
        }
    }

    // Calculate adaptive polling interval based on historical patterns
    calculateInterval(providerId) {
        this.initProvider(providerId);
        const state = this.pollingState.get(providerId);
        const provider = ProviderConfig.getProvider(providerId);
        const baseInterval = provider.pollingInterval || 3600000;

        // Exponential backoff when no changes detected
        if (state.consecutiveNoChanges > 0) {
            const backoffMultiplier = Math.min(Math.pow(1.5, state.consecutiveNoChanges), 8);
            const adjustedInterval = baseInterval * backoffMultiplier;
            return Math.min(adjustedInterval, this.maxInterval);
        }

        // Prioritize around known update patterns
        if (this._isKnownUpdateWindow(provider)) {
            return Math.max(baseInterval * 0.5, this.minInterval);
        }

        // Use historical change rate to adjust
        const changeRate = this._calculateRecentChangeRate(state);
        if (changeRate > 0.1) {
            return Math.max(baseInterval * 0.7, this.minInterval);
        }

        return baseInterval;
    }

    // Record poll result
    recordPoll(providerId, hasChanges, changeCount = 0) {
        this.initProvider(providerId);
        const state = this.pollingState.get(providerId);
        const now = Date.now();

        state.lastPoll = now;

        if (hasChanges) {
            state.lastChange = now;
            state.consecutiveNoChanges = 0;
            state.changeHistory.push({ timestamp: now, count: changeCount });
        } else {
            state.consecutiveNoChanges++;
        }

        // Cleanup old history
        state.changeHistory = state.changeHistory.filter(
            entry => now - entry.timestamp < this.historyWindow
        );

        // Update next poll time
        state.currentInterval = this.calculateInterval(providerId);
        state.nextPollTime = now + state.currentInterval;

        this.pollingState.set(providerId, state);
    }

    // Check if current time is in known update window
    _isKnownUpdateWindow(provider) {
        const now = new Date();
        const pattern = provider.metadata?.updatePattern;

        if (pattern === 'monday_morning') {
            return now.getDay() === 1 && now.getHours() >= 8 && now.getHours() < 12;
        }

        if (pattern === 'daily') {
            return now.getHours() >= 6 && now.getHours() < 10;
        }

        return false;
    }

    // Calculate recent change rate
    _calculateRecentChangeRate(state) {
        if (state.changeHistory.length === 0) return 0;

        const recentWindow = 7 * 24 * 60 * 60 * 1000; // 7 days
        const now = Date.now();
        const recentChanges = state.changeHistory.filter(
            entry => now - entry.timestamp < recentWindow
        );

        return recentChanges.length / 7; // changes per day
    }

    // Get providers that need polling
    getProvidersNeedingPoll() {
        const now = Date.now();
        const providers = [];

        for (const [providerId, state] of this.pollingState.entries()) {
            if (now >= state.nextPollTime) {
                providers.push({
                    id: providerId,
                    priority: ProviderConfig.getProvider(providerId).priority,
                    state
                });
            }
        }

        // Sort by priority (higher first)
        return providers.sort((a, b) => b.priority - a.priority);
    }
}

// ========================================
// Conflict Resolution & Deduplication
// ========================================
class MerchantEntityResolver {
    constructor() {
        this.merchantIndex = new Map();
        this.domainIndex = new Map();
    }

    // Resolve merchant using fuzzy matching
    resolveMerchant(merchantData) {
        // Normalize merchant name
        const normalizedName = this._normalizeName(merchantData.name);

        // Check domain first (most reliable)
        if (merchantData.domain) {
            const existingByDomain = this.domainIndex.get(merchantData.domain);
            if (existingByDomain) {
                return existingByDomain;
            }
        }

        // Check name similarity
        for (const [id, existing] of this.merchantIndex.entries()) {
            const similarity = this._calculateSimilarity(
                normalizedName,
                this._normalizeName(existing.name)
            );

            if (similarity > 0.85) {
                return id;
            }
        }

        // New merchant
        const merchantId = `merchant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.merchantIndex.set(merchantId, merchantData);
        
        if (merchantData.domain) {
            this.domainIndex.set(merchantData.domain, merchantId);
        }

        return merchantId;
    }

    _normalizeName(name) {
        return name.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    _calculateSimilarity(str1, str2) {
        // Simple Levenshtein-based similarity
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) return 1.0;
        
        const editDistance = this._levenshteinDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    }

    _levenshteinDistance(str1, str2) {
        const matrix = [];

        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[str2.length][str1.length];
    }
}

class DealDeduplicator {
    constructor(merchantResolver) {
        this.merchantResolver = merchantResolver;
        this.dealsByHash = new Map();
    }

    // Check if deal is duplicate and return existing or add new
    checkAndAdd(deal) {
        const hash = deal.getDeduplicationHash();
        
        if (this.dealsByHash.has(hash)) {
            const existing = this.dealsByHash.get(hash);
            
            // Merge based on priority
            const merged = this._mergeDuplicates(existing, deal);
            this.dealsByHash.set(hash, merged);
            
            return { isDuplicate: true, existing, merged };
        }

        this.dealsByHash.set(hash, deal);
        return { isDuplicate: false, deal };
    }

    _mergeDuplicates(existing, newDeal) {
        // Higher priority source wins
        const existingPriority = existing.source.priority;
        const newPriority = newDeal.source.priority;

        if (newPriority > existingPriority) {
            // New deal has higher priority
            return new Deal({
                ...newDeal,
                id: existing.id, // Keep original ID
                createdAt: existing.createdAt,
                metadata: {
                    ...existing.metadata,
                    ...newDeal.metadata,
                    sources: [
                        ...(existing.metadata.sources || [existing.source]),
                        newDeal.source
                    ]
                }
            });
        }

        // Keep existing but update metadata
        return new Deal({
            ...existing,
            updatedAt: Date.now(),
            metadata: {
                ...existing.metadata,
                sources: [
                    ...(existing.metadata.sources || [existing.source]),
                    newDeal.source
                ]
            }
        });
    }
}

// ========================================
// Event Bus
// ========================================
class DealEventBus {
    constructor() {
        this.listeners = new Map();
        this.eventHistory = [];
        this.maxHistorySize = 1000;
    }

    // Subscribe to event type
    subscribe(eventType, callback, options = {}) {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, []);
        }

        const subscription = {
            callback,
            filter: options.filter || (() => true),
            priority: options.priority || 0
        };

        this.listeners.get(eventType).push(subscription);

        // Sort by priority (higher first)
        this.listeners.get(eventType).sort((a, b) => b.priority - a.priority);

        // Return unsubscribe function
        return () => {
            const subs = this.listeners.get(eventType);
            const index = subs.indexOf(subscription);
            if (index > -1) {
                subs.splice(index, 1);
            }
        };
    }

    // Publish event
    async publish(event) {
        // Validate event schema
        if (!EventSchemaRegistry.validate(event)) {
            console.error('Invalid event schema', event);
            return;
        }

        // Add to history
        this.eventHistory.push({
            ...event,
            publishedAt: Date.now()
        });

        if (this.eventHistory.length > this.maxHistorySize) {
            this.eventHistory.shift();
        }

        // Notify listeners
        const listeners = this.listeners.get(event.type) || [];
        
        for (const { callback, filter } of listeners) {
            if (filter(event)) {
                try {
                    await callback(event);
                } catch (error) {
                    console.error(`Error in event listener for ${event.type}:`, error);
                }
            }
        }
    }

    // Get event history
    getHistory(filter = {}) {
        let events = this.eventHistory;

        if (filter.type) {
            events = events.filter(e => e.type === filter.type);
        }

        if (filter.since) {
            events = events.filter(e => e.publishedAt >= filter.since);
        }

        return events;
    }
}

// ========================================
// Export for use in other modules
// ========================================
window.DealSystem = {
    EventSchemaRegistry,
    Deal,
    ProviderConfig,
    AdaptivePollingManager,
    MerchantEntityResolver,
    DealDeduplicator,
    DealEventBus
};
