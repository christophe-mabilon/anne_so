const nodemailer = require("nodemailer");
const { oauth2Client } = require("../googleAuth"); // Assurez-vous que ce fichier exporte correctement `oauth2Client`
const { createRdvMail } = require("./templateMailAdmin");
const db = require("../config/db"); // Assurez-vous que la configuration DB est correcte

// Fonction pour convertir une date au format YYYY-MM-DD en format lisible
function formatDate(dateString) {
	const moisNoms = [
		"janvier",
		"février",
		"mars",
		"avril",
		"mai",
		"juin",
		"juillet",
		"août",
		"septembre",
		"octobre",
		"novembre",
		"décembre",
	];
	const joursSemaine = [
		"dimanche",
		"lundi",
		"mardi",
		"mercredi",
		"jeudi",
		"vendredi",
		"samedi",
	];

	const date = new Date(dateString);
	const jourSemaine = joursSemaine[date.getDay()];
	const jour = date.getDate();
	const mois = moisNoms[date.getMonth()];
	const annee = date.getFullYear();

	return `${jourSemaine} ${jour} ${mois} ${annee}`;
}

// Fonction pour envoyer un email
const sendEmail = async (to, from, subject, html) => {
	try {
		if (!to) {
			throw new Error("Adresse email de destination non définie.");
		}

		// Vérifie si l'accessToken est valide
		const accessToken = await oauth2Client.getAccessToken();

		const transporter = nodemailer.createTransport({
			service: "gmail",
			auth: {
				type: "OAuth2",
				user: process.env.USER_EMAIL, // Adresse email de l'expéditeur
				clientId: process.env.CLIENT_ID,
				clientSecret: process.env.CLIENT_SECRET,
				refreshToken: process.env.REFRESH_TOKEN,
				accessToken: accessToken?.token, // Vérifie si accessToken existe
			},
		});

		const mailOptions = {
			from: from || process.env.USER_EMAIL, // Défaut : email de l'expéditeur
			to,
			subject,
			html,
		};

		// Envoi de l'email principal
		const result = await transporter.sendMail(mailOptions);
		console.log(
			"Email envoyé avec succès :",
			result.envelope,
			result.messageId
		);

		// Envoi de la confirmation à l'expéditeur si différent de l'admin
		if (from && from !== process.env.USER_EMAIL) {
			const confirmationSubject = "Confirmation de réception de votre email";
			const confirmationHtml = `<!DOCTYPE html>
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
			h2 {
				font-size: 25px;
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
      <p class="mb-3">Bonjour,</p>
				<p class="mb-3">Votre message à <strong>${to}</strong> a été envoyé avec succès. Je vous répondrons dès que possible.</p>
			<p>Merci de votre confiance et excellente journée à vous !</p>
			<p class="mb-3">Très cordialement,</p>
      <div class="col-auto mb-3">
					<p class="mb-1"><strong>Anne-Sophie FAVRE-NOVEL</strong></p>
					<p class="my-0">802 chemin de la Petite Forêt</p>
					<p class="my-0">38440 ARTAS</p>
					<a class="my-0 nav-link" href="mailto:<img class="email-16" src="./img/mail-brun.png" alt="email"
                />"><img class="email-16" src="./img/mail-brun.png" alt="email"
                /></a>
					<p class="my-0">Tel :<strong>06 18 23 42 08</strong></p>
				</div>
			    <hr />			
    </div>
	</body>
</html>`;

			const confirmationOptions = {
				from: process.env.USER_EMAIL,
				to: from,
				subject: confirmationSubject,
				html: confirmationHtml,
			};

			await transporter.sendMail(confirmationOptions);
			console.log("Confirmation d'envoi envoyée avec succès.");
		}

		return result;
	} catch (err) {
		console.error("Erreur lors de l'envoi de l'email :", err.message || err);
		throw err;
	}
};

