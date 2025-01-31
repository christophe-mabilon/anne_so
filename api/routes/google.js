const express = require("express");
const router = express.Router();
const fs = require("fs");
const { oauth2Client, saveTokens } = require("../googleAuth");
const logger = require("../utils/logger");

router.get("/auth", (req, res) => {
	try {
		if (!oauth2Client) {
			logger.error("oauth2Client non initialisé.");
			return res
				.status(500)
				.send(
					"Erreur : oauth2Client non initialisé. Vérifiez la configuration."
				);
		}

		const scopes = [
			"https://www.googleapis.com/auth/calendar",
			"https://mail.google.com",
		];
		const authUrl = oauth2Client.generateAuthUrl({
			access_type: "offline",
			prompt: "consent",
			scope: scopes,
		});

		res.redirect(authUrl); // Redirection automatique
	} catch (err) {
		logger.error(
			"Erreur lors de la génération de l'URL d'authentification :",
			err.message || err
		);
		res
			.status(500)
			.send("Erreur lors de la génération de l'URL d'authentification.");
	}
});

router.get("/auth/callback", async (req, res) => {
	const { code } = req.query;
	if (!code) {
		return res.status(400).send("Code d'autorisation manquant.");
	}

	try {
		const { tokens } = await oauth2Client.getToken(code);
		oauth2Client.setCredentials(tokens);
		saveTokens(tokens);
		res.status(200).send(`Authentification réussie et tokens sauvegardés.
       Merci AnneSo tu peut des à présent fermer cette page l'application à été mise a jour`);
	} catch (err) {
		res.status(500).send("Erreur lors de l'authentification.");
	}
});

module.exports = router;
