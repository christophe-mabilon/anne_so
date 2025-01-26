const { logo } = require("./logotoB64");
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
/** Nouveau RDV */
function createRdvMail(email) {
	const now = new Date();
	const timeOfDay = now.getHours() >= 12 ? "Bonsoir" : "Bonjour";

	return `<!DOCTYPE html>
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
      }
      .align-items-center {
        align-items: center;
      }
      .content {
        background: #ffffff;
        border: 1px solid rgba(0, 0, 0, 0.1);
        box-shadow: 0 3px 5px rgba(0, 0, 0, 0.1);
        border-radius: 10px;
        padding: 20px;
        margin: 0 auto;
      }
      .mb-1 {
        margin-bottom: 0.5rem;
      }
      .mb-3 {
        margin-bottom: 1.5rem;
      }
      p {
        margin: 0 0 10px;
      }
      .small {
        font-size: 12px;
        color: #666666;
      }
      .logo {
        width: 150px;
        height: auto;
      }
      h1 {
        font-size: 24px;
        font-weight: bold;
        color: #353434;
        margin-top: 20px;
      }
      h2 {
        font-size: 20px;
        font-weight: bold;
        color: #00a19a;
      }
      a {
        color: #0159a7;
        text-decoration: none;
      }
      a:hover {
        text-decoration: underline;
      }
    </style>
  </head>
  <body>
    <div class="content">
      <div class="d-flex align-items-center">
        <div class="col-auto">
          <img
            class="logo"
            src="https://i.ibb.co/P9JgBJh/Arbre-de-Lumiere72-WEB.png"
            alt="logo"
          />
        </div>
        <div class="col-auto">
          <h1>L'Arbre de Lumière</h1>
        </div>
      </div>
      <hr />
      <p class="mb-3">${timeOfDay} <b>Anne Sophie</b>,</p> 
      <p class="mb-3">Ceci est une demande de renseignements
				provenant de L'arbre de Lumière :</p>
        <h3 class="mb-3">Voici le contenu du message :</h3>
        <p><b>Nom :</b> ${email.clientLastName}</p>
        <p><b>Prénom :</b> ${email.clientFirstName}</p>
        <p><b>Téléphone :</b> ${email.telephone}</p>
        <p><b>Adresse :</b> ${email.adresse}</p>
        <p><b>Code postal :</b> ${email.codePostal}</p>
        <p><b>Ville :</b> ${email.ville}</p>
        <p><b>Email :</b> ${email.email}</p>
        <p><b>Service :</b> ${email.service}</p>
        <p><b>Date du RDV :</b> ${email.date}</p>
        <p><b>Message :</b> ${email.message}</p>
        <br />
        <p>Merci de le recontacter le plus rapidement possible...</p>
        <p>Bonne journée à toi :-)</p>
      <hr />
      <div class="d-flex align-items-center">
        <div class="col-auto">
          <img
            class="logo"
            src="https://i.ibb.co/P9JgBJh/Arbre-de-Lumiere72-WEB.png"
            alt="logo"
          />
        </div>
        <div class="col-auto">
          <p class="mb-1"><strong>Anne-Sophie FAVRE-NOVEL</strong></p>
          <p class="my-0">802 chemin de la Petite Forêt</p>
          <p class="my-0">38440 ARTAS</p>
          <a href="mailto:larbredelumiere38@gmail.com">larbredelumiere38@gmail.com</a>
          <p>Tel : <strong>06 18 23 42 08</strong></p>
        </div>
      </div>
    </div>
  </body>
</html>
`;
}

module.exports = {
	createRdvMail,
};
