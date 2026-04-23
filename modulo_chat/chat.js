// VICTORIA AI - CORE LOGIC v2.0
// JC PATH LAB ELITE

function toggleChat() {
      const chatWindow = document.getElementById('victoria-chat');
    chatWindow.classList.toggle('hidden');
}

async function sendMessage() {
    const userInput = document.getElementById('user-input');
    const chatMessages = document.getElementById('chat-messages');
    const text = userInput.value.trim();

    if (!text) return;

    // Append User Message
    appendMessage('user', text);
    userInput.value = '';

    // Show Typing Indicator
    const typingId = showTyping();

    try {
        // Peticion real a Groq API
        const response = await getVictoriaResponse(text);

        removeTyping(typingId);
        appendMessage('bot', response);
    } catch (error) {
        removeTyping(typingId);
        appendMessage('bot', VICTORIA_CONFIG.errorMessage);
    }
}

function appendMessage(sender, text) {
      const chatMessages = document.getElementById('chat-messages');
    const msgDiv = document.createElement('div');
    msgDiv.className = `msg ${sender}-msg fade-in`;
    msgDiv.innerText = text;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTyping() {
      const chatMessages = document.getElementById('chat-messages');
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typing-indicator';
    typingDiv.className = 'msg bot-msg fade-in';
    typingDiv.innerText = 'Victoria esta escribiendo...';
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return 'typing-indicator';
}

function removeTyping(id) {
      const indicator = document.getElementById(id);
    if (indicator) indicator.remove();
}

async function getVictoriaResponse(input) {
    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${VICTORIA_CONFIG.groqApiKey}`
          },
                      body: JSON.stringify({
                          model: VICTORIA_CONFIG.groqModel,
                          messages: [
          {
                                  role: "system",
                                  content: VICTORIA_CONFIG.systemPrompt + "\nBase de conocimientos: " + VICTORIA_CONFIG.knowledgeBase.join(" ")
          },
          {
                                  role: "user",
                                  content: input
          }
                          ],
                          temperature: 0.5,
                          max_tokens: 300
          })
          });

        if (!response.ok) {
            throw new Error(`Error en API Groq: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error("Error en Groq API:", error);
        throw error;
    }
}

// Enter key support
document.getElementById('user-input')?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
});
