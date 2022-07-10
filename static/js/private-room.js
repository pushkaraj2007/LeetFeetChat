const socket = io();
import { Eggy } from '../toasts/js/eggy.js'

const message_div = document.querySelector('.messages-div');
const messageForm = document.querySelector('.send-message-form');
const messageInput = document.querySelector('.send-message-input');
const audio = new Audio('/static/ting.mp3');

const append = (name, message, position, classToAdd, classToRemove)=>{
  const messageElementName = document.createElement('div');
  const messageElement = document.createElement('div');
  messageElementName.innerText = name
  messageElement.innerText = message;
  messageElement.classList.add('message');
  messageElement.classList.add(position);
  messageElementName.classList.add('name');
  messageElement.append(messageElementName);
  message_div.append(messageElement);
  messageElement.classList.add(classToAdd);
  messageElement.classList.remove(classToRemove)

  if(name == ""){
      messageElementName.classList.remove('name');
  }

  if(position == 'left'){
      audio.play();
  }

}

  console.log(userDetails.username)

if(userDetails.username != undefined || null){
  
  append("", 'You joined', 'right')
  socket.emit('new-user-joined-privateRoom', roomName, userDetails.username)

  messageForm.addEventListener('submit', e => {
    e.preventDefault()
    const message = messageInput.value

    if(message.replace(/\s+/g, '').length < 1) return

    append("", message, 'right')
    socket.emit('send-privateRoom', roomName, message)
    message_div.scrollTop = message_div.scrollHeight;
    messageInput.value = ''
  })


socket.on('receive', data => {
  append(data.name, data.message, 'left')

  message_div.scrollTop = message_div.scrollHeight;
})

socket.on('user-joined', name => {
  append(name, "Joined The Chat", 'right')
})

socket.on('user-disconnected', name => {
  append("", name + " Disconnected", 'right', 'alert', 'right')
})

}

else{
  messageForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    Eggy({
      title:  'Failed To Chat',
      message:  "You Need To Login For Using Chat Services",
      type: 'error',
    })
  })
}
