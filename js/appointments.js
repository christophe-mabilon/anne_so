require("dotenv").config();
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const moment = require("moment-timezone");
const { syncWithGoogleCalendar } = require("../services/syncService");
const {
    sendAppointmentConfirmation,
    sendCancellationEmail,
    sendUpdateConfirmationEmail,
    sendReminderEmail,
} = require("../services/emailService");

// Fonction utilitaire pour envoyer un email si non envoyé
const sendEmailIfNotSent = async (appointment, type) => {
    const emailColumns = {
        creation: "email_creation_sent",
        update: "email_update_sent",
        deletion: "email_deletion_sent",
        reminder: "email_reminder_sent",
    };

    const column = emailColumns[type];

    if (!column) {
        console.error("Type d'email non reconnu :", type);
        return;
    }

    try {
        const [result] = await db.query(
            `SELECT ${column} FROM appointments WHERE id = ?`,
            [appointment.id]
        );

        if (result[0][column]) {
            console.log(`Email déjà envoyé pour ${type}`);
            return;
        }

        switch (type) {
            case "creation":
                await sendAppointmentConfirmation(appointment);
                break;
            case "update":
                await sendUpdateConfirmationEmail(appointment);
                break;
            case "deletion":
                await sendCancellationEmail(appointment);
                break;
            case "reminder":
                await sendReminderEmail(appointment);
                break;
            default:
                throw new Error("Type d'email non supporté");
        }

        await db.query(`UPDATE appointments SET ${column} = TRUE WHERE id = ?`, [
            appointment.id,
        ]);

    } catch (error) {
        console.error(`Erreur lors de l'envoi de l'email (${type}):`, error.message);
    }
};

// Récupérer les disponibilités
router.get("/availabilities", async (req, res) => {
    try {
        const { date, duration } = req.query;
        if (!date || !duration) {
            return res.status(400).send("La date et la durée sont requises");
        }

        const formattedDate = moment
            .tz(date, "YYYY-MM-DD", "Europe/Paris")
            .format("YYYY-MM-DD");
        const durationMinutes = parseInt(duration, 10);

        const [hours] = await db.query(`SELECT * FROM opening_hours`);
        if (hours.length === 0) {
            return res.status(404).send("Horaires d'ouverture non définis");
        }

        const openingHours = hours[0];
        const { morning_open, morning_close, afternoon_open, afternoon_close } = openingHours;

        if (!morning_open || !morning_close || !afternoon_open || !afternoon_close) {
            return res.status(500).send("Horaires d'ouverture incomplets");
        }

        const [appointments] = await db.query(
            `SELECT start_time, end_time FROM appointments WHERE DATE(start_time) = ?`,
            [formattedDate]
        );

        const slots = [
            {
                start: moment.tz(`${formattedDate} ${morning_open}`, "Europe/Paris"),
                end: moment.tz(`${formattedDate} ${morning_close}`, "Europe/Paris"),
            },
            {
                start: moment.tz(`${formattedDate} ${afternoon_open}`, "Europe/Paris"),
                end: moment.tz(`${formattedDate} ${afternoon_close}`, "Europe/Paris"),
            },
        ];

        appointments.forEach((appointment) => {
            const appointmentStart = moment.tz(appointment.start_time, "Europe/Paris");
            const appointmentEnd = moment.tz(appointment.end_time, "Europe/Paris");
            let newSlots = [];

            slots.forEach((slot) => {
                if (
                    appointmentEnd.isSameOrBefore(slot.start) ||
                    appointmentStart.isSameOrAfter(slot.end)
                ) {
                    newSlots.push(slot);
                } else {
                    if (appointmentStart.isAfter(slot.start)) {
                        newSlots.push({ start: slot.start, end: appointmentStart });
                    }
                    if (appointmentEnd.isBefore(slot.end)) {
                        newSlots.push({ start: appointmentEnd, end: slot.end });
                    }
                }
            });

            slots.splice(0, slots.length, ...newSlots);
        });

        const availabilities = [];
        slots.forEach((slot) => {
            let currentTime = slot.start.clone();

            while (
                currentTime.clone().add(durationMinutes, "minutes").isSameOrBefore(slot.end)
            ) {
                const start = currentTime.format("HH:mm");
                const end = currentTime.clone().add(durationMinutes, "minutes").format("HH:mm");
                availabilities.push({ start, end });
                currentTime.add(durationMinutes, "minutes");
            }
        });

        if (availabilities.length === 0) {
            res.status(200).json({
                message: "Aucune disponibilité trouvée pour la date demandée",
                availabilities: [],
            });
        } else {
            res.status(200).json({ message: "Disponibilités trouvées", availabilities });
        }
    } catch (err) {
        console.error("Erreur lors de la récupération des disponibilités :", err);
        res.status(500).send("Erreur serveur");
    }
});

