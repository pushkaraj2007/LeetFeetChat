const socket = io()

const createPublic_Room_Btn = document.querySelector('.create-publicRoom-div a');
const createPrivate_Room_Btn = document.querySelector('.create-privateRoom-div a');
const publicRooms = document.querySelector('.publicRooms');
const privateRooms = document.querySelector('.privateRooms')
const publicBtn = document.querySelector('.public-btn')
const privateBtn = document.querySelector('.private-btn');
const roomId = document.getElementById('room-id');
const roomPass = document.getElementById('room-password')
const join_privateRoom_btn = document.getElementById('join-privateRoom-btn');
let nameOfRoom;

createPublic_Room_Btn.addEventListener('click', (e)=>{

    if(userDetails.username == undefined || null){
        return Swal.fire(
            'Error !',
            'You Need To Login For Creating Room',
            'error'
        )
    }

    e.preventDefault();
    Swal.fire({
        title: 'Create A New Public Room',
        input: 'text',
        inputPlaceholder: 'Give A Name To Room',
        showCancelButton: true,
        cancelButtonColor: '#d33',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Create'

    }).then(async (result) =>{
        if(result.isConfirmed){

            if(result.value.replace(/\s+/g, '').length <= 2){
                return Swal.fire(
                    'Error !',
                    'Room Name Must Be 3 Characters Long',
                    'error'
                )
            }

            if(result.value.replace(/\s+/g, '').length >= 15){
                return Swal.fire(
                    'Error !',
                    'Room Name Must Be Less Than 15 Characters',
                    'error'
                )
            }

            let data = {room: result.value.toLowerCase().trim().replace(/\s+/g, '-'), name: result.value}
            let res = await fetch('/api/createpublicroom', {
                method: 'POST',
                headers: {
                     'content-type': 'application/json',
                },
    
                body: JSON.stringify(data)
            });

            
            let receivedRes = await res.json();

            if(receivedRes.error != undefined){
                return Swal.fire(
                        'Error !',
                        receivedRes.error,
                        'error'
                )
            }

            Swal.fire(
                'Created !',
                `New Room Has Been Created.\n Note That White Spaces Has Been Replaced With '-'`,
                'success'
            ).then(async () =>{
                console.log(result.value)
                nameOfRoom = result.value
            })
            
        }
    })


})

createPrivate_Room_Btn.onclick = (e)=>{

    e.preventDefault();

    if(userDetails.username == undefined || null){
        return Swal.fire(
            'Error !',
            'You Need To Login For Creating Room',
            'error'
        )
    }

    Swal.fire({
        title: 'Create A New Private Room',
        html: '<input id="swal-input1" class="swal2-input" placeholder="Give A Room Name">' + '<input id="swal-input2" class="swal2-input" placeholder="Create Room Password">',
        showCancelButton: true,
        cancelButtonColor: '#d33',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Create',
        focusConfirm: false,
        preConfirm: () => {
            return [
              document.getElementById('swal-input1').value,
              document.getElementById('swal-input2').value
            ]
          }
    }).then(async (result) =>{
        if(result.isConfirmed){
            if(result.value[0].trim().length < 3 && result.value[1].trim().length < 3){
                return Swal.fire(
                    'Failed !',
                    `Room Name And Password Must Be 3 Characters`,
                    'error'
                )
            }
            let data = {password: result.value[1], name: result.value[0].trim()}
            let res = await fetch('/api/createprivateroom', {
                method: 'POST',
                headers: {
                     'content-type': 'application/json',
                },
    
                body: JSON.stringify(data)
            });

            let receivedRes = await res.json();

            if(receivedRes.error != undefined){
                return Swal.fire(
                        'Error !',
                        receivedRes.error,
                        'error'
                )
            }

            Swal.fire(
                'Created !',
                `New Room Has Been Created.\n Room Id :- ${receivedRes.roomId}, Room Password :- ${receivedRes.password}`,
                'success'
            )

        }
    })
}

socket.on('room-created', (name, author) =>{
    const roomDetails_Div = document.createElement('div')
    
    roomDetails_Div.innerHTML = `<div class="room-details-second-div">
                                    <p class="main-heading">${name}</p>
                                    <p class="room-url">${author}</p>
                                    </div>
                                    <div class="join-btn-div">
                                    <button onclick="select(this)">Join</button>
                                    </div>`
    roomDetails_Div.classList.add('room-details-div')
    publicRooms.append(roomDetails_Div)
    
})

const select = (button)=>{
    Swal.fire({
        title: 'Join Room ?',
        input: 'Do You Want To Join This Room',
        showCancelButton: true,
        cancelButtonColor: '#d33',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Join'
    }).then(async (result) =>{
        if(result.isConfirmed){
            location.href = `/public-rooms/${button.parentElement.parentElement.firstElementChild.firstElementChild.innerText.toLowerCase().trim().replace(/\s+/g, '-')}`
        }
    })
    
}

socket.on('room-deleted', (room) =>{
    console.log(room)

    document.querySelectorAll('.main-heading').forEach(element => {
        if(room == element.innerText.toLowerCase().trim().replace(/\s+/g, '-')){
            element.parentElement.parentElement.remove()
        }
    })
})


publicBtn.onclick = ()=>{
    publicBtn.classList.add('bg-blue');
    privateBtn.classList.remove('bg-blue');
    publicRooms.style.display = 'block';
    privateRooms.style.display = 'none';
}

privateBtn.onclick = ()=>{
    privateBtn.classList.add('bg-blue');
    publicBtn.classList.remove('bg-blue');
    privateRooms.style.display = 'block';
    publicRooms.style.display = 'none';
}