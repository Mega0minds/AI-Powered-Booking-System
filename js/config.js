/**
 * API Configuration
 * Centralized configuration for backend API endpoints
 */
const API_CONFIG = {
    // Production backend URL (Render)
    PRODUCTION_URL: 'https://ai-booking-backend-system.onrender.com',
    
    // Development backend URL (localhost)
    DEVELOPMENT_URL: 'http://localhost:5000',
    
    /**
     * Get the appropriate backend URL based on environment
     * Returns Render URL in production, localhost in development
     */
    getBackendURL() {
        // Check if we're on localhost (development)
        const isLocalhost = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1' ||
                           window.location.hostname === '';
        
        // For development, you can set USE_PRODUCTION_API to false to use localhost
        const useProduction = window.USE_PRODUCTION_API !== false;
        
        // Return appropriate URL
        if (isLocalhost && !useProduction) {
            return this.DEVELOPMENT_URL;
        }
        return this.PRODUCTION_URL;
    },
    
    /**
     * Get the full API base URL
     */
    getApiBaseURL() {
        return `${this.getBackendURL()}/api`;
    }
};

// Make config available globally
window.API_CONFIG = API_CONFIG;

