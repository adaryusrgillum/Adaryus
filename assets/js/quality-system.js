/* Adaryus Deal Quality Control & Analytics System */

// ========================================
// Deal Verification Queue
// ========================================
class VerificationQueue {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.queue = [];
        this.verifiedDeals = new Map();
        this.suspiciousPatterns = [
            { pattern: /too good to be true/i, severity: 'high' },
            { pattern: /\b(100%|90%) off\b/i, severity: 'medium' },
            { pattern: /free .* forever/i, severity: 'medium' }
        ];
    }

    // Add deal to verification queue
    addToQueue(deal, reason = 'new_merchant') {
        const queueItem = {
            deal,
            reason,
            addedAt: Date.now(),
            priority: this._calculatePriority(deal, reason),
            status: 'pending'
        };

        this.queue.push(queueItem);
        this.queue.sort((a, b) => b.priority - a.priority);

        console.log(`Added deal ${deal.id} to verification queue: ${reason}`);

        if (this.eventBus) {
            this.eventBus.publish({
                version: 'v1',
                type: 'deal.verification_queued',
                dealId: deal.id,
                reason,
                timestamp: Date.now()
            });
        }

        return queueItem;
    }

    // Check if deal needs verification
    needsVerification(deal, merchantHistory = null) {
        const checks = [];

        // New merchant check
        if (!merchantHistory || merchantHistory.dealCount < 5) {
            checks.push({ need: true, reason: 'new_merchant', priority: 5 });
        }

        // Suspicious patterns
        const pattern = this._checkSuspiciousPatterns(deal);
        if (pattern) {
            checks.push({ need: true, reason: `suspicious_${pattern.severity}`, priority: 8 });
        }

        // Very high discount
        if (deal.discount.type === 'percentage' && deal.discount.value >= 90) {
            checks.push({ need: true, reason: 'high_discount', priority: 7 });
        }

        // Low quality score
        if (deal.getQualityScore() < 0.4) {
            checks.push({ need: true, reason: 'low_quality', priority: 6 });
        }

        if (checks.length > 0) {
            return { needs: true, reasons: checks };
        }

        return { needs: false, reasons: [] };
    }

    _checkSuspiciousPatterns(deal) {
        const text = `${deal.merchant.name} ${deal.discount.description} ${deal.terms}`.toLowerCase();

        for (const { pattern, severity } of this.suspiciousPatterns) {
            if (pattern.test(text)) {
                return { pattern: pattern.source, severity };
            }
        }

        return null;
    }

    _calculatePriority(deal, reason) {
        let priority = 5;

        if (reason.includes('suspicious')) {
            priority = 9;
        } else if (reason === 'high_discount') {
            priority = 7;
        } else if (reason === 'low_quality') {
            priority = 6;
        } else if (reason === 'new_merchant') {
            priority = 5;
        }

        // Boost priority if deal is expiring soon
        if (deal.expiry) {
            const hoursUntilExpiry = (deal.expiry - Date.now()) / (1000 * 60 * 60);
            if (hoursUntilExpiry < 48) {
                priority += 2;
            }
        }

        return Math.min(priority, 10);
    }

    // Mark deal as verified
    verify(dealId, verificationData) {
        const item = this.queue.find(q => q.deal.id === dealId);
        if (item) {
            item.status = 'verified';
            item.verifiedAt = Date.now();
            item.verificationData = verificationData;
        }

        this.verifiedDeals.set(dealId, {
            ...verificationData,
            verifiedAt: Date.now()
        });

        if (this.eventBus) {
            this.eventBus.publish({
                version: 'v1',
                type: 'deal.verified',
                id: dealId,
                verificationScore: verificationData.score,
                verifier: verificationData.verifier,
                timestamp: Date.now()
            });
        }

        console.log(`Deal ${dealId} verified with score ${verificationData.score}`);
    }

    // Get pending items
    getPendingItems(limit = 10) {
        return this.queue
            .filter(item => item.status === 'pending')
            .slice(0, limit);
    }

    // Get stats
    getStats() {
        return {
            total: this.queue.length,
            pending: this.queue.filter(i => i.status === 'pending').length,
            verified: this.queue.filter(i => i.status === 'verified').length,
            avgWaitTime: this._calculateAvgWaitTime()
        };
    }

    _calculateAvgWaitTime() {
        const verified = this.queue.filter(i => i.status === 'verified' && i.verifiedAt);
        if (verified.length === 0) return 0;

        const totalWait = verified.reduce((sum, item) => {
            return sum + (item.verifiedAt - item.addedAt);
        }, 0);

        return totalWait / verified.length;
    }
}

