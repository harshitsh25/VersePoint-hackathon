// Verse Point - Intelligent RAG Q&A System with Backend Integration
class VersePointApp {
    constructor() {
        this.currentUser = null;
        this.documents = [];
        this.chatHistory = [];
        this.isProcessing = false;
        this.currentModel = 'chatgpt5';
        this.settings = {
            darkMode: true,
            language: 'English',
            defaultModel: 'ChatGPT-5',
            showModelSuggestions: true,
            emailNotifications: false,
            processCompleteNotifications: true,
            saveChatHistory: true,
            shareUsageData: false
        };
        
        // Backend API configuration
        this.API_BASE = 'http://localhost:5001/api';
        this.authToken = localStorage.getItem('auth-token');
        
        // Load data from provided JSON
        this.appData = {
            appName: "Verse Point",
            demoCredentials: {
                username: "demo",
                password: "demo123",
                email: "demo@example.com"
            },
            aiModels: [
                {
                    id: "chatgpt5",
                    name: "ChatGPT-5",
                    description: "OpenAI's most advanced language model with superior reasoning and multimodal capabilities",
                    capabilities: ["Advanced reasoning", "Code generation", "Complex analysis", "Creative writing"],
                    speed: "Fast",
                    accuracy: "Highest",
                    icon: "🤖"
                },
                {
                    id: "claude",
                    name: "Claude",
                    description: "Anthropic's constitutional AI with excellent safety and helpfulness",
                    capabilities: ["Safety-focused", "Long context", "Detailed analysis", "Ethical reasoning"],
                    speed: "Medium",
                    accuracy: "Very High", 
                    icon: "🎭"
                },
                {
                    id: "gemini",
                    name: "Gemini",
                    description: "Google's multimodal AI with strong integration and search capabilities",
                    capabilities: ["Multimodal", "Search integration", "Real-time data", "Visual analysis"],
                    speed: "Fast",
                    accuracy: "High",
                    icon: "💎"
                },
                {
                    id: "perplexity",
                    name: "Perplexity",
                    description: "Research-focused AI with real-time web access and citation capabilities",
                    capabilities: ["Web search", "Real-time info", "Citations", "Research focus"],
                    speed: "Medium",
                    accuracy: "High",
                    icon: "🔍"
                }
            ],
            features: [
                {
                    icon: "📄",
                    title: "Multi-Format Upload",
                    description: "Support for PDFs, Notion exports, Wiki pages, and more document formats"
                },
                {
                    icon: "🧠",
                    title: "AI-Powered Answers",
                    description: "Get intelligent responses using advanced RAG technology with multiple AI models"
                },
                {
                    icon: "🔍",
                    title: "Smart Retrieval",
                    description: "Advanced vector search to find the most relevant information across documents"
                },
                {
                    icon: "📖",
                    title: "Source Citations",
                    description: "Every answer includes accurate citations and source references for verification"
                },
                {
                    icon: "⚡",
                    title: "Real-Time Processing",
                    description: "Fast document processing and instant question answering with minimal latency"
                },
                {
                    icon: "🔄",
                    title: "Model Switching",
                    description: "Switch between different AI models (ChatGPT-5, Claude, Gemini, Perplexity) on the fly"
                },
                {
                    icon: "💾",
                    title: "Document Management",
                    description: "Organize, track, and manage all your uploaded documents in one place"
                },
                {
                    icon: "🎯",
                    title: "Context Awareness",
                    description: "Maintains conversation context for follow-up questions and detailed discussions"
                }
            ],
            settingsOptions: [
                {
                    category: "Appearance",
                    options: [
                        {"type": "toggle", "key": "darkMode", "label": "Dark Mode", "default": true},
                        {"type": "select", "key": "language", "label": "Language", "options": ["English", "Spanish", "French", "German"], "default": "English"}
                    ]
                },
                {
                    category: "AI Models",
                    options: [
                        {"type": "select", "key": "defaultModel", "label": "Default Model", "options": ["ChatGPT-5", "Claude", "Gemini", "Perplexity"], "default": "ChatGPT-5"},
                        {"type": "toggle", "key": "showModelSuggestions", "label": "Show Model Suggestions", "default": true}
                    ]
                },
                {
                    category: "Notifications",
                    options: [
                        {"type": "toggle", "key": "emailNotifications", "label": "Email Notifications", "default": false},
                        {"type": "toggle", "key": "processCompleteNotifications", "label": "Processing Complete Alerts", "default": true}
                    ]
                },
                {
                    category: "Privacy",
                    options: [
                        {"type": "toggle", "key": "saveChatHistory", "label": "Save Chat History", "default": true},
                        {"type": "toggle", "key": "shareUsageData", "label": "Share Usage Analytics", "default": false}
                    ]
                }
            ]
        };

        this.init();
    }

