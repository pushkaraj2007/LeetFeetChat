import { Eggy } from "../toasts/js/eggy.js";

const Name = document.querySelector('[name="name"]')
const Username = document.querySelector('[name="username"]')
const Email = document.querySelector('[name="email"]')
const Password = document.querySelector('[name="password"]')
const form = document.querySelector('form')

const popup = (title, message, type) => {
    Eggy({
        title: title,
        message: message,
        type: type,
    });
}

form.onsubmit = async (e) => {
    e.preventDefault()

    if (Name.value.replace(/\s+/g, '').length < 5) {
        return popup('Signup Failed', 'Name Must Be Atleast 5 Characters Long', 'error')
    }

    if (Username.value.replace(/\s+/g, '').length < 3) {
        return popup('Signup Failed', 'Username Must Be Atleast 3 Characters Long', 'error')
    }

    let mailformat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if (!Email.value.match(mailformat)) {
        return popup('Signup Failed', 'Invalid Email Address', 'error')
    }

    if (Password.value.replace(/\s+/g, '').length < 6) {
        return popup('Signup Failed', 'Password Must Be Atleast 6 Characters Long', 'error')
    }

    const data = { name: Name.value, username: Username.value, email: Email.value, password: Password.value }
    async function createUser() {
        let res = await fetch('api/auth/signup', {
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
            popup('Signup Success', 'Welcome To Group Of LeetFeetChat', 'success')

            setTimeout(() => {
                location.href = "/login"
            }, 3000);
        }
        else {
            popup('Signup Failed', receivedRes.error, 'error');
        }

    }

    await createUser();
}