// Fonction pour envoyer une confirmation de rendez-vous
const sendAppointmentConfirmation = async (appointment) => {
	const clientEmail = appointment.mail || appointment.email;
	const clientFirstName =
		appointment.first_name || appointment.firstname || "Client";
	const clientLastName =
		appointment.last_name || appointment.lastname || "Inconnu";
	const phone = appointment.phone || "Non spécifié";
	const date = appointment.start_time.split(" ")[0];
	const time = appointment.start_time.split(" ")[1] || "Non spécifié";
	const duration = appointment.duration || "Non spécifiée";
	const service = appointment.service || "Service non spécifié";
	const message = appointment.message || "Aucun message";

	if (!clientEmail) {
		throw new Error("Adresse email du client non définie.");
	}

	try {
		// Email à l'admin
		const adminSubject = `Nouveau rendez-vous confirmé : ${service}`;
		const adminHtml = createRdvMail({
			clientLastName,
			clientFirstName,
			telephone: phone,
			email: clientEmail,
			adresse: "Non spécifiée",
			codePostal: "Non spécifié",
			ville: "Non spécifiée",
			service: `${service}`,
			date: `${formatDate(date)},  à ${time.split(":")[0]} Heure ${
				time.split(":")[1]
			}, pour une durée éstimée de ${duration} minutes.`,
			message: `${message}`,
		});

		await sendEmail(
			process.env.USER_EMAIL,
			clientEmail,
			adminSubject,
			adminHtml
		);

		// Email de confirmation au client
		const clientSubject = "Confirmation de votre rendez-vous";
		const clientHtml = `
			<!DOCTYPE html>
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
			h2 {
				font-size: 25px;
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
			<p class="mb-3">Bonjour <strong>${clientFirstName}</strong>,</p>

			<p>
				Votre rendez-vous pour le service "<strong>${service}</strong>" a bien
				été confirmé pour le <strong>${formatDate(date)}</strong> à
				<strong>${time.split(":")[0]} Heure ${time.split(":")[1]}</strong>.
			</p>
			<p class="mb-3">
				Pour une durée estimée d'environ <strong>${duration}</strong> minutes.
			</p>
			<p>En cas d'imprévu, n'hésitez pas à me tenir informée.</p>
			<p class="small mb-3">
				Un email de confirmation vous sera envoyée 48 heures avant votre rendez
				vous
			</p>

			<p class="mb-3">Merci et bonne journée à vous !</p>

			<p class="mb-3">Très cordialement,</p>

			<hr />
			<div class="d-flex align-items-center">
				<div class="col-auto">
					<img
						class="logo me-2"
						src="https://i.ibb.co/P9JgBJh/Arbre-de-Lumiere72-WEB.png"
						alt="logo"
					/>
				</div>
				<div class="col-auto">
					<p class="mb-1"><strong>Anne-Sophie FAVRE-NOVEL</strong></p>
					<p class="my-0">802 chemin de la Petite Forêt</p>
					<p class="my-0 mb-1">38440 ARTAS</p>
					<a class="nav-link" href="mailto:<img class="email-16" src="./img/mail-brun.png" alt="email"
                />"
						><img class="email-16" src="./img/mail-brun.png" alt="email"
                /></a
					>
					<p>Tel :<strong>06 18 23 42 08</strong></p>
				</div>
			</div>
		</div>
	</body>
</html>`;

		await sendEmail(
			clientEmail,
			process.env.USER_EMAIL,
			clientSubject,
			clientHtml
		);

		console.log("Confirmation de rendez-vous envoyée avec succès.");
	} catch (err) {
		console.error(
			"Erreur lors de l'envoi de la confirmation de rendez-vous :",
			err.message || err
		);
		throw err;
	}
};

