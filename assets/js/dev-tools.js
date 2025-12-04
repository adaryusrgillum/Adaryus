/* Adaryus Deal System - Developer Experience & Testing Tools */

// ========================================
// Event Mocking Library
// ========================================
class EventMockGenerator {
    constructor() {
        this.merchants = [
            { name: 'Apple', domain: 'apple.com', category: 'technology' },
            { name: 'Nike', domain: 'nike.com', category: 'fashion' },
            { name: 'Spotify', domain: 'spotify.com', category: 'entertainment' },
            { name: 'Amazon', domain: 'amazon.com', category: 'retail' },
            { name: 'Microsoft', domain: 'microsoft.com', category: 'technology' },
            { name: 'Starbucks', domain: 'starbucks.com', category: 'food' }
        ];

        this.campuses = [
            'campus_stanford',
            'campus_mit',
            'campus_harvard',
            'campus_berkeley',
            'campus_caltech'
        ];

        this.providers = ['student-beans', 'unidays', 'onthehub', 'generic-aggregator'];
    }

    // Generate random deal
    generateDeal(overrides = {}) {
        const merchant = overrides.merchant || this._randomMerchant();
        const discount = overrides.discount || this._randomDiscount();
        
        return new window.DealSystem.Deal({
            merchant: {
                name: merchant.name,
                domain: merchant.domain,
                id: `merchant_${merchant.name.toLowerCase().replace(/\s+/g, '_')}`
            },
            discount,
            category: merchant.category,
            terms: overrides.terms || this._randomTerms(),
            source: {
                provider: overrides.provider || this._randomProvider(),
                priority: Math.floor(Math.random() * 10) + 1,
                verificationScore: Math.random()
            },
            expiry: overrides.expiry || this._randomExpiry(),
            campusIds: overrides.campusIds || this._randomCampuses(),
            verificationScore: overrides.verificationScore || Math.random() * 0.5 + 0.5,
            ...overrides
        });
    }

    // Generate deal.created event
    generateDealCreatedEvent(dealOverrides = {}) {
        const deal = this.generateDeal(dealOverrides);
        
        return {
            version: 'v1',
            type: 'deal.created',
            id: deal.id,
            merchant: deal.merchant,
            discount: deal.discount,
            source: deal.source,
            timestamp: Date.now(),
            deal
        };
    }

    // Generate deal.updated event
    generateDealUpdatedEvent(dealId, changes = ['price_drop']) {
        return {
            version: 'v1',
            type: 'deal.updated',
            id: dealId,
            changes,
            previousValues: {
                discount: { type: 'percentage', value: 10 }
            },
            timestamp: Date.now()
        };
    }

    // Generate deal.expired event
    generateDealExpiredEvent(dealId) {
        return {
            version: 'v1',
            type: 'deal.expired',
            id: dealId,
            reason: 'time_limit',
            timestamp: Date.now()
        };
    }

    // Generate batch of events
    generateEventBatch(count = 10, types = ['deal.created', 'deal.updated']) {
        const events = [];
        
        for (let i = 0; i < count; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            
            if (type === 'deal.created') {
                events.push(this.generateDealCreatedEvent());
            } else if (type === 'deal.updated') {
                events.push(this.generateDealUpdatedEvent(`deal_${i}`, ['price_drop']));
            } else if (type === 'deal.expired') {
                events.push(this.generateDealExpiredEvent(`deal_${i}`));
            }
        }

        return events;
    }

    // Generate realistic test scenario
    generateScenario(scenarioType = 'black_friday') {
        const scenarios = {
            'black_friday': {
                dealCount: 50,
                avgDiscount: 40,
                categories: ['retail', 'technology', 'fashion'],
                duration: 4 * 24 * 60 * 60 * 1000 // 4 days
            },
            'back_to_school': {
                dealCount: 30,
                avgDiscount: 25,
                categories: ['technology', 'fashion', 'books'],
                duration: 14 * 24 * 60 * 60 * 1000 // 2 weeks
            },
            'regular': {
                dealCount: 10,
                avgDiscount: 15,
                categories: ['all'],
                duration: 30 * 24 * 60 * 60 * 1000 // 30 days
            }
        };

        const scenario = scenarios[scenarioType] || scenarios.regular;
        const deals = [];

        for (let i = 0; i < scenario.dealCount; i++) {
            const discount = Math.floor(
                scenario.avgDiscount + (Math.random() - 0.5) * 20
            );

            deals.push(this.generateDeal({
                discount: {
                    type: 'percentage',
                    value: Math.max(5, Math.min(90, discount)),
                    description: `${discount}% off`
                },
                expiry: Date.now() + scenario.duration
            }));
        }

        return {
            name: scenarioType,
            deals,
            config: scenario
        };
    }

