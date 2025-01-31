require("dotenv").config();
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const logger = require("../utils/logger");

// Exemple avec un endpoint pour récupérer les horaires
router.get("/getall", async (req, res) => {
	try {
		const query = `SELECT jour, morning_open, morning_close, afternoon_open, afternoon_close
FROM opening_hours
WHERE morning_open != '00:00:00'
   OR morning_close != '00:00:00'
   OR afternoon_open != '00:00:00'
   OR afternoon_close != '00:00:00'`;
		const [results] = await db.query(query);

		res.json(results);
	} catch (error) {
		console.error(
			"Erreur lors de la récupération des horaires :",
			error.message
		);
		res
			.status(500)
			.json({ error: "Erreur serveur lors de la récupération des horaires." });
	}
});

module.exports = router;
