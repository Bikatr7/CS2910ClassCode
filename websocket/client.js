let socket;
let username = '';
let isConnected = false;
const tabId = Math.random().toString(36).substring(2, 15);
let usernameKey = null;

const usernameInput = document.getElementById('username');
const messageInput = document.getElementById('messageInput');
const messageForm = document.getElementById('messageForm');
const messagesDiv = document.getElementById('messages');
const sendButton = document.getElementById('sendButton');

function isUsernameInUse(username) 
{
    const existingKey = localStorage.getItem(`chat_username_${username}`);
    if (existingKey && existingKey !== tabId) {
        return true;
    }
    return false;
}

function setUsername()
{
    username = usernameInput.value.trim();
    if (username)
    {
        if (isConnected)
        {
            alert('Already connected to chat! Please use only one connection per tab.');
            return;
        }

        if (isUsernameInUse(username)) {
            alert('This username is already in use in another tab!');
            return;
        }

        localStorage.setItem(`chat_username_${username}`, tabId);
        usernameKey = `chat_username_${username}`;
        
        usernameInput.disabled = true;
        messageInput.disabled = false;
        sendButton.disabled = false;

        initializeWebSocket();
    }
}

function initializeWebSocket()
{
    if (isConnected)
    {
        console.log('Already connected to WebSocket server');
        return;
    }

    socket = new WebSocket('ws://localhost:8080');

    socket.onopen = function(e)
    {
        console.log('Connection established');
        isConnected = true;
        socket.send(JSON.stringify(
        {
            type: 'username',
            username: username
        }));
    };

    socket.onmessage = function(event)
    {
        const data = JSON.parse(event.data);
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        
        if (data.type === 'chat')
        {
            messageDiv.innerHTML = `<span class="username">${escapeHtml(data.username)}:</span> ${escapeHtml(data.message)}`;
        }
        else if (data.type === 'system')
        {
            messageDiv.innerHTML = `<span class="system-message">${escapeHtml(data.message)}</span>`;
        }
        
        messagesDiv.appendChild(messageDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    };

    socket.onclose = function(event)
    {
        isConnected = false;
        messageInput.disabled = true;
        sendButton.disabled = true;
        
        if (event.wasClean)
        {
            console.log(`Connection closed cleanly, code=${event.code} reason=${event.reason}`);
        }
        else
        {
            console.log('Connection died');
        }
        
        if (usernameKey) {
            localStorage.removeItem(usernameKey);
            usernameKey = null;
        }
        
        usernameInput.disabled = false;
    };

    socket.onerror = function(error)
    {
        console.log(`WebSocket error: ${error.message}`);
    };
}

messageForm.onsubmit = function(e)
{
    e.preventDefault();
    
    const message = messageInput.value.trim();
    if (message && socket.readyState === WebSocket.OPEN)
    {
        socket.send(JSON.stringify(
        {
            type: 'chat',
            username: username,
            message: message
        }));
        messageInput.value = '';
    }
};

// Helper function to prevent XSS
// No idea if this works lol, tested it but i'm sure someone with more skills can break it
function escapeHtml(unsafe)
{
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replace(/`/g, "&#x60;") 
        .replace(/\//g, "&#x2F;");
}

window.addEventListener('beforeunload', () => {
    if (usernameKey) {
        localStorage.removeItem(usernameKey);
    }
}); 