    _randomMerchant() {
        return this.merchants[Math.floor(Math.random() * this.merchants.length)];
    }

    _randomDiscount() {
        const types = ['percentage', 'fixed', 'bogo'];
        const type = types[Math.floor(Math.random() * types.length)];

        if (type === 'percentage') {
            const value = Math.floor(Math.random() * 70) + 10; // 10-80%
            return { type, value, description: `${value}% off` };
        } else if (type === 'fixed') {
            const value = Math.floor(Math.random() * 90) + 10; // $10-$100
            return { type, value, description: `$${value} off` };
        } else {
            return { type, value: 1, description: 'Buy one get one free' };
        }
    }

    _randomTerms() {
        const terms = [
            'Valid for students only. ID required.',
            'One use per customer.',
            'Cannot be combined with other offers.',
            'In-store and online.',
            'While supplies last.'
        ];
        return terms[Math.floor(Math.random() * terms.length)];
    }

    _randomProvider() {
        return this.providers[Math.floor(Math.random() * this.providers.length)];
    }

    _randomExpiry() {
        const days = Math.floor(Math.random() * 90) + 1; // 1-90 days
        return Date.now() + (days * 24 * 60 * 60 * 1000);
    }

    _randomCampuses() {
        const count = Math.floor(Math.random() * 3) + 1;
        const shuffled = [...this.campuses].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }
}

// ========================================
// Event Replay System
// ========================================
class EventReplayManager {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.recordings = new Map();
        this.isRecording = false;
        this.currentRecording = null;
    }

    // Start recording events
    startRecording(name) {
        this.isRecording = true;
        this.currentRecording = {
            name,
            events: [],
            startTime: Date.now()
        };

        // Subscribe to all event types
        this.recordSubscription = this._subscribeToAll();

        console.log(`Started recording: ${name}`);
    }

    // Stop recording
    stopRecording() {
        if (!this.isRecording) return null;

        this.isRecording = false;
        
        if (this.recordSubscription) {
            this.recordSubscription();
        }

        const recording = {
            ...this.currentRecording,
            endTime: Date.now(),
            duration: Date.now() - this.currentRecording.startTime
        };

        this.recordings.set(recording.name, recording);
        this.currentRecording = null;

        console.log(`Stopped recording: ${recording.name} (${recording.events.length} events)`);

        return recording;
    }

    _subscribeToAll() {
        const callback = (event) => {
            if (this.isRecording && this.currentRecording) {
                this.currentRecording.events.push({
                    ...event,
                    recordedAt: Date.now()
                });
            }
        };

        // Subscribe to common event types
        const unsubscribers = [
            this.eventBus.subscribe('deal.created', callback),
            this.eventBus.subscribe('deal.updated', callback),
            this.eventBus.subscribe('deal.expired', callback),
            this.eventBus.subscribe('deal.verified', callback)
        ];

        return () => unsubscribers.forEach(unsub => unsub());
    }

    // Replay recorded events
    async replay(name, options = {}) {
        const recording = this.recordings.get(name);
        if (!recording) {
            console.error(`Recording not found: ${name}`);
            return;
        }

        const speed = options.speed || 1; // 1x, 2x, etc.
        const delay = options.delay || 0;

        console.log(`Replaying: ${name} (${recording.events.length} events)`);

        if (delay > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        for (let i = 0; i < recording.events.length; i++) {
            const event = recording.events[i];
            
            // Replay event
            await this.eventBus.publish(event);

            // Calculate delay until next event
            if (i < recording.events.length - 1) {
                const nextEvent = recording.events[i + 1];
                const originalDelay = nextEvent.recordedAt - event.recordedAt;
                const adjustedDelay = originalDelay / speed;

                if (adjustedDelay > 0) {
                    await new Promise(resolve => setTimeout(resolve, adjustedDelay));
                }
            }
        }

        console.log(`Replay complete: ${name}`);
    }

    // Load recording from JSON
    loadRecording(name, data) {
        this.recordings.set(name, data);
        console.log(`Loaded recording: ${name}`);
    }

    // Export recording as JSON
    exportRecording(name) {
        const recording = this.recordings.get(name);
        return recording ? JSON.stringify(recording, null, 2) : null;
    }

    // List all recordings
    listRecordings() {
        return Array.from(this.recordings.keys());
    }
}

