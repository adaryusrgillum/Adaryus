/* Adaryus Deal System - Main Orchestrator */

// ========================================
// Deal System Orchestrator
// ========================================
class DealSystemOrchestrator {
    constructor(config = {}) {
        this.config = {
            enablePolling: config.enablePolling !== false,
            enableNotifications: config.enableNotifications !== false,
            enableAnalytics: config.enableAnalytics !== false,
            enableQualityControl: config.enableQualityControl !== false,
            pollingInterval: config.pollingInterval || 5000, // 5 seconds for demo
            ...config
        };

        this.initialized = false;
        this.running = false;
    }

    // Initialize all systems
    async initialize() {
        console.log('Initializing Deal System Orchestrator...');

        // Core systems
        this.eventBus = new window.DealSystem.DealEventBus();
        this.merchantResolver = new window.DealSystem.MerchantEntityResolver();
        this.deduplicator = new window.DealSystem.DealDeduplicator(this.merchantResolver);
        
        // Polling system
        if (this.config.enablePolling) {
            this.pollingManager = new window.DealSystem.AdaptivePollingManager();
            this._initializeProviders();
        }

        // Notification system
        if (this.config.enableNotifications) {
            this.notificationEngine = new window.NotificationSystem.NotificationDecisionEngine(this.eventBus);
            this.updateChannel = new window.NotificationSystem.DealUpdateChannel(this.eventBus);
            this.cacheManager = new window.NotificationSystem.DealCacheManager();
        }

        // Quality control system
        if (this.config.enableQualityControl) {
            this.verificationQueue = new window.QualitySystem.VerificationQueue(this.eventBus);
            this.validator = new window.QualitySystem.CrowdsourcedValidator(this.eventBus);
            this.tester = new window.QualitySystem.AutomatedDealTester(this.eventBus);
            this.degradationManager = new window.QualitySystem.DegradationManager();
            this._initializeCircuitBreakers();
        }

        // Analytics system
        if (this.config.enableAnalytics) {
            this.analytics = new window.QualitySystem.AnalyticsTracker(this.eventBus);
        }

        // Setup event listeners
        this._setupEventListeners();

        // Load cached deals
        if (this.cacheManager) {
            const cached = this.cacheManager.loadDeals();
            if (cached.deals.length > 0) {
                console.log(`Loaded ${cached.deals.length} deals from cache (${cached.isStale ? 'stale' : 'fresh'})`);
            }
        }

        this.initialized = true;
        console.log('Deal System Orchestrator initialized successfully');

        return this;
    }

    _initializeProviders() {
        const providers = window.DealSystem.ProviderConfig.getPollingProviders();
        providers.forEach(provider => {
            this.pollingManager.initProvider(provider.id);
        });
    }

    _initializeCircuitBreakers() {
        const allProviders = Object.keys(window.DealSystem.ProviderConfig.providers);
        allProviders.forEach(providerId => {
            this.degradationManager.initCircuitBreaker(providerId, {
                threshold: 3,
                timeout: 30000
            });
        });
    }

    _setupEventListeners() {
        // Listen for deal changes
        this.eventBus.subscribe('deal.created', async (event) => {
            await this._handleDealCreated(event);
        });

        this.eventBus.subscribe('deal.updated', async (event) => {
            await this._handleDealUpdated(event);
        });

        this.eventBus.subscribe('deal.expired', async (event) => {
            await this._handleDealExpired(event);
        });

        // Listen for verification events
        if (this.config.enableQualityControl) {
            this.eventBus.subscribe('deal.auto_expired', async (event) => {
                console.log(`Deal ${event.dealId} auto-expired due to crowdsourced validation`);
            });
        }
    }

    async _handleDealCreated(event) {
        console.log(`Processing new deal: ${event.id}`);

        // Check for duplicates
        const result = this.deduplicator.checkAndAdd(event.deal);
        if (result.isDuplicate) {
            console.log(`Deal ${event.id} is duplicate of ${result.existing.id}`);
            return;
        }

        // Check if needs verification
        if (this.config.enableQualityControl) {
            const needsVerification = this.verificationQueue.needsVerification(event.deal);
            if (needsVerification.needs) {
                this.verificationQueue.addToQueue(event.deal, needsVerification.reasons[0].reason);
            }
        }

        // Process notifications
        if (this.config.enableNotifications && this.notificationEngine) {
            await this.notificationEngine.processDealChange(event, event.deal);
        }

        // Update cache
        if (this.cacheManager) {
            // In production, would fetch all deals and cache
            // For now, just log
            console.log('Cache would be updated here');
        }
    }

    async _handleDealUpdated(event) {
        console.log(`Processing deal update: ${event.id}`);

        // Process notifications for price drops
        if (this.config.enableNotifications && this.notificationEngine) {
            // Would fetch full deal object here
            const mockDeal = new window.DealSystem.Deal({
                id: event.id,
                merchant: { name: 'Test Merchant', domain: 'test.com' },
                discount: { type: 'percentage', value: 20, description: '20% off' },
                category: 'test',
                source: { provider: 'test', priority: 5, verificationScore: 0.8 }
            });
            
            await this.notificationEngine.processDealChange(event, mockDeal);
        }
    }

    async _handleDealExpired(event) {
        console.log(`Deal expired: ${event.id}`);
        
        // Remove from cache
        if (this.cacheManager) {
            console.log('Would remove from cache');
        }
    }

