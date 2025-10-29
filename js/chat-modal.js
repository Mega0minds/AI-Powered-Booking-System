/**
 * Chat Modal for AI Booking Assistant
 */
class ChatModal {
    constructor(apiClient) {
        this.apiClient = apiClient;
        this.isOpen = false;
        this.isTyping = false;
        this.conversationStarted = false;
        this.voiceInterface = null;
        
        this.createModal();
        this.bindEvents();
    }

    /**
     * Create the modal HTML structure
     */
    createModal() {
        // Create modal backdrop
        const backdrop = document.createElement('div');
        backdrop.id = 'chat-modal-backdrop';
        backdrop.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 hidden';
        
        // Create modal container
        const modal = document.createElement('div');
        modal.id = 'chat-modal';
        modal.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl w-11/12 max-w-2xl h-5/6 max-h-[600px] min-h-[400px] sm:min-h-[500px] flex flex-col z-50 hidden';
        
        // Create modal header
        const header = document.createElement('div');
        header.className = 'bg-gray-800 text-white p-4 rounded-t-lg flex justify-between items-center';
        header.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <i class="bi bi-robot text-white text-sm"></i>
                </div>
                <div>
                    <h3 class="font-semibold text-lg">AI Booking Assistant</h3>
                    <p class="text-xs text-gray-300">Let me help you find the perfect hotel</p>
                </div>
            </div>
            <button id="close-chat-modal" class="text-gray-300 hover:text-white transition-colors">
                <i class="bi bi-x-lg text-xl"></i>
            </button>
        `;
        
        // Create chat messages container
        const messagesContainer = document.createElement('div');
        messagesContainer.id = 'chat-messages';
        messagesContainer.className = 'flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50';
        
        // Create typing indicator
        const typingIndicator = document.createElement('div');
        typingIndicator.id = 'typing-indicator';
        typingIndicator.className = 'hidden flex items-center gap-2 text-gray-500 text-sm';
        typingIndicator.innerHTML = `
            <div class="flex space-x-1">
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
            </div>
            <span>AI is typing...</span>
        `;
        
        // Create input area
        const inputArea = document.createElement('div');
        inputArea.className = 'p-4 bg-white border-t border-gray-200 rounded-b-lg';
        inputArea.innerHTML = `
            <div class="flex gap-2">
                <input 
                    type="text" 
                    id="chat-input" 
                    placeholder="Type your message here..." 
                    class="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    disabled
                />
                <button 
                    id="send-message-btn" 
                    class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center min-w-[44px]"
                    disabled
                >
                    <i class="bi bi-send text-lg"></i>
                </button>
            </div>
            <div class="mt-2 text-xs text-gray-500 text-center px-2">
                Ask about destinations, dates, preferences, or any hotel questions
            </div>
        `;
        
        // Assemble modal
        modal.appendChild(header);
        modal.appendChild(messagesContainer);
        modal.appendChild(inputArea);
        
        // Add typing indicator to messages container
        messagesContainer.appendChild(typingIndicator);
        
        backdrop.appendChild(modal);
        document.body.appendChild(backdrop);
        
        // Store references
        this.backdrop = backdrop;
        this.modal = modal;
        this.messagesContainer = messagesContainer;
        this.typingIndicator = typingIndicator;
        this.chatInput = document.getElementById('chat-input');
        this.sendButton = document.getElementById('send-message-btn');
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Close modal events
        document.getElementById('close-chat-modal').addEventListener('click', () => this.close());
        this.backdrop.addEventListener('click', (e) => {
            if (e.target === this.backdrop) this.close();
        });

        // Send message events
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }

    /**
     * Open the chat modal and start conversation
     */
    async open() {
        this.isOpen = true;
        this.backdrop.classList.remove('hidden');
        this.modal.classList.remove('hidden');
        
        // Initialize voice interface
        this.initializeVoiceInterface();
        
        // Focus on input
        setTimeout(() => {
            this.chatInput.focus();
        }, 100);

        // Start conversation if not already started
        if (!this.conversationStarted) {
            await this.startConversation();
        }
    }

    /**
     * Close the chat modal
     */
    close() {
        this.isOpen = false;
        this.backdrop.classList.add('hidden');
        this.modal.classList.add('hidden');
        this.chatInput.blur();
        
        // Clean up voice interface
        if (this.voiceInterface) {
            this.voiceInterface.destroy();
            this.voiceInterface = null;
        }
        
        this.resetConversation();
    }

    /**
     * Reset conversation state
     */
    resetConversation() {
        this.conversationStarted = false;
        this.isTyping = false;
        this.chatInput.disabled = true;
        this.sendButton.disabled = true;
        this.apiClient.reset();
    }

    /**
     * Start a new conversation with the AI
     */
    async startConversation() {
        this.setTyping(true);
        this.clearMessages();
        this.addMessage('system', 'Starting conversation with AI assistant...');
        
        try {
            const response = await this.apiClient.startConversation();
            
            if (response.success) {
                this.conversationStarted = true;
                this.enableInput();
                this.addMessage('ai', response.message);
            } else {
                this.addMessage('error', response.message);
            }
        } catch (error) {
            this.addMessage('error', 'Failed to start conversation. Please check your connection and try again.');
        } finally {
            this.setTyping(false);
        }
    }

    /**
     * Send a user message
     */
    async sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message || this.isTyping) return;

        // Add user message to chat
        this.addMessage('user', message);
        this.chatInput.value = '';
        this.setTyping(true);

        try {
            const response = await this.apiClient.sendMessage(message);
            
            if (response.success) {
                this.addMessage('ai', response.message);
                
                // Handle booking details or hotel suggestions if present
                if (response.bookingDetails) {
                    this.handleBookingDetails(response.bookingDetails);
                }
                
                if (response.suggestedHotels && response.suggestedHotels.length > 0) {
                    this.handleHotelSuggestions(response.suggestedHotels);
                }
            } else {
                this.addMessage('error', response.message);
            }
        } catch (error) {
            this.addMessage('error', 'Failed to send message. Please try again.');
        } finally {
            this.setTyping(false);
        }
    }

    /**
     * Add a message to the chat
     */
    addMessage(type, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `flex ${type === 'user' ? 'justify-end' : 'justify-start'}`;
        
        let messageClass = '';
        let icon = '';
        
        switch (type) {
            case 'user':
                messageClass = 'bg-blue-500 text-white';
                break;
            case 'ai':
                messageClass = 'bg-white border border-gray-200';
                icon = '<div class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-2 flex-shrink-0"><i class="bi bi-robot text-white text-xs"></i></div>';
                break;
            case 'error':
                messageClass = 'bg-red-100 border border-red-300 text-red-700';
                icon = '<div class="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center mr-2 flex-shrink-0"><i class="bi bi-exclamation-triangle text-white text-xs"></i></div>';
                break;
            case 'system':
                messageClass = 'bg-gray-100 border border-gray-300 text-gray-600 text-sm';
                icon = '<div class="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center mr-2 flex-shrink-0"><i class="bi bi-info-circle text-white text-xs"></i></div>';
                break;
        }
        
        messageDiv.innerHTML = `
            <div class="max-w-xs sm:max-w-sm lg:max-w-md xl:max-w-lg">
                <div class="flex items-start gap-2">
                    ${icon}
                    <div class="${messageClass} rounded-lg px-3 py-2 break-words">
                        <p class="text-sm whitespace-pre-wrap">${this.linkify(content)}</p>
                    </div>
                </div>
                <div class="text-xs text-gray-500 mt-1 ${type === 'user' ? 'text-right' : 'text-left'}">
                    ${new Date().toLocaleTimeString()}
                </div>
            </div>
        `;
        
        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    /**
     * Handle booking details from AI response
     */
    handleBookingDetails(bookingDetails) {
        const detailsHtml = `
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                <h4 class="font-semibold text-blue-800 mb-2">Booking Details:</h4>
                <div class="text-sm text-blue-700 space-y-1">
                    ${Object.entries(bookingDetails).map(([key, value]) => 
                        `<div><strong>${this.capitalizeFirst(key)}:</strong> ${value}</div>`
                    ).join('')}
                </div>
            </div>
        `;
        
        const lastMessage = this.messagesContainer.lastElementChild;
        if (lastMessage) {
            const messageContent = lastMessage.querySelector('.rounded-lg');
            if (messageContent) {
                messageContent.innerHTML += detailsHtml;
            }
        }
    }

    /**
     * Handle hotel suggestions from AI response
     */
    handleHotelSuggestions(hotels) {
        const hotelsHtml = `
            <div class="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
                <h4 class="font-semibold text-green-800 mb-2">Suggested Hotels:</h4>
                <div class="space-y-2">
                    ${hotels.map(hotel => `
                        <div class="bg-white border border-green-300 rounded p-2">
                            <div class="font-medium text-green-800">${hotel.name}</div>
                            <div class="text-sm text-green-600">${hotel.location}</div>
                            <div class="text-sm text-green-700">$${hotel.pricePerNight}/night</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        const lastMessage = this.messagesContainer.lastElementChild;
        if (lastMessage) {
            const messageContent = lastMessage.querySelector('.rounded-lg');
            if (messageContent) {
                messageContent.innerHTML += hotelsHtml;
            }
        }
    }

    /**
     * Set typing indicator
     */
    setTyping(typing) {
        this.isTyping = typing;
        
        if (typing) {
            this.typingIndicator.classList.remove('hidden');
            this.sendButton.disabled = true;
            this.chatInput.disabled = true;
        } else {
            this.typingIndicator.classList.add('hidden');
            this.sendButton.disabled = false;
            this.chatInput.disabled = false;
            this.chatInput.focus();
        }
    }

    /**
     * Enable input after conversation starts
     */
    enableInput() {
        this.chatInput.disabled = false;
        this.sendButton.disabled = false;
    }

    /**
     * Clear all messages from the chat
     */
    clearMessages() {
        this.messagesContainer.innerHTML = '';
    }

    /**
     * Scroll to bottom of messages
     */
    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Convert URLs in text to clickable links
     */
    linkify(text) {
        // First escape HTML to prevent XSS
        const escaped = this.escapeHtml(text);
        
        // Convert URLs to clickable links
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return escaped.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline break-all">$1</a>');
    }

    /**
     * Capitalize first letter
     */
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Initialize voice interface
     */
    initializeVoiceInterface() {
        console.log('Initializing voice interface...');
        console.log('VoiceInterface available:', typeof VoiceInterface !== 'undefined');
        console.log('Current voice interface:', this.voiceInterface);
        
        if (typeof VoiceInterface !== 'undefined' && !this.voiceInterface) {
            console.log('Creating new VoiceInterface...');
            this.voiceInterface = new VoiceInterface(this.apiClient, this);
            console.log('VoiceInterface created:', this.voiceInterface);
            
            // Add voice panel to modal
            setTimeout(() => {
                console.log('Adding voice panel to modal...');
                this.voiceInterface.addVoicePanelToModal();
            }, 100);
        } else {
            console.log('VoiceInterface not available or already exists');
        }
    }

    /**
     * Add message method for voice interface (public access)
     */
    addVoiceMessage(type, content) {
        this.addMessage(type, content);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatModal;
}