// Fonction pour envoyer un email de mise à jour de rendez-vous
const sendUpdateConfirmationEmail = async (appointment) => {
	const { clientEmail, clientName, date, start_time, end_time, service } =
		appointment;

	if (!clientEmail) {
		throw new Error("Adresse email du client non définie.");
	}

	try {
		const subject = "Mise à jour de votre rendez-vous";
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
        margin: 0;
      }
      .d-flex {
        display: flex;
      }
      .col-auto {
        flex: 0 0 auto;
        width: auto;
      }
      .align-items-center {
        align-items: center;
      }
      .content {
        background: #ffffff;
        border: 1px solid rgba(0, 0, 0, 0.1);
        box-shadow: 0 3px 5px rgba(0, 0, 0, 0.1);
        border-radius: 15px;
        padding: 20px;
        margin: 0 auto;
      }
      .mb-1 {
        margin-bottom: 0.5rem;
      }
      .mb-3 {
        margin-bottom: 1.5rem;
      }
      .my-0 {
        margin: 0;
      }
      p {
        margin: 0 0 10px;
      }
      .small {
        font-size: 12px;
        color: #666666;
        margin-bottom: 10px;
      }
      .logo {
        width: 100px;
        height: auto;
      }
      h1 {
        font-size: 24px;
        font-weight: 700;
        color: #353434;
        margin: 20px 0;
      }
      h2 {
        font-size: 20px;
        font-weight: 700;
        color: #00a19a;
      }
      h3 {
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      }
      .me-2 {
        margin-right: 10px;
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
      <p class="mb-3">Bonjour <strong>${clientName}</strong>,</p>
      <p class="mb-3">
        Votre rendez-vous pour le service "<strong>${service}</strong>" a été
        mis à jour avec succès.
      </p>
      <p>Rappel de votre rendez-vous :</p>
      <p><strong>Date : ${formatDate(date)}</strong></p>
      <p>De :<strong>${start_time}</strong> à <strong>${end_time}</strong></p>
      <p>En cas d'imprévu, n'hésitez pas à me tenir informée.</p>
      <p class="small mb-3">
        Un email de confirmation vous sera envoyé 48 heures avant votre rendez-vous.
      </p>
      <p>Merci de votre confiance et excellente journée à vous !</p>
      <p class="mb-3">Très cordialement,</p>
      <hr />
      <div class="d-flex align-items-center">
        <div class="col-auto">
          <img
            class="logo me-2"
            src="https://i.ibb.co/P9JgBJh/Arbre-de-Lumiere72-WEB.png"
            alt="logo"
          />
        </div>
        <div class="col-auto">
          <p class="mb-1"><strong>Anne-Sophie FAVRE-NOVEL</strong></p>
          <p class="my-0">802 chemin de la Petite Forêt</p>
          <p class="my-0 mb-1">38440 ARTAS</p>
          <a class="nav-link" href="mailto:<img class="email-16" src="./img/mail-brun.png" alt="email"
                />"
            ><img class="email-16" src="./img/mail-brun.png" alt="email"
                /></a
          >
          <p>Tel : <strong>06 18 23 42 08</strong></p>
        </div>
      </div>
    </div>
  </body>
</html>
`;

		await sendEmail(clientEmail, process.env.USER_EMAIL, subject, html);

		console.log("Email de mise à jour envoyé avec succès.");
	} catch (err) {
		console.error(
			"Erreur lors de l'envoi de l'email de mise à jour :",
			err.message || err
		);
		throw err;
	}
};

// Fonction pour envoyer un email d'annulation de rendez-vous
const sendCancellationEmail = async (appointment) => {
	const { clientEmail, clientName, date, time, service } = appointment;

	if (!clientEmail) {
		throw new Error("Adresse email du client non définie.");
	}

	try {
		const subject = "Annulation de votre rendez-vous";
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
                h2 {
                    font-size: 25px;
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
                <p class="mb-3">Bonjour <strong>${clientName}</strong>,</p>
                <p class="mb-3">
                    Votre rendez-vous pour le service <strong>${service}</strong> prévu le <strong>${formatDate(
			date
		)}</strong> à <strong>${time}</strong> a bien été annulé.
                </p>
                <p>Si vous souhaitez reprogrammer, n'hésitez pas à me contacter ou à reprendre rendez-vous directement en ligne.</p>
                <p>Merci de votre confiance et excellente journée à vous !</p>
                <p class="mb-3">Très cordialement,</p>
                <hr />
                <div class="d-flex align-items-center">
                    <div class="col-auto">
                        <img
                            class="logo me-2"
                            src="https://i.ibb.co/P9JgBJh/Arbre-de-Lumiere72-WEB.png"
                            alt="logo"
                        />
                    </div>
                    <div class="col-auto">
                        <p class="mb-1"><strong>Anne-Sophie FAVRE-NOVEL</strong></p>
                        <p class="my-0">802 chemin de la Petite Forêt</p>
                        <p class="my-0 mb-1">38440 ARTAS</p>
                        <a class="nav-link" href="mailto:<img class="email-16" src="./img/mail-brun.png" alt="email"
                />"><img class="email-16" src="./img/mail-brun.png" alt="email"
                /></a>
                        <p>Tel : <strong>06 18 23 42 08</strong></p>
                    </div>
                </div>
            </div>
        </body>
        </html>`;

		await sendEmail(clientEmail, process.env.USER_EMAIL, subject, html);

		console.log("Email d'annulation envoyé avec succès.");
	} catch (err) {
		console.error(
			"Erreur lors de l'envoi de l'email d'annulation :",
			err.message || err
		);
		throw err;
	}
};