// ========================================
// Crowdsourced Validation Tracker
// ========================================
class CrowdsourcedValidator {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.reports = new Map(); // dealId -> reports[]
        this.autoExpireThreshold = 5; // Auto-expire after 5 negative reports
        this.reportWindow = 30 * 24 * 60 * 60 * 1000; // 30 days
    }

    // Report deal status
    reportDeal(dealId, userId, status, comments = '') {
        if (!this.reports.has(dealId)) {
            this.reports.set(dealId, []);
        }

        const report = {
            userId,
            status, // 'worked', 'failed', 'expired'
            comments,
            timestamp: Date.now()
        };

        this.reports.get(dealId).push(report);

        // Clean old reports
        this._cleanOldReports(dealId);

        // Check if auto-expire threshold reached
        const stats = this.getReportStats(dealId);
        if (stats.failed >= this.autoExpireThreshold) {
            this._triggerAutoExpire(dealId, stats);
        }

        if (this.eventBus) {
            this.eventBus.publish({
                version: 'v1',
                type: 'deal.user_report',
                dealId,
                userId,
                status,
                timestamp: Date.now()
            });
        }

        console.log(`User ${userId} reported deal ${dealId} as ${status}`);

        return stats;
    }

    // Get report statistics for a deal
    getReportStats(dealId) {
        const reports = this.reports.get(dealId) || [];
        const recent = reports.filter(r => Date.now() - r.timestamp < this.reportWindow);

        return {
            total: recent.length,
            worked: recent.filter(r => r.status === 'worked').length,
            failed: recent.filter(r => r.status === 'failed').length,
            expired: recent.filter(r => r.status === 'expired').length,
            successRate: recent.length > 0 
                ? recent.filter(r => r.status === 'worked').length / recent.length 
                : null
        };
    }

    _cleanOldReports(dealId) {
        const reports = this.reports.get(dealId) || [];
        const now = Date.now();
        
        const filtered = reports.filter(r => now - r.timestamp < this.reportWindow);
        this.reports.set(dealId, filtered);
    }

    _triggerAutoExpire(dealId, stats) {
        console.warn(`Auto-expiring deal ${dealId} due to ${stats.failed} failure reports`);

        if (this.eventBus) {
            this.eventBus.publish({
                version: 'v1',
                type: 'deal.auto_expired',
                dealId,
                reason: 'crowdsourced_validation',
                stats,
                timestamp: Date.now()
            });
        }
    }

    // Get deals flagged for review
    getFlaggedDeals(minReports = 3) {
        const flagged = [];

        for (const [dealId, reports] of this.reports.entries()) {
            const stats = this.getReportStats(dealId);
            
            if (stats.total >= minReports && stats.successRate < 0.5) {
                flagged.push({
                    dealId,
                    stats,
                    priority: stats.failed
                });
            }
        }

        return flagged.sort((a, b) => b.priority - a.priority);
    }
}

// ========================================
// Automated Testing System
// ========================================
class AutomatedDealTester {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.testSchedule = new Map();
        this.testResults = new Map();
        this.testInterval = 24 * 60 * 60 * 1000; // Test once per day
    }

    // Schedule deal for testing
    scheduleTest(deal, options = {}) {
        if (!deal.merchant.domain) {
            console.log(`Cannot schedule test for ${deal.id}: no merchant domain`);
            return { success: false, reason: 'no_merchant_domain' };
        }

        const testId = `test_${deal.id}_${Date.now()}`;
        
        this.testSchedule.set(testId, {
            dealId: deal.id,
            merchant: deal.merchant,
            discount: deal.discount,
            scheduledFor: Date.now() + (options.delay || 0),
            interval: options.interval || this.testInterval,
            lastTest: null,
            nextTest: Date.now()
        });

        console.log(`Scheduled automated test for deal ${deal.id}`);
        return { success: true, testId };
    }

    // Simulate running automated test
    async runTest(testId) {
        const schedule = this.testSchedule.get(testId);
        if (!schedule) return null;

        console.log(`Running automated test for deal ${schedule.dealId}...`);

        // Simulate test execution (in real implementation, would use headless browser)
        const result = await this._simulateTest(schedule);

        // Store result
        if (!this.testResults.has(schedule.dealId)) {
            this.testResults.set(schedule.dealId, []);
        }
        this.testResults.get(schedule.dealId).push(result);

        // Update schedule
        schedule.lastTest = Date.now();
        schedule.nextTest = Date.now() + schedule.interval;

        // Emit event
        if (this.eventBus) {
            this.eventBus.publish({
                version: 'v1',
                type: 'deal.tested',
                dealId: schedule.dealId,
                result: result.status,
                timestamp: Date.now()
            });
        }

        return result;
    }

    async _simulateTest(schedule) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 100));

        // Simulate test outcome (in reality, would test discount code, etc.)
        const outcomes = ['success', 'failed', 'unavailable', 'expired'];
        const weights = [0.8, 0.1, 0.05, 0.05]; // 80% success rate
        
        const random = Math.random();
        let cumulative = 0;
        let status = outcomes[0];

        for (let i = 0; i < outcomes.length; i++) {
            cumulative += weights[i];
            if (random < cumulative) {
                status = outcomes[i];
                break;
            }
        }

        return {
            testId: `result_${Date.now()}`,
            status,
            timestamp: Date.now(),
            details: {
                merchant: schedule.merchant.name,
                responseTime: Math.random() * 2000 + 500
            }
        };
    }

    // Get tests needing execution
    getTestsDue() {
        const now = Date.now();
        return Array.from(this.testSchedule.entries())
            .filter(([_, schedule]) => now >= schedule.nextTest)
            .map(([testId, schedule]) => ({ testId, schedule }));
    }

    // Get test history for a deal
    getTestHistory(dealId) {
        return this.testResults.get(dealId) || [];
    }
}

