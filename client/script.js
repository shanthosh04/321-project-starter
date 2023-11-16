let username;
const messagesContainer = document.getElementById('messages');
const usersContainer = document.getElementById('users');
const usernameInput = document.getElementById('username');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('send');
const socket = new WebSocket("ws://localhost:3000");

usernameInput.addEventListener('change', (event) => {
  username = event.target.value;
  messageInput.disabled = !username;
  socket.send(JSON.stringify({ type: 'join', username }));
});

socket.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'userList') {
    displayUserList(data.users);
  } else if (data.type === 'message') {
    if (data.username !== username) {
      displayMessage(data.username, data.message);
    }
  }
});

sendButton.addEventListener('click', sendMessage);

function sendMessage() {
  if (messageInput.value.trim() === '' || !username) {
    alert('Please enter a username and a message.');
    return;
  }
  const message = messageInput.value;
  socket.send(JSON.stringify({ type: 'message', username, message }));
  displayMessage(username, message);
  messageInput.value = '';
}

function displayMessage(user, message) {
  const messageElement = document.createElement('div');
  messageElement.textContent = '${user}: ${message}';
  messagesContainer.appendChild(messageElement);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function displayUserList(users) {
  usersContainer.innerHTML = '';
  users.forEach(user => {
    const userElement = document.createElement('div');
    userElement.textContent = user;
    usersContainer.appendChild(userElement);
  });
}