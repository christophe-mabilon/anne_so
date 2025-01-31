const { createLogger, format, transports } = require("winston");
const path = require("path");

// Définition du logger
const logger = createLogger({
    level: "info", // Niveau de log (info, error, warn, debug)
    format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)
    ),
    transports: [
        new transports.Console(), // Affichage console
        new transports.File({ filename: path.join(__dirname, "../logs/server.log") }) // Stockage fichier
    ]
});

module.exports = logger;
