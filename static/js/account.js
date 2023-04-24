const nameOfUser = document.getElementById('name');
const username = document.getElementById('username');
const email = document.getElementById('email');
const Inputimage = document.getElementById('input-image');
const changePasswordBtn = document.querySelector('.change-password-div a')
const SaveBtn = document.querySelector('.save-btn')
const resetBtn = document.querySelector('.reset-btn')
const Btn = document.querySelectorAll('.save-changes-btn-div button')
const nameErrDiv = document.querySelector('.name-err-div');
const nameErrDivImg = document.querySelector('.name-err-div img');
const usernameErrDiv = document.querySelector('.username-err-div');
const usernameErrDivImg = document.querySelector('.username-err-div img');
const nameErrMessageDiv = document.querySelector('.name-err-message-div');
const usernameErrMessageDiv = document.querySelector('.username-err-message-div');
const updateImgDiv = document.querySelector('.update-img-div')
const preview = document.getElementById('preview')

nameErrDivImg.onmouseenter = () => {
    nameErrMessageDiv.style.display = 'flex'
}

nameErrDivImg.onmouseleave = () => {
    nameErrMessageDiv.style.display = 'none';
}

usernameErrDivImg.onmouseenter = () => {
    usernameErrMessageDiv.style.display = 'flex'
}

usernameErrDivImg.onmouseleave = () => {
    usernameErrMessageDiv.style.display = 'none';
}



const checkUser = setInterval(() => {
    console.log('hello')
    if (userDetails.username == undefined || null) {
        console.log(userDetails)
    }

    else {
        clearInterval(checkUser)
        nameOfUser.value = userDetails.name;
        username.value = userDetails.username;
        email.value = userDetails.email;
        if (userDetails.imageUrl != undefined && userDetails.imageUrl != 'none') {
            updateImgDiv.style.backgroundImage = `url(${userDetails.imageUrl})`
        }
    }
}, 100);

document.onkeyup = () => {
    if (username.value.trim() == userDetails.username && nameOfUser.value == userDetails.name) {
        removeBtn();
    }
}

nameOfUser.onkeyup = () => {
    if (nameOfUser.value.trim() != userDetails.name) {
        AddBtn();
        nameErrDiv.style.display = 'none'
    }

    if (nameOfUser.value.trim().length < 5) {
        Btn.forEach(btn => {
            btn.style.opacity = '0.4'
            btn.style.cursor = 'default'
            btn.setAttribute('disabled', 'true')
        })

        nameErrDiv.style.display = 'flex';
    }

    if (nameOfUser.value.trim() == userDetails.name) {
        nameErrDiv.style.display = 'none'
    }

}

username.onkeyup = (e) => {
    if (e.key == " " || e.code == "Space" || e.keyCode == 32) {
        e.preventDefault()
    }

    if (username.value.trim().replace(/\s+/g, '') != userDetails.username) {
        AddBtn();
        usernameErrDiv.style.display = 'none'
    }

    if (username.value.trim().replace(/\s+/g, '').length < 3) {
        removeBtn()
        usernameErrDiv.style.display = 'flex'
    }

    if (username.value.trim() == userDetails.username) {
        usernameErrDiv.style.display = 'none'
    }

}

SaveBtn.onclick = async () => {
    const ChangeAccountDetails = async () => {
        let data = { username: username.value, name: nameOfUser.value, image: Inputimage.files[0] }

        if (Inputimage.files[0]) {
            data.imageUrl = userDetails.imageUrl
        }

        const form = new FormData();

        for (const name in data) {
            form.append(name, data[name]);
        }


        let res = await fetch('/api/change-account-details', {
            method: 'POST',
            body: form
        });


        let receivedRes = await res.json();

        if (receivedRes.error != undefined) {
            return Swal.fire("Can't Save Changes", receivedRes.error, 'error')
        }

        Swal.fire("Changes Saved", receivedRes.success, 'success')

        console.log(receivedRes)
    }

    await ChangeAccountDetails()
}

resetBtn.onclick = () => {
    nameOfUser.value = userDetails.name
    username.value = userDetails.username
    Btn.forEach(btn => {
        btn.style.opacity = '0.4'
        btn.style.cursor = 'default'
        btn.removeAttribute('disabled')
    })
}

changePasswordBtn.onclick = (e) => {
    e.preventDefault();

    Swal.fire({
        title: 'Enter Current Password',
        input: 'text',
        inputPlaceholder: 'Password',
        showCancelButton: true,
        cancelButtonColor: '#d33',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Confirm'
    }).then(async (result) => {
        if (result.isConfirmed) {

            let data = { password: result.value }
            let res = await fetch('/api/verify-password', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                },

                body: JSON.stringify(data)
            });

            let receivedRes = await res.json();

            if (receivedRes.error != undefined) {
                return Swal.fire('Incorrect Password', receivedRes.error, 'error')
            }

            Swal.fire({
                title: 'Create A New Public Room',
                html: '<input id="swal-input1" class="swal2-input" placeholder="New Password">' + '<input id="swal-input2" class="swal2-input" placeholder="Confirm Password">',
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
            }).then(async (result) => {
                if (result.value[0] !== result.value[1]) {
                    return Swal.fire('Password And Confirm Password Should Be Same', '', 'error')
                }

                let data = { password: result.value[1] }
                let res = await fetch('/api/change-password', {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json',
                    },

                    body: JSON.stringify(data)
                });

                let receivedRes = await res.json();

                if (receivedRes.error != undefined) {
                    return Swal.fire(receivedRes.error, '', 'error')
                }

                Swal.fire('Password Changed', 'Your Account Password Has Been Changed Successfully', 'success')

            })
        }
    })
}

updateImgDiv.onclick = () => {
    Inputimage.click();
}

Inputimage.onchange = () => {
    AddBtn()
    const reader = new FileReader()
    reader.addEventListener('load', () => {
        let uploaded_image = reader.result;
        updateImgDiv.style.backgroundImage = `url(${uploaded_image})`
    })
    reader.readAsDataURL(Inputimage.files[0])
}


const removeBtn = () => {
    Btn.forEach(btn => {
        btn.style.opacity = '0.4'
        btn.style.cursor = 'default'
        btn.setAttribute('disabled', 'true')
    })
}

const AddBtn = () => {
    Btn.forEach(btn => {
        btn.style.opacity = '1'
        btn.style.cursor = 'pointer'
        btn.removeAttribute('disabled')
    })
}