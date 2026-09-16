export default {
  title: 'Präsentation',

  setup: {
    title: 'Google-Slides-Präsentation',
    description:
      'Füge einen Google-Slides-Link ein, um die Präsentation in einem eigenen Fenster zu öffnen. Platziere dieses Fenster nach Wunsch; das Cast-Fenster liegt darüber, sodass die Bestenliste über den Folien bleibt. Die Präsentation muss für alle mit dem Link freigegeben sein.',
    urlLabel: 'Link zur Präsentation',
    urlHint: 'https://docs.google.com/presentation/d/...',
    showing: 'Die Präsentation läuft in einem eigenen Fenster.',
    placement:
      'Zieh das Präsentationsfenster auf den gewünschten Bildschirm und schalte dann auf Vollbild, um den Rahmen auszublenden. Das Cast-Fenster liegt darüber, wo sich beide überlappen.',
  },

  action: {
    show: 'Anzeigen',
    hide: 'Ausblenden',
    next: 'Nächste Folie',
    previous: 'Vorherige Folie',
    blackout: 'Schwarzes Bild',
    unblackout: 'Folien zeigen',
    fullscreen: 'Vollbild',
    exitFullscreen: 'Vollbild verlassen',
    close: 'Schließen',
  },

  error: {
    invalidUrl: 'Das sieht nicht nach einem Google-Slides-Link aus.',
    noCastWindow: 'Öffne zuerst das Cast-Fenster.',
    loadFailed: 'Die Präsentation konnte nicht geladen werden.',
  },
};
