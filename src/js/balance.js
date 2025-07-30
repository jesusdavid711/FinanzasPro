const btnlogout = document.getElementById('btn-logout');

btnlogout.addEventListener( 'click', function() {
    localStorage.removeItem("currentUser");
    window.location.href = '../../index.html'
    
})

