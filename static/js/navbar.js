const loginDiv = document.querySelector('.login-signup-div')
const profileDiv = document.querySelector('.navbar-profile-div')
const profileDivImg = document.querySelector('.navbar-profile-div-img')
const profileDropdown = document.querySelector('.profile-dropdown-div');
const container = document.querySelector('.container')

const userDetails = {};
const mainFunction = async () => {
    const authenticate = async ()=>{
        let res = await fetch('/api/auth/getuser', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },

        });

        let receivedRes = await res.json()
        Object.assign(userDetails, receivedRes.user)
    }

    await authenticate();

    console.log(userDetails)
    if(userDetails.imageUrl != undefined && userDetails.imageUrl != 'none'){
        profileDivImg.src = userDetails.imageUrl
    }
    
    if(userDetails.username == undefined){
        profileDiv.remove();
        profileDropdown.remove();
        loginDiv.style.display = 'block'
    }
    else{
        loginDiv.remove();
        profileDiv.style.display = 'block'
    }
    
    
    
    profileDivImg.addEventListener('click', ()=>{
        profileDropdown.classList.toggle('hide')
    })
    
    container.addEventListener('click', ()=>{
        if(profileDropdown.className.split(' ')[1] != 'hide'){
            profileDropdown.classList.add('hide')
        }
    })
    

    console.log(userDetails.username)
}

mainFunction();
