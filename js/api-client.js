/**
 * API Client for connecting to the conversational AI booking backend
 */
class BookingAPI {
    constructor() {
        // Use centralized config for backend URL
        const backendURL = window.API_CONFIG ? window.API_CONFIG.getApiBaseURL() : 'https://ai-booking-backend-system.onrender.com/api';
        this.baseURL = backendURL;
        this.conversationId = null;
        this.isConnected = false;
    }

    /**
     * Start a new conversation with the AI booking assistant
     */
    async startConversation() {
        try {
            const response = await fetch(`${this.baseURL}/conversation/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.conversationId = data.conversationId;
            this.isConnected = true;
            
            return {
                success: true,
                message: data.message,
                conversationId: data.conversationId
            };
        } catch (error) {
            console.error('Error starting conversation:', error);
            return {
                success: false,
                message: 'Sorry, I\'m having trouble connecting to our booking system. Please try again later.',
                error: error.message
            };
        }
    }

    /**
     * Send a message to the AI assistant
     */
    async sendMessage(message) {
        if (!this.conversationId) {
            return {
                success: false,
                message: 'No active conversation. Please start a new conversation first.'
            };
        }

        try {
            const response = await fetch(`${this.baseURL}/conversation/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionId: this.conversationId,
                    message: message
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            return {
                success: true,
                message: data.message,
                bookingDetails: data.bookingDetails || null,
                suggestedHotels: data.suggestedHotels || null,
                conversationId: this.conversationId
            };
        } catch (error) {
            console.error('Error sending message:', error);
            return {
                success: false,
                message: 'Sorry, I\'m having trouble processing your request. Please try again.',
                error: error.message
            };
        }
    }

    /**
     * Search for hotels based on criteria
     */
    async searchHotels(searchCriteria) {
        try {
            const response = await fetch(`${this.baseURL}/hotels/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(searchCriteria),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            return {
                success: true,
                hotels: data.hotels || [],
                total: data.total || 0
            };
        } catch (error) {
            console.error('Error searching hotels:', error);
            return {
                success: false,
                hotels: [],
                total: 0,
                error: error.message
            };
        }
    }

    /**
     * Complete a booking
     */
    async completeBooking(bookingData) {
        if (!this.conversationId) {
            return {
                success: false,
                message: 'No active conversation. Please start a new conversation first.'
            };
        }

        try {
            const response = await fetch(`${this.baseURL}/conversation/complete-booking`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    conversationId: this.conversationId,
                    bookingData: bookingData
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            return {
                success: true,
                booking: data.booking,
                message: data.message
            };
        } catch (error) {
            console.error('Error completing booking:', error);
            return {
                success: false,
                message: 'Sorry, I\'m having trouble completing your booking. Please try again.',
                error: error.message
            };
        }
    }

    /**
     * Check if backend is available
     */
    async checkConnection() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch(`${this.baseURL}/health`, {
                method: 'GET',
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            return response.ok;
        } catch (error) {
            console.error('Backend connection check failed:', error);
            return false;
        }
    }

    /**
     * Reset the conversation
     */
    reset() {
        this.conversationId = null;
        this.isConnected = false;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BookingAPI;
}
