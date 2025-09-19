// script.js

const API_KEY = 'sk-1234abcd1234abcd1234abcd1234abcd1234abcd'; // Replace with your OpenAI API key (do NOT commit this to GitHub!)
const API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-3.5-turbo'; // Or 'gpt-4o-mini' for a faster/cheaper option

let conversationHistory = [
    {
        role: 'system',
        content: 'You are Akinator, the web genie. Your goal is to guess what character, person, or object the user is thinking of by asking one yes/no question at a time. The user can answer with "yes", "no", "maybe", "maybe not", or "don\'t know". Based on the answers, ask the next relevant question. If you are confident, make a guess by saying "I guess it is [your guess]". Keep responses short and to the point, just the question or guess.'
    }
];

function addMessage(content, isUser = false) {
    const messagesDiv = document.getElementById('messages');
    const message = document.createElement('p');
    message.textContent = (isUser ? 'You: ' : 'AI: ') + content;
    messagesDiv.appendChild(message);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

async function sendMessage() {
    const userInput = document.getElementById('user-input');
    const answer = userInput.value.trim().toLowerCase();
    if (!answer) return;

    addMessage(answer, true);
    userInput.value = '';

    conversationHistory.push({ role: 'user', content: answer });

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: MODEL,
                messages: conversationHistory,
                temperature: 0.7,
                max_tokens: 100
            })
        });

        if (!response.ok) {
            throw new Error('API request failed: ' + response.statusText);
        }

        const data = await response.json();
        const aiResponse = data.choices[0].message.content.trim();
        addMessage(aiResponse);

        conversationHistory.push({ role: 'assistant', content: aiResponse });
    } catch (error) {
        addMessage('Error: ' + error.message);
    }
}

function resetGame() {
    conversationHistory = [conversationHistory[0]]; // Keep system prompt
    document.getElementById('messages').innerHTML = '';
    addMessage('Ready! Think of something, and I\'ll start asking questions.');
    sendInitialQuestion();
}

async function sendInitialQuestion() {
    // Start with the first question
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: MODEL,
                messages: conversationHistory,
                temperature: 0.7,
                max_tokens: 100
            })
        });

        const data = await response.json();
        const aiResponse = data.choices[0].message.content.trim();
        addMessage(aiResponse);
        conversationHistory.push({ role: 'assistant', content: aiResponse });
    } catch (error) {
        addMessage('Error: ' + error.message);
    }
}

document.getElementById('send-btn').addEventListener('click', sendMessage);
document.getElementById('reset-btn').addEventListener('click', resetGame);
document.getElementById('user-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// Initialize
addMessage('Ready! Think of something, and I\'ll start asking questions.');
sendInitialQuestion();