const { google } = require("googleapis");
const { oauth2Client, refreshTokensIfNeeded } = require("./googleAuth");
const logger = require("./utils/logger");

const getCalendar = () =>
	google.calendar({ version: "v3", auth: oauth2Client });

// Créer un événement dans Google Calendar
const createEvent = async (event) => {
	try {
		await refreshTokensIfNeeded();
		const calendar = getCalendar();
		const response = await calendar.events.insert({
			calendarId: "primary",
			resource: event,
		});
		console.log("Événement créé avec succès :", response.data);
		return response.data;
	} catch (err) {
		console.error("Erreur lors de la création de l'événement :", err);
		throw err;
	}
};

// Mettre à jour un événement dans Google Calendar
const updateEvent = async (eventId, event) => {
	try {
		const calendar = getCalendar();
		await refreshTokensIfNeeded();
		await calendar.events.update({
			calendarId: "primary",
			eventId,
			resource: event,
		});
		console.log("Événement mis à jour avec succès.");
	} catch (err) {
		console.error(
			"Erreur lors de la mise à jour de l'événement :",
			err.message || err
		);
		throw err;
	}
};

// Supprimer un événement dans Google Calendar
const deleteEvent = async (eventId) => {
	try {
		const calendar = getCalendar();
		await refreshTokensIfNeeded();
		await calendar.events.delete({
			calendarId: "primary",
			eventId,
		});
		console.log("Événement supprimé avec succès.");
	} catch (err) {
		console.error(
			"Erreur lors de la suppression de l'événement :",
			err.message || err
		);
		throw err;
	}
};

module.exports = { getCalendar, createEvent, updateEvent, deleteEvent };
