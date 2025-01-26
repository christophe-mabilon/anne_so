// Sélecteurs
const daysContainer = document.querySelector(".days");
const monthLabel = document.querySelector(".date");
const prevButton = document.querySelector(".prev");
const nextButton = document.querySelector(".next");
const todayButton = document.querySelector(".today-btn");
const weekdaysContainer = document.querySelector(".weekdays");
let currentDate = moment(); // Utiliser moment.js pour la date actuelle
let selectedDate = "";
const availabilityModal = new bootstrap.Modal(
	document.getElementById("availabilityModal")
);
const availabilityContent = document.getElementById("availabilityContent");
availabilityContent.innerHTML =
	'<p class="text-danger">Sélectionnez un type de consultation.</p>'; // Ajout du message d'avertissement

// Objets pour stocker les horaires par jour
const horaires = {
};

fetchAndTransformHoraires();


// URL de l'API
const apiUrl = "https://www.larbredelumiere38.fr:8082/api/rdv/openingHours";

// Fonction pour appeler l'API et transformer les données
async function fetchAndTransformHoraires() {
    try {
        // Appel à l'API
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Erreur lors de l'appel API : ${response.statusText}`);
        }

        // Récupération des données JSON
        const apiResponse = await response.json();

        // Transformation des données
        const horaires = apiResponse.reduce((acc, day) => {
            acc[day.jour] = {
                morningOpen: day.morning_open === "00:00:00" ? null : day.morning_open,
                morningClose: day.morning_close === "00:00:00" ? null : day.morning_close,
                afternoonOpen: day.afternoon_open === "00:00:00" ? null : day.afternoon_open,
                afternoonClose: day.afternoon_close === "00:00:00" ? null : day.afternoon_close,
            };
            return acc;
        }, {});

        console.log("Horaires transformés :", horaires);

        // Retourner l'objet transformé (si nécessaire pour une utilisation ultérieure)
        return horaires;
    } catch (error) {
        console.error("Erreur lors de la récupération ou transformation des horaires :", error);
    }
}


// Fonction pour afficher les notifications
function showNotification(message, type = "success") {
	const notificationContainer = document.getElementById(
		"notification-container"
	);

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
		alert.classList.add("hide");
		setTimeout(() => {
			alert.remove();
		}, 500);
	}, 5000);
}

// Fonction pour mettre à jour le mois courant
function updateCurrentMonth() {
	monthLabel.textContent = currentDate.format("MMMM YYYY");
	renderWeekdays();
}

// Fonction pour rendre le calendrier
const renderCalendar = () => {
	daysContainer.innerHTML = "";
	const startOfMonth = currentDate.clone().startOf("month");
	const endOfMonth = currentDate.clone().endOf("month");
	const totalDays = endOfMonth.date();

	const firstDayIndex = startOfMonth.isoWeekday(); // Lundi = 1

	// Ajout de jours vides avant le premier jour
	for (let i = 1; i < firstDayIndex; i++) {
		const emptyCell = document.createElement("div");
		emptyCell.classList.add("empty");
		daysContainer.appendChild(emptyCell);
	}

	// Affichage des jours du mois
	for (let day = 1; day <= totalDays; day++) {
		const dayElement = document.createElement("div");
		const currentDay = startOfMonth.clone().date(day);
		const dayOfWeek = currentDay.format("dddd").toLowerCase(); // Obtenir le nom du jour

		dayElement.textContent = day;
		dayElement.dataset.date = currentDay.format("YYYY-MM-DD"); // Format pour l'API
		dayElement.classList.add("day");

		// Vérifier si le jour est un week-end
		if (currentDay.isoWeekday() === 6 || currentDay.isoWeekday() === 7) {
			dayElement.classList.add("weekend");
		}

		// Vérifier si le jour correspond à aujourd'hui
		if (currentDay.isSame(moment(), "day")) {
			dayElement.classList.add("today");
		}

		// Désactiver les jours dans le passé
		if (currentDay.isBefore(moment(), "day")) {
			dayElement.classList.add("disable");
			dayElement.style.pointerEvents = "none"; // Désactiver le clic
		}

		// Vérifier si le jour est défini dans les horaires
		if (!horaires[dayOfWeek]) {
			// Jour non défini dans les horaires
			dayElement.classList.add("disable");
			dayElement.style.pointerEvents = "none"; // Désactiver le clic
		} else {
			// Ajouter un gestionnaire d'événement pour les jours disponibles
			dayElement.addEventListener("click", () => {
				selectedDate = currentDay.format("YYYY-MM-DD");
				availabilityModal.show();
				loadAvailability(selectedDate);
			});
		}

		daysContainer.appendChild(dayElement);
	}

	updateCurrentMonth();
};