// Créer un rendez-vous
router.post("/", async (req, res) => {
    try {
        let {
            first_name,
            last_name,
            email,
            phone,
            start_time,
            end_time,
            duration,
            service,
            calendarId,
            message,
        } = req.body;

        if (!first_name || !last_name || !email || !start_time || !end_time || !duration || !service) {
            return res.status(400).send("Tous les champs requis doivent être remplis");
        }

        const startTimeMoment = moment.tz(start_time, "Europe/Paris");
        const endTimeMoment = moment.tz(end_time, "Europe/Paris");

        if (!startTimeMoment.isValid() || !endTimeMoment.isValid()) {
            return res.status(400).send("Dates de début ou de fin invalides");
        }

        start_time = startTimeMoment.format("YYYY-MM-DD HH:mm:ss");
        end_time = endTimeMoment.format("YYYY-MM-DD HH:mm:ss");

        const [userResults] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
        let userId;

        if (userResults.length === 0) {
            const [userResult] = await db.query(
                "INSERT INTO users (first_name, last_name, email, phone) VALUES (?, ?, ?, ?)",
                [first_name, last_name, email, phone]
            );
            userId = userResult.insertId;
        } else {
            userId = userResults[0].id;
        }

        if (!message) {
            message = "";
        }

        const insertQuery = `
        INSERT INTO appointments 
        (user_id, first_name, last_name, email, phone, start_time, end_time, duration, service, calendarId, message, email_creation_sent, email_update_sent, email_deletion_sent, email_reminder_sent) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE, FALSE, FALSE, FALSE)
      `;
        const [insertResult] = await db.query(insertQuery, [
            userId,
            first_name,
            last_name,
            email,
            phone,
            start_time,
            end_time,
            duration,
            service,
            calendarId,
            message,
        ]);

        const appointment = {
            id: insertResult.insertId,
            first_name,
            last_name,
            email,
            phone,
            start_time,
            end_time,
            duration,
            service,
            message
        };

        res.status(201).send("Rendez-vous créé avec succès");

        try {
            await syncWithGoogleCalendar();
            await sendEmailIfNotSent(appointment, "creation");
        } catch (error) {
            console.error("Erreur lors de la confirmation de rendez-vous :", error);
        }
    } catch (err) {
        console.error("Erreur lors de la création du rendez-vous :", err);
        res.status(500).send("Erreur serveur");
    }
});

// Récupérer tous les rendez-vous
router.get("/", async (req, res) => {
    try {
        const [results] = await db.query(`SELECT * FROM appointments`);

        const appointments = results.map((appointment) => {
            appointment.start_time = moment
                .tz(appointment.start_time, "Europe/Paris")
                .format("YYYY-MM-DD HH:mm");
            appointment.end_time = moment
                .tz(appointment.end_time, "Europe/Paris")
                .format("YYYY-MM-DD HH:mm");
            return appointment;
        });

        res.json(appointments);
    } catch (err) {
        console.error("Erreur lors de la récupération des rendez-vous :", err);
        res.status(500).send("Erreur serveur");
    }
});

