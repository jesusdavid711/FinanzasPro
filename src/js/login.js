const formLogin = document.getElementById("formLogin")

formLogin.addEventListener("submit", function (event){ // captar el evento addevent

    
    const inputUsername = formLogin.username.value;
    const inputPassword = formLogin.password.value;

    login(inputUsername,inputPassword)
    
    event.preventDefault()
})

async function login (inputUsername,inputPassword) { // se encarga de usar el login
    let response =  await fetch(`http://localhost:3000/users?username=${inputUsername}`)
    let data =  await response.json()

    if (data.length === 0){
        alert("credenciales incorrectas , revisa el usuario o la contraseña")
    }else{
        const userFound = data[0]
        
        if(userFound.password === inputPassword){

            localStorage.setItem("currentUser", JSON.stringify(userFound)) // el local storage la llave
            alert("login correcto")
            window.location.href ="balance.html"
            

        }else{
            alert("credenciales incorrectas , revisa el usuario o la contraseña")
        }
    }
}