// Fonction pour envoyer un email si non déjà envoyé
const sendEmailIfNotSent = async (appointment, toClient = true) => {
	const column = toClient ? "email_sent_to_client" : "email_sent_to_admin";

	try {
		// Vérifie si l'email a déjà été envoyé
		const [result] = await db.query(
			`SELECT ${column} FROM appointments WHERE id = ?`,
			[appointment.id]
		);

		if (result.length === 0) {
			throw new Error(`Aucun rendez-vous trouvé avec l'ID ${appointment.id}.`);
		}

		if (result[0][column]) {
			console.log(`Email déjà envoyé pour ${toClient ? "client" : "admin"}`);
			return;
		}

		// Envoi de l'email
		if (toClient) {
			await sendAppointmentConfirmation(appointment);
		} else {
			const adminAppointment = {
				...appointment,
				clientEmail: process.env.USER_EMAIL,
			};
			await sendAppointmentConfirmation(adminAppointment);
		}

		// Marque l'email comme envoyé
		await db.query(`UPDATE appointments SET ${column} = TRUE WHERE id = ?`, [
			appointment.id,
		]);
	} catch (err) {
		console.error("Erreur lors de l'envoi de l'email :", err.message || err);
		throw err;
	}
};

const sendReminderEmail = async (emailData) => {
	try {
		console.log(emailData);

		if (!emailData.clientEmail) {
			console.error(
				"Erreur : Adresse e-mail manquante pour l'envoi du rappel."
			);
			throw new Error("Adresse e-mail du client non définie.");
		}
		const subject = "Rappel de votre rendez-vous";
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
                h2 {
                    font-size: 25px;
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
                 <p>Bonjour ${emailData.clientName},</p>
      <p>Nous vous rappelons que vous avez un rendez-vous prévu :</p>
      <ul>
        <li><strong>Date :</strong> ${emailData.date}</li>
        <li><strong>Heure :</strong> ${emailData.time}</li>
        <li><strong>Service :</strong> ${emailData.service}</li>
      </ul>
      <p>N'hésitez pas a me contacter si vous avez des questions.</p>     
                <p>Merci de votre confiance et excellente journée à vous !</p>
                <p class="mb-3">Très cordialement,</p>
                 <div class="col-auto">
                        <p class="mb-1"><strong>Anne-Sophie FAVRE-NOVEL</strong></p>
                        <p class="my-0">802 chemin de la Petite Forêt</p>
                        <p class="my-0">38440 ARTAS</p>
                        <a class="nav-link my-0" href="mailto:<img class="email-16" src="./img/mail-brun.png" alt="email"
                />"><img class="email-16" src="./img/mail-brun.png" alt="email"
                /></a>
                        <p class="my-0">Tel : <strong>06 18 23 42 08</strong></p>
                <hr />
                </div>
            </div>
        </body>
        </html>











     
    `;

		await sendEmail(
			emailData.clientEmail,
			process.env.SENDER_EMAIL,
			subject,
			html
		);
	} catch (error) {
		console.error(
			"Erreur lors de l'envoi de l'email de rappel :",
			error.message
		);
		throw error;
	}
};

module.exports = {
	sendEmail,
	sendAppointmentConfirmation,
	sendUpdateConfirmationEmail,
	sendCancellationEmail,
	sendEmailIfNotSent,
	sendReminderEmail,
};
