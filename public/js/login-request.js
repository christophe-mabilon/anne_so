function onSubmit(){event.preventDefault();var e=document.getElementById("username").value;document.getElementById("email").value,LoginRequest(e,document.getElementById("password").value)}function LoginRequest(e,n,t){document.getElementById("loginError").classList.remove("d-none"),document.getElementById("successMessage").innerHTML="",document.getElementById("loginError").innerHTML="<b>\xc9chec de la connexion:</b> Identifiant email et mot de passe sont incorrect"}function callAPI(e,n,t){}