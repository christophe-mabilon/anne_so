const fs = require("fs");
const { google } = require("googleapis");
require("dotenv").config();
const path = require("path");
const { notifyAdmin } = require("./services/backupEmailService");
const logger = require("./utils/logger");

const TOKEN_PATH = path.resolve(__dirname, "tokens.json");
const ALERT_LOG_PATH = path.resolve(__dirname, "lastAlertSent.json");

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URL
);

// Fonction pour charger la dernière date d'alerte envoyée
const loadLastAlertSent = () => {
    if (fs.existsSync(ALERT_LOG_PATH)) {
        try {
            const data = JSON.parse(fs.readFileSync(ALERT_LOG_PATH, "utf8"));
            return new Date(data.lastSent);
        } catch (err) {
            console.error("Erreur lors du chargement du fichier d'alerte :", err.message || err);
            return null;
        }
    }
    return null;
};

// Fonction pour enregistrer la dernière date d'alerte envoyée
const saveLastAlertSent = () => {
    try {
        fs.writeFileSync(ALERT_LOG_PATH, JSON.stringify({ lastSent: new Date() }, null, 2));
        
    } catch (err) {
        console.error("Erreur lors de l'enregistrement de la date d'alerte :", err.message || err);
    }
};

// Fonction pour vérifier si une alerte peut être envoyée
const shouldSendAlert = () => {
    const lastSent = loadLastAlertSent();
    if (!lastSent) return true;

    const now = new Date();
    const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);
    return lastSent < sixHoursAgo;
};

const loadTokens = async () => {
    try {
       
        if (fs.existsSync(TOKEN_PATH)) {
            const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"));
            oauth2Client.setCredentials(tokens);
            console.log("Tokens chargés avec succès.");
            scheduleTokenRefresh();
        } else {
            console.log("Aucun token trouvé. Vérification pour alerte...");
            if (shouldSendAlert()) {
                await notifyAdmin(process.env.BACKUP_SMTP_USER);
                saveLastAlertSent(); // Enregistrer uniquement si l'alerte est envoyée
            } else {
                console.log("Alerte non envoyée : délai de 6 heures non écoulé.");
            }
        }
    } catch (err) {
        console.error("Erreur lors du chargement des tokens :", err.message || err);
        if (shouldSendAlert()) {
            await notifyAdmin(process.env.BACKUP_SMTP_USER);
            saveLastAlertSent(); // Enregistrer uniquement si l'alerte est envoyée
        }
    }
};

const saveTokens = (tokens) => {
    try {
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
        console.log("Tokens sauvegardés avec succès.");
    } catch (err) {
        console.error("Erreur lors de la sauvegarde des tokens :", err.message || err);
    }
};

const refreshTokensIfNeeded = async () => {
  try {
      if (
          !oauth2Client.credentials ||
          oauth2Client.credentials.expiry_date <= Date.now()
      ) {
          console.log("Rafraîchissement des tokens...");
          const { credentials } = await oauth2Client.refreshAccessToken();
          oauth2Client.setCredentials(credentials);
          saveTokens(credentials);
          scheduleTokenRefresh(); // Planifier le prochain rafraîchissement
          console.log("Rafraîchissement effectué avec succès.");
      } else {
          console.log("Tokens encore valides, pas de rafraîchissement nécessaire.");
      }
  } catch (err) {
      console.error("Erreur lors du rafraîchissement des tokens :", err.message || err);

      if (err.response?.data?.error === "invalid_grant") {
          console.error("Le refresh_token est invalide ou expiré. Une nouvelle authentification est requise.");
          const authUrl = oauth2Client.generateAuthUrl({
              access_type: "offline",
              scope: ["https://www.googleapis.com/auth/calendar"],
          });
          console.log(`Veuillez réauthentifier l'application en visitant ce lien : ${authUrl}`);
      } else {
          console.error("Erreur inconnue lors du rafraîchissement :", err.message || err);
          if (shouldSendAlert()) {
              await notifyAdmin(process.env.BACKUP_SMTP_USER);
              saveLastAlertSent();
          }
      }
  }
};

const scheduleTokenRefresh = () => {
  const credentials = oauth2Client.credentials;
  if (credentials && credentials.expiry_date) {
      const refreshTime = credentials.expiry_date - Date.now() - 5 * 60 * 1000; // 5 minutes avant expiration
      if (refreshTime > 0) {
          console.log(`Planification du rafraîchissement dans ${refreshTime / 1000} secondes.`);
          setTimeout(async () => {
              try {
                  console.log("Rafraîchissement programmé du token...");
                  await refreshTokensIfNeeded();
              } catch (err) {
                  console.error("Erreur lors du rafraîchissement programmé :", err.message || err);
              }
          }, refreshTime);
      }
  }
};



// Charger les tokens au démarrage
(async () => {
    await loadTokens();
})();

module.exports = { oauth2Client, saveTokens, refreshTokensIfNeeded };