// ========================================
// Analytics Event Tracker
// ========================================
class AnalyticsTracker {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.events = [];
        this.metrics = {
            views: new Map(),
            clicks: new Map(),
            redemptions: new Map()
        };
    }

    // Track deal viewed
    trackView(dealId, userId, context = {}) {
        this._trackEvent('view', dealId, userId, context);
        this._incrementMetric('views', dealId);
    }

    // Track deal clicked
    trackClick(dealId, userId, context = {}) {
        this._trackEvent('click', dealId, userId, context);
        this._incrementMetric('clicks', dealId);
    }

    // Track deal redeemed
    trackRedemption(dealId, userId, context = {}) {
        this._trackEvent('redemption', dealId, userId, context);
        this._incrementMetric('redemptions', dealId);
    }

    _trackEvent(eventType, dealId, userId, context) {
        const event = {
            type: eventType,
            dealId,
            userId,
            context,
            timestamp: Date.now()
        };

        this.events.push(event);

        // Publish to event bus
        if (this.eventBus) {
            this.eventBus.publish({
                version: 'v1',
                type: `deal.${eventType}`,
                dealId,
                userId,
                context,
                timestamp: Date.now()
            });
        }
    }

    _incrementMetric(type, dealId) {
        const metric = this.metrics[type];
        metric.set(dealId, (metric.get(dealId) || 0) + 1);
    }

    // Get metrics for a deal
    getDealMetrics(dealId) {
        return {
            views: this.metrics.views.get(dealId) || 0,
            clicks: this.metrics.clicks.get(dealId) || 0,
            redemptions: this.metrics.redemptions.get(dealId) || 0,
            clickThroughRate: this._calculateCTR(dealId),
            conversionRate: this._calculateConversionRate(dealId)
        };
    }

    _calculateCTR(dealId) {
        const views = this.metrics.views.get(dealId) || 0;
        const clicks = this.metrics.clicks.get(dealId) || 0;
        return views > 0 ? clicks / views : 0;
    }

    _calculateConversionRate(dealId) {
        const clicks = this.metrics.clicks.get(dealId) || 0;
        const redemptions = this.metrics.redemptions.get(dealId) || 0;
        return clicks > 0 ? redemptions / clicks : 0;
    }

    // Get trending deals
    getTrendingDeals(limit = 10, timeWindow = 24 * 60 * 60 * 1000) {
        const now = Date.now();
        const recentEvents = this.events.filter(e => now - e.timestamp < timeWindow);

        // Count events per deal
        const dealCounts = new Map();
        for (const event of recentEvents) {
            dealCounts.set(
                event.dealId,
                (dealCounts.get(event.dealId) || 0) + 1
            );
        }

        // Sort and return top deals
        return Array.from(dealCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([dealId, count]) => ({
                dealId,
                eventCount: count,
                metrics: this.getDealMetrics(dealId)
            }));
    }

    // Get events by campus
    getEventsByCampus(campusId, timeWindow = 24 * 60 * 60 * 1000) {
        const now = Date.now();
        return this.events.filter(e => 
            now - e.timestamp < timeWindow &&
            e.context.campusId === campusId
        );
    }

    // Get provider performance
    getProviderPerformance(providerId) {
        const providerEvents = this.events.filter(e => 
            e.context.providerId === providerId
        );

        const dealIds = [...new Set(providerEvents.map(e => e.dealId))];
        
        return {
            totalDeals: dealIds.length,
            totalEvents: providerEvents.length,
            avgEventsPerDeal: providerEvents.length / dealIds.length || 0,
            deals: dealIds.map(id => ({
                id,
                metrics: this.getDealMetrics(id)
            }))
        };
    }
}