// Récupérer un rendez-vous par ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const [results] = await db.query(
            `SELECT * FROM appointments WHERE id = ?`,
            [id]
        );

        if (results.length === 0) {
            res.status(404).send("Rendez-vous non trouvé");
        } else {
            const appointment = results[0];
            appointment.start_time = moment
                .tz(appointment.start_time, "Europe/Paris")
                .format("YYYY-MM-DD HH:mm");
            appointment.end_time = moment
                .tz(appointment.end_time, "Europe/Paris")
                .format("YYYY-MM-DD HH:mm");
            res.json(appointment);
        }
    } catch (err) {
        console.error("Erreur lors de la récupération du rendez-vous :", err);
        res.status(500).send("Erreur serveur");
    }
});

// Mise à jour d'un rendez-vous
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const {
            first_name,
            last_name,
            email,
            phone,
            start_time,
            end_time,
            duration,
            service,
            calendarId,
        } = req.body;

        const formattedStartTime = moment
            .tz(start_time, "Europe/Paris")
            .format("YYYY-MM-DD HH:mm:ss");
        const formattedEndTime = moment
            .tz(end_time, "Europe/Paris")
            .format("YYYY-MM-DD HH:mm:ss");

        const [existingAppointment] = await db.query(
            `SELECT * FROM appointments WHERE id = ?`,
            [id]
        );

        if (existingAppointment.length === 0) {
            return res.status(404).send("Rendez-vous non trouvé");
        }

        const currentData = existingAppointment[0];
        const isDateChanged =
            currentData.start_time !== formattedStartTime ||
            currentData.end_time !== formattedEndTime;

        const [result] = await db.query(
            `UPDATE appointments SET first_name = ?, last_name = ?, email = ?, phone = ?, start_time = ?, end_time = ?, duration = ?, service = ?, calendarId = ?,
                email_update_sent = FALSE WHERE id = ?`,
            [
                first_name,
                last_name,
                email,
                phone,
                formattedStartTime,
                formattedEndTime,
                duration,
                service,
                calendarId,
                id,
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).send("Rendez-vous non trouvé");
        }

        res.send("Rendez-vous mis à jour avec succès");

        const appointment = {
            id,
            first_name,
            last_name,
            email,
            phone,
            start_time: formattedStartTime,
            end_time: formattedEndTime,
            duration,
            service,
        };

        if (isDateChanged) {
            try {
                await sendEmailIfNotSent(appointment, "update");
            } catch (error) {
                console.error(
                    "Erreur lors de l'envoi de l'e-mail de mise à jour :",
                    error
                );
            }
        }
    } catch (error) {
        console.error("Erreur lors de la mise à jour du rendez-vous :", error);
        res.status(500).send("Erreur serveur");
    }
});

// Suppression d'un rendez-vous
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [existingAppointment] = await db.query(
            `SELECT * FROM appointments WHERE id = ?`,
            [id]
        );

        if (existingAppointment.length === 0) {
            return res.status(404).send("Rendez-vous non trouvé");
        }

        const { email, first_name, last_name, start_time, service } =
            existingAppointment[0];

        const [result] = await db.query(`DELETE FROM appointments WHERE id = ?`, [
            id,
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).send("Rendez-vous non trouvé");
        }

        res.send("Rendez-vous supprimé avec succès");

        const appointment = {
            email,
            first_name,
            last_name,
            start_time,
            service,
        };

        try {
            await sendEmailIfNotSent(appointment, "deletion");
        } catch (error) {
            console.error("Erreur lors de l'envoi de l'e-mail d'annulation :", error);
        }
    } catch (error) {
        console.error("Erreur lors de la suppression du rendez-vous :", error);
        res.status(500).send("Erreur serveur");
    }
});



module.exports = router;
