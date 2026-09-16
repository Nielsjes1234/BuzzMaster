export default {
  title: 'Presentatie',

  setup: {
    title: 'Google Slides-presentatie',
    description:
      'Plak een Google Slides-link om de presentatie in een eigen venster te openen. Zet dat venster waar je wilt; het castvenster zweeft eroverheen, dus het scorebord blijft bovenop de slides staan. Zorg dat de presentatie gedeeld is met iedereen die de link heeft.',
    urlLabel: 'Link naar presentatie',
    urlHint: 'https://docs.google.com/presentation/d/...',
    showing: 'De presentatie draait in een eigen venster.',
    placement:
      'Sleep het presentatievenster naar het scherm dat je wilt en zet het daarna op volledig scherm om de rand te verbergen. Het castvenster zweeft eroverheen waar ze elkaar overlappen.',
  },

  action: {
    show: 'Tonen',
    hide: 'Verbergen',
    next: 'Volgende slide',
    previous: 'Vorige slide',
    blackout: 'Zwart scherm',
    unblackout: 'Slides tonen',
    fullscreen: 'Volledig scherm',
    exitFullscreen: 'Volledig scherm verlaten',
    close: 'Sluiten',
  },

  error: {
    invalidUrl: 'Dit lijkt geen Google Slides-link te zijn.',
    noCastWindow: 'Open eerst het castvenster.',
    loadFailed: 'De presentatie kon niet worden geladen.',
  },
};
