let username;
const messagesContainer = document.getElementById('messages');
const usersContainer = document.getElementById('users');
const usernameInput = document.getElementById('username');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('send');
const socket = new WebSocket("ws://localhost:3000");

// Funktion, um die Benutzerliste anzufordern
const requestUserList = () => {
  socket.send(JSON.stringify({ type: 'requestUsers' }));
};

// Event, das ausgelöst wird, sobald die WebSocket-Verbindung geöffnet ist
socket.addEventListener('open', () => {
  requestUserList(); 
});

usernameInput.addEventListener('change', (event) => {
  username = event.target.value;
  messageInput.disabled = !username;
  if (username) {
    socket.send(JSON.stringify({ type: 'join', username }));
  }
});

socket.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);
  switch (data.type) {
    case 'userList':
      displayUserList(data.users);
      break;
    case 'message':
      if (data.username !== username) {
        displayMessage(data.username, data.message);
      }
      break;
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
  messageElement.textContent = user + ": " + message;
  messagesContainer.appendChild(messageElement);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function displayUserList(users) {
  usersContainer.innerHTML = '';
  users.forEach(user => {
    displayUser(user);
  });
}

function displayUser(user) {
  const userElement = document.createElement('div');
  userElement.textContent = user;
  usersContainer.appendChild(userElement);
}

window.onload = () => {
  fetchCurrentUsers();
  fetchCurrentMessages();
};

const fetchCurrentUsers = () => {
  fetch('/api/users')
    .then(response => response.json())
    .then(users => users.forEach(user => displayUser(user.name)))
    .catch(error => console.error('Error fetching users:', error));
};

const fetchCurrentMessages = () => {
  fetch('/api/messages')
    .then(response => response.json())
    .then(messages => messages.forEach(message => displayMessage(message.username, message.message)))
    .catch(error => console.error('Error fetching messages:', error));
};
