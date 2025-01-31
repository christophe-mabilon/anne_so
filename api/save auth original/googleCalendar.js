const { google } = require("googleapis");
const { oauth2Client } = require("./googleAuth");

const getCalendar = () =>
	google.calendar({ version: "v3", auth: oauth2Client });
const logger = require("../utils/logger");


// Créer un événement dans Google Calendar
const createEvent = async (event) => {
	try {
		const calendar = getCalendar();
		const response = await calendar.events.insert({
			calendarId: "primary",
			resource: event,
		});
		logger.info("Événement créé avec succès :", response.data);
		return response.data;
	} catch (err) {
		logger.error("Erreur lors de la création de l'événement :", err);
		throw err;
	}
};

// Mettre à jour un événement dans Google Calendar
const updateEvent = async (eventId, event) => {
	const calendar = getCalendar();
	await calendar.events.update({
		calendarId: "primary",
		eventId,
		resource: event,
	});
};

// Supprimer un événement dans Google Calendar
const deleteEvent = async (eventId) => {
	const calendar = getCalendar();
	await calendar.events.delete({
		calendarId: "primary",
		eventId,
	});
};

module.exports = { getCalendar, createEvent, updateEvent, deleteEvent };
