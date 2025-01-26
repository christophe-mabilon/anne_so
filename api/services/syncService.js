const { google } = require("googleapis");
const db = require("../config/db");
const { oauth2Client } = require("../googleAuth");
const { updateLocalDatabase } = require("../utils/databaseUtils");
const {
	sendUpdateConfirmationEmail,
	sendCancellationEmail,
	sendReminderEmail,
} = require("../services/emailService");
const cron = require("node-cron");
const moment = require("moment");

const syncWithGoogleCalendar = async () => {
	try {
		console.log("Début de la synchronisation avec Google Agenda...");

		const calendar = google.calendar({ version: "v3", auth: oauth2Client });

		// Obtenir l'heure actuelle avec le fuseau horaire Paris
		const now = moment().tz("Europe/Paris").toISOString();
    console.log(now);

		const response = await calendar.events.list({
			calendarId: "primary",
			timeMin: now,
			singleEvents: true,
			orderBy: "startTime",
		});

		const googleEvents = response.data.items || [];

		const [localAppointments] = await db.query("SELECT * FROM appointments");

		const { updatedAppointments, newAppointments, deletedAppointments } =
			updateLocalDatabase(googleEvents, localAppointments);

		// Mettre à jour les rendez-vous existants depuis Google Agenda
		await Promise.all(
			updatedAppointments.map(async (appointment) => {
				try {
					const adminEmail = process.env.USER_EMAIL;

					// Récupérer les informations existantes dans la base
					const [existingAppointment] = await db.query(
						`SELECT start_time, end_time, last_sent_start_time, last_sent_end_time, email_reminder_sent 
                   FROM appointments WHERE googleEventId = ?`,
						[appointment.googleEventId]
					);

					if (existingAppointment.length === 0) {
						console.error(
							`Rendez-vous introuvable pour l'ID Google : ${appointment.googleEventId}`
						);
						return;
					}

					const {
						start_time: oldStartTime,
						end_time: oldEndTime,
						last_sent_start_time: lastSentStartTime,
						last_sent_end_time: lastSentEndTime,
					} = existingAppointment[0];

					// Vérifier si les dates/horaires ont changé
					const hasStartTimeChanged =
						moment(appointment.start_time).format("YYYY-MM-DD HH:mm:ss") !==
						moment(oldStartTime).format("YYYY-MM-DD HH:mm:ss");

					const hasEndTimeChanged =
						moment(appointment.end_time).format("YYYY-MM-DD HH:mm:ss") !==
						moment(oldEndTime).format("YYYY-MM-DD HH:mm:ss");

					// Si aucun changement, ne pas mettre à jour ni envoyer d'email
					if (!hasStartTimeChanged && !hasEndTimeChanged) {
						console.error(`RDV NON MODIFIE : ${appointment.googleEventId}`);
						return;
					}

					// Convertir les dates en timestamps pour le stockage
					const newStartTime = moment(appointment.start_time).valueOf();
					const newEndTime = moment(appointment.end_time).valueOf();

					// Initialiser les timestamps manquants dans la base
					await db.query(
						`UPDATE appointments 
                   SET last_sent_start_time = ?, 
                       last_sent_end_time = ? 
                   WHERE googleEventId = ?`,
						[
							moment(appointment.start_time).format("YYYY-MM-DD HH:mm:ss"),
							moment(appointment.end_time).format("YYYY-MM-DD HH:mm:ss"),
							appointment.googleEventId,
						]
					);

					// Mettre à jour la base locale avec les nouvelles données
					await db.query(
						`UPDATE appointments 
                   SET start_time = ?, 
                       end_time = ?, 
                       service = ?, 
                       message = ?, 
                       updated_at = ? 
                   WHERE googleEventId = ?`,
						[
							moment(appointment.start_time).format("YYYY-MM-DD HH:mm:ss"),
							moment(appointment.end_time).format("YYYY-MM-DD HH:mm:ss"),
							appointment.service,
							appointment.message,
							moment().format("YYYY-MM-DD HH:mm:ss"),
							appointment.googleEventId,
						]
					);

					// Envoyer les emails uniquement si les dates/horaires ont changé
					if (hasStartTimeChanged || hasEndTimeChanged) {
						console.log(
							`Changements détectés dans les horaires pour l'événement : ${appointment.googleEventId}`
						);

						// Préparer les données pour l'email
						const emailData = {
							clientEmail: appointment.email,
							clientName: `${appointment.first_name} ${appointment.last_name}`,
							date: moment(appointment.start_time).format("DD MMMM YYYY"),
							start_time: moment(appointment.start_time).format("HH:mm"),
							end_time: moment(appointment.end_time).format("HH:mm"),
							service: appointment.service,
						};

						// Envoyer l'email au client
						await sendUpdateConfirmationEmail(emailData);

						// Envoyer l'email à l'admin
						const adminEmailData = {
							...emailData,
							clientEmail: adminEmail, // Email de l'admin
							clientName: "Admin",
						};
						await sendUpdateConfirmationEmail(adminEmailData);

						// Mettre à jour les colonnes `last_sent_start_time`, `last_sent_end_time` et réinitialiser `email_reminder_sent`
						await db.query(
							`UPDATE appointments 
                       SET last_sent_start_time = ?, 
                           last_sent_end_time = ?, 
                           email_reminder_sent = FALSE 
                       WHERE googleEventId = ?`,
							[
								moment(appointment.start_time).format("YYYY-MM-DD HH:mm:ss"),
								moment(appointment.end_time).format("YYYY-MM-DD HH:mm:ss"),
								appointment.googleEventId,
							]
						);
					} else {
						console.log(
							`Aucun changement détecté dans les dates/heures. Aucun email envoyé pour l'événement : ${appointment.googleEventId}`
						);
					}
				} catch (err) {
					console.error("Erreur lors de la mise à jour locale :", err.message);
				}
			})
		);

		// Ajouter les nouveaux rendez-vous depuis la base locale vers Google Agenda
		await Promise.all(
			localAppointments
				.filter((appointment) => !appointment.googleEventId)
				.map(async (appointment) => {
					try {
						const event = {
							summary: appointment.service || "Rendez-vous",
							description:
								`Client: ${appointment.first_name || "N/A"} ${
									appointment.last_name || "N/A"
								}\n` +
								`Email: ${appointment.email || "N/A"}\n` +
								`Téléphone: ${appointment.phone || "Non fourni"}\n` +
								`Message: ${appointment.message || "Aucun message"}`,
							start: {
								dateTime: moment(appointment.start_time).toISOString(),
								timeZone: "Europe/Paris",
							},
							end: {
								dateTime: moment(appointment.end_time).toISOString(),
								timeZone: "Europe/Paris",
							},
							colorId: "5",
						};

						const result = await calendar.events.insert({
							calendarId: "primary",
							resource: event,
						});

						if (result.data.id) {
							console.log(
								`Événement ajouté à Google Agenda : ${result.data.id}`
							);
							await db.query(
								"UPDATE appointments SET googleEventId = ? WHERE id = ?",
								[result.data.id, appointment.id]
							);
						}
					} catch (err) {
						console.error(
							"Erreur lors de l'ajout dans Google Agenda :",
							err.message
						);
					}
				})
		);

		// Supprimer les rendez-vous absents dans Google Agenda
		await Promise.all(
			deletedAppointments.map(async (appointment) => {
				try {
					const adminEmail = process.env.USER_EMAIL;

					// Vérifier si un email de suppression a déjà été envoyé
					const [existingAppointment] = await db.query(
						`SELECT email_deletion_sent FROM appointments WHERE id = ?`,
						[appointment.id]
					);

					if (existingAppointment.length === 0) {
						console.error(
							`Rendez-vous introuvable dans la base locale : ${appointment.id}`
						);
						return;
					}

					const { email_deletion_sent } = existingAppointment[0];

					// Supprimer le rendez-vous de la base
					await db.query("DELETE FROM appointments WHERE id = ?", [
						appointment.id,
					]);

					// Envoyer l'email uniquement si non déjà envoyé
					if (!email_deletion_sent) {
						// Préparer les données pour les emails
						const clientEmailData = {
							clientEmail: appointment.email,
							clientName: `${appointment.first_name} ${appointment.last_name}`,
							date: moment(appointment.start_time).format("YYYY-MM-DD"),
							time: moment(appointment.start_time).format("HH:mm"),
							service: appointment.service,
						};

						await sendCancellationEmail(clientEmailData);

						const adminEmailData = {
							clientEmail: adminEmail, // Email de l'admin
							clientName: "Admin",
							date: clientEmailData.date,
							time: clientEmailData.time,
							service: clientEmailData.service,
						};

						await sendCancellationEmail(adminEmailData);

						// Marquer l'email de suppression comme envoyé
						await db.query(
							`UPDATE appointments SET email_deletion_sent = TRUE WHERE id = ?`,
							[appointment.id]
						);
					} else {
						console.log(
							`Emails de suppression déjà envoyés pour le rendez-vous : ${appointment.id}`
						);
					}
				} catch (err) {
					console.error(
						"Erreur lors de la suppression locale ou de l'envoi des emails :",
						err.message
					);
				}
			})
		);

		console.log("Synchronisation terminée avec succès !");
	} catch (error) {
		console.error("Erreur lors de la synchronisation :", error.message);

		if (
			error.message.includes("invalid_grant") ||
			error.message.includes("No access, refresh token")
		) {
			console.log(
				`Les tokens OAuth sont invalides. Notification à l'administrateur à ${adminEmail}...`
			);

			// Préparer les informations pour le mail
			const adminEmail = process.env.USER_EMAIL;
			const emailContent = {
				email: adminEmail,
				message: `Bonjour AnneSo les jetons de connexion pour le site ne sont plus bon merci de te reidentifier avec cette adresse:
          <a href="https://www.larbredelumiere38.fr/google/auth">lien pour s'identifier à ton compte Google</a>`,
			};

			const emailHtml = createRdvMail(emailContent);

			// Envoyer l'email
			await sendEmail({
				to: adminEmail,
				subject: "Tokens OAuth Invalides",
				html: emailHtml,
			});
		}
	}
};