// Fonction pour afficher les jours de la semaine
function renderWeekdays() {
	weekdaysContainer.innerHTML = "";
	const weekdays = moment.weekdaysShort(true); // Commence par lundi
	weekdays.forEach((day) => {
		const dayElement = document.createElement("div");
		dayElement.textContent = day.charAt(0).toUpperCase() + day.slice(1);
		dayElement.classList.add("text-uppercase", "fw-bold", "weekdays-item");
		weekdaysContainer.appendChild(dayElement);
	});
}

// Fonction pour charger les disponibilités
const loadAvailability = (date) => {
	availabilityContent.innerHTML = ""; // Vider le contenu précédent

	const consultationType = document.getElementById(
		"consultationTypeSelect"
	).value;
	if (!consultationType) {
		availabilityContent.innerHTML =
			'<p class="text-danger">Veuillez sélectionner un type de consultation.</p>';
		return;
	}

	getAvailabilityForDate(date, consultationType);
};

// Fonction pour récupérer les disponibilités
const getAvailabilityForDate = (date, consultationType) => {
	updateAvailability(consultationType, date);
};

function updateAvailability(consultationType, consultationDate) {
	if (!consultationType || !consultationDate) {
		console.error("consultationType ou consultationDate manquant");
		return;
	}

	let consultationTypeTime;
	if (consultationType.includes(":")) {
		consultationTypeTime = consultationType.split(":")[1];
	} else {
		return;
	}

	if (!consultationTypeTime) {
		console.error("consultationTypeTime est invalide :", consultationTypeTime);
		return;
	}

	fetch(
		`https://www.larbredelumiere38.fr:8082/api/rdv/availabilities?date=${consultationDate}&duration=${consultationTypeTime}`
	)
		.then((response) => {
			if (!response.ok) {
				throw new Error("Erreur réseau : " + response.statusText);
			}
			return response.json();
		})
		.then((data) => {
			if (!data.availabilities || data.availabilities.length === 0) {
				displayAvailability([]); // Pas de créneaux disponibles
			} else {
				const slots = data.availabilities.map((slot) => ({
					start: slot.start,
					end: slot.end,
				}));

				displayAvailability(slots);
			}
		})
		.catch((error) => {
			console.error(
				"Erreur lors de la récupération des disponibilités :",
				error
			);
			availabilityContent.innerHTML =
				'<p class="text-danger">Erreur lors de la récupération des disponibilités. Veuillez réessayer plus tard.</p>';
		});
}

// Affichage des disponibilités
function displayAvailability(slots) {
	availabilityContent.innerHTML = ""; // Vider le contenu précédent

	// Créer une div pour afficher la date sélectionnée
	const dateElement = document.createElement("div");
	dateElement.classList.add(
		"selected-date",
		"my-3",
		"text-center",
		"fw-bold",
		"brun"
	);

	// Formater la date au format "vendredi 25 octobre"
	const options = {
		weekday: "long",
		day: "numeric",
		month: "long",
		year: "numeric",
	};
	const formattedDate = new Date(selectedDate).toLocaleDateString(
		"fr-FR",
		options
	);
	dateElement.textContent = `Disponibilités du ${formattedDate}`;

	// Ajouter la date en haut du contenu des disponibilités
	availabilityContent.appendChild(dateElement);
	const hr = document.createElement("hr");
	availabilityContent.appendChild(hr);

	if (slots.length === 0) {
		const noAvailabilityMessage = document.createElement("p");
		noAvailabilityMessage.classList.add("text-danger");
		noAvailabilityMessage.textContent =
			"Aucun créneau disponible pour cette date.";
		availabilityContent.appendChild(noAvailabilityMessage);
		return;
	}

	// Créer un conteneur pour les créneaux
	const slotList = document.createElement("ul");
	slotList.classList.add("list-group", "mw-auto", "justify-content-center");

	// Parcourir les créneaux et créer les éléments correspondants
	slots.forEach((slot) => {
		const slotElement = document.createElement("li");
		slotElement.classList.add(
			"list-group-item",
			"d-flex",
			"justify-content-between",
			"align-items-center"
		);

		// Élément pour l'intervalle de disponibilité
		const dispo = document.createElement("span");
		dispo.classList.add("brun");
		dispo.textContent = `${slot.start} - ${slot.end}`;

		// Bouton pour réserver le rendez-vous
		const rdv = document.createElement("button");
		rdv.classList.add("btn", "btn-green-dark");
		rdv.title = "Réserver ce RDV";
		rdv.dataset.slotStart = slot.start;
		rdv.dataset.slotEnd = slot.end;

		// Icône
		const icon = document.createElement("i");
		icon.classList.add("bi", "bi-plus-circle-fill", "me-2");

		// Ajouter l'icône et le texte au bouton
		rdv.appendChild(icon);
		rdv.appendChild(document.createTextNode("Prendre RDV"));

		// Événement au clic
		rdv.onclick = () => {
			availabilityModal.hide();
			openModalForSlot(slot.start, slot.end);
		};

		// Ajouter les éléments au DOM
		slotElement.appendChild(dispo);
		slotElement.appendChild(rdv);
		slotList.appendChild(slotElement);
	});

	// Ajouter la liste des créneaux au contenu des disponibilités
	availabilityContent.appendChild(slotList);
}