    // Start the system
    async start() {
        if (!this.initialized) {
            await this.initialize();
        }

        console.log('Starting Deal System...');
        this.running = true;

        // Start polling loop
        if (this.config.enablePolling) {
            this._startPollingLoop();
        }

        // Start automated testing
        if (this.config.enableQualityControl) {
            this._startTestingLoop();
        }

        console.log('Deal System running');
    }

    // Stop the system
    stop() {
        console.log('Stopping Deal System...');
        this.running = false;

        if (this.pollingTimer) {
            clearInterval(this.pollingTimer);
        }

        if (this.testingTimer) {
            clearInterval(this.testingTimer);
        }

        console.log('Deal System stopped');
    }

    _startPollingLoop() {
        this.pollingTimer = setInterval(async () => {
            if (!this.running) return;

            const providers = this.pollingManager.getProvidersNeedingPoll();
            
            for (const provider of providers) {
                if (this.degradationManager.canCallProvider(provider.id)) {
                    await this._pollProvider(provider);
                } else {
                    console.log(`Skipping ${provider.id} - circuit breaker open`);
                }
            }
        }, this.config.pollingInterval);
    }

    async _pollProvider(provider) {
        console.log(`Polling provider: ${provider.id}`);

        try {
            // Simulate polling (in real implementation, would call actual API)
            const hasChanges = Math.random() > 0.6; // 40% chance of changes
            const changeCount = hasChanges ? Math.floor(Math.random() * 5) + 1 : 0;

            // Record poll result
            this.pollingManager.recordPoll(provider.id, hasChanges, changeCount);

            if (hasChanges) {
                // Generate mock events
                const mockGenerator = new window.DevTools.EventMockGenerator();
                for (let i = 0; i < changeCount; i++) {
                    const event = mockGenerator.generateDealCreatedEvent({
                        provider: provider.id
                    });
                    await this.eventBus.publish(event);
                }
            }

            // Record success
            if (this.degradationManager) {
                this.degradationManager.recordSuccess(provider.id);
            }

        } catch (error) {
            console.error(`Error polling ${provider.id}:`, error);
            
            if (this.degradationManager) {
                this.degradationManager.recordFailure(provider.id);
            }
        }
    }

    _startTestingLoop() {
        // Run automated tests every minute
        this.testingTimer = setInterval(async () => {
            if (!this.running) return;

            const tests = this.tester.getTestsDue();
            
            for (const { testId } of tests) {
                await this.tester.runTest(testId);
            }
        }, 60000);
    }

    // Register a user for notifications
    registerUser(userId, preferences) {
        if (!this.notificationEngine) {
            console.error('Notification engine not enabled');
            return;
        }

        this.notificationEngine.registerUser(userId, preferences);
        console.log(`Registered user: ${userId}`);
    }

    // Connect user for real-time updates
    connectUser(userId, filters = {}) {
        if (!this.updateChannel) {
            console.error('Update channel not enabled');
            return null;
        }

        return this.updateChannel.connect(userId, filters);
    }

    // Report deal status (crowdsourced validation)
    reportDeal(dealId, userId, status, comments = '') {
        if (!this.validator) {
            console.error('Validator not enabled');
            return;
        }

        return this.validator.reportDeal(dealId, userId, status, comments);
    }

    // Track analytics event
    trackEvent(type, dealId, userId, context = {}) {
        if (!this.analytics) {
            console.error('Analytics not enabled');
            return;
        }

        if (type === 'view') {
            this.analytics.trackView(dealId, userId, context);
        } else if (type === 'click') {
            this.analytics.trackClick(dealId, userId, context);
        } else if (type === 'redemption') {
            this.analytics.trackRedemption(dealId, userId, context);
        }
    }

    // Get system status
    getStatus() {
        const status = {
            running: this.running,
            initialized: this.initialized,
            timestamp: Date.now()
        };

        if (this.pollingManager) {
            const providers = this.pollingManager.getProvidersNeedingPoll();
            status.polling = {
                providersNeedingPoll: providers.length,
                providers: Array.from(this.pollingManager.pollingState.entries()).map(([id, state]) => ({
                    id,
                    lastPoll: state.lastPoll,
                    nextPoll: state.nextPollTime,
                    consecutiveNoChanges: state.consecutiveNoChanges
                }))
            };
        }

        if (this.verificationQueue) {
            status.verification = this.verificationQueue.getStats();
        }

        if (this.updateChannel) {
            status.connections = this.updateChannel.getStats();
        }

        if (this.degradationManager) {
            status.health = this.degradationManager.getHealthStatus();
        }

        if (this.analytics) {
            status.trending = this.analytics.getTrendingDeals(5);
        }

        return status;
    }

    // Get admin toolkit
    getAdminTools() {
        return new window.DevTools.AdminToolkit(this);
    }

    // Enable chaos mode for testing
    enableChaosMode(config) {
        this.chaosEngineer = new window.DevTools.ChaosEngineer(this.eventBus);
        this.chaosEngineer.enable(config);
        console.log('Chaos mode enabled');
    }

    // Disable chaos mode
    disableChaosMode() {
        if (this.chaosEngineer) {
            this.chaosEngineer.disable();
            console.log('Chaos mode disabled');
        }
    }
}

// ========================================
// Export for global use
// ========================================
window.DealSystemOrchestrator = DealSystemOrchestrator;

// ========================================
// Auto-initialize if configured
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    // Make orchestrator available globally for demo
    if (window.location.pathname.includes('deal-system-demo')) {
        console.log('Deal system demo page detected - orchestrator available as window.dealOrchestrator');
    }
});
