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
  /* Custom width for the modal */
  .modal-md {
    max-width: 80%;
    /* Adjust the max-width as needed */
  }
  </style>
</head>

<body>
  <!-- Button to trigger the modal -->
  <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#appointmentModal">
    Réserver un rendez-vous
  </button>

  <!-- Modal -->
  <div class="modal fade" id="appointmentModal" tabindex="-1" aria-labelledby="appointmentModalLabel"
    aria-hidden="true">
    <div class="modal-dialog modal-md">
      <!-- Use the custom class for medium size -->
      <div class="modal-content">
        <div class="modal-header">
          <div class="d-flex align-items-center"><i class="fs-4 bi bi-calendar2-check brun me-2"></i></div>
          <h5 class="modal-title" id="appointmentModalLabel">Réserver un rendez-vous en ligne</h5>
          <button type="button" class="btn-close brun" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <form action="process.php" method="POST" class="p-3">
            <div class="row">
              <div class="col-12">
                <div class="col-xxl-6 mb-3">
                  <label for="name" class="form-label green-dark">Nom :</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="green-dark bi bi-person"></i></span>
                    <input type="text" id="name" name="name" class="form-control" placeholder="Votre nom" required />
                  </div>
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
                </div>
              </div>
              <div class="col-12 col-xxl-4">
                <div class="mb-3">
                  <label for="email" class="form-label green-dark">Email :</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="green-dark bi bi-envelope"></i></span>
                    <input type="email" id="email" name="email" class="form-control" placeholder="name@example.com"
                      required />
                  </div>
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
                </div>
              </div>
              <div class="col-12">
                <div class="mb-3">
                  <label for="message" class="form-label green-dark">Objet du rendez-vous :</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="green-dark bi bi-pencil-square"></i></span>
                    <textarea class="form-control" id="message" name="message" required rows="10"></textarea>
                  </div>
                </div>
              </div>
              <div class="col-auto my-3">
                <input class="btn btn-green-dark p-3 text-white fs-6" type="submit" value="Réserver mon RDV" />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>

  <!-- Bootstrap JS local -->
  <script type="text/javascript" src="./node_modules/bootstrap/dist/js/bootstrap.bundle.min.js"></script>

  <!-- Flatpickr JS local -->
  <script src="./node_modules/flatpickr/dist/flatpickr.min.js"></script>

  <!-- Initialisation de Flatpickr -->
  <script>
  document.addEventListener("DOMContentLoaded", function() {
    // Initialiser le sélecteur de date
    flatpickr("#date", {
      dateFormat: "Y-m-d", // Format de date (ex: 2023-10-10)
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
  });
  </script>
</body>

</html>