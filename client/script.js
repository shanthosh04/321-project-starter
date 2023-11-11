let username;
const messagesContainer = document.getElementById('messages');
const usernameInput = document.getElementById('username');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('send');
const socket = new WebSocket("ws://localhost:3000");

usernameInput.addEventListener('change', (event) => {
  username = event.target.value;
  messageInput.disabled = !username;
});

socket.addEventListener('open', (event) => {
  console.log("WebSocket connected!");
});

socket.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);
  displayMessage(data.username, data.message);
});

socket.addEventListener('close', (event) => {
  console.log("WebSocket closed.");
});

socket.addEventListener('error', (event) => {
  console.error("WebSocket error:", event);
});

sendButton.addEventListener('click', sendMessage); 

function sendMessage() {
  if (messageInput.value.trim() === '' || !username) {
    alert('Please enter a username and a message.');
    return;
  }
  const message = messageInput.value;
  socket.send(JSON.stringify({ username, message }));
  displayMessage(username, message);
  messageInput.value = '';
}

function displayMessage(user, message) {
  const messageElement = document.createElement('div');
  messageElement.textContent = `${user}: ${message}`;
  messagesContainer.appendChild(messageElement);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
