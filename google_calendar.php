<?php
require 'vendor/autoload.php';

// Initialiser le client Google
$client = new Google_Client();
$client->setAuthConfig('path/to/credentials.json'); // Utilise ton fichier credentials.json
$client->addScope(Google_Service_Calendar::CALENDAR);
$client->setRedirectUri('http://localhost/google-callback.php'); // L'URI de redirection

// Si on a un token d'accès, l'utiliser
if (isset($_SESSION['access_token']) && $_SESSION['access_token']) {
  $client->setAccessToken($_SESSION['access_token']);

  // Initialiser le service Google Calendar
  $service = new Google_Service_Calendar($client);

  // Ajouter l'événement dans Google Calendar
  $event = new Google_Service_Calendar_Event(array(
    'summary' => 'Nouvelle réservation',
    'location' => 'Adresse de l\'événement',
    'description' => 'Description du rendez-vous',
    'start' => array(
      'dateTime' => '2024-10-07T09:00:00', // Date et heure du début
      'timeZone' => 'Europe/Paris',
    ),
    'end' => array(
      'dateTime' => '2024-10-07T10:00:00', // Date et heure de fin
      'timeZone' => 'Europe/Paris',
    ),
    'attendees' => array(
      array('email' => 'client@example.com'), // L'email du client
    ),
    'reminders' => array(
      'useDefault' => FALSE,
      'overrides' => array(
        array('method' => 'email', 'minutes' => 24 * 60), // Rappel 1 jour avant
        array('method' => 'popup', 'minutes' => 10), // Rappel 10 minutes avant
      ),
    ),
  ));

  // Ajouter l'événement au calendrier principal
  $calendarId = 'primary';
  $event = $service->events->insert($calendarId, $event);

  echo 'Événement créé : ' . $event->htmlLink;
} else {
  // Rediriger vers Google pour autorisation
  $authUrl = $client->createAuthUrl();
  header('Location: ' . filter_var($authUrl, FILTER_SANITIZE_URL));
}