// Fonction pour formater la date pour l'affichage (format DD/MM/YYYY)
function formatDateForDisplay(dateString) {
	const parts = dateString.split("-");
	return `${parts[2]}/${parts[1]}/${parts[0]}`; // Format DD/MM/YYYY
}

// Fonction pour ouvrir la modal de réservation
const openModalForSlot = (startTime, endTime) => {
	console.log("Créneau sélectionné :", startTime, "-", endTime);
	document.getElementById("modalStartTime").value = startTime;
	document.getElementById("modalEndTime").value = endTime;

	// Formater la date pour l'affichage
	const formattedDate = formatDateForDisplay(selectedDate);
	document.getElementById("modalDate").value = formattedDate;

	const reservationModalElement = document.getElementById("exampleModalToggle");
	const reservationModalInstance = new bootstrap.Modal(reservationModalElement);
	reservationModalInstance.show();
};

// Boutons de navigation du calendrier
prevButton.onclick = () => {
	currentDate.setMonth(currentDate.getMonth() - 1);
	renderCalendar();
	updateCurrentMonth();
	updateButtonStates(); // Mettre à jour l'état des boutons
};

nextButton.onclick = () => {
	currentDate.setMonth(currentDate.getMonth() + 1);
	renderCalendar();
	updateCurrentMonth();
	updateButtonStates(); // Mettre à jour l'état des boutons
};

todayButton.onclick = () => {
	currentDate = new Date();
	renderCalendar();
	updateCurrentMonth();
	updateButtonStates(); // Mettre à jour l'état des boutons
};

function updateButtonStates() {
	const now = moment(); // Date actuelle avec moment.js

	// Obtenir l'année et le mois actuels
	const currentYear = now.year();
	const currentMonth = now.month();

	// Obtenir le mois et l'année affichés
	const displayedYear = currentDate.year();
	const displayedMonth = currentDate.month();

	// Désactiver le bouton précédent si le mois affiché est le mois courant
	if (displayedYear === currentYear && displayedMonth === currentMonth) {
		prevButton.disabled = true; // Désactiver le bouton précédent si on est au mois courant
	} else {
		prevButton.disabled = false; // Activer le bouton précédent sinon
	}
}

// Événements pour la navigation
prevButton.onclick = () => {
	currentDate.subtract(1, "month"); // Manipulation de `currentDate` avec moment.js
	renderCalendar();
	updateButtonStates(); // Mettre à jour l'état des boutons
};

nextButton.onclick = () => {
	currentDate.add(1, "month"); // Manipulation de `currentDate` avec moment.js
	renderCalendar();
	updateButtonStates(); // Mettre à jour l'état des boutons
};

todayButton.onclick = () => {
	currentDate = moment(); // Retourner à aujourd'hui
	renderCalendar();
	updateButtonStates(); // Mettre à jour l'état des boutons
};

// Événement pour le type de consultation
document
	.getElementById("consultationTypeSelect")
	.addEventListener("change", function () {
		const consultationType = this.value; // Obtenir la valeur sélectionnée
		// Vérifier si le type de consultation et la date sélectionnée sont définis
		if (consultationType && selectedDate) {
			loadAvailability(selectedDate); // Charger les disponibilités uniquement si les deux sont sélectionnés
		} else if (!consultationType) {
			availabilityContent.innerHTML =
				'<p class="text-danger">Sélectionnez un type de consultation.</p>'; // Message d'avertissement
		}
	});

// Sélecteur du formulaire
const reservationForm = document.getElementById("reservation-form");