// Planification des rappels automatiques
cron.schedule("0 * * * *", async () => {
	// Exécuté toutes les heures
	try {
		console.log(
			`[${moment().format(
				"YYYY-MM-DD HH:mm:ss"
			)}] Démarrage de la tâche de rappel automatique...`
		);

		const now = moment();
		const reminderStart = now.format("YYYY-MM-DD HH:mm:ss");
		const reminderEnd = now.add(48, "hours").format("YYYY-MM-DD HH:mm:ss");

		console.log(
			`Recherche des RDV entre : ${reminderStart} et ${reminderEnd}...`
		);

		// Requête pour récupérer les rendez-vous dans les 24 heures
		const [appointments] = await db.query(
			`SELECT * FROM appointments 
           WHERE start_time BETWEEN ? AND ? 
           AND email_reminder_sent = FALSE`,
			[reminderStart, reminderEnd]
		);

		if (appointments.length === 0) {
			console.log("Aucun rendez-vous à rappeler pour cette période.");
			return;
		}

		console.log(`Rappels à envoyer pour ${appointments.length} rendez-vous.`);

		for (const appointment of appointments) {
			try {
				const emailData = {
					clientEmail: appointment.email,
					clientName: `${appointment.first_name} ${appointment.last_name}`,
					date: moment(appointment.start_time).format("dddd D MMMM YYYY"),
					time: moment(appointment.start_time).format("HH:mm"),
					service: appointment.service,
				};

				if (!emailData.clientEmail) {
					console.error(
						`Adresse e-mail manquante pour le rendez-vous ID: ${appointment.id}`
					);
					continue;
				}

				// Envoi du rappel
				await sendReminderEmail(emailData);

				// Mise à jour de l'état de rappel
				await db.query(
					`UPDATE appointments SET email_reminder_sent = TRUE WHERE id = ?`,
					[appointment.id]
				);

				console.log(
					`Rappel envoyé avec succès pour le rendez-vous ID: ${appointment.id}`
				);
			} catch (error) {
				console.error(
					`Erreur lors de l'envoi du rappel pour le rendez-vous ID: ${appointment.id}:`,
					error.message
				);
			}
		}
	} catch (error) {
		console.error(
			"Erreur lors de l'exécution des rappels automatiques :",
			error.message
		);
	}
});

module.exports = { syncWithGoogleCalendar };
