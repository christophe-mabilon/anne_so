let partnerFormIsVisible = false;
let partnerForm = document.getElementById("partnerForm");

function openModal(type, labelTitle, content) {
	const myModal = new bootstrap.Modal(document.getElementById("modal"));

	setModalTitle(type, labelTitle, content, myModal);
	myModal.show();
}

function setModalTitle(type, labelTitle, content, myModal) {
	const modalHeader = document.getElementById("modal-header");
	const modalLabel = document.getElementById("modalLabel");
	const modalContent = document.getElementById("modal-body");
	const btnClose = document.getElementById("btnClose");

	modalContent.classList = "modal-body text-dark";

	switch (type) {
		case "error":
			modalLabel.innerHTML = labelTitle;
			modalHeader.classList = "modal-header bg-danger";
			modalContent.innerHTML = content;
			btnClose.classList = "btn btn-danger";
			setTimeout(() => myModal.hide(), 6000);
			break;
		case "success":
			modalLabel.innerHTML = labelTitle;
			modalHeader.classList = "modal-header bg-success";
			modalContent.innerHTML = content;
			btnClose.classList = "btn btn-success";
			setTimeout(() => myModal.hide(), 6000);
			break;
		default:
			modalLabel.innerHTML = labelTitle;
			modalHeader.classList = "modal-header bg-info";
			modalContent.innerHTML = content;
			btnClose.classList = "btn btn-info";
			setTimeout(() => myModal.hide(), 3000);
			break;
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
		const form = {
			societyContact: document.getElementById("contact").value.trim(),
			societyEmail: document.getElementById("email").value.trim(),
			societyName: document.getElementById("name").value.trim(),
			societySiret: document.getElementById("siret").value.trim(),
			societyServices: document.getElementById("services").value.trim(),
			societyLocation: document.getElementById("location").value.trim(),
			societyUrlSite: document.getElementById("urlSite").value.trim(),
			societyDescription: document.getElementById("description").value.trim(),
		};

		const mailDto = setEmailStyleType(form);
		sendSocietyEmailSiteAdd(mailDto);
	}
}

function validateForm() {
	let isValid = true;
	const fields = [
		{ id: "contact", errorId: "requiredSocietyContact" },
		{
			id: "email",
			errorId: "requiredSocietyEmail",
			regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
			badErrorId: "badEmail",
		},
		{ id: "name", errorId: "requiredSocietyName" },
		{ id: "siret", errorId: "requiredSocietySiret" },
		{ id: "services", errorId: "requiredSocietyServices" },
		{ id: "location", errorId: "requiredSocietyLocation" },
		{ id: "urlSite", errorId: "requiredSocietySite" },
		{ id: "description", errorId: "requiredSocietyDescription" },
	];

	let errorMessage =
		"<p class='fs-4 text-danger fw-bolder'>Le formulaire n'est pas valide.</p><p class='fw-bolder'>Merci de vérifier les champs suivants :</p><ul class='list-group'>";

	fields.forEach(({ id, errorId, regex, badErrorId }) => {
		const inputElement = document.getElementById(id);

		if (!inputElement) {
			console.error(`Élément avec l'id "${id}" introuvable.`);
			isValid = false;
			return;
		}

		const value = inputElement.value;
		const errorField = document.getElementById(errorId);

		if (!value) {
			errorField.classList.remove("d-none");
			isValid = false;
			errorMessage += `<li class='list-group-item'><i class='fs-2 bi bi-x text-danger me-2'></i>${id}</li>`;
		} else {
			errorField.classList.add("d-none");
			if (regex && !regex.test(value)) {
				const badErrorField = document.getElementById(badErrorId);
				if (badErrorField) badErrorField.classList.remove("d-none");
				isValid = false;
				errorMessage += `<li class='list-group-item'><i class='fs-2 bi bi-x text-danger me-2'></i>${id} (format invalide)</li>`;
			}
		}
	});

	errorMessage += "</ul>";

	if (!isValid) {
		openModal("error", "Erreur", errorMessage);
	}

	return isValid;
}

function setEmailStyleType(email) {
	const maintenant = new Date();
	const heureActuelle = maintenant.getHours();
	const sayHello = heureActuelle > 12 ? "Bonsoir" : "Bonjour";

	return {
		emailSender: email.societyEmail,
		subject: "Demande de Partenariat provenant du site L'arbre de lumière",
		text: `...`, // Reste du HTML (inchangé)
	};
}

async function sendSocietyEmailSiteAdd(mailDto) {
	const apiUrl = "https://www.larbredelumiere38.fr:8082/api/email/send-email";

	viewSpinner(true);
	try {
		const response = await fetch(apiUrl, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(mailDto),
		});

		showResponseModal(response.status);
	} catch (error) {
		showResponseModal(500);
	}
}

function showResponseModal(status) {
	const isError = status >= 400 && status < 600;
	viewSpinner(false);
	openModal(
		isError ? "error" : "success",
		isError ? "Erreur API" : "Message envoyé avec succès",
		isError
			? "Une erreur est survenue lors de l'envoi du formulaire. Veuillez réessayer."
			: "Votre message a été envoyé avec succès. Merci pour votre confiance."
	);

	if (!isError) {
		partnerForm.reset();
	}
}

function viewSpinner(visible) {
	const spinner = document.getElementById("spinner");
	spinner.classList = visible ? "d-block" : "d-none";
}
