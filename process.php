<?php
// Connexion à la base de données
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "reservation_system";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
  die("Erreur de connexion: " . $conn->connect_error);
}

// Récupération des données du formulaire
$name = $_POST['name'];
$firstName = $_POST['firstName'];
$email = $_POST['email'];
$date = $_POST['date'];
$time = $_POST['time'];
$message = $_POST['message'];

// Conversion de la date au format SQL
$date = date("Y-m-d", strtotime(str_replace('/', '-', $date)));

// Vérification de la disponibilité
$sql_check = "SELECT * FROM reservations WHERE date = '$date' AND time = '$time'";
$result = $conn->query($sql_check);

if ($result->num_rows > 0) {
  echo "Désolé, cette date et heure sont déjà réservées.";
} else {
  // Insertion de la réservation dans la base de données
  $sql = "INSERT INTO reservations (name, firstName, email, date, time, message)
  VALUES ('$name', '$firstName', '$email', '$date', '$time', '$message')";

  if ($conn->query($sql) === TRUE) {
    echo "Réservation effectuée avec succès.";
  } else {
    echo "Erreur : " . $conn->error;
  }
}

$conn->close();
?>