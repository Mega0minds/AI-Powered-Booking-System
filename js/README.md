# Frontend-Backend Integration Guide

## How to Test the AI Booking System

### 1. Start the Backend Server

First, make sure your backend server is running:

```bash
cd Backend
npm install
npm start
```

The backend will start on `http://localhost:5000`

### 2. Open the Frontend

Open the `Frontend/index.html` file in your browser. You can:
- Double-click the file to open it in your default browser
- Or use a local server (recommended for development)

### 3. Test the Integration

1. **Click the "Find Hotels" button** in the search widget
2. **Or click the "Book Now" button** in the promotional section

Both buttons will:
- Check if the backend is available
- Open a chat modal
- Start a conversation with the AI booking assistant

### 4. Chat with the AI Assistant

Once the modal opens, you can:
- Ask about destinations: "I want to go to Paris"
- Specify dates: "I need a room for October 15-17"
- Ask about preferences: "I want a luxury hotel with a spa"
- Ask questions: "What hotels do you recommend in New York?"

### 5. Expected Behavior

- **Backend Available**: Chat modal opens and AI responds
- **Backend Unavailable**: Shows an alert message

### 6. Troubleshooting

If the chat modal doesn't open:
1. Check browser console for errors
2. Make sure backend is running on port 5000
3. Check if CORS is properly configured
4. Verify all JavaScript files are loaded

### 7. File Structure

```
Frontend/
├── index.html          # Main HTML file
├── js/
│   ├── api-client.js   # API communication
│   ├── chat-modal.js   # Chat interface
│   ├── main.js         # Main integration logic
│   └── README.md       # This file
```

### 8. API Endpoints Used

- `POST /api/conversation/start` - Start new conversation
- `POST /api/conversation/message` - Send message to AI
- `GET /api/health` - Check backend status

### 9. Browser Compatibility

This integration works with modern browsers that support:
- ES6+ JavaScript features
- Fetch API
- CSS Grid and Flexbox
- Tailwind CSS classes
