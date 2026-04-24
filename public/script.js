document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');

    function appendMessage(sender, text) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        if (sender === 'user') {
            messageDiv.classList.add('user-message');
            messageDiv.innerHTML = `
                <div class="message-content">
                    <p>${text}</p>
                    <span class="timestamp">${timeString}</span>
                </div>
            `;
        } else {
            messageDiv.classList.add('bot-message');
            messageDiv.innerHTML = `
                <div class="avatar chakra-avatar">
                    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
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
                    ${marked.parse(text)}
                    <span class="timestamp">${timeString}</span>
                </div>
            `;
        }
        
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.classList.add('message', 'bot-message');
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="avatar chakra-avatar">
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#fff" stroke-width="4"/>
                    <circle cx="50" cy="50" r="10" fill="#fff"/>
                </svg>
            </div>
            <div class="message-content typing-indicator">
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
        if (typingDiv) {
            typingDiv.remove();
        }
    }

    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        // Display user message
        appendMessage('user', message);
        userInput.value = '';
        
        // Show bot is thinking
        showTypingIndicator();

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message }),
            });

            const data = await response.json();
            removeTypingIndicator();

            if (response.ok) {
                appendMessage('bot', data.reply);
            } else {
                appendMessage('bot', `**Error:** ${data.error || 'Something went wrong.'}`);
            }
        } catch (error) {
            console.error('Error:', error);
            removeTypingIndicator();
            appendMessage('bot', '**Error:** Could not connect to the server.');
        }
    }

    sendBtn.addEventListener('click', sendMessage);

    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});
