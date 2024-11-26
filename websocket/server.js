const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer(
    (req, res) => {
        let filePath = '.' + req.url;
        if (filePath === './') {
            filePath = './index.html';
        }

        const extname = path.extname(filePath);
        const contentType = {
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.css': 'text/css'
        }[extname] || 'text/plain';

        fs.readFile(
            filePath,
            (error, content) => {
                if (error) {
                    if (error.code === 'ENOENT') {
                        res.writeHead(404);
                        res.end('File not found');
                    } else {
                        res.writeHead(500);
                        res.end('Server error: ' + error.code);
                    }
                } else {
                    res.writeHead(200, { 'Content-Type': contentType });
                    res.end(content, 'utf-8');
                }
            }
        );
    }
);

const wss = new WebSocket.Server({ server });

const clients = new Map();

wss.on(
    'connection',
    function connection(ws) {
        console.log('New client connected');

        ws.on(
            'message',
            function incoming(message) {
                try {
                    const data = JSON.parse(message);
                    
                    if (data.type === 'username') {
                        clients.set(ws, data.username);
                        
                        broadcast(JSON.stringify({
                            type: 'system',
                            message: `${data.username} joined the chat`
                        }));
                    } else if (data.type === 'chat') {
                        broadcast(JSON.stringify({
                            type: 'chat',
                            username: data.username,
                            message: data.message
                        }));
                    }
                } catch (e) {
                    console.error('Error processing message:', e);
                }
            }
        );

        ws.on(
            'close',
            function() {
                const username = clients.get(ws);
                if (username) {
                    broadcast(JSON.stringify({
                        type: 'system',
                        message: `${username} left the chat`
                    }));
                    clients.delete(ws);
                }
            }
        );
    }
);

function broadcast(message) {
    wss.clients.forEach(
        function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        }
    );
}

const PORT = 8080;
server.listen(
    PORT,
    () => {
        console.log(`Server is running on port ${PORT}`);
    }
); 