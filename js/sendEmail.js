const myForm = document.getElementById("myForm");

function openModal(type, labelTitle, content) {
	var myModal = new bootstrap.Modal(document.getElementById("modal"));

	setModalTitle(type, labelTitle, content, myModal);
	myModal.show();
}

function setModalTitle(type, labelTitle, content, myModal) {
	let modalHeader = document.getElementById("modal-header");
	let modalLabel = document.getElementById("modalLabel");
	let modalContent = document.getElementById("modal-body");
	let btnClose = document.getElementById("btnClose");
	modalContent.classList = "modal-body text-dark";
	if (type === "error") {
		modalLabel.innerHTML = labelTitle;
		modalHeader.classList = "modal-header bg-danger";

		modalContent.innerHTML = content;

		btnClose.classList = "btn btn-danger";

		setTimeout(function () {
			myModal.hide();
		}, 6000);
	} else if (type === "success") {
		modalLabel.innerHTML = labelTitle;
		modalHeader.classList = "modal-header bg-success";
		modalContent.innerHTML = content;

		btnClose.classList = "btn btn-success";
		setTimeout(function () {
			myModal.hide();
		}, 6000);
	} else {
		modalLabel.innerHTML = labelTitle;
		modalHeader.classList = "modal-header bg-info";

		modalContent.innerHTML = content;

		btnClose.classList = "btn btn-info";
		setTimeout(function () {
			myModal.hide();
		}, 3000);
	}
}

function validateForm() {
	let jobType = document.getElementById("jobType").value;
	let firstName = document.getElementById("firstName").value;
	let lastName = document.getElementById("lastName").value;
	let adresse = document.getElementById("adresse").value;
	let postalCode = document.getElementById("postalCode").value;
	let city = document.getElementById("city").value;
	let phone = document.getElementById("phone").value;
	let email = document.getElementById("email").value;

	let requiredJobType = validateField(jobType, "requiredJobType");
	let requiredFirstName = validateField(firstName, "requiredFirstName");
	let requiredLastName = validateField(lastName, "requiredLastName");
	let requiredAdresse = validateField(adresse, "requiredAdresse");
	let requiredPostalCode = validateField(postalCode, "requiredPostalCode");
	let requiredCity = validateField(city, "requiredCity");
	let requiredPhone = validateField(phone, "requiredPhone");
	let badPhone = validateLength(phone, 10, "badPhone");

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	let badEmail = validateRegex(email, emailRegex, "badEmail");

	if (
		requiredJobType ||
		requiredFirstName ||
		requiredLastName ||
		requiredAdresse ||
		requiredPostalCode ||
		requiredCity ||
		requiredPhone ||
		badPhone ||
		badEmail
	) {
		let errorCount = 0;
		let errorMessage =
			"<p class='fs-4 text-danger fw-bolder'>Le formulaire n'est pas valide.</p><p class='fw-bolder'>Merci de vérifier le champ :</p>";
		errorMessage += "<ul class='list-group'>";
		if (requiredJobType) {
			errorMessage +=
				"<li class='d-flex col-12 align-items-center list-group-item'> <i class='fs-2 bi bi-x text-danger me-2'></i><span class='mb-1'>Type de travaux</span></li>";
			errorCount++;
		}
		if (requiredLastName) {
			errorMessage +=
				"<li class='d-flex col-12 align-items-center list-group-item'> <i class='fs-2 bi bi-x text-danger me-2'></i><span class='mb-1'>Nom de famille</span></li>";
			errorCount++;
		}
		if (requiredFirstName) {
			errorMessage +=
				"<li class='d-flex col-12 align-items-center list-group-item'> <i class='fs-2 bi bi-x text-danger me-2'></i><span class='mb-1'>Prénom</span></li>";
			errorCount++;
		}

		if (requiredAdresse) {
			errorMessage +=
				"<li class='d-flex col-12 align-items-center list-group-item'> <i class='fs-2 bi bi-x text-danger me-2'></i><span class='mb-1'>Adresse</span></li>";
			errorCount++;
		}
		if (requiredPostalCode) {
			errorMessage +=
				"<li class='d-flex col-12 align-items-center list-group-item'> <i class='fs-2 bi bi-x text-danger me-2'></i><span class='mb-1'>Code postal</span></li>";
			errorCount++;
		}
		if (requiredCity) {
			errorMessage +=
				"<li class='d-flex col-12 align-items-center list-group-item'> <i class='fs-2 bi bi-x text-danger me-2'></i><span class='mb-1'>Ville</span></li>";
			errorCount++;
		}
		if (requiredPhone) {
			errorMessage +=
				"<li class='d-flex col-12 align-items-center list-group-item'> <i class='fs-2 bi bi-x text-danger me-2'></i><span class='mb-1'>Téléphone</span></li>";
			errorCount++;
		}
		if (requiredCity) {
			errorMessage +=
				"<li class='d-flex col-12 align-items-center list-group-item'> <i class='fs-2 bi bi-x text-danger me-2'></i><span class='mb-1'>Email</span></li>";
			errorCount++;
		}
		errorMessage += "<ul>";

		if (errorCount > 1) {
			errorMessage = errorMessage.replace(
				"Merci de vérifier le champ :",
				"Merci de vérifier les champs :"
			);
		}

		openModal("error", "Erreur", errorMessage);
		return false;
	}

	return true;
}

