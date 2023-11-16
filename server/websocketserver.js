const WebSocket = require("ws");

const users = new Map(); // Speichert die Zuordnung von WebSocket zu Benutzernamen

const initializeWebsocketServer = (server) => {
  const websocketServer = new WebSocket.Server({ server });

  websocketServer.on("connection", (ws) => {
    console.log("New websocket connection");
    
    ws.on("message", (message) => {
      const data = JSON.parse(message);
      switch(data.type) {
        case 'join':
          users.set(ws, data.username);
          broadcastUserList(websocketServer);
          break;
        case 'message':
          // Nachrichtenbehandlung
          break;
        case 'requestUsers':
          sendUserList(ws);
          break;
      }
    });

    ws.on("close", () => {
      users.delete(ws);
      broadcastUserList(websocketServer);
    });
  });
};

const sendUserList = (ws) => {
  const userList = Array.from(users.values());
  ws.send(JSON.stringify({ type: 'userList', users: userList }));
};

const broadcastUserList = (websocketServer) => {
  const userList = Array.from(users.values());
  websocketServer.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'userList', users: userList }));
    }
  });
};

module.exports = { initializeWebsocketServer };
