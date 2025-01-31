const express = require("express");
const router = express.Router();
const {
	sendEmail,
	sendMessageToAdminWithConfirmation,
	sendAppointmentConfirmation,
} = require("../services/emailService");
const logger = require("../utils/logger");

// Route pour gérer l'envoi d'un email avec une adresse fixe
router.post("/send-email", async (req, res) => {
	const { firstName, lastName, phone, email, message } = req.body;

	try {
		// Définir le contenu de l'email
		const subject = `Message de contact de ${firstName} ${lastName}`;
		const html = `<!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f0f0f0;
                    color: #333333;
                    padding: 20px;
                }
                .d-flex {
                    display: flex !important;
                }
                .col-auto {
                    flex: 0 0 auto;
                    width: auto;
                }
                .align-items-center {
                    align-items: center !important;
                }
                .content {
                    background: rgba(255, 255, 255, 0.9);
                    border: 1px solid rgba(0, 0, 0, 0.3);
                    box-shadow: 0 3px 5px rgba(0, 0, 0, 0.3);
                    border-radius: 15px;
                    padding: 3vh 3vw;
                }
                .mb-1 {
                    margin-bottom: 0.5rem !important;
                }
                .mb-3 {
                    margin-bottom: 2rem !important;
                }
                .my-0 {
                    margin-bottom: 0;
                    margin-top: 1px;
                }
                p {
                    margin-bottom: 0;
                }
                .small {
                    font-size: 12px;
                    color: #666666;
                    margin-bottom: 0.5rem;
                }
                .logo {
                    width: 200px;
                    height: auto;
                }
                h1 {
                    font-size: 25px;
                    font-weight: 700;
                    font-family: "Oswald", sans-serif;
                    color: rgb(53, 52, 52);
                    margin-top: 1.5rem;
                }
                h3 {
                    
                    font-weight: 700;
                    font-family: "Oswald", sans-serif;
                    color: rgb(0, 161, 154);
                }
                h3 {
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
                }
                .me-2 {
                    margin-right: 1rem;
                }
                .nav-link {
                    color: #0159a7;
                    text-decoration: none;
                }
                .nav-link:hover {
                    text-decoration: underline;
                }
            </style>
        </head>
        <body>
            <div class="content">
                <div class="d-flex align-items-center">
                    <div class="col-auto">
                        <img
                            class="logo me-2"
                            src="https://i.ibb.co/P9JgBJh/Arbre-de-Lumiere72-WEB.png"
                            alt="logo"
                        />
                    </div>
                    <div class="col-auto">
                        <h1>L'Arbre de Lumière</h1>
                    </div>
                </div>
                <hr />
                 <p>Bonjour Anne So,</p>
      <h3>Nouveau message de contact</h3>
      <ul class="mb-3">
        <li><strong>Nom :</strong> ${firstName} ${lastName}</li>
        <li><strong>Téléphone :</strong> ${phone}</li>
        <li><strong>Email :</strong> ${email}</li>
        <li><strong>Message :</strong> ${message}</li>
      </ul>
          
                <p>Merci de répondre le plus rapidement possible et excellente journée à toi !</p>
                <p class="mb-3">Très cordialement,</p>
                 
                <hr />
                </div>
            </div>
        </body>
        </html>`;

		// Envoi de l'email au destinataire fixe
		const result = await sendEmail(
			process.env.USER_EMAIL, // Destinataire fixe
			email, // Expéditeur
			subject,
			html
		);

		res.status(200).json({ message: "Email envoyé avec succès", result });
	} catch (error) {
		console.error("Erreur lors de l'envoi de l'email :", error.message);
		res.status(500).json({ error: "Erreur lors de l'envoi de l'email" });
	}
});

module.exports = router;
