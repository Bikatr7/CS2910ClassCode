# WebSocket Chat Application Reflections

##  Possible (Likely) Security Vulnerabilities

1. Cross-Site Scripting (XSS)
   - ~~While we implemented HTML escaping for chat messages using `escapeHtml()`, usernames are not escaped and could be used for XSS attacks~~
   - ~~The escaping function might miss some edge cases or newer XSS attack vectors~~
   - ~~System messages are rendered as HTML with `<em>` tags without escaping~~

2. No Authentication/Authorization
   - Users can join without any authentication
   - Anyone can claim any username, enabling impersonation
   - No way to verify user identities or manage user permissions
   - No way to ban malicious users since they can rejoin with a different name

3. WebSocket Security
   - Using ws:// instead of wss://, making communications unencrypted, since i am not messing with SSL/TLS
   - Vulnerable to man-in-the-middle attacks
   - No origin checking on the WebSocket server
   - No rate limiting on message sending

4. Input Validation Issues
   - No maximum length limits on usernames or messages
   - No validation of message content beyond basic trimming
   - Could allow spam or extremely large messages that could crash clients
   - No filtering of malicious content or inappropriate messages

5. Denial of Service Vulnerabilities
   - No limit on number of concurrent connections
   - No rate limiting for messages or connections
   - Server keeps all connections in memory without limits
   - Large messages could consume excessive memory

Put simply, I put effort into the basics of the application, some xss prevention, and a basic ui but the security is not there for a production application.

## Learnings from the Exercise

1. WebSocket Protocol
   - Learned how WebSockets provide real-time, bidirectional communication
   - Understanding of WebSocket events (open, message, close, error)
   - Difference between HTTP and WebSocket protocols
   - How to manage WebSocket connection states

2. Real-time Application Architecture
   - How to broadcast messages to multiple clients
   - Managing client state and connections
   - Importance of proper error handling
   - How to structure client-server communication