    // API Helper Methods
    async makeAPIRequest(endpoint, options = {}) {
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            };

            if (this.authToken) {
                config.headers['Authorization'] = `Bearer ${this.authToken}`;
            }

            const response = await fetch(`${this.API_BASE}${endpoint}`, config);
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'API request failed');
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    async uploadFile(file) {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${this.API_BASE}/documents/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                },
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Upload failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Upload Error:', error);
            throw error;
        }
    }

    init() {
        this.loadTheme();
        this.loadSettings();
        
        // Check if user is logged in
        if (this.authToken) {
            this.loadUserData();
        }
        
        // Initialize immediately if DOM is ready, otherwise wait
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupEventListeners();
                this.populateContent();
                this.loadInitialData();
            });
        } else {
            setTimeout(() => {
                this.setupEventListeners();
                this.populateContent();
                this.loadInitialData();
            }, 50);
        }
    }

    async loadUserData() {
        try {
            // Load user documents
            const documentsResponse = await this.makeAPIRequest('/documents');
            this.documents = documentsResponse.documents || [];
            
            // Load chat history
            const historyResponse = await this.makeAPIRequest('/chat/history');
            this.chatHistory = historyResponse.chatHistory || [];
            
            this.renderDocuments();
            this.renderChatHistory();
        } catch (error) {
            console.error('Error loading user data:', error);
            // If token is invalid, clear it
            if (error.message.includes('403') || error.message.includes('401')) {
                this.logout();
            }
        }
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        this.attachFormEventListeners();
        this.attachKeyboardListeners();
        this.attachClickListeners();
    }

    attachFormEventListeners() {
        // Form submissions
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        const chatForm = document.getElementById('chatForm');
        const fileInput = document.getElementById('fileInput');
        const modelSelect = document.getElementById('modelSelect');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        }

        if (chatForm) {
            chatForm.addEventListener('submit', (e) => this.handleChatSubmit(e));
        }

        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }

        if (modelSelect) {
            modelSelect.addEventListener('change', (e) => this.handleModelChange(e));
        }
    }

    attachKeyboardListeners() {
        // Close modals on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
                
                // Also close mobile nav
                const navMenu = document.getElementById('navMenu');
                if (navMenu) {
                    navMenu.classList.remove('active');
                }
            }
            
            // Ctrl/Cmd + K to focus chat input
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const chatInput = document.getElementById('chatInput');
                if (chatInput) {
                    chatInput.focus();
                    this.scrollToAskQuestion();
                }
            }
        });
    }

    attachClickListeners() {
        // Close mobile nav when clicking outside
        document.addEventListener('click', (e) => {
            const navMenu = document.getElementById('navMenu');
            const navToggle = document.getElementById('navToggle');
            
            if (navMenu && navToggle && !navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                navMenu.classList.remove('active');
            }
        });
    }

    // Content Population (same as before)
    populateContent() {
        this.populateFeatures();
        this.populateModels();
    }

    populateFeatures() {
        const featuresGrid = document.getElementById('featuresGrid');
        if (!featuresGrid) return;

        featuresGrid.innerHTML = this.appData.features.map(feature => `
            <div class="feature-card">
                <div class="feature-icon">${feature.icon}</div>
                <h3>${feature.title}</h3>
                <p>${feature.description}</p>
            </div>
        `).join('');
    }

    populateModels() {
        const modelsGrid = document.getElementById('modelsGrid');
        if (!modelsGrid) return;

        modelsGrid.innerHTML = this.appData.aiModels.map(model => `
            <div class="model-card ${model.id === this.currentModel ? 'active' : ''}" 
                 data-model-id="${model.id}">
                <div class="model-icon">${model.icon}</div>
                <h3>${model.name}</h3>
                <p class="model-description">${model.description}</p>
                <div class="model-capabilities">
                    ${model.capabilities.map(cap => `<span class="capability-tag">${cap}</span>`).join('')}
                </div>
                <div class="model-stats">
                    <div class="stat">
                        <span class="stat-label">Speed</span>
                        <span class="stat-value">${model.speed}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Accuracy</span>
                        <span class="stat-value">${model.accuracy}</span>
                    </div>
                </div>
            </div>
        `).join('');

        // Add click handlers to model cards
        setTimeout(() => {
            document.querySelectorAll('.model-card').forEach(card => {
                card.addEventListener('click', () => {
                    const modelId = card.getAttribute('data-model-id');
                    if (modelId) {
                        this.selectModel(modelId);
                    }
                });
            });
        }, 100);
    }

    loadInitialData() {
        // If user is logged in, data will be loaded from loadUserData()
        if (!this.authToken) {
            // Show sample data for demo
            this.documents = [];
            this.chatHistory = [];
        }
        this.updateModelSelector();
    }

    // Navigation - These functions are called from HTML onclick attributes
    scrollToSection(sectionId) {
        console.log('Scrolling to section:', sectionId);
        const section = document.getElementById(sectionId);
        if (section) {
            const offset = 80; // Account for fixed header
            const elementPosition = section.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        } else {
            console.warn('Section not found:', sectionId);
        }
    }

    scrollToAskQuestion() {
        console.log('Scrolling to Ask Question');
        this.scrollToSection('qa-dashboard');
        // Focus on the chat input after scrolling
        setTimeout(() => {
            const chatInput = document.getElementById('chatInput');
            if (chatInput) {
                chatInput.focus();
            }
        }, 800);
    }

    // Theme Management (same as before)
    loadTheme() {
        const savedTheme = localStorage.getItem('verse-point-theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.settings.darkMode = savedTheme === 'dark';
        this.updateThemeIcon(savedTheme);
    }

    toggleTheme() {
        console.log('Toggling theme');
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('verse-point-theme', newTheme);
        this.settings.darkMode = newTheme === 'dark';
        this.updateThemeIcon(newTheme);
        this.saveSettings();
        
        this.showNotification('Theme updated successfully!', 'success');
    }

    updateThemeIcon(theme) {
        const themeIcons = document.querySelectorAll('.theme-icon');
        themeIcons.forEach(icon => {
            icon.textContent = theme === 'dark' ? '☀️' : '🌙';
        });
    }

    // Settings Management (same as before)
    loadSettings() {
        const savedSettings = localStorage.getItem('verse-point-settings');
        if (savedSettings) {
            this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
        }
    }

    saveSettings() {
        localStorage.setItem('verse-point-settings', JSON.stringify(this.settings));
    }

    openSettings() {
        console.log('Opening settings');
        const settingsPanel = document.getElementById('settingsPanel');
        if (settingsPanel) {
            settingsPanel.classList.remove('hidden');
            this.populateSettings();
            setTimeout(() => this.attachSettingsListeners(), 100);
        }
    }

    closeSettings() {
        console.log('Closing settings');
        const settingsPanel = document.getElementById('settingsPanel');
        if (settingsPanel) {
            settingsPanel.classList.add('hidden');
        }
    }

    populateSettings() {
        const settingsBody = document.getElementById('settingsBody');
        if (!settingsBody) return;

        settingsBody.innerHTML = this.appData.settingsOptions.map(category => `
            <div class="settings-category">
                <h3>${category.category}</h3>
                ${category.options.map(option => this.createSettingOption(option)).join('')}
            </div>
        `).join('');
    }

    createSettingOption(option) {
        if (option.type === 'toggle') {
            const isActive = this.settings[option.key];
            return `
                <div class="settings-option">
                    <label>${option.label}</label>
                    <div class="toggle-switch ${isActive ? 'active' : ''}" 
                         data-setting-key="${option.key}">
                    </div>
                </div>
            `;
        } else if (option.type === 'select') {
            const currentValue = this.settings[option.key];
            return `
                <div class="settings-option">
                    <label>${option.label}</label>
                    <select class="form-control" data-setting-key="${option.key}">
                        ${option.options.map(opt => `
                            <option value="${opt}" ${opt === currentValue ? 'selected' : ''}>${opt}</option>
                        `).join('')}
                    </select>
                </div>
            `;
        }
        return '';
    }

    attachSettingsListeners() {
        // Attach listeners to toggle switches
        document.querySelectorAll('.toggle-switch[data-setting-key]').forEach(toggle => {
            toggle.addEventListener('click', () => {
                const key = toggle.getAttribute('data-setting-key');
                if (key) {
                    this.toggleSetting(key);
                }
            });
        });

        // Attach listeners to select dropdowns
        document.querySelectorAll('select[data-setting-key]').forEach(select => {
            select.addEventListener('change', () => {
                const key = select.getAttribute('data-setting-key');
                if (key) {
                    this.updateSetting(key, select.value);
                }
            });
        });
    }

    toggleSetting(key) {
        console.log('Toggling setting:', key);
        this.settings[key] = !this.settings[key];
        
        // Special handling for dark mode
        if (key === 'darkMode') {
            const newTheme = this.settings[key] ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('verse-point-theme', newTheme);
            this.updateThemeIcon(newTheme);
        }
        
        this.saveSettings();
        this.populateSettings();
        this.attachSettingsListeners();
        this.showNotification(`${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} updated!`, 'success');
    }

    updateSetting(key, value) {
        console.log('Updating setting:', key, value);
        this.settings[key] = value;
        this.saveSettings();
        this.showNotification(`${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} updated!`, 'success');
    }

    // Modal Management - These functions are called from HTML onclick attributes
    openLoginModal() {
        console.log('Opening login modal');
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.classList.remove('hidden');
        } else {
            console.warn('Login modal not found');
        }
    }

    closeLoginModal() {
        console.log('Closing login modal');
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    openSignupModal() {
        console.log('Opening signup modal');
        const modal = document.getElementById('signupModal');
        if (modal) {
            modal.classList.remove('hidden');
        }
        // Close login modal if open
        this.closeLoginModal();
    }

    closeSignupModal() {
        console.log('Closing signup modal');
        const modal = document.getElementById('signupModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    closeAllModals() {
        this.closeLoginModal();
        this.closeSignupModal();
        this.closeSettings();
    }

    // Authentication with Backend
    async handleLogin(event) {
        event.preventDefault();
        console.log('Handling login');
        
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        
        this.showLoading('Authenticating...');
        
        try {
            const response = await this.makeAPIRequest('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });
            
            this.authToken = response.token;
            localStorage.setItem('auth-token', this.authToken);
            this.currentUser = response.user;
            
            this.hideLoading();
            this.closeLoginModal();
            this.showNotification('Login successful! Welcome to Verse Point.', 'success');
            this.updateAuthState();
            
            // Load user data
            await this.loadUserData();
            
            // Scroll to Q&A dashboard
            setTimeout(() => {
                this.scrollToAskQuestion();
            }, 1000);
        } catch (error) {
            this.hideLoading();
            this.showNotification('Login failed: ' + error.message, 'error');
        }
    }

    async handleSignup(event) {
        event.preventDefault();
        console.log('Handling signup');
        
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const username = document.getElementById('signupUsername').value;
        const password = document.getElementById('signupPassword').value;
        
        // Basic validation
        if (password.length < 6) {
            this.showNotification('Password must be at least 6 characters long', 'error');
            return;
        }
        
        this.showLoading('Creating account...');
        
        try {
            const response = await this.makeAPIRequest('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ name, email, username, password })
            });
            
            this.authToken = response.token;
            localStorage.setItem('auth-token', this.authToken);
            this.currentUser = response.user;
            
            this.hideLoading();
            this.closeSignupModal();
            this.showNotification('Account created successfully! Welcome to Verse Point.', 'success');
            this.updateAuthState();
            
            // Load user data
            await this.loadUserData();
            
            // Scroll to Q&A dashboard
            setTimeout(() => {
                this.scrollToAskQuestion();
            }, 1000);
        } catch (error) {
            this.hideLoading();
            this.showNotification('Signup failed: ' + error.message, 'error');
        }
    }

    logout() {
        this.currentUser = null;
        this.authToken = null;
        localStorage.removeItem('auth-token');
        this.documents = [];
        this.chatHistory = [];
        this.renderDocuments();
        this.renderChatHistory();
        this.updateAuthState();
        this.showNotification('Logged out successfully', 'success');
        this.scrollToSection('home');
    }

    updateAuthState() {
        // Update UI to show user state
        if (this.currentUser) {
            this.showNotification(`Welcome, ${this.currentUser.name}!`, 'success');
        }
    }

    // Model Selection
    selectModel(modelId) {
        console.log('Selecting model:', modelId);
        this.currentModel = modelId;
        
        // Update model cards
        document.querySelectorAll('.model-card').forEach(card => {
            card.classList.remove('active');
        });
        
        const selectedCard = document.querySelector(`[data-model-id="${modelId}"]`);
        if (selectedCard) {
            selectedCard.classList.add('active');
        }
        
        // Update model selector
        this.updateModelSelector();
        
        // Save preference
        const model = this.appData.aiModels.find(m => m.id === modelId);
        if (model) {
            this.showNotification(`Switched to ${model.name}`, 'success');
            this.settings.defaultModel = model.name;
            this.saveSettings();
        }
    }

    handleModelChange(event) {
        const modelId = event.target.value;
        this.selectModel(modelId);
    }

    updateModelSelector() {
        const modelSelect = document.getElementById('modelSelect');
        if (modelSelect) {
            modelSelect.value = this.currentModel;
        }
    }

    // Document Management with Backend
    renderDocuments() {
        const documentList = document.getElementById('documentList');
        if (!documentList) return;
        
        if (this.documents.length === 0) {
            documentList.innerHTML = '<p style="color: var(--color-text-secondary); text-align: center; padding: var(--space-16);">No documents uploaded yet</p>';
            return;
        }
        
        documentList.innerHTML = this.documents.map(doc => `
            <div class="document-item">
                <div class="doc-icon">${doc.type === 'PDF' ? '📄' : '📝'}</div>
                <div class="doc-info">
                    <div class="doc-name">${doc.filename}</div>
                    <div class="doc-meta">${doc.size || 'Unknown size'} • ${doc.uploadDate || 'Unknown date'}</div>
                </div>
                <div class="doc-status ${doc.status}">${doc.status}</div>
            </div>
        `).join('');
    }

    // File Upload with Backend
    handleFileSelect(event) {
        if (!event || !event.target) return;
        const files = Array.from(event.target.files);
        this.processFiles(files);
    }

    handleDrop(event) {
        event.preventDefault();
        event.stopPropagation();
        
        const uploadArea = document.getElementById('uploadArea');
        if (uploadArea) {
            uploadArea.classList.remove('drag-over');
        }
        
        const files = Array.from(event.dataTransfer.files);
        this.processFiles(files);
    }

    handleDragOver(event) {
        event.preventDefault();
        event.stopPropagation();
        
        const uploadArea = document.getElementById('uploadArea');
        if (uploadArea) {
            uploadArea.classList.add('drag-over');
        }
    }

    processFiles(files) {
        if (!this.authToken) {
            this.showNotification('Please log in to upload files', 'error');
            return;
        }

        const validTypes = ['.pdf', '.md', '.html'];
        const validFiles = files.filter(file => {
            const extension = '.' + file.name.split('.').pop().toLowerCase();
            return validTypes.includes(extension);
        });
        
        if (validFiles.length === 0) {
            this.showNotification('Please select valid files (PDF, MD, HTML)', 'error');
            return;
        }
        
        validFiles.forEach(file => {
            this.uploadFileToBackend(file);
        });
    }

    async uploadFileToBackend(file) {
        const uploadProgress = document.getElementById('uploadProgress');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        if (!uploadProgress || !progressFill || !progressText) return;
        
        uploadProgress.style.display = 'block';
        progressText.textContent = `Uploading ${file.name}...`;
        
        try {
            // Simulate progress
            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += 10;
                progressFill.style.width = Math.min(progress, 90) + '%';
            }, 200);

            const response = await this.uploadFile(file);
            
            clearInterval(progressInterval);
            progressFill.style.width = '100%';
            progressText.textContent = 'Processing complete!';
            
            // Add to documents list
            this.documents.unshift(response.document);
            this.renderDocuments();
            
            setTimeout(() => {
                uploadProgress.style.display = 'none';
                progressFill.style.width = '0%';
            }, 1000);
            
            this.showNotification(`${file.name} uploaded and processed successfully!`, 'success');
            
        } catch (error) {
            uploadProgress.style.display = 'none';
            this.showNotification(`Upload failed: ${error.message}`, 'error');
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    // Chat Functionality with Backend
    renderChatHistory() {
        const chatContainer = document.getElementById('chatContainer');
        if (!chatContainer) return;
        
        chatContainer.innerHTML = '';
        
        if (this.chatHistory.length === 0) {
            chatContainer.innerHTML = `
                <div class="welcome-message" style="text-align: center; padding: var(--space-32); color: var(--color-text-secondary);">
                    <h4>Welcome to Verse Point!</h4>
                    <p>Upload some documents and start asking questions to see AI-powered answers with source citations.</p>
                </div>
            `;
            return;
        }
        
        this.chatHistory.forEach(message => {
            const messageElement = this.createMessageElement(message);
            chatContainer.appendChild(messageElement);
        });
        
        // Scroll to bottom
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message';
        
        if (message.type === 'question') {
            messageDiv.innerHTML = `
                <div class="message-question">
                    <div class="message-content">${message.content}</div>
                </div>
            `;
        } else {
            const model = this.appData.aiModels.find(m => m.id === message.model) || this.appData.aiModels[0];
            messageDiv.innerHTML = `
                <div class="message-answer">
                    <div class="message-content">${message.content}</div>
                    ${message.source ? `
                        <div class="message-source">
                            📚 ${message.source}
                            ${message.confidence ? `<span class="confidence-score">${Math.round(message.confidence * 100)}% confident</span>` : ''}
                        </div>
                    ` : ''}
                    <div class="message-model" style="font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-top: var(--space-8);">
                        ${model.icon} Answered by ${model.name}
                    </div>
                </div>
            `;
        }
        
        return messageDiv;
    }

    async handleChatSubmit(event) {
        event.preventDefault();
        
        if (this.isProcessing) return;
        
        if (!this.authToken) {
            this.showNotification('Please log in to ask questions', 'error');
            return;
        }
        
        const chatInput = document.getElementById('chatInput');
        if (!chatInput) return;
        
        const question = chatInput.value.trim();
        
        if (!question) return;
        
        if (this.documents.length === 0) {
            this.showNotification('Please upload some documents first', 'error');
            return;
        }
        
        // Add question to chat
        const questionMessage = {
            type: 'question',
            content: question,
            timestamp: new Date().toISOString(),
            model: this.currentModel
        };
        
        this.chatHistory.push(questionMessage);
        this.renderNewMessage(questionMessage);
        
        // Clear input
        chatInput.value = '';
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Process with backend
        this.isProcessing = true;
        
        try {
            const response = await this.makeAPIRequest('/chat', {
                method: 'POST',
                body: JSON.stringify({ 
                    message: question, 
                    model: this.currentModel 
                })
            });
            
            this.hideTypingIndicator();
            
            // Add AI response to chat
            const answerMessage = {
                type: 'answer',
                content: response.answer,
                source: response.sources,
                confidence: response.confidence,
                timestamp: new Date().toISOString(),
                model: this.currentModel
            };
            
            this.chatHistory.push(answerMessage);
            this.renderNewMessage(answerMessage);
            
        } catch (error) {
            this.hideTypingIndicator();
            this.showNotification(`Chat error: ${error.message}`, 'error');
        } finally {
            this.isProcessing = false;
        }
    }

    renderNewMessage(message) {
        const chatContainer = document.getElementById('chatContainer');
        if (!chatContainer) return;
        
        // Remove welcome message if it exists
        const welcomeMessage = chatContainer.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }
        
        const messageElement = this.createMessageElement(message);
        chatContainer.appendChild(messageElement);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    showTypingIndicator() {
        const chatContainer = document.getElementById('chatContainer');
        if (!chatContainer) return;
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chat-message';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <div class="message-loading">
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
                <span>AI is thinking...</span>
            </div>
        `;
        chatContainer.appendChild(typingDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    // UI Helpers (same as before)
    showLoading(message = 'Loading...') {
        const overlay = document.getElementById('loadingOverlay');
        if (!overlay) return;
        
        const text = overlay.querySelector('.loading-text');
        if (text) text.textContent = message;
        overlay.classList.remove('hidden');
    }

    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    }

    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        if (!notification) return;
        
        const icon = notification.querySelector('.notification-icon');
        const text = notification.querySelector('.notification-text');
        
        if (!icon || !text) return;
        
        // Set icon based on type
        if (type === 'success') {
            icon.textContent = '✅';
            notification.className = 'notification success';
        } else if (type === 'error') {
            icon.textContent = '❌';
            notification.className = 'notification error';
        }
        
        text.textContent = message;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 4000);
    }

    // Mobile Navigation - Called from HTML onclick attributes
    toggleNav() {
        console.log('Toggling nav');
        const navMenu = document.getElementById('navMenu');
        if (navMenu) {
            navMenu.classList.toggle('active');
        }
    }
}

// Initialize the app immediately
console.log('Initializing Verse Point app...');
window.app = new VersePointApp();

// Also handle DOM loaded event for backup
document.addEventListener('DOMContentLoaded', () => {
    if (!window.app) {
        console.log('Backup initialization of Verse Point app...');
        window.app = new VersePointApp();
    }
});

// Prevent default drag behavior on document
document.addEventListener('dragover', (e) => {
    e.preventDefault();
});

document.addEventListener('drop', (e) => {
    e.preventDefault();
});

// Handle window resize for mobile nav
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        const navMenu = document.getElementById('navMenu');
        if (navMenu) {
            navMenu.classList.remove('active');
        }
    }
});

// Smooth scroll polyfill for older browsers
if (!('scrollBehavior' in document.documentElement.style)) {
    const smoothScrollPolyfill = document.createElement('script');
    smoothScrollPolyfill.src = 'https://cdn.jsdelivr.net/gh/iamdustan/smoothscroll@master/src/smoothscroll.js';
    document.head.appendChild(smoothScrollPolyfill);
}