function validateField(value, errorId) {
	let requiredField = document.getElementById(errorId);
	if (value.trim() === "") {
		requiredField.classList.remove("d-none");
		return true;
	} else {
		requiredField.classList.add("d-none");
		return false;
	}
}

function validateLength(value, minLength, errorId) {
	let errorField = document.getElementById(errorId);
	if (value.length < minLength) {
		errorField.classList.remove("d-none");
		return true;
	} else {
		errorField.classList.add("d-none");
		return false;
	}
}

function validateRegex(value, regex, errorId) {
	let errorField = document.getElementById(errorId);
	if (!regex.test(value)) {
		errorField.classList.remove("d-none");
		return true;
	} else {
		errorField.classList.add("d-none");
		return false;
	}
}

function submitForm() {
	let generalConditionsChecked =
		document.getElementById("generalConditions").checked;

	if (!generalConditionsChecked) {
		openModal(
			"info",
			"Erreur",
			"Veuillez accepter les conditions pour soumettre le formulaire."
		);
		return;
	}

	if (validateForm()) {
		let form = {
			nom: document.getElementById("lastName").value,
			prenom: document.getElementById("firstName").value,
			telephone: document.getElementById("phone").value,
			email: document.getElementById("email").value,
			adresse: document.getElementById("adresse").value,
			ville: document.getElementById("city").value,
			codePostal: document.getElementById("postalCode").value,
			jobType: document.getElementById("jobType").value,
			prescision: document.getElementById("prescision").value,
			message: document.getElementById("message").value,
		};
		let mailDto = setEmailStyleType(form);

		sendEmail(mailDto);
	}
}

function setEmailStyleType(email) {
	const maintenant = new Date();
	const heureActuelle = maintenant.getHours();
	let sayHello = "Bonjour";
	if (heureActuelle > 12) {
		sayHello = "Bonsoir";
	}

	const mailDto = {
		emailSender: email.email,
		subject: "Demande de renseignement provenant du site DZ Maçonnerie",
		text: `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          p {
            margin-bottom: 10px;
          }
    
          .logo {
            width: 100px !important;
            height: auto;
          }
          .flex {
            display: flex;
            align-items: center;
          }
          h2 {
            font-size: 25px;
            font-weight: 700;
            font-family: "Oswald", sans-serif;
            color: rgb(0, 161, 154) !important;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
          }
          .title {
            margin: 40px 0;
          }
          
        </style>
      </head>
      <body style="font-family: Arial, sans-serif;
      background-color: #f0f0f0;
      color: #333;
      margin: 0;
      padding: 20px;
      font-size: 14px !important;
    ">
        <div style="background:rgba(255,255,255,0.9);border:1px solid rgba(0, 0, 0, 0.3); box-shadow: 0 3px 5px rgba(0, 0, 0, 0.3);border-radius:15px;padding:3vh 3vw;margin:1.5vh 1.5vw;min-width:80%">
          <h2>DZ MAÇONNERIE & TERRASSEMENT</h2>
          <p class="title">
            ${sayHello} <b>David</b> , ceci est une Demande de renseignements
            provenant du site DZ Maçonnerie,voici le contenu de l'email :
          </p>
          <p></p>
          <p><b>Nom : </b> ${email.nom}</p>
          <p><b>Prénom : </b> ${email.prenom}</p>
          <p><b>Téléphone : </b> ${email.telephone}</p>
          <p><b>Adresse: </b>${email.adresse}</p>
          <p><b>Code postal: </b>${email.codePostal}</p>
          <p><b>Ville: </b>${email.ville}</p>
          <p><b>E-mail : </b> ${email.email}</p>
          <p><b>Type de travaux à effectuer : </b> ${email.jobType}</p>
          <p><b>Précision sur les travaux : </b> ${email.prescision}</p>
    
          <p><b>Message du client : </b> ${email.message}</p>
          <br />
          <p>Merci de le recontacter le plus rapidement possible...</p>
          <p>Bonne journée</p>
        </div>
      </body>
    </html>
    `,
	};
	return mailDto;
}

async function sendEmail(mailDto) {
	viewSpinner(true);
	const apiUrl = "https://www.dzmaconnerie38.fr:8082/api/email/send-email";

	try {
		fetch(apiUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(mailDto),
		})
			.then((response) => {
				showResponseModal(response.status);
			})
			.catch((error) => {
				showResponseModal(500); // Assuming a generic server error if fetch fails
			});
	} catch (error) {
		showResponseModal(500); // Assuming a generic server error if try block fails
	}
}

function showResponseModal(status) {
	switch (true) {
		case status >= 400 && status < 600:
			viewSpinner(false);
			openModal(
				"error",
				"Erreur API",
				`Une erreur est survenue lors de l'envoi du formulaire.<p class="mt-2">Votre message n'a pas été envoyé.</p>`
			);

			break;

		default:
			viewSpinner(false);
			openModal(
				"success",
				"Message envoyé avec succès",
				`Votre message a été envoyé avec succès.<p class="mt-2">Merci pour votre confiance</p>`
			);

			myForm.reset();

			break;
	}
}

function viewSpinner(viewSpinner) {
	let spinner = document.getElementById("spinner");
	spinner.classList = viewSpinner ? "d-block" : "d-none";
}