// ========================================
// Graceful Degradation Manager
// ========================================
class DegradationManager {
    constructor() {
        this.providerStatus = new Map();
        this.circuitBreakers = new Map();
        this.fallbackData = new Map();
    }

    // Initialize circuit breaker for provider
    initCircuitBreaker(providerId, options = {}) {
        this.circuitBreakers.set(providerId, {
            state: 'closed', // closed, open, half-open
            failureCount: 0,
            lastFailure: null,
            threshold: options.threshold || 5,
            timeout: options.timeout || 60000, // 1 minute
            halfOpenAttempts: options.halfOpenAttempts || 3
        });

        this.providerStatus.set(providerId, {
            healthy: true,
            lastCheck: Date.now(),
            uptime: 1.0
        });
    }

    // Record provider failure
    recordFailure(providerId) {
        const breaker = this.circuitBreakers.get(providerId);
        if (!breaker) return;

        breaker.failureCount++;
        breaker.lastFailure = Date.now();

        if (breaker.failureCount >= breaker.threshold) {
            this._openCircuit(providerId);
        }

        const status = this.providerStatus.get(providerId);
        if (status) {
            status.healthy = false;
            status.lastCheck = Date.now();
        }
    }

    // Record provider success
    recordSuccess(providerId) {
        const breaker = this.circuitBreakers.get(providerId);
        if (!breaker) return;

        if (breaker.state === 'half-open') {
            breaker.halfOpenAttempts--;
            if (breaker.halfOpenAttempts <= 0) {
                this._closeCircuit(providerId);
            }
        }

        breaker.failureCount = Math.max(0, breaker.failureCount - 1);

        const status = this.providerStatus.get(providerId);
        if (status) {
            status.healthy = true;
            status.lastCheck = Date.now();
        }
    }

    // Check if provider can be called
    canCallProvider(providerId) {
        const breaker = this.circuitBreakers.get(providerId);
        if (!breaker) return true;

        if (breaker.state === 'open') {
            // Check if timeout has passed
            if (Date.now() - breaker.lastFailure > breaker.timeout) {
                this._halfOpenCircuit(providerId);
                return true;
            }
            return false;
        }

        return true;
    }

    _openCircuit(providerId) {
        const breaker = this.circuitBreakers.get(providerId);
        breaker.state = 'open';
        console.warn(`Circuit breaker opened for provider ${providerId}`);
    }

    _halfOpenCircuit(providerId) {
        const breaker = this.circuitBreakers.get(providerId);
        breaker.state = 'half-open';
        breaker.halfOpenAttempts = 3;
        console.log(`Circuit breaker half-open for provider ${providerId}`);
    }

    _closeCircuit(providerId) {
        const breaker = this.circuitBreakers.get(providerId);
        breaker.state = 'closed';
        breaker.failureCount = 0;
        console.log(`Circuit breaker closed for provider ${providerId}`);
    }

    // Store fallback data
    storeFallbackData(key, data) {
        this.fallbackData.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    // Get fallback data
    getFallbackData(key, maxAge = 24 * 60 * 60 * 1000) {
        const cached = this.fallbackData.get(key);
        if (!cached) return null;

        const age = Date.now() - cached.timestamp;
        if (age > maxAge) return null;

        return {
            data: cached.data,
            age,
            isStale: age > maxAge * 0.5
        };
    }

    // Get system health status
    getHealthStatus() {
        const providers = Array.from(this.providerStatus.entries()).map(([id, status]) => {
            const breaker = this.circuitBreakers.get(id);
            return {
                id,
                ...status,
                circuitState: breaker?.state || 'unknown'
            };
        });

        const healthyCount = providers.filter(p => p.healthy).length;
        
        return {
            overall: healthyCount / providers.length || 0,
            providers,
            timestamp: Date.now()
        };
    }
}

// ========================================
// Export for use in other modules
// ========================================
window.QualitySystem = {
    VerificationQueue,
    CrowdsourcedValidator,
    AutomatedDealTester,
    AnalyticsTracker,
    DegradationManager
};
