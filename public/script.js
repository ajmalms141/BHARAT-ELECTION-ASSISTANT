/**
 * Bharat Election Assistant — Frontend Script
 * Handles multi-turn conversation, voice input, language toggle,
 * suggested questions, character counting, and keyboard accessibility.
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
    // ── DOM References ────────────────────────────────────────────────────────
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const voiceBtn = document.getElementById('voice-btn');
    const newChatBtn = document.getElementById('new-chat-btn');
    const suggestionsBar = document.getElementById('suggestions-bar');
    const charCounter = document.getElementById('char-counter');
    const srAnnouncer = document.getElementById('sr-announcer');
    const langEnBtn = document.getElementById('lang-en');
    const langHiBtn = document.getElementById('lang-hi');

    // ── State ─────────────────────────────────────────────────────────────────
    /** @type {Array<{role: string, parts: Array<{text: string}>}>} */
    let conversationHistory = [];
    let currentLanguage = 'en';
    let isLoading = false;

    // ── Screen Reader Announcer ───────────────────────────────────────────────
    /**
     * Announces a message to screen readers via the aria-live region.
     * @param {string} message
     */
    function announce(message) {
        srAnnouncer.textContent = '';
        setTimeout(() => { srAnnouncer.textContent = message; }, 50);
    }

    // ── Character Counter ─────────────────────────────────────────────────────
    userInput.addEventListener('input', () => {
        const count = userInput.value.length;
        charCounter.textContent = `${count}/2000`;
        charCounter.style.color = count > 1800 ? '#FF9933' : '';
    });

    // ── Language Toggle ───────────────────────────────────────────────────────
    function setLanguage(lang) {
        currentLanguage = lang;
        langEnBtn.classList.toggle('active', lang === 'en');
        langHiBtn.classList.toggle('active', lang === 'hi');
        langEnBtn.setAttribute('aria-pressed', lang === 'en');
        langHiBtn.setAttribute('aria-pressed', lang === 'hi');

        userInput.placeholder = lang === 'hi'
            ? 'चुनाव, मतदान, पंजीकरण के बारे में पूछें...'
            : 'Ask about voting, registration, EVMs, dates... (EN or हिंदी)';

        announce(lang === 'hi' ? 'हिंदी मोड सक्रिय' : 'English mode active');
    }

    langEnBtn.addEventListener('click', () => setLanguage('en'));
    langHiBtn.addEventListener('click', () => setLanguage('hi'));

    // ── Message Rendering ─────────────────────────────────────────────────────
    /**
     * Appends a message bubble to the chat box.
     * @param {'user'|'bot'} sender
     * @param {string} text - Raw text (markdown supported for bot)
     */
    function appendMessage(sender, text) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.setAttribute('role', 'article');

        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (sender === 'user') {
            messageDiv.classList.add('user-message');
            messageDiv.setAttribute('aria-label', `You said: ${text}`);
            messageDiv.innerHTML = `
                <div class="message-content">
                    <p>${escapeHtml(text)}</p>
                    <span class="timestamp" aria-label="Sent at ${timeString}">${timeString}</span>
                </div>
            `;
        } else {
            messageDiv.classList.add('bot-message');
            const parsedContent = marked.parse(text);
            messageDiv.setAttribute('aria-label', 'Assistant replied');
            messageDiv.innerHTML = `
                <div class="avatar chakra-avatar" aria-hidden="true">
                    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#fff" stroke-width="4"/>
                        <circle cx="50" cy="50" r="10" fill="#fff"/>
                        <g stroke="#fff" stroke-width="4">
                            <line x1="50" y1="50" x2="50" y2="5"/> <line x1="50" y1="50" x2="50" y2="95"/>
                            <line x1="50" y1="50" x2="5" y2="50"/> <line x1="50" y1="50" x2="95" y2="50"/>
                            <line x1="50" y1="50" x2="81.8" y2="18.2"/> <line x1="50" y1="50" x2="18.2" y2="81.8"/>
                            <line x1="50" y1="50" x2="18.2" y2="18.2"/> <line x1="50" y1="50" x2="81.8" y2="81.8"/>
                        </g>
                    </svg>
                </div>
                <div class="message-content">
                    ${parsedContent}
                    <span class="timestamp" aria-label="Received at ${timeString}">${timeString}</span>
                </div>
            `;
        }

        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
        return messageDiv;
    }

    /**
     * Escapes HTML to prevent XSS in user message display.
     * @param {string} text
     * @returns {string}
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(text));
        return div.innerHTML;
    }

    // ── Typing Indicator ──────────────────────────────────────────────────────
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.classList.add('message', 'bot-message');
        typingDiv.id = 'typing-indicator';
        typingDiv.setAttribute('aria-label', 'Assistant is typing');
        typingDiv.setAttribute('role', 'status');
        typingDiv.innerHTML = `
            <div class="avatar chakra-avatar" aria-hidden="true">
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#fff" stroke-width="4"/>
                    <circle cx="50" cy="50" r="10" fill="#fff"/>
                </svg>
            </div>
            <div class="message-content typing-indicator" aria-hidden="true">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
            </div>
        `;
        chatBox.appendChild(typingDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function removeTypingIndicator() {
        const typingDiv = document.getElementById('typing-indicator');
        if (typingDiv) typingDiv.remove();
    }

    // ── Suggested Questions ───────────────────────────────────────────────────
    /**
     * Renders clickable suggestion chips below the chat.
     * @param {string[]} suggestions
     */
    function renderSuggestions(suggestions) {
        suggestionsBar.innerHTML = '';
        if (!suggestions || suggestions.length === 0) return;

        suggestions.forEach((suggestion) => {
            const chip = document.createElement('button');
            chip.classList.add('suggestion-chip');
            chip.textContent = suggestion;
            chip.setAttribute('aria-label', `Ask: ${suggestion}`);
            chip.addEventListener('click', () => {
                userInput.value = suggestion;
                userInput.dispatchEvent(new Event('input'));
                sendMessage();
            });
            suggestionsBar.appendChild(chip);
        });
    }

    // ── Send Message ──────────────────────────────────────────────────────────
    /**
     * Sends the current user input to the backend and displays the response.
     * Maintains conversationHistory for multi-turn context.
     */
    async function sendMessage() {
        const rawMessage = userInput.value.trim();
        if (!rawMessage || isLoading) return;

        isLoading = true;
        sendBtn.disabled = true;
        sendBtn.setAttribute('aria-busy', 'true');

        // Display user message
        appendMessage('user', rawMessage);
        userInput.value = '';
        charCounter.textContent = '0/2000';
        suggestionsBar.innerHTML = '';
        showTypingIndicator();
        announce('Sending message, please wait...');

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: rawMessage,
                    history: conversationHistory,
                    language: currentLanguage,
                }),
            });

            const data = await response.json();
            removeTypingIndicator();

            if (response.ok) {
                appendMessage('bot', data.reply);
                announce('Assistant has replied.');

                // Update conversation history for multi-turn context
                conversationHistory.push(
                    { role: 'user', parts: [{ text: rawMessage }] },
                    { role: 'model', parts: [{ text: data.reply }] }
                );

                // Keep history at max 20 turns to avoid token limits
                if (conversationHistory.length > 40) {
                    conversationHistory = conversationHistory.slice(-40);
                }

                // Render suggested follow-up questions
                if (data.suggestedQuestions && data.suggestedQuestions.length > 0) {
                    renderSuggestions(data.suggestedQuestions);
                }
            } else {
                const errorMsg = `**Error:** ${data.error || 'Something went wrong. Please try again.'}`;
                appendMessage('bot', errorMsg);
                announce('An error occurred. Please try again.');
            }
        } catch (error) {
            console.error('Network error:', error);
            removeTypingIndicator();
            appendMessage('bot', '**Network Error:** Could not connect to the server. Please check your connection and try again.');
            announce('Network error. Could not connect to the server.');
        } finally {
            isLoading = false;
            sendBtn.disabled = false;
            sendBtn.setAttribute('aria-busy', 'false');
            userInput.focus();
        }
    }

    // ── New Conversation ──────────────────────────────────────────────────────
    newChatBtn.addEventListener('click', () => {
        conversationHistory = [];
        suggestionsBar.innerHTML = '';
        chatBox.innerHTML = `
            <div class="message bot-message" role="article" aria-label="Assistant message">
                <div class="avatar chakra-avatar" aria-hidden="true">
                    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#fff" stroke-width="4"/>
                        <circle cx="50" cy="50" r="10" fill="#fff"/>
                        <g stroke="#fff" stroke-width="4">
                            <line x1="50" y1="50" x2="50" y2="5"/> <line x1="50" y1="50" x2="50" y2="95"/>
                            <line x1="50" y1="50" x2="5" y2="50"/> <line x1="50" y1="50" x2="95" y2="50"/>
                        </g>
                    </svg>
                </div>
                <div class="message-content">
                    <p>Namaste! 🙏 New conversation started. How can I help you with Indian elections today?</p>
                    <span class="timestamp">Just now</span>
                </div>
            </div>
        `;
        announce('New conversation started.');
        userInput.focus();
    });

    // ── Quick Links ───────────────────────────────────────────────────────────
    document.querySelectorAll('.link-item[data-query]').forEach((btn) => {
        btn.addEventListener('click', () => {
            userInput.value = btn.dataset.query;
            userInput.dispatchEvent(new Event('input'));
            sendMessage();
            // On mobile, scroll to chat
            document.querySelector('.chat-wrapper').scrollIntoView({ behavior: 'smooth' });
        });
    });

    // ── Voice Input ───────────────────────────────────────────────────────────
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-IN'; // Indian English
        recognition.interimResults = false;

        voiceBtn.addEventListener('click', () => {
            recognition.start();
            voiceBtn.classList.add('listening');
            voiceBtn.setAttribute('aria-label', 'Listening... click to stop');
            announce('Voice input started. Speak your question.');
        });

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            userInput.value = transcript;
            userInput.dispatchEvent(new Event('input'));
            voiceBtn.classList.remove('listening');
            voiceBtn.setAttribute('aria-label', 'Start voice input');
            sendMessage();
        };

        recognition.onerror = () => {
            voiceBtn.classList.remove('listening');
            voiceBtn.setAttribute('aria-label', 'Start voice input');
            announce('Voice input error. Please try again or type your question.');
        };

        recognition.onend = () => {
            voiceBtn.classList.remove('listening');
            voiceBtn.setAttribute('aria-label', 'Start voice input');
        };
    } else {
        // Hide voice button if not supported
        voiceBtn.style.display = 'none';
    }

    // ── Event Listeners ───────────────────────────────────────────────────────
    sendBtn.addEventListener('click', sendMessage);

    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Focus input on load
    userInput.focus();
});
