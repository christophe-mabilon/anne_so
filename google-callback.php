<?php
require 'vendor/autoload.php';

session_start();

$client = new Google_Client();
$client->setAuthConfig('path/to/credentials.json');
$client->addScope(Google_Service_Calendar::CALENDAR);
$client->setRedirectUri('http://localhost/google-callback.php'); // L'URI de redirection

// Récupérer le code d'authentification après le consentement
if (isset($_GET['code'])) {
    $token = $client->fetchAccessTokenWithAuthCode($_GET['code']);
    $_SESSION['access_token'] = $token;

    // Redirection vers la page de création d'événement après authentification réussie
    header('Location: google-calendar.php');
}