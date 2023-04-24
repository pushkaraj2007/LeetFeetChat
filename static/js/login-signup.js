import { Eggy } from "../toasts/js/eggy.js";

const sign_in_btn = document.querySelector("#sign-in-btn");
const sign_up_btn = document.querySelector("#sign-up-btn");
const container = document.querySelector(".container");
const signupUserImg = document.getElementById('image')
const signupName = document.querySelector('.sign-up-name')
const signupUsername = document.querySelector('.sign-up-username')
const signupEmail = document.querySelector('.sign-up-email')
const signupPassword = document.querySelector('.sign-up-password')
const signupImage = document.getElementById('image')
const signupform = document.querySelector('.sign-up-form')
const signinEmail = document.querySelector('.sign-in-email')
const signinPassword = document.querySelector('.sign-in-password')
const signinform = document.querySelector('.sign-in-form')
const uploadImgDiv = document.querySelector('.upload-img-div')

setTimeout(() => {
    if (location.hash == '#signup') {
        container.classList.add('sign-up-mode')
    }
    else {
        container.classList.remove('sign-up-mode')
    }
}, 10);


window.addEventListener('hashchange', () => {
    console.log('changed')

    if (location.hash == '#signup') {
        container.classList.add('sign-up-mode')
    }
    else {
        container.classList.remove('sign-up-mode')
    }
})

sign_up_btn.addEventListener("click", () => {
    location.hash = '#signup'
});

sign_in_btn.addEventListener("click", () => {
    location.hash = '#login'
});

signupform.onsubmit = async (e) => {
    e.preventDefault()

    if (signupName.value.replace(/\s+/g, '').length < 5) {
        return Eggy({
            title: 'Signup Failed',
            message: "Name Must Be Atleast 5 Characters Long",
            type: 'error',
        });
    }

    if (signupUsername.value.replace(/\s+/g, '').length < 3) {
        return Eggy({
            title: 'Signup Failed',
            message: "Username Must Be Atleast 3 Characters Long",
            type: 'error',
        });
    }

    let mailformat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if (!signupEmail.value.match(mailformat)) {
        return Eggy({
            title: 'Signup Failed',
            message: "Invalid Email Address",
            type: 'error',
        });
    }

    const data = { image: signupImage.files[0], name: signupName.value, username: signupUsername.value, email: signupEmail.value, password: signupPassword.value }

    const form = new FormData();

    for (const name in data) {
        form.append(name, data[name]);
    }
    async function createUser() {
        let res = await fetch('api/auth/signup', {
            method: 'POST',
            body: form
        });

        let receivedRes = await res.json();
        console.log('err ' + receivedRes.error)
        console.log(receivedRes)

        if (receivedRes.error == undefined) {
            Eggy({
                title: 'Signup Success',
                message: "Verification Link Has Been Sent To Your Email",
                type: 'success',
            });
        }
        else {
            Eggy({
                title: 'Signup Failed',
                message: receivedRes.error,
                type: 'error',
            });
        }

    }
    await createUser();
}


signinform.onsubmit = async (e) => {
    e.preventDefault();
    console.log("login clicked")

    let mailformat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if (!signinEmail.value.match(mailformat)) {
        return Eggy({
            title: 'Signup Failed',
            message: "Invalid Email Address",
            type: 'error',
        });
    }

    const data = { email: signinEmail.value, password: signinPassword.value }

    async function autheticateUser() {
        let res = await fetch('api/auth/login', {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },

            body: JSON.stringify(data)
        });

        let receivedRes = await res.json();
        console.log('err ' + receivedRes.error)
        console.log(receivedRes)

        if (receivedRes.error == undefined) {
            Eggy({
                title: 'Login Success',
                message: "ComeBack To Group Of LeetFeetChat",
                type: 'success',
            });

            setTimeout(() => {
                location.href = "/"
            }, 3000);
        }
        else {
            Eggy({
                title: 'Login Failed',
                message: receivedRes.error,
                type: 'error',
            });
        }

    }
    await autheticateUser()

}

uploadImgDiv.onclick = () => {
    signupUserImg.click()
}

signupUserImg.onchange = () => {
    if (signupImage.files[0].size > 1024 * 1024) {
        console.log("Can't Upload File Over 1 Mb")
    }

    const reader = new FileReader()
    reader.addEventListener('load', () => {
        let uploaded_image = reader.result;
        uploadImgDiv.style.backgroundImage = `url(${uploaded_image})`
    })
    reader.readAsDataURL(signupImage.files[0])
}