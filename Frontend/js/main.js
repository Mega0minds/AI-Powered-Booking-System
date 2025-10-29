/**
 * Main JavaScript file for the AI Booking System
 * Connects the frontend with the backend API
 */

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('AI Booking System initialized');
    
    // Initialize API client
    const apiClient = new BookingAPI();
    
    // Initialize chat modal
    const chatModal = new ChatModal(apiClient);
    
    // Find the "Find Hotels" button and add click event
    const findHotelsButton = document.getElementById('find-hotels-btn');
    
    if (findHotelsButton) {
        findHotelsButton.addEventListener('click', async function(e) {
            e.preventDefault();
            console.log('Find Hotels button clicked');
            
            // Check if backend is available
            const isBackendAvailable = await apiClient.checkConnection();
            
            if (!isBackendAvailable) {
                alert('Sorry, our booking system is currently unavailable. Please try again later or contact support.');
                return;
            }
            
            // Open the chat modal
            await chatModal.open();
        });
    } else {
        console.warn('Find Hotels button not found');
    }
    
    // Also add event listener to "Book Now" button
    const bookNowButton = document.getElementById('book-now-btn');
    
    if (bookNowButton) {
        bookNowButton.addEventListener('click', async function(e) {
            e.preventDefault();
            console.log('Book Now button clicked');
            
            // Check if backend is available
            const isBackendAvailable = await apiClient.checkConnection();
            
            if (!isBackendAvailable) {
                alert('Sorry, our booking system is currently unavailable. Please try again later or contact support.');
                return;
            }
            
            // Open the chat modal
            await chatModal.open();
        });
    }
});


/**
 * Helper function to check if backend is running
 */
async function checkBackendStatus() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch('http://localhost:5000/api/health', {
            method: 'GET',
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        return response.ok;
    } catch (error) {
        console.log('Backend not available:', error);
        return false;
    }
}

/**
 * Show connection status in console
 */
async function showConnectionStatus() {
    const isConnected = await checkBackendStatus();
    console.log(`Backend connection status: ${isConnected ? 'Connected ✅' : 'Disconnected ❌'}`);
    
    if (!isConnected) {
        console.warn('Backend server is not running. Please start the backend server first.');
        console.info('To start the backend: cd Backend && npm start');
    }
}

// Check connection status when page loads
window.addEventListener('load', showConnectionStatus);
