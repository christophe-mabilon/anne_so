const updateLocalDatabase = (googleEvents, localAppointments) => {
  const updatedAppointments = [];
  const newAppointments = [];
  const deletedAppointments = [];

  const localGoogleIds = localAppointments.map((appointment) => appointment.googleEventId);

  googleEvents.forEach((event) => {
    const localAppointment = localAppointments.find(
      (appointment) => appointment.googleEventId === event.id
    );

    if (localAppointment) {
      const eventUpdated = new Date(event.updated).getTime();
      const localUpdated = new Date(localAppointment.updated_at || localAppointment.created_at).getTime();

      // Si l'événement Google est plus récent, ajouter aux mises à jour
      if (eventUpdated > localUpdated) {
        updatedAppointments.push({
          ...localAppointment,
          start_time: event.start.dateTime,
          end_time: event.end.dateTime,
          service: event.summary || "Rendez-vous",
          updated_at: event.updated,
        });
      }
    } else {
      // Nouvel événement dans Google Agenda non présent dans la base locale
      newAppointments.push({
        googleEventId: event.id,
        start_time: event.start.dateTime,
        end_time: event.end.dateTime,
        service: event.summary || "Rendez-vous",
      });
    }
  });

  // Supprimer les rendez-vous locaux qui n'existent plus dans Google Agenda
  localAppointments.forEach((appointment) => {
    if (appointment.googleEventId && !googleEvents.find((event) => event.id === appointment.googleEventId)) {
      deletedAppointments.push(appointment);
    }
  });

  return { updatedAppointments, newAppointments, deletedAppointments };
};

module.exports = { updateLocalDatabase };
