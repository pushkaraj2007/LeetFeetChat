const socket = io();

const spinner = document.querySelector('.spinner-img')
const publicRooms = document.querySelector('.publicRooms')
const privateRooms = document.querySelector('.privateRooms')
const publicBtn = document.querySelector('.public-btn')
const privateBtn = document.querySelector('.private-btn');
const mainContainer = document.querySelector('.container');

const removeSpinner = async () => {
    if (userDetails.username == undefined || null) {
        console.log('script not loaded')
        console.log(nameOfUser)
    }

    else {
        console.log('script loaded')
        spinner.remove()
        console.log(userDetails.username)

        const fetchMyRooms = async () => {
            let res = await fetch('/api/get-my-rooms', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                },

            });


            let receivedRes = await res.json();
            console.log(receivedRes)

            receivedRes.rooms.forEach(element => {
                const roomDetails_Div = document.createElement('div')

                roomDetails_Div.innerHTML = `<div class="room-details-second-div">
                                                <p class="main-heading">${element.name}</p>
                                                <p class="room-url">${element.author}</p>
                                                </div>
                                                <div class="delete-btn-div">
                                                <img src="/static/Images/delete.svg" onclick="deletepublicroom(this)" class="delete-img">
                                                </div>`
                roomDetails_Div.classList.add('room-details-div')
                publicRooms.append(roomDetails_Div)

            });


        }

        await fetchMyRooms();


        const fetchMyPrivateRooms = async () => {
            let res = await fetch('/api/get-my-private-rooms', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                },
            });


            let receivedRes = await res.json();
            console.log(receivedRes)

            receivedRes.rooms.forEach(element => {
                const roomDetails_Div = document.createElement('div')

                roomDetails_Div.innerHTML = `<div class="room-details-second-div">
                                                <p class="main-heading">${element.name}</p>
                                                <div class="room-id-div"><p>Room ID :&nbsp</p> <p class="room-id">${element.roomId}</p></div>
                                                <p class="room-pass">Room Password : ${element.password}</p>
                                                </div>                                
                                                <div class="delete-btn-div">
                                                    <img src="/static/Images/delete.svg" onclick="deleteprivateroom(this)" class="delete-img">
                                                </div>
                                                `
                roomDetails_Div.classList.add('room-details-div')
                privateRooms.append(roomDetails_Div)

            });


        }

        await fetchMyPrivateRooms();
    }
}

setTimeout(() => {
    removeSpinner()
}, 1000);

const deletepublicroom = async (button) => {
    Swal.fire({
        title: 'Delete A Room',
        text: `Deleted Room Can't Be Restore`,
        showCancelButton: true,
        cancelButtonColor: '#d33',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Delete'
    }).then(async (result) => {
        if (result.isConfirmed) {

            const deletemyRooms = async () => {
                let data = { room: button.parentElement.parentElement.firstElementChild.firstElementChild.innerText.toLowerCase().trim().replace(/\s+/g, '-') }
                let res = await fetch('/api/deletepublicroom', {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json',
                    },

                    body: JSON.stringify(data)
                });


                let receivedRes = await res.json();
                console.log(receivedRes)

                if (receivedRes.error != undefined) {
                    return alert('room not exists')
                }
            }

            await deletemyRooms();
            
            button.parentElement.parentElement.remove()

        }
    })
}

const deleteprivateroom = async (button) => {
    Swal.fire({
        title: 'Delete A Room',
        text: `Deleted Room Can't Be Restore`,
        showCancelButton: true,
        cancelButtonColor: '#d33',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Delete'
    }).then(async (result) => {
        if (result.isConfirmed) {

            const deletemyRooms = async () => {
                console.log(button.parentElement.parentElement.parentElement.firstElementChild.children[1].children[1].innerText.toLowerCase().trim())
                let data = { room: button.parentElement.parentElement.parentElement.firstElementChild.children[1].children[1].innerText.toLowerCase().trim()}
                let res = await fetch('/api/deleteprivateroom', {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json',
                    },

                    body: JSON.stringify(data)
                });


                let receivedRes = await res.json();
                console.log(receivedRes)

                if (receivedRes.error != undefined) {
                    return alert('room not exists')
                }
            }

            await deletemyRooms();
            
            button.parentElement.parentElement.parentElement.remove()

        }
    })
}

socket.on('room-created', (name, author)=>{
    const roomDetails_Div = document.createElement('div')

    roomDetails_Div.innerHTML = `<div class="room-details-second-div">
                                    <p class="main-heading">${name}</p>
                                    <p class="room-url">${author}</p>
                                    </div>
                                    <div class="share-btn-div">
                                    <img src="/static/Images/share.svg" onclick="share(this)" class="delete-img">
                                    </div>
                                    <div class="delete-btn-div">
                                    <img src="/static/Images/delete.svg" onclick="deletepublicroom(this)" class="delete-img">
                                    </div>`
    roomDetails_Div.classList.add('room-details-div')
    publicRooms.append(roomDetails_Div)
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

mainContainer.addEventListener('click', (e)=>{
    let shareRoomDiv = document.querySelectorAll('.share-room-div');
        // if(shareRoomDiv.className.split(' ')[1] != 'hide-share-div'){
        //     shareRoomDiv.classList.add('hide-share-div')
        // }

    console.log(e.target)

    if (e.target != shareRoomDiv && e.target != document.querySelectorAll('.share-img').every()){
        shareRoomDiv.forEach(element => {
          element.classList.add('hide-share-div')  
        })
    }
})


const share = (button)=>{
    let shareRoomDiv = button.parentElement.parentElement.firstElementChild
    let shareRoomDivs = document.querySelectorAll('.share-room-div');
    shareRoomDivs.forEach(element => {
        element.classList.add('hide-share-div')
    });
    shareRoomDiv.classList.toggle('hide-share-div');
}