// ========================================
// Chaos Engineering Tools
// ========================================
class ChaosEngineer {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.isActive = false;
        this.config = {
            delayProbability: 0.2,
            dropProbability: 0.1,
            minDelay: 100,
            maxDelay: 5000
        };
    }

    // Enable chaos mode
    enable(config = {}) {
        this.config = { ...this.config, ...config };
        this.isActive = true;
        this._interceptEvents();
        console.log('Chaos engineering enabled:', this.config);
    }

    // Disable chaos mode
    disable() {
        this.isActive = false;
        console.log('Chaos engineering disabled');
    }

    _interceptEvents() {
        // Store original publish method
        const originalPublish = this.eventBus.publish.bind(this.eventBus);

        // Override publish method
        this.eventBus.publish = async (event) => {
            if (!this.isActive) {
                return originalPublish(event);
            }

            // Randomly drop events
            if (Math.random() < this.config.dropProbability) {
                console.warn('Chaos: Dropped event', event.type);
                return Promise.resolve(); // Return resolved promise for API compatibility
            }

            // Randomly delay events
            if (Math.random() < this.config.delayProbability) {
                const delay = Math.random() * (this.config.maxDelay - this.config.minDelay) + this.config.minDelay;
                console.warn(`Chaos: Delaying event ${event.type} by ${delay}ms`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }

            return originalPublish(event);
        };
    }

    // Simulate provider outage
    simulateOutage(providerId, duration = 60000) {
        console.warn(`Chaos: Simulating ${providerId} outage for ${duration}ms`);
        
        // In real implementation, would temporarily disable provider
        setTimeout(() => {
            console.log(`Chaos: ${providerId} outage ended`);
        }, duration);
    }

    // Simulate spike in deal updates
    async simulateSpike(count = 100, duration = 5000) {
        console.warn(`Chaos: Simulating spike of ${count} deals over ${duration}ms`);
        
        const mockGenerator = new EventMockGenerator();
        const interval = duration / count;

        for (let i = 0; i < count; i++) {
            const event = mockGenerator.generateDealCreatedEvent();
            await this.eventBus.publish(event);
            await new Promise(resolve => setTimeout(resolve, interval));
        }

        console.log('Chaos: Spike simulation complete');
    }
}

// ========================================
// Admin Tools
// ========================================
class AdminToolkit {
    constructor(dealSystem) {
        this.dealSystem = dealSystem;
    }

    // Manually trigger poll for provider
    async triggerPoll(providerId) {
        console.log(`Admin: Triggering manual poll for ${providerId}`);
        
        // In real implementation, would call actual provider poll
        const mockGenerator = new EventMockGenerator();
        const deals = mockGenerator.generateEventBatch(5, ['deal.created']);
        
        for (const event of deals) {
            await this.dealSystem.eventBus.publish(event);
        }

        console.log(`Admin: Poll complete for ${providerId}`);
    }

    // Republish event
    async republishEvent(eventId) {
        console.log(`Admin: Republishing event ${eventId}`);
        
        const event = this.dealSystem.eventBus.getHistory()
            .find(e => e.id === eventId);

        if (event) {
            await this.dealSystem.eventBus.publish(event);
            console.log('Admin: Event republished');
        } else {
            console.error('Admin: Event not found');
        }
    }

    // Inspect event logs
    inspectEventLog(filters = {}) {
        const history = this.dealSystem.eventBus.getHistory(filters);
        
        console.table(history.map(e => ({
            type: e.type,
            id: e.id,
            timestamp: new Date(e.timestamp).toISOString()
        })));

        return history;
    }

