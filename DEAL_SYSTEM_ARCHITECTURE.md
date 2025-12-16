# Deal Aggregation System - Architecture Documentation

## Overview

This document describes the implementation of an event-driven student discount deal aggregation system with intelligent polling, real-time notifications, quality control, and graceful degradation patterns.

## System Architecture

### Core Components

#### 1. Event-Driven Architecture (`deal-system.js`)

##### Event Schema Versioning
- **Purpose**: Ensure backward compatibility as event schemas evolve
- **Features**:
  - Schema registry with versioned event definitions
  - Validation of events against schemas
  - Transformation logic for version migrations
  - Support for required and optional fields

##### Deal Data Models
- **Deal Class**: Normalized deal representation with:
  - Merchant information (name, domain, location)
  - Discount details (type, value, description)
  - Source metadata (provider, priority, verification score)
  - Quality metrics (success rate, report count)
  - Geographic scope (campus IDs, location)
  - Deduplication hash generation

##### Provider Configuration
- **Supported Providers**:
  - Student Beans (webhook, priority 9)
  - UNiDAYS (webhook, priority 9)
  - OnTheHub (polling, priority 10 for software)
  - Generic Aggregator (polling, priority 5)
- **Configuration**: Rate limits, polling intervals, update patterns

##### Adaptive Polling Strategy
- **Intelligence**:
  - Exponential backoff when no changes detected
  - Pattern recognition (Monday mornings, daily updates)
  - Historical change rate analysis
  - Provider-specific interval adjustment
- **Constraints**:
  - Min interval: 10 minutes
  - Max interval: 24 hours

##### Merchant Entity Resolution
- **Fuzzy Matching**:
  - Domain-based resolution (most reliable)
  - Name similarity using Levenshtein distance
  - Normalization and deduplication
- **Threshold**: 85% similarity for match

##### Deal Deduplication
- **Hash-Based**: Combines merchant, discount, and terms
- **Priority System**: Higher priority sources override lower
- **Metadata Tracking**: All sources tracked in deal metadata

##### Event Bus
- **Features**:
  - Subscribe with filtering and priority
  - Event validation before publishing
  - Event history with configurable size limit
  - Async event processing

### Notification System (`notification-system.js`)

#### User Preferences Model
- **Configurable**:
  - Categories of interest
  - Favorite merchants
  - Minimum discount threshold
  - Notification channels (push, email)
  - Quiet hours (default: 10pm-7am)
  - Daily/weekly notification caps

#### Notification Decision Engine
- **Smart Filtering**:
  - Interest matching (categories, merchants)
  - Discount threshold validation
  - Deal value calculation
  - Notification fatigue protection
- **Strategies**:
  - Instant: High value, favorites, price drops
  - Batch: Medium value deals (5-minute batches)
  - Digest: Low value deals (daily/weekly)
- **Timing Rules**:
  - Respects quiet hours
  - Batches minor updates
  - Immediate for high-value changes

#### Real-Time Update Channel
- **WebSocket Simulation**:
  - Connection management
  - Filter-based routing
  - Connection stats and monitoring
  - Custom event dispatching

#### Offline-First Cache
- **LocalStorage Backend**:
  - Deal caching with timestamps
  - 24-hour max cache age
  - Staleness detection
  - Metadata tracking

### Quality Control System (`quality-system.js`)

#### Verification Queue
- **Triggers**:
  - New merchants (< 5 deals)
  - Suspicious patterns (too good to be true)
  - Very high discounts (≥90%)
  - Low quality scores (<0.4)
- **Priority System**: 1-10 scale
- **Status Tracking**: Pending, verified

#### Crowdsourced Validation
- **User Reports**: worked, failed, expired
- **Auto-Expiration**: 5 negative reports triggers removal
- **Success Rate**: Calculated from 30-day window
- **Flagging**: Deals with <50% success rate flagged

#### Automated Testing
- **Scheduled Tests**: Daily per deal
- **Simulation**: Headless browser testing (simulated)
- **Results Tracking**: Success/failure history
- **Provider Integration**: Tests major partners

#### Analytics Tracker
- **Events**:
  - Deal viewed
  - Deal clicked
  - Deal redeemed
- **Metrics**:
  - Click-through rate (CTR)
  - Conversion rate
  - Trending deals
  - Campus-specific analytics
  - Provider performance

#### Graceful Degradation
- **Circuit Breakers**:
  - Failure threshold: 5 consecutive
  - Timeout: 1 minute
  - States: closed, open, half-open
- **Health Monitoring**:
  - Provider status tracking
  - System-wide health score
  - Fallback data with TTL

### Developer Tools (`dev-tools.js`)

#### Event Mock Generator
- **Capabilities**:
  - Random deal generation
  - Event batch creation
  - Scenario simulation (Black Friday, back-to-school)
  - Realistic test data

#### Event Replay System
- **Recording**:
  - Capture production events
  - Timestamp preservation
  - Duration tracking
- **Replay**:
  - Speed control (1x, 2x, etc.)
  - Delay simulation
  - JSON export/import

#### Chaos Engineering
- **Fault Injection**:
  - Random event delays (configurable probability)
  - Random event drops (configurable probability)
  - Provider outage simulation
  - Traffic spike simulation

#### Admin Toolkit
- **Operations**:
  - Manual poll triggering
  - Event republishing
  - Event log inspection
  - System metrics retrieval
  - Data export/import
  - Cache clearing

#### Test Helper
- **Integration Testing**:
  - Full system setup/teardown
  - Complete workflow testing
  - Metrics validation
  - Automated test suite

### Orchestrator (`deal-orchestrator.js`)

