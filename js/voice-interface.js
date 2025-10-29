class VoiceInterface {
  constructor(apiClient, chatModal) {
    this.apiClient = apiClient;
    this.chatModal = chatModal;
    this.isRecording = false;
    this.isPlaying = false;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.audioContext = null;
    this.recognition = null;
    this.voicePanel = null;
    
    this.initVoiceRecognition();
    this.createVoiceUI();
  }

  initVoiceRecognition() {
    // Check if browser supports speech recognition
    console.log('Initializing voice recognition...');
    console.log('SpeechRecognition available:', 'SpeechRecognition' in window);
    console.log('webkitSpeechRecognition available:', 'webkitSpeechRecognition' in window);
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        console.log('Speech recognition started');
        this.showVoiceStatus('Listening... Speak now');
      };

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('Voice input:', transcript);
        this.handleVoiceInput(transcript);
      };

      this.recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        this.showVoiceError(`Speech recognition failed: ${event.error}`);
        this.isRecording = false;
        this.updateVoiceButton();
      };

      this.recognition.onend = () => {
        console.log('Speech recognition ended');
        this.isRecording = false;
        this.updateVoiceButton();
      };
      
      console.log('Voice recognition initialized successfully');
    } else {
      console.error('Speech recognition not supported in this browser');
      this.showVoiceError('Voice recognition not supported in this browser. Please use Chrome or Edge.');
      this.createFallbackUI();
    }
  }

  createVoiceUI() {
    // Create voice control panel
    this.voicePanel = document.createElement('div');
    this.voicePanel.className = 'voice-panel flex items-center gap-2 p-4 bg-blue-50 border-t border-blue-200';
    this.voicePanel.style.minHeight = '60px';
    this.voicePanel.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium text-blue-800">Voice Commands:</span>
        <button id="voice-toggle" class="voice-btn flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17a1 1 0 102 0v-2.07z" clip-rule="evenodd"></path>
          </svg>
          <span class="voice-btn-text">Speak</span>
        </button>
        <button id="voice-stop" class="voice-btn hidden flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path>
          </svg>
          <span>Stop</span>
        </button>
      </div>
      <div id="voice-status" class="voice-status text-sm text-blue-600 ml-auto"></div>
    `;

    console.log('Voice UI created:', this.voicePanel);
    this.bindVoiceEvents();
  }

  addVoicePanelToModal() {
    // Add voice panel to chat modal when modal is opened
    const chatModal = document.getElementById('chat-modal');
    console.log('Adding voice panel to modal:', chatModal, this.voicePanel);
    
    if (chatModal && this.voicePanel) {
      // Check if voice panel is already added
      if (!chatModal.querySelector('.voice-panel')) {
        chatModal.appendChild(this.voicePanel);
        console.log('Voice panel added successfully');
        
        // Make sure the panel is visible
        this.voicePanel.style.display = 'flex';
        this.voicePanel.style.visibility = 'visible';
        
        // Test if buttons are clickable
        const speakBtn = document.getElementById('voice-toggle');
        const stopBtn = document.getElementById('voice-stop');
        console.log('Speak button found:', speakBtn);
        console.log('Stop button found:', stopBtn);
        
        if (speakBtn) {
          console.log('Adding click listener to speak button');
          speakBtn.addEventListener('click', () => {
            console.log('Speak button clicked!');
            this.toggleRecording();
          });
        }
        
        if (stopBtn) {
          console.log('Adding click listener to stop button');
          stopBtn.addEventListener('click', () => {
            console.log('Stop button clicked!');
            this.stopRecording();
          });
        }
      } else {
        console.log('Voice panel already exists');
      }
    } else {
      console.log('Chat modal or voice panel not found');
      console.log('Chat modal:', chatModal);
      console.log('Voice panel:', this.voicePanel);
    }
  }

  bindVoiceEvents() {
    const voiceToggle = document.getElementById('voice-toggle');
    const voiceStop = document.getElementById('voice-stop');

    if (voiceToggle) {
      voiceToggle.addEventListener('click', () => this.toggleRecording());
    }

    if (voiceStop) {
      voiceStop.addEventListener('click', () => this.stopRecording());
    }
  }

  toggleRecording() {
    if (this.isRecording) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  }

  startRecording() {
    console.log('Starting voice recording...');
    console.log('Recognition object:', this.recognition);
    console.log('Is recording:', this.isRecording);
    
    if (!this.recognition) {
      console.error('Voice recognition not available');
      this.showVoiceError('Voice recognition not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (this.isRecording) {
      console.log('Already recording, stopping first');
      this.stopRecording();
      return;
    }

    this.isRecording = true;
    this.updateVoiceButton();
    this.showVoiceStatus('Starting microphone...');
    
    try {
      console.log('Calling recognition.start()');
      this.recognition.start();
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      this.showVoiceError(`Failed to start voice recognition: ${error.message}`);
      this.isRecording = false;
      this.updateVoiceButton();
    }
  }

  stopRecording() {
    if (this.recognition && this.isRecording) {
      this.recognition.stop();
    }
    this.isRecording = false;
    this.updateVoiceButton();
    this.showVoiceStatus('');
  }

  updateVoiceButton() {
    const voiceToggle = document.getElementById('voice-toggle');
    const voiceStop = document.getElementById('voice-stop');
    const voiceBtnText = document.querySelector('.voice-btn-text');

    if (this.isRecording) {
      voiceToggle?.classList.add('hidden');
      voiceStop?.classList.remove('hidden');
      if (voiceBtnText) voiceBtnText.textContent = 'Listening...';
    } else {
      voiceToggle?.classList.remove('hidden');
      voiceStop?.classList.add('hidden');
      if (voiceBtnText) voiceBtnText.textContent = 'Speak';
    }
  }

  showVoiceStatus(message) {
    const status = document.getElementById('voice-status');
    if (status) {
      status.textContent = message;
    }
  }

  showVoiceError(message) {
    this.showVoiceStatus(`❌ ${message}`);
    setTimeout(() => this.showVoiceStatus(''), 3000);
  }

  async handleVoiceInput(transcript) {
    this.showVoiceStatus('Processing...');
    
    // Add user message to chat
    this.chatModal.addVoiceMessage('user', transcript);
    
    try {
      // Send to backend for AI response
      const response = await this.apiClient.sendMessage(transcript);
      
      if (response.success) {
        // Add AI response to chat
        this.chatModal.addVoiceMessage('ai', response.message);
        
        // Convert AI response to speech
        await this.speakResponse(response.message);
        
        // Check if user provided name and email, try to force-complete booking
        if (this.shouldTryForceComplete(transcript)) {
          setTimeout(() => {
            this.tryForceCompleteBooking();
          }, 1000); // Wait 1 second after AI response
        }
      } else {
        this.showVoiceError('Failed to get AI response');
      }
    } catch (error) {
      console.error('Error processing voice input:', error);
      this.showVoiceError('Failed to process your request');
    }
  }

  shouldTryForceComplete(transcript) {
    // Check if the transcript contains name and email patterns
    const hasName = /(?:my name is|i'm|i am|call me|name is)\s+([a-zA-Z\s]+)/i.test(transcript);
    const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i.test(transcript);
    
    return hasName && hasEmail;
  }

  async tryForceCompleteBooking() {
    try {
      console.log('Attempting to force-complete booking...');
      const apiBaseURL = window.API_CONFIG ? window.API_CONFIG.getApiBaseURL() : 'https://ai-booking-backend-system.onrender.com/api';
      const response = await fetch(`${apiBaseURL}/conversation/force-complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId: this.apiClient.sessionId })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          console.log('Booking force-completed successfully!');
          // The booking completion will be handled by the backend
        } else {
          console.log('Force-complete failed:', result.message);
        }
      }
    } catch (error) {
      console.error('Error trying force-complete:', error);
    }
  }

  async speakResponse(text) {
    if (this.isPlaying) return;

    try {
      this.isPlaying = true;
      this.showVoiceStatus('AI is speaking...');

      // Try backend TTS first (better quality)
      try {
        await this.useBackendTTS(text);
      } catch (backendError) {
        console.log('Backend TTS failed, falling back to browser TTS:', backendError);
        
        // Fallback: Use Web Speech API for text-to-speech
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 0.9;
          utterance.pitch = 1;
          utterance.volume = 0.8;

          utterance.onend = () => {
            this.isPlaying = false;
            this.showVoiceStatus('');
          };

          utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event.error);
            this.isPlaying = false;
            this.showVoiceStatus('');
          };

          speechSynthesis.speak(utterance);
        } else {
          throw new Error('No TTS available');
        }
      }
    } catch (error) {
      console.error('Error with text-to-speech:', error);
      this.isPlaying = false;
      this.showVoiceStatus('');
    }
  }

  async useBackendTTS(text) {
    try {
      const apiBaseURL = window.API_CONFIG ? window.API_CONFIG.getApiBaseURL() : 'https://ai-booking-backend-system.onrender.com/api';
      const response = await fetch(`${apiBaseURL}/voice/speak`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onended = () => {
          this.isPlaying = false;
          this.showVoiceStatus('');
          URL.revokeObjectURL(audioUrl);
        };

        audio.onerror = (error) => {
          console.error('Audio playback error:', error);
          this.isPlaying = false;
          this.showVoiceStatus('');
          URL.revokeObjectURL(audioUrl);
        };

        audio.play();
      } else {
        throw new Error(`TTS request failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Backend TTS error:', error);
      this.isPlaying = false;
      this.showVoiceStatus('');
    }
  }

  // Method to enable/disable voice features
  setVoiceEnabled(enabled) {
    const voicePanel = document.querySelector('.voice-panel');
    if (voicePanel) {
      voicePanel.style.display = enabled ? 'flex' : 'none';
    }
  }

  // Create fallback UI for browsers without speech recognition
  createFallbackUI() {
    if (this.voicePanel) {
      this.voicePanel.innerHTML = `
        <div class="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
          <svg class="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
          </svg>
          <span class="text-sm text-yellow-800">Voice not supported. Please use text input above.</span>
        </div>
      `;
    }
  }

  // Clean up resources
  destroy() {
    if (this.recognition) {
      this.recognition.stop();
    }
    if (this.isPlaying) {
      speechSynthesis.cancel();
    }
  }
}

// Export for use in other files
window.VoiceInterface = VoiceInterface;