    // Get system metrics
    getMetrics() {
        const metrics = {
            eventBus: {
                totalEvents: this.dealSystem.eventBus.eventHistory.length,
                listeners: this.dealSystem.eventBus.listeners.size
            }
        };

        if (this.dealSystem.pollingManager) {
            metrics.polling = {
                providers: this.dealSystem.pollingManager.pollingState.size,
                needingPoll: this.dealSystem.pollingManager.getProvidersNeedingPoll().length
            };
        }

        if (this.dealSystem.verificationQueue) {
            metrics.verification = this.dealSystem.verificationQueue.getStats();
        }

        return metrics;
    }

    // Clear all data (dev/test only)
    clearAllData() {
        console.warn('Admin: Clearing all data');
        
        this.dealSystem.eventBus.eventHistory = [];
        
        if (this.dealSystem.deduplicator) {
            this.dealSystem.deduplicator.dealsByHash.clear();
        }

        if (this.dealSystem.cacheManager) {
            this.dealSystem.cacheManager.clearCache();
        }

        console.log('Admin: Data cleared');
    }

    // Export system state
    exportState() {
        return {
            timestamp: Date.now(),
            eventHistory: this.dealSystem.eventBus.eventHistory,
            metrics: this.getMetrics()
        };
    }

    // Import system state
    importState(state) {
        console.log('Admin: Importing state...');
        
        this.dealSystem.eventBus.eventHistory = state.eventHistory || [];
        
        console.log('Admin: State imported');
    }
}

// ========================================
// Integration Test Helper
// ========================================
class TestHelper {
    constructor() {
        this.eventBus = new window.DealSystem.DealEventBus();
        this.mockGenerator = new EventMockGenerator();
        this.setupComplete = false;
    }

    // Setup test environment
    async setup() {
        console.log('Test: Setting up environment...');
        
        // Initialize all systems
        this.pollingManager = new window.DealSystem.AdaptivePollingManager();
        this.merchantResolver = new window.DealSystem.MerchantEntityResolver();
        this.deduplicator = new window.DealSystem.DealDeduplicator(this.merchantResolver);
        
        this.notificationEngine = new window.NotificationSystem.NotificationDecisionEngine(this.eventBus);
        this.updateChannel = new window.NotificationSystem.DealUpdateChannel(this.eventBus);
        this.cacheManager = new window.NotificationSystem.DealCacheManager();
        
        this.verificationQueue = new window.QualitySystem.VerificationQueue(this.eventBus);
        this.validator = new window.QualitySystem.CrowdsourcedValidator(this.eventBus);
        this.tester = new window.QualitySystem.AutomatedDealTester(this.eventBus);
        this.analytics = new window.QualitySystem.AnalyticsTracker(this.eventBus);
        
        this.setupComplete = true;
        console.log('Test: Environment ready');
        
        return this;
    }

    // Teardown test environment
    async teardown() {
        console.log('Test: Tearing down environment...');
        
        this.eventBus.eventHistory = [];
        this.cacheManager.clearCache();
        
        console.log('Test: Teardown complete');
    }

    // Run a complete integration test
    async runIntegrationTest() {
        if (!this.setupComplete) await this.setup();

        console.log('Test: Running integration test...');
        
        // 1. Generate test deals
        const deals = this.mockGenerator.generateEventBatch(10, ['deal.created']);
        
        // 2. Process through event bus
        for (const event of deals) {
            await this.eventBus.publish(event);
        }

        // 3. Register test user
        this.notificationEngine.registerUser('test_user', {
            categories: ['technology'],
            minDiscountPercentage: 15
        });

        // 4. Connect for real-time updates
        const connection = this.updateChannel.connect('test_user', {
            categories: ['technology']
        });

        // 5. Track analytics
        deals.forEach((event, i) => {
            this.analytics.trackView(event.id, 'test_user');
            if (i % 2 === 0) {
                this.analytics.trackClick(event.id, 'test_user');
            }
        });

        // 6. Verify results
        const metrics = this.analytics.getTrendingDeals(5);
        console.log('Test: Trending deals:', metrics);

        const channelStats = this.updateChannel.getStats();
        console.log('Test: Channel stats:', channelStats);

        connection.disconnect();

        console.log('Test: Integration test complete');
        
        return {
            dealsProcessed: deals.length,
            trending: metrics,
            channelStats
        };
    }
}

// ========================================
// Export for use in other modules
// ========================================
window.DevTools = {
    EventMockGenerator,
    EventReplayManager,
    ChaosEngineer,
    AdminToolkit,
    TestHelper
};
