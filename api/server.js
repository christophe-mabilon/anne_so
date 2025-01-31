require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const fs = require("fs");
const https = require("https"); // Module HTTPS de Node.js
const { refreshTokensIfNeeded } = require("./googleAuth"); // Import unique
const {
	getCalendar,
	createEvent,
	updateEvent,
	deleteEvent,
} = require("./googleCalendar");
const { updateLocalDatabase } = require("./services/syncService");
const db = require("./config/db"); // Vérifiez que ce fichier est correctement configuré
const appointmentsRoutes = require("./routes/appointments");
const googleRoutes = require("./routes/google");
const emailRoutes = require("./routes/emailRoutes");
const openingHours = require("./routes/openingHours");
const { syncWithGoogleCalendar } = require("./services/syncService");
const logger = require("./utils/logger");

const app = express();
const port = 8082; // Le port sur lequel ton serveur HTTPS va écouter

// Middleware
app.use(cors());
app.use(express.json());

// Rafraîchir les tokens toutes les 30 minutes
setInterval(async () => {
	await refreshTokensIfNeeded();
}, 1000 * 60 * 30);

// Planification de la synchronisation toutes les 10 minutes
cron.schedule("*/1 * * * *", async () => {
	logger.info("Début de la tâche de synchronisation avec Google Agenda...");
	await syncWithGoogleCalendar();
});

// Routes
app.use("/google", googleRoutes);
app.use("/api/rdv", appointmentsRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/openingHours", openingHours);

// Gestion des erreurs globales
app.use((err, req, res, next) => {
	logger.error("Erreur non gérée :", err);
	res.status(500).send("Erreur serveur");
});

// Chemin vers les certificats SSL
const sslOptions = {
	key: fs.readFileSync(
		"/etc/letsencrypt/live/larbredelumiere38.fr/privkey.pem"
	), // Remplace par le chemin vers ta clé privée
	cert: fs.readFileSync(
		"/etc/letsencrypt/live/larbredelumiere38.fr/fullchain.pem"
	), // Remplace par le chemin vers ton certificat
	ca: fs.readFileSync("/etc/letsencrypt/live/larbredelumiere38.fr/chain.pem"), // Facultatif : chaîne de certificats si nécessaire
};

// Créer un serveur HTTPS avec ton certificat
https.createServer(sslOptions, app).listen(port, () => {
	logger.info(`Serveur démarré sur https://www.larbredelumiere38.fr:${port}`);
});
