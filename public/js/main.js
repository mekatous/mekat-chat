const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const usersList = document.getElementById('users');
const clearBtn = document.getElementById('btn_clear_chat');

const {username, room} = Qs.parse(location.search,{
    ignoreQueryPrefix: true
})

const socket = io();

//join chat room
socket.emit('joinRoom',{username, room});

socket.on('roomUsers',({room, users})=>{
    outputRoomName(room);
    outputUsers(users);
})
socket.on('message',(message)=>{
    outputMessage(message);

    chatMessages.scrollTop = chatMessages.scrollHeight;
})

chatForm.addEventListener('submit',e=>{
    e.preventDefault();

    const msg = e.target.elements.msg.value;
    socket.emit('chatMessage', msg);

    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
})


const outputMessage = (message)=>{
    const div = document.createElement('div');
    div.classList.add('message');

    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;

    chatMessages.appendChild(div);
}

const outputRoomName = (room)=>{
    roomName.innerText = room;
}

const outputUsers = (users)=>{
    usersList.innerHTML = `
        ${users.map(user=>`<li>${user.username}</li>`).join('')}
    `;
}

clearBtn.addEventListener('click',e=>{
    chatMessages.innerHTML = '';
})