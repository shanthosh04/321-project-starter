const WebSocket = require("ws");
const { addUser, saveMessage, getUserByName } = require("./database");

const users = new Map();

const initializeWebsocketServer = (server) => {
  const websocketServer = new WebSocket.Server({ server });

  websocketServer.on("connection", (ws) => {
    console.log("New websocket connection");

    ws.on("message", async (message) => {
      const data = JSON.parse(message);

      switch (data.type) {
        case 'join':
          const user = await getUserByName(data.username);
          if (!user) {
            await addUser(data.username);
          }
          users.set(ws, data.username);
          broadcastUserList(websocketServer);
          break;
        case 'message':
          await saveMessage(data.username, data.message);
          broadcastMessage(websocketServer, data.username, data.message);
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

const broadcastMessage = (websocketServer, username, message) => {
  websocketServer.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'message', username, message }));
    }
  });
};

module.exports = { initializeWebsocketServer };
