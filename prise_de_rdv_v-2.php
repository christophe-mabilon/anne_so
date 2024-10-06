<!DOCTYPE html>
<html lang="fr">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Prise de rendez-vous</title>
  <!-- Bootstrap CSS local -->
  <link href="./node_modules/bootstrap/dist/css/bootstrap.min.css" rel="stylesheet" />
  <link rel="stylesheet" href="./node_modules/bootstrap-icons/font/bootstrap-icons.css" />

  <!-- Flatpickr CSS local -->
  <link rel="stylesheet" href="./node_modules/flatpickr/dist/flatpickr.min.css" />

  <link rel="stylesheet" href="./css/style.css" />
  <link rel="stylesheet" href="./css/menu.css" />
  <style>
  .modal-md {
    max-width: 80%;
  }

  .error {
    color: red;
    font-size: 0.9em;
    display: none;
  }

  .input-group .form-control.is-invalid {
    border-color: red;
  }
  </style>
  <!-- Bootstrap CSS local -->
  <link href="./node_modules/bootstrap/dist/css/bootstrap.min.css" rel="stylesheet" />
  <link rel="stylesheet" href="./node_modules/bootstrap-icons/font/bootstrap-icons.css" />

  <!-- Flatpickr CSS local -->
  <link rel="stylesheet" href="./node_modules/flatpickr/dist/flatpickr.min.css" />

  <link rel="stylesheet" href="./css/style.css" />
  <link rel="stylesheet" href="./css/menu.css" />
</head>

<body class="p-3">
  <h1>Réserver un rendez-vous en ligne</h1>
  <form id="reservation-form" action="process.php" method="POST" class="p-3" novalidate>
    <div class="row">
      <div class="col-12">
        <div class="col-xxl-6 mb-3">
          <label for="name" class="form-label green-dark">Nom :</label>
          <div class="input-group">
            <span class="input-group-text"><i class="green-dark bi bi-person"></i></span>
            <input type="text" id="name" name="name" class="form-control" placeholder="Votre nom" required />
          </div>
          <div class="error" id="nameError">Veuillez entrer votre nom.</div>
        </div>
      </div>
      <div class="col-12">
        <div class="col-xxl-6 mb-3">
          <label for="firstName" class="form-label green-dark">Prénom :</label>
          <div class="input-group">
            <span class="input-group-text"><i class="green-dark bi bi-person-fill"></i></span>
            <input type="text" id="firstName" name="firstName" class="form-control" placeholder="Votre prénom"
              required />
          </div>
          <div class="error" id="firstNameError">Veuillez entrer votre prénom.</div>
        </div>
      </div>
      <div class="col-12 col-xxl-4">
        <div class="mb-3">
          <label for="email" class="form-label green-dark">Email :</label>
          <div class="input-group">
            <span class="input-group-text"><i class="green-dark bi bi-envelope"></i></span>
            <input type="email" id="email" name="email" class="form-control" placeholder="name@example.com" required />
          </div>
          <div class="error" id="emailError">Veuillez entrer une adresse email valide.</div>
        </div>
      </div>
      <div class="col-12 col-xxl-3">
        <div class="mb-3">
          <label for="date" class="form-label green-dark">Date du rendez-vous :</label>
          <div class="input-group">
            <span class="input-group-text"><i class="green-dark bi bi-calendar3"></i></span>
            <input type="text" id="date" name="date" class="form-control" placeholder="Sélectionner une date"
              required />
          </div>
          <div class="error" id="dateError">Veuillez sélectionner une date.</div>
        </div>
      </div>
      <div class="col-12 col-xxl-4">
        <div class="mb-3">
          <label for="time" class="form-label green-dark">Heure du rendez-vous :</label>
          <div class="input-group">
            <span class="input-group-text"><i class="green-dark bi bi-clock"></i></span>
            <input type="text" id="time" name="time" class="form-control" placeholder="Sélectionner une heure"
              required />
          </div>
          <div class="error" id="timeError">Veuillez sélectionner une heure.</div>
        </div>
      </div>
    </div>
    <div class="col-12">
      <div class="mb-3">
        <label for="message" class="form-label green-dark">Objet du rendez-vous :</label>
        <div class="input-group">
          <span class="input-group-text"><i class="green-dark bi bi-pencil-square"></i></span>
          <textarea class="form-control" id="message" name="message" required rows="10"></textarea>
        </div>
        <div class="error" id="messageError">Veuillez indiquer l'objet du rendez-vous.</div>
      </div>
    </div>
    <div class="col-auto my-3">
      <input class="btn btn-green-dark p-3 text-white fs-6" type="submit" value="Réserver mon RDV" />
    </div>
    </div>
  </form>

  <!-- Flatpickr JS local -->
  <script src="./node_modules/flatpickr/dist/flatpickr.min.js"></script>
  <script src="./node_modules/flatpickr/dist/l10n/fr.js"></script>

  <!-- Initialisation de Flatpickr et validation -->
  <script>
  document.addEventListener("DOMContentLoaded", function() {
    // Initialiser le sélecteur de date
    flatpickr("#date", {
      dateFormat: "d-m-Y", // Format de date (ex: 2023-10-10)
      locale: "fr",
    });

    // Initialiser le sélecteur d'heure
    flatpickr("#time", {
      enableTime: true,
      noCalendar: true,
      dateFormat: "H:i", // Format de l'heure (ex: 14:30)
      time_24hr: true, // Heure au format 24h
      locale: "fr",
    });

    // Validation du formulaire
    const form = document.getElementById("reservation-form");

    form.addEventListener("submit", function(event) {
      let isValid = true;

      // Réinitialiser les messages d'erreur
      document.querySelectorAll(".error").forEach(function(el) {
        el.style.display = "none";
      });
      document.querySelectorAll(".form-control").forEach(function(el) {
        el.classList.remove("is-invalid");
      });

      // Validation du nom
      const name = document.getElementById("name");
      if (!name.value.trim()) {
        isValid = false;
        document.getElementById("nameError").style.display = "block";
        name.classList.add("is-invalid");
      }

      // Validation du prénom
      const firstName = document.getElementById("firstName");
      if (!firstName.value.trim()) {
        isValid = false;
        document.getElementById("firstNameError").style.display = "block";
        firstName.classList.add("is-invalid");
      }

      // Validation de l'email
      const email = document.getElementById("email");
      const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
      if (!email.value.trim() || !emailPattern.test(email.value.trim())) {
        isValid = false;
        document.getElementById("emailError").style.display = "block";
        email.classList.add("is-invalid");
      }

      // Validation de la date
      const date = document.getElementById("date");
      if (!date.value.trim()) {
        isValid = false;
        document.getElementById("dateError").style.display = "block";
        date.classList.add("is-invalid");
      }

      // Validation de l'heure
      const time = document.getElementById("time");
      if (!time.value.trim()) {
        isValid = false;
        document.getElementById("timeError").style.display = "block";
        time.classList.add("is-invalid");
      }

      // Validation du message
      const message = document.getElementById("message");
      if (!message.value.trim()) {
        isValid = false;
        document.getElementById("messageError").style.display = "block";
        message.classList.add("is-invalid");
      }

      // Empêcher l'envoi du formulaire si la validation échoue
      if (!isValid) {
        event.preventDefault();
      }
    });
  });
  </script>
</body>

</html>