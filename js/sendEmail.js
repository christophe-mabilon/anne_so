// Fonction de validation
function validateForm() {
	let isValid = true;

	// Récupération des éléments
	const firstName = document.getElementById("firstName");
	const lastName = document.getElementById("lastName");
	const phone = document.getElementById("phone");
	const email = document.getElementById("email");

	const errorFirstName = document.getElementById("errorFirstName");
	const errorLastName = document.getElementById("errorLastName");
	const errorPhone = document.getElementById("errorPhone");
	const errorEmail = document.getElementById("errorEmail");

	// Réinitialisation des messages d'erreur
	[errorFirstName, errorLastName, errorPhone, errorEmail].forEach((error) =>
		error.classList.add("d-none")
	);

	// Validation des champs
	if (firstName.value.trim() === "") {
		errorFirstName.classList.remove("d-none");
		isValid = false;
	}
	if (lastName.value.trim() === "") {
		errorLastName.classList.remove("d-none");
		isValid = false;
	}
	const phoneRegex = /^(\d{2}([ .-]?\d{2}){4})$/;
	if (!phoneRegex.test(phone.value)) {
		errorPhone.classList.remove("d-none");
		isValid = false;
	}
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email.value)) {
		errorEmail.classList.remove("d-none");
		isValid = false;
	}
	return isValid;
}

// Fonction de soumission
function submitForm(event) {
	event.preventDefault();

	const spinner = document.getElementById("spinner");

	if (!validateForm()) {
		return;
	}

	spinner.classList.remove("d-none");

	const formData = {
		firstName: document.getElementById("firstName").value,
		lastName: document.getElementById("lastName").value,
		phone: document.getElementById("phone").value,
		email: document.getElementById("email").value,
		message: document.getElementById("message").value,
	};

	fetch("https://www.larbredelumiere38.fr:8082/api/email/send-email", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(formData),
	})
		.then((response) => response.json())
		.then((data) => {
			spinner.classList.add("d-none");
			if (data.message) {
				spinner.classList.add("d-none");
				showNotification(
					"Votre email a été envoyé avec succès. Un email de confirmation vient de vous être envoyé. !",
					"success"
				);
				document.getElementById("myForm").reset();
			} else {
				spinner.classList.add("d-none");
				showNotification(
					"Un probleme est survenue pendnant l'envoi de l'email",
					"danger"
				);
			}
		})
		.catch((error) => {
			spinner.classList.add("d-none");
			showNotification(error, "danger");
		});
}

// Fonction pour afficher les notifications
function showNotification(message, type = "success") {
	// Récupère le conteneur ou le crée s'il n'existe pas
	let notificationContainer = document.getElementById("notification-container");
	if (!notificationContainer) {
		notificationContainer = document.createElement("div");
		notificationContainer.id = "notification-container";
		notificationContainer.style.position = "fixed";
		notificationContainer.style.top = "10px";
		notificationContainer.style.right = "10px";
		notificationContainer.style.zIndex = "1050";
		document.body.appendChild(notificationContainer);
	}

	// Créer une alerte Bootstrap
	const alert = document.createElement("div");
	alert.className = `alert alert-${type} alert-dismissible fade show`;
	alert.setAttribute("role", "alert");
	alert.innerHTML = `
		${message}
		<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
	`;

	// Ajouter l'alerte au conteneur
	notificationContainer.appendChild(alert);

	// Supprimer l'alerte après 5 secondes
	setTimeout(() => {
		alert.classList.remove("show");
		setTimeout(() => {
			alert.remove();
		}, 300); // Donne un délai pour la transition CSS
	}, 3000);
}
