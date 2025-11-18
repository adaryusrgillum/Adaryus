/* AI Tools Directory Controller */
const ToolsDirectory = {
    // State Management
    allTools: [],
    filteredTools: [],
    displayedTools: [],
    selectedForComparison: [],
    userHistory: [],
    currentPage: 1,
    toolsPerPage: 12,
    filters: {
        search: '',
        categories: [],
        pricing: [],
        deployment: [],
        features: [],
        compliance: []
    },
    sortBy: 'relevance',

    // Initialize
    init() {
        this.loadToolsData();
        this.bindEventListeners();
        this.initializeCharts();
        this.loadUserHistory();
        this.displayRecommendations();
        this.displayTrending();
        this.displayCommunityData();
    },

    // Load sample tools data
    loadToolsData() {
        this.allTools = [
            {
                id: 1,
                name: 'GPT-4 Turbo',
                category: 'nlp',
                description: 'Advanced language model with extended context window and multimodal capabilities. Perfect for complex reasoning, content generation, and conversational AI.',
                pricing: 'paid',
                pricingDetails: { model: 'Usage-based', pricePerToken: '$0.01/1K tokens' },
                deployment: ['api', 'cloud'],
                features: ['multimodal', 'realtime', 'customizable'],
                compliance: ['soc2', 'gdpr'],
                rating: 4.8,
                reviews: 1250,
                url: 'https://openai.com/gpt-4',
                provider: 'OpenAI',
                version: '4.0-turbo',
                lastUpdated: '2024-01-15',
                popularity: 98,
                tags: ['NLP', 'Chat', 'Code', 'Vision'],
                integrations: ['API', 'Azure', 'Plugins'],
                securityCerts: ['SOC 2', 'GDPR']
            },
            {
                id: 2,
                name: 'Claude 3 Opus',
                category: 'nlp',
                description: 'Most capable Claude model for complex analysis, longer documents, and advanced reasoning tasks with industry-leading safety features.',
                pricing: 'paid',
                pricingDetails: { model: 'Usage-based', pricePerToken: '$0.015/1K tokens' },
                deployment: ['api', 'cloud'],
                features: ['multimodal', 'realtime'],
                compliance: ['soc2', 'gdpr', 'hipaa'],
                rating: 4.9,
                reviews: 890,
                url: 'https://anthropic.com/claude',
                provider: 'Anthropic',
                version: '3.0',
                lastUpdated: '2024-03-01',
                popularity: 95,
                tags: ['NLP', 'Analysis', 'Safety', 'Long Context'],
                integrations: ['API', 'AWS', 'Google Cloud'],
                securityCerts: ['SOC 2', 'GDPR', 'HIPAA']
            },
            {
                id: 3,
                name: 'Midjourney',
                category: 'image',
                description: 'Leading AI art generator creating stunning, high-quality images from text descriptions. Ideal for creative professionals and artists.',
                pricing: 'freemium',
                pricingDetails: { model: 'Subscription', plans: ['Basic: $10/mo', 'Standard: $30/mo', 'Pro: $60/mo'] },
                deployment: ['cloud'],
                features: ['batch', 'customizable'],
                compliance: ['gdpr'],
                rating: 4.7,
                reviews: 3200,
                url: 'https://midjourney.com',
                provider: 'Midjourney Inc',
                version: '6.0',
                lastUpdated: '2024-02-20',
                popularity: 97,
                tags: ['Image Generation', 'Art', 'Design'],
                integrations: ['Discord', 'Web App'],
                securityCerts: ['GDPR']
            },
            {
                id: 4,
                name: 'GitHub Copilot',
                category: 'code',
                description: 'AI pair programmer that helps write code faster with intelligent completions and suggestions across dozens of programming languages.',
                pricing: 'freemium',
                pricingDetails: { model: 'Subscription', plans: ['Individual: $10/mo', 'Business: $19/user/mo', 'Enterprise: Custom'] },
                deployment: ['desktop', 'cloud'],
                features: ['realtime', 'integration'],
                compliance: ['soc2', 'gdpr'],
                rating: 4.6,
                reviews: 5600,
                url: 'https://github.com/features/copilot',
                provider: 'GitHub/Microsoft',
                version: '1.156',
                lastUpdated: '2024-03-10',
                popularity: 94,
                tags: ['Code', 'IDE', 'Autocomplete'],
                integrations: ['VS Code', 'JetBrains', 'Neovim'],
                securityCerts: ['SOC 2', 'GDPR']
            },
            {
                id: 5,
                name: 'Whisper',
                category: 'audio',
                description: 'Open-source automatic speech recognition system with near-human accuracy across 99 languages. Perfect for transcription and translation.',
                pricing: 'opensource',
                pricingDetails: { model: 'Free/Open Source', apiPricing: 'OpenAI API: $0.006/min' },
                deployment: ['api', 'onprem', 'cloud'],
                features: ['batch', 'customizable'],
                compliance: [],
                rating: 4.8,
                reviews: 2100,
                url: 'https://openai.com/research/whisper',
                provider: 'OpenAI',
                version: '3.0',
                lastUpdated: '2024-01-05',
                popularity: 91,
                tags: ['Speech-to-Text', 'Translation', 'Audio'],
                integrations: ['API', 'Python', 'Command Line'],
                securityCerts: []
            },
            {
                id: 6,
                name: 'Stable Diffusion XL',
                category: 'image',
                description: 'Open-source text-to-image model capable of generating high-resolution images with improved composition and face generation.',
                pricing: 'opensource',
                pricingDetails: { model: 'Free/Open Source', cloudOptions: 'Various hosting providers available' },
                deployment: ['onprem', 'cloud', 'api'],
                features: ['batch', 'customizable'],
                compliance: [],
                rating: 4.7,
                reviews: 4800,
                url: 'https://stability.ai/stable-diffusion',
                provider: 'Stability AI',
                version: '1.0',
                lastUpdated: '2023-12-15',
                popularity: 93,
                tags: ['Image Generation', 'Open Source', 'Fine-tuning'],
                integrations: ['ComfyUI', 'Automatic1111', 'Python'],
                securityCerts: []
            },
            {
                id: 7,
                name: 'Grammarly',
                category: 'nlp',
                description: 'AI-powered writing assistant that helps improve grammar, clarity, engagement, and delivery in your writing across platforms.',
                pricing: 'freemium',
                pricingDetails: { model: 'Subscription', plans: ['Free', 'Premium: $12/mo', 'Business: $15/user/mo'] },
                deployment: ['cloud', 'desktop', 'mobile'],
                features: ['realtime', 'integration'],
                compliance: ['soc2', 'gdpr'],
                rating: 4.5,
                reviews: 8900,
                url: 'https://grammarly.com',
                provider: 'Grammarly Inc',
                version: '2024.1',
                lastUpdated: '2024-03-05',
                popularity: 96,
                tags: ['Writing', 'Grammar', 'Editing'],
                integrations: ['Chrome', 'Word', 'Google Docs', 'Outlook'],
                securityCerts: ['SOC 2', 'GDPR']
            },
            {
                id: 8,
                name: 'Jasper AI',
                category: 'nlp',
                description: 'Enterprise-grade AI content platform for creating marketing copy, blog posts, social media content, and more at scale.',
                pricing: 'paid',
                pricingDetails: { model: 'Subscription', plans: ['Creator: $39/mo', 'Teams: $99/mo', 'Business: Custom'] },
                deployment: ['cloud'],
                features: ['batch', 'integration', 'customizable'],
                compliance: ['soc2', 'gdpr'],
                rating: 4.4,
                reviews: 2300,
                url: 'https://jasper.ai',
                provider: 'Jasper AI',
                version: '2.0',
                lastUpdated: '2024-02-28',
                popularity: 88,
                tags: ['Content', 'Marketing', 'Copywriting'],
                integrations: ['Surfer SEO', 'Grammarly', 'Chrome'],
                securityCerts: ['SOC 2', 'GDPR']
            },
            {
                id: 9,
                name: 'Runway ML',
                category: 'video',
                description: 'AI-powered creative suite for video editing, image generation, and multimodal content creation with cutting-edge AI models.',
                pricing: 'freemium',
                pricingDetails: { model: 'Subscription', plans: ['Free', 'Standard: $12/mo', 'Pro: $28/mo', 'Unlimited: $76/mo'] },
                deployment: ['cloud'],
                features: ['multimodal', 'realtime', 'customizable'],
                compliance: ['gdpr'],
                rating: 4.6,
                reviews: 1800,
                url: 'https://runwayml.com',
                provider: 'Runway',
                version: 'Gen-2',
                lastUpdated: '2024-03-12',
                popularity: 89,
                tags: ['Video', 'Image', 'Generative AI'],
                integrations: ['Adobe', 'Web App'],
                securityCerts: ['GDPR']
            },
            {
                id: 10,
                name: 'ChatGPT',
                category: 'chat',
                description: 'Conversational AI assistant for answering questions, writing content, coding help, and general-purpose problem solving.',
                pricing: 'freemium',
                pricingDetails: { model: 'Subscription', plans: ['Free', 'Plus: $20/mo', 'Team: $25/user/mo', 'Enterprise: Custom'] },
                deployment: ['cloud', 'mobile'],
                features: ['multimodal', 'realtime', 'integration'],
                compliance: ['soc2', 'gdpr'],
                rating: 4.7,
                reviews: 15000,
                url: 'https://chat.openai.com',
                provider: 'OpenAI',
                version: 'GPT-4',
                lastUpdated: '2024-03-15',
                popularity: 99,
                tags: ['Chat', 'Assistant', 'General Purpose'],
                integrations: ['API', 'Plugins', 'Mobile Apps'],
                securityCerts: ['SOC 2', 'GDPR']
            },
            {
                id: 11,
                name: 'Notion AI',
                category: 'nlp',
                description: 'AI assistant built into Notion workspace for writing, editing, summarizing, and organizing information seamlessly.',
                pricing: 'freemium',
                pricingDetails: { model: 'Add-on', plans: ['$10/user/mo added to Notion plan'] },
                deployment: ['cloud', 'mobile', 'desktop'],
                features: ['realtime', 'integration'],
                compliance: ['soc2', 'gdpr'],
                rating: 4.5,
                reviews: 3400,
                url: 'https://notion.so/product/ai',
                provider: 'Notion Labs',
                version: '1.0',
                lastUpdated: '2024-03-01',
                popularity: 90,
                tags: ['Writing', 'Productivity', 'Knowledge Management'],
                integrations: ['Notion', 'Web', 'Mobile'],
                securityCerts: ['SOC 2', 'GDPR']
            },
            {
                id: 12,
                name: 'ElevenLabs',
                category: 'audio',
                description: 'Advanced AI voice synthesis and speech cloning platform with natural-sounding voices in multiple languages.',
                pricing: 'freemium',
                pricingDetails: { model: 'Subscription', plans: ['Free', 'Starter: $5/mo', 'Creator: $22/mo', 'Pro: $99/mo'] },
                deployment: ['api', 'cloud'],
                features: ['realtime', 'customizable'],
                compliance: ['gdpr'],
                rating: 4.8,
                reviews: 2700,
                url: 'https://elevenlabs.io',
                provider: 'ElevenLabs',
                version: '2.0',
                lastUpdated: '2024-03-08',
                popularity: 92,
                tags: ['Voice', 'Text-to-Speech', 'Voice Cloning'],
                integrations: ['API', 'Discord', 'Zapier'],
                securityCerts: ['GDPR']
            }
        ];

        this.filteredTools = [...this.allTools];
        this.displayTools();
    },

    // Event Listeners
    bindEventListeners() {
        // Search
        const searchInput = document.getElementById('tool-search-input');
        const searchBtn = document.getElementById('search-btn');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.filters.search = searchInput.value;
                this.applyFilters();
            });
        }
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.applyFilters());
        }

        // Category filters
        document.querySelectorAll('#category-filters input').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.filters.categories.push(e.target.value);
                } else {
                    this.filters.categories = this.filters.categories.filter(c => c !== e.target.value);
                }
                this.applyFilters();
            });
        });

        // Pricing filters
        document.querySelectorAll('#pricing-filters input').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.filters.pricing.push(e.target.value);
                } else {
                    this.filters.pricing = this.filters.pricing.filter(p => p !== e.target.value);
                }
                this.applyFilters();
            });
        });

        // Deployment filters
        document.querySelectorAll('#deployment-filters input').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.filters.deployment.push(e.target.value);
                } else {
                    this.filters.deployment = this.filters.deployment.filter(d => d !== e.target.value);
                }
                this.applyFilters();
            });
        });

        // Feature filters
        document.querySelectorAll('#feature-filters input').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.filters.features.push(e.target.value);
                } else {
                    this.filters.features = this.filters.features.filter(f => f !== e.target.value);
                }
                this.applyFilters();
            });
        });

        // Compliance filters
        document.querySelectorAll('#compliance-filters input').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.filters.compliance.push(e.target.value);
                } else {
                    this.filters.compliance = this.filters.compliance.filter(c => c !== e.target.value);
                }
                this.applyFilters();
            });
        });

        // Clear filters
        const clearBtn = document.getElementById('clear-filters');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearFilters());
        }

        // Sort
        const sortSelect = document.getElementById('sort-by');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortBy = e.target.value;
                this.sortTools();
                this.displayTools();
            });
        }

        // Comparison
        const startComparisonBtn = document.getElementById('start-comparison');
        if (startComparisonBtn) {
            startComparisonBtn.addEventListener('click', () => this.showComparison());
        }

        // Submit form
        const submitForm = document.getElementById('submit-tool-form');
        if (submitForm) {
            submitForm.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // Modal close
        document.querySelectorAll('[data-close-modal]').forEach(btn => {
            btn.addEventListener('click', () => this.closeModal());
        });

        // Download comparison
        const downloadBtn = document.getElementById('download-comparison');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadComparison());
        }

        // Share comparison
        const shareBtn = document.getElementById('share-comparison');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => this.shareComparison());
        }
    },

    // Apply filters
    applyFilters() {
        this.filteredTools = this.allTools.filter(tool => {
            // Search filter
            if (this.filters.search) {
                const searchLower = this.filters.search.toLowerCase();
                const matchesSearch = 
                    tool.name.toLowerCase().includes(searchLower) ||
                    tool.description.toLowerCase().includes(searchLower) ||
                    tool.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
                    tool.provider.toLowerCase().includes(searchLower);
                if (!matchesSearch) return false;
            }

            // Category filter
            if (this.filters.categories.length > 0) {
                if (!this.filters.categories.includes(tool.category)) return false;
            }

            // Pricing filter
            if (this.filters.pricing.length > 0) {
                if (!this.filters.pricing.includes(tool.pricing)) return false;
            }

            // Deployment filter
            if (this.filters.deployment.length > 0) {
                const hasDeployment = this.filters.deployment.some(d => tool.deployment.includes(d));
                if (!hasDeployment) return false;
            }

            // Features filter
            if (this.filters.features.length > 0) {
                const hasFeature = this.filters.features.some(f => tool.features.includes(f));
                if (!hasFeature) return false;
            }

            // Compliance filter
            if (this.filters.compliance.length > 0) {
                const hasCompliance = this.filters.compliance.some(c => tool.compliance.includes(c));
                if (!hasCompliance) return false;
            }

            return true;
        });

        this.sortTools();
        this.currentPage = 1;
        this.displayTools();
    },

    // Sort tools
    sortTools() {
        const sorted = [...this.filteredTools];
        
        switch (this.sortBy) {
            case 'rating':
                sorted.sort((a, b) => b.rating - a.rating);
                break;
            case 'popular':
                sorted.sort((a, b) => b.popularity - a.popularity);
                break;
            case 'recent':
                sorted.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
                break;
            case 'price-low':
                sorted.sort((a, b) => {
                    const priceOrder = { 'free': 0, 'opensource': 0, 'freemium': 1, 'paid': 2, 'enterprise': 3 };
                    return priceOrder[a.pricing] - priceOrder[b.pricing];
                });
                break;
            case 'price-high':
                sorted.sort((a, b) => {
                    const priceOrder = { 'free': 0, 'opensource': 0, 'freemium': 1, 'paid': 2, 'enterprise': 3 };
                    return priceOrder[b.pricing] - priceOrder[a.pricing];
                });
                break;
            default: // relevance
                sorted.sort((a, b) => b.popularity - a.popularity);
        }

        this.filteredTools = sorted;
    },

    // Clear all filters
    clearFilters() {
        this.filters = {
            search: '',
            categories: [],
            pricing: [],
            deployment: [],
            features: [],
            compliance: []
        };

        document.getElementById('tool-search-input').value = '';
        document.querySelectorAll('.filter-options input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });

        this.applyFilters();
    },

    // Display tools
    displayTools() {
        const grid = document.getElementById('tools-grid');
        const count = document.getElementById('count');
        
        if (!grid) return;

        // Update count
        if (count) {
            count.textContent = this.filteredTools.length;
        }

        // Pagination
        const startIndex = (this.currentPage - 1) * this.toolsPerPage;
        const endIndex = startIndex + this.toolsPerPage;
        this.displayedTools = this.filteredTools.slice(startIndex, endIndex);

        // Clear grid
        grid.innerHTML = '';

        if (this.displayedTools.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--fg-secondary); padding: 3rem;">No tools found matching your criteria. Try adjusting your filters.</p>';
            return;
        }

        // Render tools
        this.displayedTools.forEach(tool => {
            const card = this.createToolCard(tool);
            grid.appendChild(card);
        });

        // Update pagination
        this.updatePagination();
    },

    // Create tool card
    createToolCard(tool) {
        const card = document.createElement('article');
        card.className = 'tool-card';
        card.setAttribute('role', 'listitem');

        const stars = '★'.repeat(Math.round(tool.rating)) + '☆'.repeat(5 - Math.round(tool.rating));

        card.innerHTML = `
            <div class="compare-checkbox">
                <input type="checkbox" id="compare-${tool.id}" data-tool-id="${tool.id}" 
                    ${this.selectedForComparison.find(t => t.id === tool.id) ? 'checked' : ''}
                    aria-label="Add ${tool.name} to comparison">
            </div>
            <div class="tool-card-header">
                <div class="tool-logo">${tool.name.charAt(0)}</div>
            </div>
            <div class="tool-card-content">
                <h3>${tool.name}</h3>
                <span class="tool-category">${this.getCategoryLabel(tool.category)}</span>
                <p class="tool-description">${tool.description}</p>
                <div class="tool-meta">
                    <div class="tool-meta-item">
                        <span class="icon">💰</span>
                        <span class="tool-pricing">${this.getPricingLabel(tool.pricing)}</span>
                    </div>
                    <div class="tool-meta-item tool-rating">
                        <span class="stars">${stars}</span>
                        <span>${tool.rating}</span>
                        <span>(${tool.reviews})</span>
                    </div>
                </div>
                <div class="tool-tags">
                    ${tool.tags.slice(0, 4).map(tag => `<span class="tool-tag">${tag}</span>`).join('')}
                </div>
            </div>
        `;

        // Click to view details
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.compare-checkbox')) {
                this.showToolDetails(tool);
            }
        });

        // Compare checkbox
        const checkbox = card.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', (e) => {
            e.stopPropagation();
            if (e.target.checked) {
                this.addToComparison(tool);
            } else {
                this.removeFromComparison(tool.id);
            }
        });

        return card;
    },

    // Get category label
    getCategoryLabel(category) {
        const labels = {
            'nlp': 'NLP & Text',
            'cv': 'Computer Vision',
            'audio': 'Audio & Speech',
            'code': 'Code Generation',
            'chat': 'Chatbots',
            'image': 'Image Generation',
            'video': 'Video Tools',
            'analytics': 'Analytics'
        };
        return labels[category] || category;
    },

    // Get pricing label
    getPricingLabel(pricing) {
        const labels = {
            'free': 'Free',
            'freemium': 'Freemium',
            'paid': 'Paid',
            'enterprise': 'Enterprise',
            'opensource': 'Open Source'
        };
        return labels[pricing] || pricing;
    },

    // Show tool details modal
    showToolDetails(tool) {
        const modal = document.getElementById('tool-detail-modal');
        const container = document.getElementById('tool-detail-container');
        
        if (!modal || !container) return;

        const stars = '★'.repeat(Math.round(tool.rating)) + '☆'.repeat(5 - Math.round(tool.rating));

        container.innerHTML = `
            <h2 id="tool-detail-title">${tool.name}</h2>
            <p style="color: var(--fg-secondary); margin-bottom: 1rem;">${tool.provider} • Version ${tool.version}</p>
            
            <div style="display: flex; gap: 1rem; margin-bottom: 2rem;">
                <div style="background: rgba(0, 40, 85, 0.5); padding: 1rem; border-radius: 8px; flex: 1;">
                    <div style="color: var(--fg-secondary); font-size: 0.85rem;">Rating</div>
                    <div style="color: var(--accent-gold); font-size: 1.5rem;">${stars} ${tool.rating}</div>
                    <div style="color: var(--fg-secondary); font-size: 0.85rem;">${tool.reviews} reviews</div>
                </div>
                <div style="background: rgba(0, 40, 85, 0.5); padding: 1rem; border-radius: 8px; flex: 1;">
                    <div style="color: var(--fg-secondary); font-size: 0.85rem;">Pricing</div>
                    <div style="color: var(--accent-green); font-size: 1.25rem; margin: 0.5rem 0;">${this.getPricingLabel(tool.pricing)}</div>
                    <div style="color: var(--fg-secondary); font-size: 0.85rem;">${tool.pricingDetails.model}</div>
                </div>
                <div style="background: rgba(0, 40, 85, 0.5); padding: 1rem; border-radius: 8px; flex: 1;">
                    <div style="color: var(--fg-secondary); font-size: 0.85rem;">Popularity</div>
                    <div style="color: var(--accent-blue); font-size: 1.5rem;">${tool.popularity}%</div>
                    <div style="color: var(--fg-secondary); font-size: 0.85rem;">adoption rate</div>
                </div>
            </div>

            <h3 style="margin-bottom: 1rem; color: var(--accent-blue);">Description</h3>
            <p style="color: var(--fg-secondary); line-height: 1.7; margin-bottom: 2rem;">${tool.description}</p>

            <h3 style="margin-bottom: 1rem; color: var(--accent-blue);">Features</h3>
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 2rem;">
                ${tool.tags.map(tag => `<span class="tool-tag">${tag}</span>`).join('')}
            </div>

            <h3 style="margin-bottom: 1rem; color: var(--accent-blue);">Integrations</h3>
            <p style="color: var(--fg-secondary); margin-bottom: 2rem;">${tool.integrations.join(', ')}</p>

            ${tool.securityCerts.length > 0 ? `
                <h3 style="margin-bottom: 1rem; color: var(--accent-blue);">Security & Compliance</h3>
                <div style="display: flex; gap: 0.5rem; margin-bottom: 2rem;">
                    ${tool.securityCerts.map(cert => `<span class="tool-tag">${cert}</span>`).join('')}
                </div>
            ` : ''}

            <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                <a href="${tool.url}" target="_blank" class="btn btn-primary">Visit Website →</a>
                <button class="btn btn-secondary" onclick="ToolsDirectory.addToComparison(${JSON.stringify(tool).replace(/"/g, '&quot;')})">Add to Comparison</button>
            </div>
        `;

        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
    },

    // Add to comparison
    addToComparison(tool) {
        if (this.selectedForComparison.length >= 4) {
            alert('You can compare up to 4 tools at once');
            return;
        }

        if (!this.selectedForComparison.find(t => t.id === tool.id)) {
            this.selectedForComparison.push(tool);
            this.updateComparisonUI();
        }
    },

    // Remove from comparison
    removeFromComparison(toolId) {
        this.selectedForComparison = this.selectedForComparison.filter(t => t.id !== toolId);
        this.updateComparisonUI();
        
        // Update checkbox in grid
        const checkbox = document.querySelector(`#compare-${toolId}`);
        if (checkbox) checkbox.checked = false;
    },

    // Update comparison UI
    updateComparisonUI() {
        const container = document.getElementById('compare-items');
        const count = document.getElementById('compare-count');
        const btn = document.getElementById('start-comparison');

        if (count) count.textContent = this.selectedForComparison.length;
        if (btn) btn.disabled = this.selectedForComparison.length < 2;

        if (!container) return;

        container.innerHTML = this.selectedForComparison.map(tool => `
            <div class="compare-item">
                <button class="compare-item-remove" onclick="ToolsDirectory.removeFromComparison(${tool.id})" aria-label="Remove ${tool.name}">×</button>
                <strong>${tool.name}</strong>
                <p style="color: var(--fg-secondary); font-size: 0.85rem; margin-top: 0.25rem;">${tool.provider}</p>
            </div>
        `).join('');
    },

    // Show comparison modal
    showComparison() {
        if (this.selectedForComparison.length < 2) return;

        const modal = document.getElementById('comparison-modal');
        const container = document.getElementById('comparison-table-container');

        if (!modal || !container) return;

        const features = [
            { label: 'Provider', key: 'provider' },
            { label: 'Category', key: 'category', format: (v) => this.getCategoryLabel(v) },
            { label: 'Pricing Model', key: 'pricing', format: (v) => this.getPricingLabel(v) },
            { label: 'Rating', key: 'rating', format: (v) => `${v}/5.0` },
            { label: 'Reviews', key: 'reviews' },
            { label: 'Version', key: 'version' },
            { label: 'Last Updated', key: 'lastUpdated' },
            { label: 'Popularity', key: 'popularity', format: (v) => `${v}%` },
            { label: 'Deployment', key: 'deployment', format: (v) => v.join(', ') },
            { label: 'Key Features', key: 'tags', format: (v) => v.join(', ') },
        ];

        let tableHTML = '<table class="comparison-table"><thead><tr><th>Feature</th>';
        this.selectedForComparison.forEach(tool => {
            tableHTML += `<th>${tool.name}</th>`;
        });
        tableHTML += '</tr></thead><tbody>';

        features.forEach(feature => {
            tableHTML += `<tr><td><strong>${feature.label}</strong></td>`;
            this.selectedForComparison.forEach(tool => {
                const value = tool[feature.key];
                const formatted = feature.format ? feature.format(value) : value;
                tableHTML += `<td>${formatted}</td>`;
            });
            tableHTML += '</tr>';
        });

        tableHTML += '</tbody></table>';
        container.innerHTML = tableHTML;

        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
    },

    // Download comparison as CSV
    downloadComparison() {
        if (this.selectedForComparison.length < 2) return;

        let csv = 'Feature,' + this.selectedForComparison.map(t => t.name).join(',') + '\n';
        
        const features = ['provider', 'category', 'pricing', 'rating', 'reviews', 'version'];
        features.forEach(key => {
            csv += key + ',';
            csv += this.selectedForComparison.map(t => t[key]).join(',');
            csv += '\n';
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tool-comparison.csv';
        a.click();
    },

    // Share comparison
    shareComparison() {
        const toolIds = this.selectedForComparison.map(t => t.id).join(',');
        const url = `${window.location.origin}${window.location.pathname}?compare=${toolIds}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'AI Tools Comparison',
                url: url
            });
        } else {
            navigator.clipboard.writeText(url);
            alert('Comparison link copied to clipboard!');
        }
    },

    // Close modal
    closeModal() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
        });
    },

    // Update pagination
    updatePagination() {
        const container = document.getElementById('pagination');
        if (!container) return;

        const totalPages = Math.ceil(this.filteredTools.length / this.toolsPerPage);
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let html = '';
        
        // Previous button
        html += `<button ${this.currentPage === 1 ? 'disabled' : ''} onclick="ToolsDirectory.goToPage(${this.currentPage - 1})">Previous</button>`;
        
        // Page numbers
        for (let i = 1; i <= Math.min(totalPages, 10); i++) {
            html += `<button class="${i === this.currentPage ? 'active' : ''}" onclick="ToolsDirectory.goToPage(${i})">${i}</button>`;
        }
        
        // Next button
        html += `<button ${this.currentPage === totalPages ? 'disabled' : ''} onclick="ToolsDirectory.goToPage(${this.currentPage + 1})">Next</button>`;
        
        container.innerHTML = html;
    },

    // Go to page
    goToPage(page) {
        const totalPages = Math.ceil(this.filteredTools.length / this.toolsPerPage);
        if (page < 1 || page > totalPages) return;
        
        this.currentPage = page;
        this.displayTools();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    // Handle form submission
    handleSubmit(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('tool-name').value,
            url: document.getElementById('tool-url').value,
            description: document.getElementById('tool-description').value,
            category: document.getElementById('tool-category').value,
            pricing: document.getElementById('tool-pricing').value,
            features: document.getElementById('tool-features').value,
            email: document.getElementById('submitter-email').value
        };

        // Simulate submission
        alert('Thank you for your submission! Your tool will be reviewed and added to the directory soon.');
        e.target.reset();
    },

    // Initialize charts
    initializeCharts() {
        // Only initialize if Chart.js is loaded
        if (typeof Chart === 'undefined') {
            this.loadChartJS();
            return;
        }

        this.createCategoryGrowthChart();
        this.createPriceTrendsChart();
    },

    // Load Chart.js dynamically
    loadChartJS() {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
        script.onload = () => {
            this.createCategoryGrowthChart();
            this.createPriceTrendsChart();
        };
        document.head.appendChild(script);
    },

    // Create category growth chart
    createCategoryGrowthChart() {
        const canvas = document.getElementById('category-growth-chart');
        if (!canvas || typeof Chart === 'undefined') return;

        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: ['NLP', 'Image Gen', 'Code', 'Chat', 'Audio', 'Video'],
                datasets: [{
                    label: 'Growth Rate (%)',
                    data: [45, 38, 52, 41, 35, 48],
                    backgroundColor: 'rgba(56, 189, 248, 0.6)',
                    borderColor: 'rgba(56, 189, 248, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    },

    // Create price trends chart
    createPriceTrendsChart() {
        const canvas = document.getElementById('price-trends-chart');
        if (!canvas || typeof Chart === 'undefined') return;

        new Chart(canvas, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Avg Price ($)',
                    data: [25, 28, 26, 30, 29, 32],
                    borderColor: 'rgba(234, 170, 0, 1)',
                    backgroundColor: 'rgba(234, 170, 0, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                }
            }
        });
    },

    // Display trending tools
    displayTrending() {
        const container = document.getElementById('trending-tools');
        if (!container) return;

        const trending = [...this.allTools]
            .sort((a, b) => b.popularity - a.popularity)
            .slice(0, 5);

        container.innerHTML = trending.map((tool, index) => `
            <div class="trending-item">
                <div class="trending-rank">${index + 1}</div>
                <div class="trending-info">
                    <h4>${tool.name}</h4>
                    <p class="trending-stat">
                        <span class="trend-up">↑ ${tool.popularity}%</span> adoption
                    </p>
                </div>
            </div>
        `).join('');
    },

    // Display community data
    displayCommunityData() {
        this.displayLeaderboard();
        this.displayRecentReviews();
        this.displayQA();
        this.displayUseCases();
    },

    // Display leaderboard
    displayLeaderboard() {
        const container = document.getElementById('leaderboard');
        if (!container) return;

        const contributors = [
            { name: 'Sarah Chen', score: 2850, initials: 'SC' },
            { name: 'Alex Kumar', score: 2340, initials: 'AK' },
            { name: 'Maria Garcia', score: 1980, initials: 'MG' },
            { name: 'John Smith', score: 1720, initials: 'JS' },
            { name: 'Lisa Wang', score: 1590, initials: 'LW' }
        ];

        container.innerHTML = contributors.map((c, i) => `
            <div class="leaderboard-item">
                <div class="leaderboard-rank">${i + 1}</div>
                <div class="leaderboard-avatar">${c.initials}</div>
                <div class="leaderboard-info">
                    <div class="leaderboard-name">${c.name}</div>
                    <div class="leaderboard-score">${c.score} points</div>
                </div>
            </div>
        `).join('');
    },

    // Display recent reviews
    displayRecentReviews() {
        const container = document.getElementById('recent-reviews');
        if (!container) return;

        const reviews = [
            { author: 'Mike J.', rating: 5, text: 'GPT-4 Turbo has been a game-changer for our content workflow. Highly recommended!', tool: 'GPT-4 Turbo' },
            { author: 'Emma R.', rating: 5, text: 'Claude 3 Opus excels at complex analysis tasks. The safety features are top-notch.', tool: 'Claude 3 Opus' },
            { author: 'David L.', rating: 4, text: 'Midjourney creates stunning artwork, though the learning curve is steep.', tool: 'Midjourney' }
        ];

        container.innerHTML = reviews.map(r => `
            <div class="review-item">
                <div class="review-header">
                    <span class="review-author">${r.author}</span>
                    <span class="review-rating">${'★'.repeat(r.rating)}</span>
                </div>
                <p class="review-text">${r.text}</p>
            </div>
        `).join('');
    },

    // Display Q&A
    displayQA() {
        const container = document.getElementById('qa-section');
        if (!container) return;

        const questions = [
            { author: 'Tom B.', text: 'What\'s the best AI tool for beginners?', answers: 15 },
            { author: 'Rachel M.', text: 'How do I choose between GPT-4 and Claude for my use case?', answers: 23 },
            { author: 'Chris P.', text: 'Are there any good open-source alternatives to Midjourney?', answers: 31 }
        ];

        container.innerHTML = questions.map(q => `
            <div class="qa-item">
                <div class="qa-header">
                    <span class="qa-author">${q.author}</span>
                    <span style="color: var(--accent-blue); font-size: 0.85rem;">${q.answers} answers</span>
                </div>
                <p class="qa-text">${q.text}</p>
            </div>
        `).join('');
    },

    // Display use cases word cloud
    displayUseCases() {
        const container = document.getElementById('use-cases-cloud');
        if (!container) return;

        const useCases = [
            'Content Creation', 'Code Generation', 'Image Generation', 'Data Analysis',
            'Customer Support', 'Translation', 'Summarization', 'Research',
            'Design', 'Marketing', 'Education', 'Automation'
        ];

        container.innerHTML = useCases.map(useCase => 
            `<span class="cloud-word" style="font-size: ${0.9 + Math.random() * 0.6}rem;">${useCase}</span>`
        ).join('');
    },

    // Display recommendations
    displayRecommendations() {
        const container = document.getElementById('recommended-tools');
        if (!container) return;

        // Simple recommendation: highest rated tools
        const recommended = [...this.allTools]
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 6);

        container.innerHTML = '';
        recommended.forEach(tool => {
            const card = this.createToolCard(tool);
            container.appendChild(card);
        });
    },

    // Load user history from localStorage
    loadUserHistory() {
        const history = localStorage.getItem('adaryus-tools-history');
        if (history) {
            this.userHistory = JSON.parse(history);
        }
    },

    // Save to history
    saveToHistory(toolId) {
        if (!this.userHistory.includes(toolId)) {
            this.userHistory.push(toolId);
            localStorage.setItem('adaryus-tools-history', JSON.stringify(this.userHistory));
        }
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (document.body.dataset.page === 'tools') {
            ToolsDirectory.init();
        }
    });
} else {
    if (document.body.dataset.page === 'tools') {
        ToolsDirectory.init();
    }
}
