export default {
  title: 'Presentación',

  setup: {
    title: 'Presentación de Google Slides',
    description:
      'Pega un enlace de Google Slides para abrirla en su propia ventana. Coloca esa ventana donde quieras; la ventana de cast queda por encima, así que la clasificación permanece sobre las diapositivas. Asegúrate de que la presentación esté compartida con cualquier persona que tenga el enlace.',
    urlLabel: 'Enlace de la presentación',
    urlHint: 'https://docs.google.com/presentation/d/...',
    showing: 'La presentación se reproduce en su propia ventana.',
    placement:
      'Arrastra la ventana de la presentación a la pantalla que quieras y luego ponla en pantalla completa para ocultar su marco. La ventana de cast queda por encima donde se solapan.',
  },

  action: {
    show: 'Mostrar',
    hide: 'Ocultar',
    next: 'Diapositiva siguiente',
    previous: 'Diapositiva anterior',
    blackout: 'Pantalla en negro',
    unblackout: 'Mostrar diapositivas',
    fullscreen: 'Pantalla completa',
    exitFullscreen: 'Salir de pantalla completa',
    close: 'Cerrar',
  },

  error: {
    invalidUrl: 'Esto no parece un enlace de Google Slides.',
    noCastWindow: 'Abre primero la ventana de cast.',
    notShared:
      'Google pide iniciar sesión. Comparte la presentación con cualquier persona que tenga el enlace.',
    loadFailed: 'No se ha podido cargar la presentación.',
  },
};
