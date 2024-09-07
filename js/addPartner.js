let partnerFormIsVisible = false;
let partnerForm = document.getElementById("partnerForm");

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

function openPartnerForm() {
	partnerFormIsVisible = !partnerFormIsVisible;
	partnerForm.classList = partnerFormIsVisible
		? "d-block mt-5 mb-3"
		: "d-none mt-5 mb-3";
}

function submitFormSociety() {
	if (validateForm()) {
		let form = {
			societyContact: document.getElementById("contact").value,
			societyEmail: document.getElementById("email").value,
			societyName: document.getElementById("name").value,
			societySiret: document.getElementById("siret").value,
			societyServices: document.getElementById("services").value,
			societyLocation: document.getElementById("location").value,
			societyUrlSite: document.getElementById("urlSite").value,
			societyDescription: document.getElementById("description").value,
		};
		let mailDto = setEmailStyleType(form);
		console.log(mailDto);
		sendSocietyEmailSiteAdd(mailDto);
	}
}

function validateForm() {
	let societyContact = document.getElementById("contact").value;
	let societyEmail = document.getElementById("email").value;
	let societyName = document.getElementById("name").value;
	let societySiret = document.getElementById("siret").value;
	let societyServices = document.getElementById("services").value;
	let societyLocation = document.getElementById("location").value;
	let societyUrlSite = document.getElementById("urlSite").value;
	let societyDescription = document.getElementById("description").value;

	let requiredSocietyContact = validateField(
		societyContact,
		"requiredSocietyContact"
	);
	let requiredSocietyEmail = validateField(
		societyEmail,
		"requiredSocietyEmail"
	);
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	let badEmail = validateRegex(societyEmail, emailRegex, "badEmail");
	let requiredSocietyName = validateField(societyName, "requiredSocietyName");
	let requiredSocietySiret = validateField(
		societySiret,
		"requiredSocietySiret"
	);
	let requiredSocietyServices = validateField(
		societyServices,
		"requiredSocietyServices"
	);
	let requiredSocietyLocation = validateField(
		societyLocation,
		"requiredSocietyLocation"
	);
	let requiredSocietySite = validateField(
		societyUrlSite,
		"requiredSocietySite"
	);
	let requiredSocietyDescription = validateField(
		societyDescription,
		"requiredSocietyDescription"
	);

	if (
		requiredSocietyContact ||
		requiredSocietyEmail ||
		badEmail ||
		requiredSocietyName ||
		requiredSocietySiret ||
		requiredSocietyServices ||
		requiredSocietyLocation ||
		requiredSocietySite ||
		requiredSocietyDescription
	) {
		let errorCount = 0;
		let errorMessage =
			"<p class='fs-4 text-danger fw-bolder'>Le formulaire n'est pas valide.</p><p class='fw-bolder'>Merci de vérifier le champ :</p>";
		errorMessage += "<ul class='list-group'>";
		if (requiredSocietyContact) {
			errorMessage +=
				"<li class='d-flex col-12 align-items-center list-group-item'> <i class='fs-2 bi bi-x text-danger me-2'></i><span class='mb-1'>Contact</span></li>";
			errorCount++;
		}
		if (requiredSocietyEmail) {
			errorMessage +=
				"<li class='d-flex col-12 align-items-center list-group-item'> <i class='fs-2 bi bi-x text-danger me-2'></i><span class='mb-1'>Email</span></li>";
			errorCount++;
		}
		if (requiredSocietyName) {
			errorMessage +=
				"<li class='d-flex col-12 align-items-center list-group-item'> <i class='fs-2 bi bi-x text-danger me-2'></i><span class='mb-1'>Nom de la societé</span></li>";
			errorCount++;
		}

		if (requiredSocietySiret) {
			errorMessage +=
				"<li class='d-flex col-12 align-items-center list-group-item'> <i class='fs-2 bi bi-x text-danger me-2'></i><span class='mb-1'>Numéro de siret</span></li>";
			errorCount++;
		}
		if (requiredSocietyServices) {
			errorMessage +=
				"<li class='d-flex col-12 align-items-center list-group-item'> <i class='fs-2 bi bi-x text-danger me-2'></i><span class='mb-1'>Services proposé</span></li>";
			errorCount++;
		}
		if (requiredSocietyLocation) {
			errorMessage +=
				"<li class='d-flex col-12 align-items-center list-group-item'> <i class='fs-2 bi bi-x text-danger me-2'></i><span class='mb-1'>Localisation</span></li>";
			errorCount++;
		}
		if (requiredSocietySite) {
			errorMessage +=
				"<li class='d-flex col-12 align-items-center list-group-item'> <i class='fs-2 bi bi-x text-danger me-2'></i><span class='mb-1'>Url du site web</span></li>";
			errorCount++;
		}
		if (requiredSocietyDescription) {
			errorMessage +=
				"<li class='d-flex col-12 align-items-center list-group-item'> <i class='fs-2 bi bi-x text-danger me-2'></i><span class='mb-1'>Déscription</span></li>";
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
function setEmailStyleType(email) {
	const maintenant = new Date();
	const heureActuelle = maintenant.getHours();
	let sayHello = "Bonjour";
	if (heureActuelle > 12) {
		sayHello = "Bonsoir";
	}

	const mailDto = {
		emailSender: email.email,
		subject: "Demande de Partenariat provenant du site DZ Maçonnerie",
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
            ${sayHello} <b>David</b> , ceci est une Demande de partenariat
            provenant du site DZ Maçonnerie,voici le contenu de l'email :
          </p>
          <h3>Demande d'ajout d'un site sur l'annuaire de DZ Maçonnerie:</h3>
          <p></p>
          <p><b>Nom du contact : </b>${email.societyContact}</p>
          <p><b>E-mail : </b>${email.societyEmail}</p>
          <p><b>Nom de la société à ajouter : </b>${email.societyName}</p>
          <p><b>Numéro de siret : </b>${email.societySiret}</p>
          <p><b>Type de services proposés : </b>${email.societyServices}</p>
          <p><b>Localisation : </b>${email.societyLocation}</p>
          <p><b>Url du site web : </b>${email.societyUrlSite}</p>
          <p><b>Description de la société : </b>${email.societyDescription}</p>
          <br />         
          <p>Bonne journée</p>

          <p><b>PS :</b>Transfer cet email a Chris pour qu'il ajoute sur le site </p> 
        </div>
      </body>
    </html>
    `,
	};
	return mailDto;
}

async function sendSocietyEmailSiteAdd(mailDto) {
	viewSpinner(true);
	const apiUrl = "https://www.dzmaconnerie38.fr:8082/api/email/send-email";

	try {
		fetch(apiUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(mailDto),
		}).then((response) => {
			showResponseModal(response.status);
		});
	} catch (error) {
		showResponseModal(500);
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

			partnerForm.reset();

			break;
	}
}

function viewSpinner(viewSpinner) {
	let spinner = document.getElementById("spinner");
	spinner.classList = viewSpinner ? "d-block" : "d-none";
}
