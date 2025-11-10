/* Adaryus Frontend Controller */
const Adaryus = {
    page: 'home',
    workflows: {},
    projects: [],
    downloads: [],
    promptPlaybooks: [],
    insights: [],
    charts: [],

    init() {
        this.page = document.body.dataset.page || 'home';
        this.defineDataModels();
        this.cacheGlobalElements();
        this.bindNav();
        this.initScrollWatcher();
        this.initParticles();
        this.animateCounters();
        this.initChatbot();
        this.initBlueprintModal();
        this.routePageInit();
    },

    defineDataModels() {
        this.workflows = {
            'content-engine': {
                label: 'Autonomous Content Engine',
                summary: 'Research, draft, and fact-check long-form content with research validation and human approvals.',
                nodes: [
                    { id: 'signals', label: 'Signals & Briefs', x: 70, y: 60, type: 'input' },
                    { id: 'research', label: 'Research Agent', x: 200, y: 150, type: 'agent' },
                    { id: 'draft', label: 'Drafting Agent', x: 340, y: 160, type: 'agent' },
                    { id: 'editor', label: 'Editing Agent', x: 470, y: 90, type: 'agent' },
                    { id: 'qa', label: 'QA Harness', x: 270, y: 300, type: 'tool' },
                    { id: 'publish', label: 'Publish & Metrics', x: 440, y: 310, type: 'output' }
                ],
                links: [
                    ['signals', 'research'],
                    ['research', 'draft'],
                    ['draft', 'editor'],
                    ['editor', 'publish'],
                    ['draft', 'qa'],
                    ['qa', 'publish']
                ],
                timeline: [
                    { title: 'Brief ingestion', description: 'NLP normalisation, KPI tagging, and audience persona mapping.' },
                    { title: 'Research agent swarm', description: 'SERP, competitor intel, and citation harvesting with deduplication.' },
                    { title: 'Autonomous drafting', description: 'Model selection and prompt routing tuned per content pillar.' },
                    { title: 'QA & publish', description: 'Hallucination sweep, human sign-off, CMS deploy, and metric logging.' }
                ],
                json: {
                    name: 'adaryus-content-engine',
                    version: '1.2.3',
                    triggers: ['schedule', 'editor-request'],
                    agents: ['researcher', 'drafter', 'editor'],
                    tools: ['serpAPI', 'notionCMS', 'perplexity'],
                    guardrails: ['citation-check', 'toxicity-filter', 'style-guide'],
                    metrics: {
                        targetLatencyMs: 180000,
                        factualityScore: '>0.94',
                        humanReview: 'Required for tier-1 clients'
                    }
                }
            },
            'customer-support': {
                label: 'Support Copilot',
                summary: 'Contextual support answers with policy-aware guardrails and auto ticket routing.',
                nodes: [
                    { id: 'webhook', label: 'Inbound Ticket', x: 80, y: 100, type: 'input' },
                    { id: 'classifier', label: 'Intent Classifier', x: 210, y: 80, type: 'tool' },
                    { id: 'retrieval', label: 'RAG Retrieval', x: 210, y: 200, type: 'tool' },
                    { id: 'copilot', label: 'Support Copilot', x: 360, y: 140, type: 'agent' },
                    { id: 'escalation', label: 'Escalation Router', x: 480, y: 220, type: 'tool' },
                    { id: 'crm', label: 'CRM Update', x: 360, y: 300, type: 'output' }
                ],
                links: [
                    ['webhook', 'classifier'],
                    ['classifier', 'copilot'],
                    ['classifier', 'retrieval'],
                    ['retrieval', 'copilot'],
                    ['copilot', 'crm'],
                    ['copilot', 'escalation']
                ],
                timeline: [
                    { title: 'Signal scoring', description: 'Real-time triage using vector similarity and priority heuristics.' },
                    { title: 'Policy aware generation', description: 'Grounded responses referencing approved policy snippets.' },
                    { title: 'Routing logic', description: 'Escalate high-risk tickets with contextual snapshots.' },
                    { title: 'Closed-loop learning', description: 'Feedback ingestion calibrates tone, product updates, and macros.' }
                ],
                json: {
                    name: 'adaryus-support-copilot',
                    version: '4.0.0',
                    integrations: ['Zendesk', 'Salesforce', 'Slack'],
                    evaluation: ['toxicity', 'bias', 'latency'],
                    alerts: {
                        onCall: 'PagerDuty',
                        anomalyDetection: 'openmetrics'
                    }
                }
            },
            analytics: {
                label: 'Analytics Command Desk',
                summary: 'Interactive analytics assistant that composes SQL, validates output, and narrates KPI shifts.',
                nodes: [
                    { id: 'request', label: 'Analyst Prompt', x: 60, y: 120, type: 'input' },
                    { id: 'planner', label: 'Query Planner', x: 200, y: 120, type: 'agent' },
                    { id: 'sql', label: 'SQL Generator', x: 340, y: 90, type: 'agent' },
                    { id: 'warehouse', label: 'Warehouse Exec', x: 340, y: 220, type: 'tool' },
                    { id: 'validator', label: 'Validator', x: 480, y: 160, type: 'tool' },
                    { id: 'story', label: 'Narrative Builder', x: 340, y: 320, type: 'agent' }
                ],
                links: [
                    ['request', 'planner'],
                    ['planner', 'sql'],
                    ['sql', 'warehouse'],
                    ['warehouse', 'validator'],
                    ['validator', 'story'],
                    ['story', 'planner']
                ],
                timeline: [
                    { title: 'Prompt parsing', description: 'Intent extraction, KPI resolution, and compliance checks.' },
                    { title: 'Plan synthesis', description: 'Multi-step SQL generation with schema-aware templating.' },
                    { title: 'Result validation', description: 'Guardrails run distribution checks plus unit comparisons.' },
                    { title: 'Narrative mode', description: 'Explain KPI shifts with charts, anomaly alerts, and next steps.' }
                ],
                json: {
                    name: 'adaryus-analytics-command-desk',
                    version: '0.9.8',
                    dataSources: ['snowflake', 'bigquery'],
                    safeguards: ['row-level security', 'query sandbox'],
                    outputs: ['insight-report', 'slack-summary', 'csv-export']
                }
            }
        };

        this.projects = [
            {
                id: 'content-engine',
                title: 'AI Content Engine',
                headline: 'Tripled output while raising editorial quality for a SaaS marketing team.',
                metrics: ['12x faster drafting', '0.98 factuality score', 'Full audit log'],
                stack: ['n8n', 'OpenAI', 'Pinecone', 'Notion'],
                blueprint: this.workflows['content-engine'].json,
                summary: 'Orchestrated research, drafting, and editing agents with automated fact checking and CMS delivery.'
            },
            {
                id: 'support-copilot',
                title: 'RAG Support Copilot',
                headline: 'Deflected 63% of tickets with confidence-based routing and policy citations.',
                metrics: ['-42% handle time', '+18 NPS', 'SOC2 aligned'],
                stack: ['LangGraph', 'pgvector', 'Zendesk'],
                blueprint: this.workflows['customer-support'].json,
                summary: 'Hybrid retrieval, structured macros, and guardrails ensure safe customer responses with instant CRM updates.'
            },
            {
                id: 'analytics-desk',
                title: 'Analytics Command Desk',
                headline: 'Automated weekly growth narratives for RevOps across 7 data sources.',
                metrics: ['90% analyst time saved', 'Automated QA', 'Narrative playbooks'],
                stack: ['dbt', 'Snowflake', 'Anthropic'],
                blueprint: this.workflows.analytics.json,
                summary: 'Agentic SQL assistants pair with validator modules to produce trustworthy metrics and recommended actions.'
            }
        ];

        this.downloads = [
            {
                id: 'architecture-pack',
                name: 'Multi-agent Architecture Guide (PDF)',
                category: 'Architecture',
                format: 'PDF',
                description: 'Design playbooks for orchestrating multi-agent systems with governance and observability layers.',
                size: '2.4 MB',
                data: '# Multi-agent Architecture\n\n- Interaction topologies\n- Routing policies\n- Evaluation harness setup\n- Observability checklist\n'
            },
            {
                id: 'crm-kit',
                name: 'Predictive CRM Workflow (JSON)',
                category: 'Workflow',
                format: 'JSON',
                description: 'Ready-to-import n8n automation for revenue teams with lead scoring and lifecycle triggers.',
                size: '56 KB',
                data: JSON.stringify({
                    name: 'crm-predictive-automation',
                    version: '1.0.0',
                    triggers: ['crm.ticket.created', 'calendar.weekly'],
                    tasks: ['score_lead', 'notify_owner', 'update_dashboard']
                }, null, 2)
            },
            {
                id: 'video-pipeline',
                name: 'Video Automation Pipeline (Notebook)',
                category: 'Media',
                format: 'IPYNB',
                description: 'Notebook outlining automated script writing, asset sourcing, and rendering pipeline.',
                size: '312 KB',
                data: '{\n  "cells": [],\n  "metadata": {"name": "video-automation"},\n  "nbformat": 4,\n  "nbformat_minor": 5\n}'
            },
            {
                id: 'api-template',
                name: 'Automation API Template (Markdown)',
                category: 'Documentation',
                format: 'MD',
                description: 'API starter kit for running automation orchestration behind secure endpoints.',
                size: '14 KB',
                data: '# Automation API Template\n\n## Authentication\n- Bearer tokens\n- HMAC signatures\n'
            },
            {
                id: 'cost-optimizer',
                name: 'Cost Optimization Playbook (PDF)',
                category: 'Operations',
                format: 'PDF',
                description: 'Strategies to reduce inference costs while maintaining SLA fidelity using smart batching and caching.',
                size: '1.1 MB',
                data: '# Cost Optimisation Guide\n\n1. Monitor usage buckets\n2. Apply dynamic model routing\n3. Cache frequent prompts\n'
            },
            {
                id: 'prompt-library-pack',
                name: 'Prompt Library Master Pack (Markdown)',
                category: 'Prompt Ops',
                format: 'MD',
                description: 'Sequenced prompt recipes for sales, customer success, and operations leadership teams.',
                size: '22 KB',
                data: '# Prompt Library Master Pack\n\n## Sales Acceleration\n- Discovery call planner\n- Executive summary drafter\n- Competitive intel synthesiser\n\n## Customer Success\n- Risk signal explainer\n- Renewal reinforcement script\n- Upsell story builder\n\n## Operations\n- Incident briefing organiser\n- Weekly KPI narrator\n- Cost variance investigator\n'
            },
            {
                id: 'revenue-copilot-blueprint',
                name: 'Revenue Copilot Blueprint (PDF)',
                category: 'Revenue',
                format: 'PDF',
                description: 'Enterprise reference architecture for pipeline acceleration copilots with executive-ready reporting.',
                size: '3.2 MB',
                data: '# Revenue Copilot Blueprint\n\n1. Signal ingestion mesh\n2. Qualification heuristics\n3. Playbook routing logic\n4. Forecast narrative templates\n'
            },
            {
                id: 'support-resilience-runbook',
                name: 'Customer Service Automation Runbook (PDF)',
                category: 'Support',
                format: 'PDF',
                description: 'Policy-aware customer support automation with escalation ladders and satisfaction recovery sequences.',
                size: '2.8 MB',
                data: '# Customer Service Automation Runbook\n\n- Tiered escalation triggers\n- Guardrail prompts\n- Conversational QA checklist\n- NPS recovery strategy\n'
            },
            {
                id: 'ops-scorecard-schema',
                name: 'Operations Scorecard Schema (JSON)',
                category: 'Operations',
                format: 'JSON',
                description: 'Normalized schema for automation performance dashboards covering quality, cost, and throughput.',
                size: '18 KB',
                data: JSON.stringify({
                    version: '1.2.0',
                    metrics: [
                        { id: 'quality_score', label: 'Quality Score', target: 0.94 },
                        { id: 'latency_p95', label: 'Latency P95', target: 220 },
                        { id: 'cost_per_run', label: 'Cost Per Run', target: 0.42 },
                        { id: 'human_override', label: 'Human Override Rate', target: 0.03 }
                    ],
                    dimensions: ['business_unit', 'region', 'use_case']
                }, null, 2)
            }
        ];

        this.promptPlaybooks = [
            {
                id: 'content-suite',
                title: 'Content Engine Agents',
                category: 'Content Ops',
                steps: ['Research Agent briefing grid', 'Drafting Agent tone adaptors', 'Editing Agent QA rubric'],
                workflow: ['Collect SERP highlights', 'Assemble structural outline', 'Draft w/ targeted voice', 'Run QA & compliance checks']
            },
            {
                id: 'rag-audit',
                title: 'RAG Quality Audit',
                category: 'Knowledge Ops',
                steps: ['Vector integrity check', 'Chunk overlap sweep', 'Metric logging prompts'],
                workflow: ['Run embedding health-check', 'Compare semantic vs keyword recall', 'Generate hallucination report']
            },
            {
                id: 'automation-discovery',
                title: 'Automation Discovery Sprint',
                category: 'Strategy',
                steps: ['Process mapping prompt', 'ROI scoring rubric', 'Risk heatmap generator'],
                workflow: ['Interview stakeholders', 'Sequence automation roadmap', 'Quantify value & risk', 'Stakeholder alignment']
            }
        ];

        this.insights = [
            {
                id: 'hallucination-sweeps',
                title: 'Hallucination sweeps that scale',
                tags: ['EvalOps', 'Safety'],
                excerpt: 'Combine retrieval proofs, counterfactual prompts, and policy checklists to keep outputs trustworthy.',
                body: 'We layer retrieval proofs, deterministic fallbacks, and rebuttal prompts to interrogate generations. Automated sweeps cover high-risk intents before human review.',
                code: 'def sweep_outputs(samples):\n    for case in samples:\n        result = run_agent(case)\n        assert result.has_sources()\n        assert result.confidence >= 0.85\n        yield log_case(result)'
            },
            {
                id: 'vector-mesh',
                title: 'Building a resilient vector mesh',
                tags: ['RAG', 'Infrastructure'],
                excerpt: 'Hybrid search, freshness scoring, and embedding diffing keep retrieval precise and fast.',
                body: 'The mesh combines semantic, keyword, and metadata filters. Freshness scores and diff alerts catch drift while pgvector replicas keep latency low.',
                code: "SELECT id, similarity FROM documents ORDER BY embedding <=> $1 LIMIT 8;"
            },
            {
                id: 'policy-layer',
                title: 'Policy-aware agent routing',
                tags: ['Governance'],
                excerpt: 'Codify policy states so each agent run respects region, audience, and compliance profiles.',
                body: 'Policy selectors evaluate intent and jurisdiction before delegating to execution agents. Violations trigger human escalation with context payloads.',
                code: 'if policy.requires_override(intent):\n    return escalate_with_context(intent, artifacts)'
            }
        ];
    },

    cacheGlobalElements() {
        this.navbar = document.getElementById('navbar');
        this.mobileToggle = document.getElementById('mobile-toggle');
        this.mobileMenu = document.getElementById('mobile-menu');
        this.blueprintModal = document.getElementById('blueprint-modal');
        this.modalTitle = document.getElementById('modal-title');
        this.modalSummary = document.getElementById('modal-summary');
        this.modalCode = document.getElementById('modal-code');
        this.canvas = document.getElementById('particle-canvas');
    },

    bindNav() {
        if (this.mobileToggle && this.mobileMenu) {
            this.mobileToggle.addEventListener('click', () => {
                this.mobileMenu.classList.toggle('active');
            });
        }
    },

    initScrollWatcher() {
        if (!this.navbar) return;
        const toggleClass = () => {
            if (window.scrollY > 32) {
                this.navbar.classList.add('scrolled');
            } else {
                this.navbar.classList.remove('scrolled');
            }
        };
        toggleClass();
        window.addEventListener('scroll', toggleClass, { passive: true });
    },

    initParticles() {
        if (!this.canvas) return;
        const context = this.canvas.getContext('2d');
        const particleCount = 42;
        const particles = Array.from({ length: particleCount }, () => this.createParticle());

        const resize = () => {
            this.canvas.width = window.innerWidth * window.devicePixelRatio;
            this.canvas.height = window.innerHeight * window.devicePixelRatio;
        };
        resize();
        window.addEventListener('resize', resize);

        const draw = () => {
            context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;
                context.beginPath();
                context.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                context.fillStyle = p.color;
                context.fill();
            });
            requestAnimationFrame(draw);
        };
        draw();
    },

    createParticle() {
        const palette = ['rgba(56, 189, 248, 0.3)', 'rgba(168, 85, 247, 0.25)', 'rgba(250, 204, 21, 0.25)'];
        return {
            x: Math.random() * window.innerWidth * window.devicePixelRatio,
            y: Math.random() * window.innerHeight * window.devicePixelRatio,
            vx: (Math.random() - 0.5) * 0.6,
            vy: (Math.random() - 0.5) * 0.6,
            r: Math.random() * 2.2 + 1.2,
            color: palette[Math.floor(Math.random() * palette.length)]
        };
    },

    animateCounters() {
        const counters = document.querySelectorAll('[data-counter]');
        counters.forEach(counter => {
            const target = Number(counter.dataset.counter);
            const suffix = counter.textContent.replace(/[0-9.]/g, '').trim();
            let start = 0;
            const duration = 1400;
            const step = timestamp => {
                if (!counter.startTime) counter.startTime = timestamp;
                const progress = Math.min((timestamp - counter.startTime) / duration, 1);
                const value = (target * progress).toFixed(target < 5 ? 1 : 0);
                counter.textContent = suffix ? `${value}${suffix}` : value;
                if (progress < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        });
    },

    initBlueprintModal() {
        if (!this.blueprintModal) return;
        const openButtons = document.querySelectorAll('[data-blueprint-trigger]');
        openButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.blueprintTrigger;
                const workflow = this.workflows[id];
                if (!workflow) return;
                this.modalTitle.textContent = workflow.label;
                this.modalSummary.textContent = workflow.summary;
                this.modalCode.textContent = JSON.stringify(workflow.json, null, 2);
                this.blueprintModal.classList.add('active');
                this.blueprintModal.setAttribute('aria-hidden', 'false');
            });
        });
        const closeButtons = this.blueprintModal.querySelectorAll('[data-close-modal]');
        closeButtons.forEach(close => close.addEventListener('click', () => this.closeModal()));
        this.blueprintModal.addEventListener('click', e => {
            if (e.target === this.blueprintModal) {
                this.closeModal();
            }
        });
    },

    closeModal() {
        if (!this.blueprintModal) return;
        this.blueprintModal.classList.remove('active');
        this.blueprintModal.setAttribute('aria-hidden', 'true');
    },

    initChatbot() {
        const toggle = document.getElementById('chatbot-toggle');
        const panel = document.getElementById('chatbot-panel');
        const body = document.getElementById('chatbot-body');
        const input = document.getElementById('chatbot-input');
        const send = document.getElementById('chatbot-send');
        if (!toggle || !panel || !body || !input || !send) return;

        const docs = [
            { id: 'retrieval', content: 'We adopt multi-store retrieval with hybrid search, citation logging, and continuous evaluation harnesses.', source: 'Retrieval Playbook' },
            { id: 'guardrails', content: 'Guardrails combine policy prompts, deterministic fallbacks, and audit logs to prevent hallucinations.', source: 'Guardrail Stack' },
            { id: 'observability', content: 'Production automations stream metrics into Grafana with anomaly detection and PagerDuty hooks.', source: 'Ops Console' },
            { id: 'evaluation', content: 'Automated evals benchmark accuracy, sentiment, and policy compliance across weekly cohorts.', source: 'Evaluation Suite' }
        ];

        const addMessage = (text, role, sources = []) => {
            const el = document.createElement('div');
            el.className = `message ${role}`;
            el.innerHTML = `<p>${text}</p>`;
            if (sources.length) {
                const list = sources.map(src => `<span>${src}</span>`).join(', ');
                const meta = document.createElement('div');
                meta.className = 'sources';
                meta.textContent = `Sources: ${list}`;
                el.appendChild(meta);
            }
            body.appendChild(el);
            body.scrollTop = body.scrollHeight;
        };

        const respond = query => {
            const terms = query.toLowerCase().split(/\W+/).filter(Boolean);
            const ranked = docs.map(doc => ({
                doc,
                score: terms.reduce((acc, term) => acc + (doc.content.includes(term) ? 1 : 0), 0)
            })).sort((a, b) => b.score - a.score);
            const top = ranked.slice(0, 2).map(item => item.doc);
            const answer = top.length
                ? `We operate a layered approach combining ${top.map(item => item.content.toLowerCase()).join(' Also, ')}`
                : 'We scope each automation with safeguards, evaluations, and human oversight to keep outcomes reliable.';
            addMessage(answer, 'ai', top.map(item => item.source));
        };

        toggle.addEventListener('click', () => {
            const expanded = panel.classList.toggle('active');
            toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        });

        const handleSend = () => {
            const value = input.value.trim();
            if (!value) return;
            addMessage(value, 'user');
            input.value = '';
            setTimeout(() => respond(value), 350);
        };

        send.addEventListener('click', handleSend);
        input.addEventListener('keydown', event => {
            if (event.key === 'Enter') {
                event.preventDefault();
                handleSend();
            }
        });

        addMessage('Hey there, need a summary of our guardrails or blueprint catalog?', 'ai', ['Welcome']);
    },

    routePageInit() {
        switch (this.page) {
            case 'home':
                this.initHome();
                break;
            case 'services':
                this.initServices();
                break;
            case 'projects':
                this.initProjects();
                break;
            case 'downloads':
                this.initDownloads();
                break;
            case 'prompts':
                this.initPrompts();
                break;
            case 'insights':
                this.initInsights();
                break;
            case 'dashboard':
                this.initDashboard();
                break;
            default:
                break;
        }
    },

    initHome() {
        if (window.Typed) {
            new window.Typed('#typed-keywords', {
                strings: ['agent workflows', 'retrieval copilots', 'automation desk ops'],
                typeSpeed: 42,
                backSpeed: 22,
                loop: true
            });
        }
        this.renderWorkflowDiagram('content-engine');
        const tabs = document.getElementById('workflow-tabs');
        if (tabs) {
            tabs.querySelectorAll('[data-workflow]').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.renderWorkflowDiagram(btn.dataset.workflow);
                });
            });
        }
    },

    renderWorkflowDiagram(id) {
        const cfg = this.workflows[id];
        const svg = document.getElementById('workflow-svg');
        const detail = document.getElementById('workflow-detail');
        if (!cfg || !svg || !detail) return;
        svg.innerHTML = '';
        const ns = 'http://www.w3.org/2000/svg';
        cfg.links.forEach(([fromId, toId]) => {
            const from = cfg.nodes.find(n => n.id === fromId);
            const to = cfg.nodes.find(n => n.id === toId);
            if (!from || !to) return;
            const line = document.createElementNS(ns, 'line');
            line.setAttribute('x1', from.x);
            line.setAttribute('y1', from.y);
            line.setAttribute('x2', to.x);
            line.setAttribute('y2', to.y);
            line.setAttribute('stroke', 'rgba(56, 189, 248, 0.35)');
            line.setAttribute('stroke-width', '2');
            line.setAttribute('stroke-linecap', 'round');
            svg.appendChild(line);
        });
        cfg.nodes.forEach(node => {
            const circle = document.createElementNS(ns, 'circle');
            circle.setAttribute('cx', node.x);
            circle.setAttribute('cy', node.y);
            circle.setAttribute('r', 22);
            circle.setAttribute('fill', this.nodeFill(node.type));
            circle.setAttribute('stroke', 'rgba(56, 189, 248, 0.45)');
            circle.setAttribute('stroke-width', '2');
            svg.appendChild(circle);

            const text = document.createElementNS(ns, 'text');
            text.setAttribute('x', node.x);
            text.setAttribute('y', node.y + 40);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('fill', '#cbd5f5');
            text.setAttribute('font-size', '12');
            text.textContent = node.label;
            svg.appendChild(text);
        });

        if (window.anime) {
            window.anime({
                targets: svg.querySelectorAll('line'),
                strokeDashoffset: [anime.setDashoffset, 0],
                easing: 'easeOutQuad',
                duration: 1200,
                delay: (el, i) => i * 80
            });
        }

        detail.innerHTML = '';
        cfg.timeline.forEach(step => {
            const item = document.createElement('div');
            item.className = 'timeline-entry';
            item.innerHTML = `<h4>${step.title}</h4><p>${step.description}</p>`;
            detail.appendChild(item);
        });
    },

    nodeFill(type) {
        switch (type) {
            case 'agent':
                return 'rgba(168, 85, 247, 0.25)';
            case 'tool':
                return 'rgba(56, 189, 248, 0.25)';
            case 'input':
                return 'rgba(250, 204, 21, 0.25)';
            case 'output':
                return 'rgba(52, 211, 153, 0.25)';
            default:
                return 'rgba(148, 163, 184, 0.25)';
        }
    },

    initServices() {
        const checklist = document.querySelector('[data-service-checklist]');
        if (!checklist) return;
        const items = [
            'Discovery sprint with process mapping and automation ROI grid.',
            'Blueprint deliverables: diagrams, prompts, runbooks, handoff docs.',
            'Pilot implementation with embedded Adaryus engineers.',
            'Observability plus evaluation harness to monitor adoption.',
            'Enablement workshops so internal teams stay autonomous.'
        ];
        checklist.innerHTML = '';
        items.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            checklist.appendChild(li);
        });
    },

    initProjects() {
        const grid = document.getElementById('project-grid');
        const modal = document.getElementById('project-modal');
        if (!grid || !modal) return;
        const list = document.createElement('div');
        list.className = 'card-grid';
        this.projects.forEach(project => {
            const card = document.createElement('article');
            card.className = 'card';
            card.innerHTML = `
                <div class="card-content">
                    <div class="card-icon">🛰️</div>
                    <h3>${project.title}</h3>
                    <p>${project.headline}</p>
                    <div class="chip-list">${project.stack.map(tech => `<span class="chip">${tech}</span>`).join('')}</div>
                    <button class="btn btn-secondary" data-project-id="${project.id}">View blueprint</button>
                </div>
            `;
            list.appendChild(card);
        });
        grid.appendChild(list);

        grid.addEventListener('click', event => {
            const button = event.target.closest('[data-project-id]');
            if (!button) return;
            const project = this.projects.find(item => item.id === button.dataset.projectId);
            if (!project) return;
            modal.querySelector('#project-modal-title').textContent = project.title;
            modal.querySelector('#project-modal-summary').textContent = project.summary;
            modal.querySelector('#project-modal-metrics').innerHTML = project.metrics.map(metric => `<li>${metric}</li>`).join('');
            modal.querySelector('#project-modal-code').textContent = JSON.stringify(project.blueprint, null, 2);
            modal.classList.add('active');
        });

        modal.addEventListener('click', event => {
            if (event.target === modal || event.target.hasAttribute('data-close-modal')) {
                modal.classList.remove('active');
            }
        });
    },

    initDownloads() {
        const list = document.getElementById('download-table-body');
        const search = document.getElementById('download-search');
        const categoryFilter = document.getElementById('download-category');
        const formatFilter = document.getElementById('download-format');
        if (!list || !search || !categoryFilter || !formatFilter) return;

        const render = () => {
            const term = search.value.toLowerCase();
            const category = categoryFilter.value;
            const format = formatFilter.value;
            list.innerHTML = '';

            const filtered = this.downloads
                .filter(item => (!term || item.name.toLowerCase().includes(term) || item.description.toLowerCase().includes(term)))
                .filter(item => (category === 'all' ? true : item.category === category))
                .filter(item => (format === 'all' ? true : item.format.toLowerCase() === format.toLowerCase()));

            if (!filtered.length) {
                const emptyRow = document.createElement('tr');
                emptyRow.className = 'download-empty';
                emptyRow.innerHTML = '<td colspan="5">No assets match these filters yet. Adjust your selection or email <a href="mailto:build@adaryus.ai">build@adaryus.ai</a>.</td>';
                list.appendChild(emptyRow);
                return;
            }

            filtered.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td data-label="Asset"><strong>${item.name}</strong><p>${item.description}</p></td>
                    <td data-label="Category">${item.category}</td>
                    <td data-label="Format">${item.format}</td>
                    <td data-label="Size">${item.size}</td>
                    <td data-label="Download"><button class="btn btn-secondary" data-download-id="${item.id}">Download</button></td>
                `;
                list.appendChild(row);
            });
        };

        const download = id => {
            const item = this.downloads.find(entry => entry.id === id);
            if (!item) return;
            const extension = item.format.toLowerCase();
            const mimeTypeMap = {
                pdf: 'application/pdf',
                json: 'application/json',
                ipynb: 'application/json',
                md: 'text/markdown'
            };
            const payload = typeof item.data === 'string' ? item.data : JSON.stringify(item.data, null, 2);
            const blob = new Blob([payload], { type: mimeTypeMap[extension] || 'text/plain' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${item.id}.${extension}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        };

        search.addEventListener('input', render);
        categoryFilter.addEventListener('change', render);
        formatFilter.addEventListener('change', render);
        document.addEventListener('click', event => {
            const button = event.target.closest('[data-download-id]');
            if (!button) return;
            download(button.dataset.downloadId);
        });

        render();
    },

    initPrompts() {
        const container = document.getElementById('prompt-grid');
        const filter = document.getElementById('prompt-filter');
        if (!container || !filter) return;

        const render = () => {
            const category = filter.value;
            container.innerHTML = '';
            this.promptPlaybooks
                .filter(playbook => (category === 'all' ? true : playbook.category === category))
                .forEach(playbook => {
                    const card = document.createElement('article');
                    card.className = 'card';
                    card.innerHTML = `
                        <div class="card-content">
                            <div class="card-icon">🧠</div>
                            <h3>${playbook.title}</h3>
                            <p>${playbook.workflow.join(' → ')}</p>
                            <ul>${playbook.steps.map(step => `<li>${step}</li>`).join('')}</ul>
                        </div>
                    `;
                    container.appendChild(card);
                });
        };

        filter.addEventListener('change', render);
        render();
    },

    initInsights() {
        const grid = document.getElementById('insight-grid');
        const modal = document.getElementById('insight-modal');
        if (!grid || !modal) return;
        this.insights.forEach(item => {
            const card = document.createElement('article');
            card.className = 'card';
            card.innerHTML = `
                <div class="card-content">
                    <div class="card-icon">📈</div>
                    <h3>${item.title}</h3>
                    <p>${item.excerpt}</p>
                    <div class="chip-list">${item.tags.map(tag => `<span class="chip">${tag}</span>`).join('')}</div>
                    <button class="btn btn-secondary" data-insight-id="${item.id}">Open insight</button>
                </div>
            `;
            grid.appendChild(card);
        });

        grid.addEventListener('click', event => {
            const button = event.target.closest('[data-insight-id]');
            if (!button) return;
            const insight = this.insights.find(entry => entry.id === button.dataset.insightId);
            if (!insight) return;
            modal.querySelector('#insight-modal-title').textContent = insight.title;
            modal.querySelector('#insight-modal-body').textContent = insight.body;
            modal.querySelector('#insight-modal-code').textContent = insight.code;
            modal.classList.add('active');
        });

        modal.addEventListener('click', event => {
            if (event.target === modal || event.target.hasAttribute('data-close-modal')) {
                modal.classList.remove('active');
            }
        });
    },

    async initDashboard() {
        const cards = document.querySelectorAll('[data-metric]');
        cards.forEach(card => {
            const trend = card.dataset.metric === 'success-rate' ? '+2.8%' : '+0.6%';
            card.querySelector('.trend').textContent = trend;
        });

        const chartContainers = document.querySelectorAll('[data-chart]');
        if (!chartContainers.length) return;
        await this.loadScript('https://cdn.jsdelivr.net/npm/chart.js');
        chartContainers.forEach(container => {
            const ctx = container.getContext('2d');
            this.charts.push(new window.Chart(ctx, this.chartConfig(container.dataset.chart)));
        });
    },

    chartConfig(type) {
        const base = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#cbd5f5' } },
                tooltip: { backgroundColor: 'rgba(15,23,42,0.9)' }
            },
            scales: {
                x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.12)' } },
                y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.12)' } }
            }
        };
        switch (type) {
            case 'pipeline-throughput':
                return {
                    type: 'line',
                    data: {
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                        datasets: [
                            {
                                label: 'Runs',
                                data: [420, 510, 620, 780, 960, 1040],
                                borderColor: '#38bdf8',
                                tension: 0.35,
                                fill: true,
                                backgroundColor: 'rgba(56, 189, 248, 0.12)'
                            }
                        ]
                    },
                    options: base
                };
            case 'cost-curve':
                return {
                    type: 'bar',
                    data: {
                        labels: ['Compute', 'Storage', 'LM APIs', 'Evaluations'],
                        datasets: [{
                            label: 'Quarterly Spend (k)',
                            data: [32, 12, 26, 6],
                            backgroundColor: ['#38bdf8', '#a855f7', '#facc15', '#34d399']
                        }]
                    },
                    options: base
                };
            case 'quality-scores':
                return {
                    type: 'radar',
                    data: {
                        labels: ['Accuracy', 'Latency', 'Coverage', 'Compliance', 'Satisfaction'],
                        datasets: [{
                            label: 'Score',
                            data: [95, 88, 92, 97, 91],
                            borderColor: '#a855f7',
                            backgroundColor: 'rgba(168, 85, 247, 0.18)'
                        }]
                    },
                    options: base
                };
            default:
                return {
                    type: 'line',
                    data: { labels: [], datasets: [] },
                    options: base
                };
        }
    },

    loadScript(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
        });
    }
};

document.addEventListener('DOMContentLoaded', () => Adaryus.init());