#### System Integration
- **Initialization**:
  - Component wiring
  - Provider setup
  - Event listener registration
  - Cache loading
- **Lifecycle**:
  - Start/stop operations
  - Polling loop management
  - Testing loop management
  - Health monitoring

#### API Surface
```javascript
// Initialize and start
const orchestrator = new DealSystemOrchestrator(config);
await orchestrator.initialize();
await orchestrator.start();

// User management
orchestrator.registerUser(userId, preferences);
const connection = orchestrator.connectUser(userId, filters);

// Operations
orchestrator.reportDeal(dealId, userId, status, comments);
orchestrator.trackEvent(type, dealId, userId, context);

// Monitoring
const status = orchestrator.getStatus();
const adminTools = orchestrator.getAdminTools();

// Testing
orchestrator.enableChaosMode(config);
orchestrator.disableChaosMode();
```

## Event Flow

### Deal Creation Flow
1. **Ingestion**: Webhook/poll receives deal data
2. **Normalization**: Transform to internal schema
3. **Merchant Resolution**: Fuzzy match merchant entity
4. **Deduplication**: Check hash against existing deals
5. **Verification Check**: Queue if suspicious
6. **Event Publishing**: Emit `deal.created` event
7. **Notification Processing**: Evaluate user subscriptions
8. **Cache Update**: Store for offline access
9. **Analytics**: Track initial view

### Deal Update Flow
1. **Change Detection**: Compare with existing deal
2. **Event Publishing**: Emit `deal.updated` event with changes
3. **Priority Boost**: Price drops get instant notifications
4. **Cache Invalidation**: Update cached version
5. **Analytics**: Track update engagement

### Notification Flow
1. **Event Received**: Deal change event arrives
2. **Filter Users**: Match preferences and interests
3. **Calculate Value**: Score deal importance
4. **Check Fatigue**: Verify notification limits
5. **Determine Strategy**: Instant vs batch vs digest
6. **Respect Timing**: Apply quiet hours
7. **Send Notification**: Push/email/batch queue
8. **Track Delivery**: Log notification event

## Configuration

### Orchestrator Options
```javascript
{
    enablePolling: true,
    enableNotifications: true,
    enableAnalytics: true,
    enableQualityControl: true,
    pollingInterval: 5000, // milliseconds
}
```

### User Preferences
```javascript
{
    userId: 'user123',
    categories: ['technology', 'fashion'],
    merchants: ['merchant_apple', 'merchant_nike'],
    campusId: 'campus_stanford',
    minDiscountPercentage: 15,
    notificationChannels: ['push', 'email'],
    quietHours: { start: 22, end: 7 },
    maxDailyNotifications: 10,
    maxWeeklyNotifications: 50
}
```

### Circuit Breaker Options
```javascript
{
    threshold: 5,        // failures before opening
    timeout: 60000,      // milliseconds
    halfOpenAttempts: 3  // attempts in half-open state
}
```

## Performance Characteristics

### Latency Targets
- **Webhook to notification**: ~500ms
- **Polled source to notification**: ~2 minutes
- **Event processing**: <100ms per event
- **Deduplication check**: <10ms

### Scalability
- **Event history**: Configurable (default 1000)
- **Cache size**: Limited by LocalStorage (~5-10MB)
- **Concurrent connections**: Browser-dependent
- **Polling frequency**: Adaptive (10min - 24hr)

## Monitoring & Observability

### Key Metrics
- Events processed (total, by type)
- Active WebSocket connections
- Verification queue size
- System health percentage
- Provider circuit breaker states
- Notification delivery rate
- Cache hit/miss ratio

### Event Types
- `deal.created` - New deal added
- `deal.updated` - Deal modified
- `deal.expired` - Deal no longer valid
- `deal.verified` - Manual verification complete
- `deal.auto_expired` - Auto-expired due to reports
- `deal.verification_queued` - Added to verification
- `deal.tested` - Automated test completed
- `deal.viewed` - User viewed deal
- `deal.clicked` - User clicked deal
- `deal.redeemed` - User redeemed deal
- `deal.user_report` - User reported deal status
- `notification.sent` - Notification delivered

## Security Considerations

### Input Validation
- Event schema validation before processing
- Deal attribute sanitization
- User preference validation

### Rate Limiting
- Provider-specific rate limits enforced
- User notification caps (daily/weekly)
- Circuit breakers prevent retry storms

### Data Privacy
- User preferences stored locally
- No external data transmission in demo
- Campus/location data pseudonymized

## Testing Strategy

### Unit Tests
- Deal deduplication logic
- Merchant fuzzy matching
- Notification value calculation
- Circuit breaker state transitions

### Integration Tests
- End-to-end event flow
- Multi-user notification scenarios
- Provider failure handling
- Cache synchronization

### Chaos Tests
- Random event delays/drops
- Provider outage simulation
- Traffic spike handling
- Concurrent connection stress

## Future Enhancements

### Phase 1: Backend Integration
- Replace LocalStorage with PostgreSQL
- Implement Redis for caching
- Add Elasticsearch for search
- Deploy actual WebSockets

### Phase 2: Advanced Features
- Machine learning for deal ranking
- Predictive notification timing
- A/B testing framework
- Geographic clustering

### Phase 3: Scale & Performance
- Kafka event bus
- Distributed caching
- Multi-region deployment
- CDN edge caching

## Usage Examples

See `deal-system-demo.html` for interactive examples and live demonstrations of all features.

## References

- Event Schema Registry pattern
- Circuit Breaker pattern (Martin Fowler)
- Adaptive polling strategies
- Notification fatigue research
- Fuzzy matching algorithms (Levenshtein distance)
