const nodemailer = require("nodemailer");
const { logo } = require("./logotoB64");
const logger = require("../utils/logger");

const sendBackupEmail = async ({ to, subject, text, html }) => {
	try {
		if (
			!process.env.BACKUP_SMTP_HOST ||
			!process.env.BACKUP_SMTP_PORT ||
			!process.env.BACKUP_SMTP_USER ||
			!process.env.BACKUP_SMTP_PASSWORD
		) {
			throw new Error(
				"Les informations SMTP de secours ne sont pas configurées."
			);
		}

		const transporter = nodemailer.createTransport({
			host: process.env.BACKUP_SMTP_HOST,
			port: process.env.BACKUP_SMTP_PORT,
			secure: false, // true pour le port 465
			auth: {
				user: process.env.BACKUP_SMTP_USER,
				pass: process.env.BACKUP_SMTP_PASSWORD,
			},
		});

		const mailOptions = {
			from: process.env.BACKUP_SMTP_USER,
			to,
			subject,
			text,
			html, // HTML avec l'image en Base64
			headers: {
				"X-Priority": "1", // Définir la priorité sur "1" pour "Urgent"
				Priority: "urgent", // Pour compatibilité avec certains clients email
				Importance: "high", // Pour Outlook et autres
			},
		};

		const result = await transporter.sendMail(mailOptions);
		logger.info("Email de secours envoyé avec succès :", result);
	} catch (err) {
		logger.error(
			"Erreur lors de l'envoi de l'email de secours :",
			err.message || err
		);
	}
};

const notifyAdmin = async (adminEmail) => {
	if (!adminEmail) {
		logger.error("Erreur : L'email de l'administrateur est manquant !");
		return;
	}

	let redirectUrl = process.env.ADMIN_ACCOUNT_URL;
	try {
		await sendBackupEmail({
			to: adminEmail,
			subject:
				"Mail URGENT APP ARBRE DE LUMIERE Tokens OAuth Invalides ou Manquants",
			html: `<!DOCTYPE html>
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
			.content {
				background: rgba(255, 255, 255, 0.9);
				border: 1px solid rgba(0, 0, 0, 0.3);
				box-shadow: 0 3px 5px rgba(0, 0, 0, 0.3);
				border-radius: 15px;
				padding: 3vh 3vw;
			}
			p {
				margin-bottom: 10px;
			}
			.logo {
				width: 100px;
				height: auto;
			}
			h1 {
				font-size: 25px;
				font-weight: 700;
				font-family: "Oswald", sans-serif;
				color: rgb(53, 52, 52);
				margin-top: 1.5rem;
			}
			h2 {
				font-size: 25px;
				font-weight: 700;
				font-family: "Oswald", sans-serif;
				color: rgb(0, 161, 154);
			}
			.urgent {
				background: linear-gradient(rgb(255, 0, 0) 0%, rgb(100, 1, 1) 100%);
				border-radius: 5px;
				border: 1px solid grey;
				box-shadow: 0 3px 5px rgba(0, 0, 0, 0.3);
				color: white;
				padding: 2px;
				margin-top: 5px;
				text-align: center;
			}
			h3 {
				text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
			}
			.d-flex-container {
				display: flex;
				align-items: center;
			}
			.me-2 {
				margin-right: 1rem;
			}
			nav-link {
				color: #0159a7;
			}
		</style>
	</head>
	<body>
		<div class="content">
			<div class="d-flex-container">
				<img
					class="logo me-2"
					src="https://i.ibb.co/P9JgBJh/Arbre-de-Lumiere72-WEB.png"
					alt="logo"
				/>
				<h1>L'arbre de lumiére</h1>
			</div>
			<div class="urgent">
				<h3>ATTENTION : MESSAGE URGENT</h3>
			</div>
			<p>Bonjour , AnneSo</p>
			<p>
				Les jettons Google (tokens OAuth) sont invalides ou manquants. Il faut
				réauthentifier l'application et ton compte en utilisant le lien suivant
				:
			</p>
			<a class="nav-link" href="${redirectUrl}"
				><div class="d-flex-container">
					<img src="" class="" />${redirectUrl}
				</div></a
			>
			<p>Merci... et Bonne journée à toi</p>
			<p>Christophe Mabilon</p>
		</div>
	</body>
</html>`,
		});
		logger.info(
			`Notification de secours envoyéea l'admin ${adminEmail} avec succès.`
		);
	} catch (err) {
		logger.error(
			"Erreur lors de l'envoi de l'email de secours :",
			err.message || err
		);
	}
};

function sanitizeBase64(base64) {
	// Retire les caractères non valides
	const cleanedBase64 = base64.replace(/[^A-Za-z0-9+/=]/g, "");
	// Ajoute un padding si nécessaire
	const paddingNeeded = 4 - (cleanedBase64.length % 4);
	if (paddingNeeded !== 4) {
		return cleanedBase64 + "=".repeat(paddingNeeded);
	}
	return cleanedBase64;
}

module.exports = { sendBackupEmail, notifyAdmin };