reservationForm.addEventListener("submit", function (event) {
	event.preventDefault(); // Empêche le rechargement de la page

	// Récupérer les données du formulaire
	const formData = new FormData(reservationForm);

	// Convertir FormData en objet
	const data = Object.fromEntries(formData.entries());

	// Obtenir la date sélectionnée au format YYYY-MM-DD pour le serveur
	const dateForServer = selectedDate;

	data.date = dateForServer; // Utiliser la date non formatée pour le serveur
	data.startTime = document.getElementById("modalStartTime").value;
	data.endTime = document.getElementById("modalEndTime").value;
	data.consultationType = document.getElementById(
		"consultationTypeSelect"
	).value;
	data.message = document.getElementById("message").value;

	// Validation des données
	if (validateFormData(data)) {
		// Construire l'objet avec les clés correspondantes
		const reservationData = {
			first_name: data.firstName,
			last_name: data.name,
			email: data.email,
			phone: data.phone,
			start_time: moment
				.tz(`${data.date} ${data.startTime}`, "Europe/Paris")
				.format(),
			end_time: moment
				.tz(`${data.date} ${data.endTime}`, "Europe/Paris")
				.format(),

			duration: getDurationFromConsultationType(data.consultationType),
			service: getServiceFromConsultationType(data.consultationType),
			message: data.message,
			calendarId: data.calendarId || "cal123", // Utiliser la valeur du champ caché ou une valeur par défaut
		};

		// Envoyer les données au serveur
		sendReservation(reservationData);
	} else {
		console.error("Validation du formulaire échouée.");
	}
});

// Fonction pour extraire la durée du type de consultation
function getDurationFromConsultationType(consultationType) {
	if (consultationType.includes(":")) {
		const durationStr = consultationType.split(":")[1];
		return parseInt(durationStr, 10);
	}
	return null;
}

// Fonction pour extraire le service du type de consultation
function getServiceFromConsultationType(consultationType) {
	if (consultationType.includes(":")) {
		return consultationType.split(":")[0];
	}
	return consultationType;
}

function validateFormData(data) {
	let isValid = true;
	let errorMessage = "";

	// Vérifier le nom
	if (!data.name || data.name.trim() === "") {
		errorMessage += "Veuillez entrer votre nom.<br>";
		isValid = false;
	}

	// Vérifier le prénom
	if (!data.firstName || data.firstName.trim() === "") {
		errorMessage += "Veuillez entrer votre prénom.<br>";
		isValid = false;
	}

	// Vérifier l'email
	if (!data.email || !validateEmail(data.email)) {
		errorMessage += "Veuillez entrer une adresse email valide.<br>";
		isValid = false;
	}

	// Vérifier le téléphone
	if (!data.phone || data.phone.trim() === "") {
		errorMessage += "Veuillez entrer votre numéro de téléphone.<br>";
		isValid = false;
	}

	if (!isValid) {
		showNotification(errorMessage, "danger");
	}

	return isValid;
}

function validateEmail(email) {
	// Expression régulière simple pour valider l'email
	const re = /\S+@\S+\.\S+/;
	return re.test(email);
}

function sendReservation(reservationData) {
	fetch("https://www.larbredelumiere38.fr:8082/api/rdv", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(reservationData),
	})
		.then((response) => {
			if (!response.ok) {
				// Traiter les erreurs en récupérant le texte de la réponse
				return response.text().then((text) => {
					throw new Error(text);
				});
			}
			// Vérifier le type de contenu de la réponse
			const contentType = response.headers.get("Content-Type");
			if (contentType && contentType.includes("application/json")) {
				return response.json();
			} else {
				return response.text();
			}
		})
		.then((result) => {
			// Afficher un message de succès à l'utilisateur
			showNotification(
				"Votre rendez-vous a été réservé avec succès. Un email de confirmation vient de vous être envoyé. !",
				"success"
			);
			// Fermer la modal de réservation
			const reservationModalElement =
				document.getElementById("exampleModalToggle");
			const reservationModalInstance = bootstrap.Modal.getInstance(
				reservationModalElement
			);
			reservationModalInstance.hide();
			// Réinitialiser le formulaire
			reservationForm.reset();
		})
		.catch((error) => {
			console.error("Erreur lors de la réservation :", error);
			showNotification(
				`Une erreur est survenue lors de la réservation : ${error.message}`,
				"danger"
			);
		});
}

// Rendu initial
updateCurrentMonth();
renderCalendar();
updateButtonStates(); // Vérifier l'état initial des boutons
