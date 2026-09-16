export default {
  title: 'Presentation',

  setup: {
    title: 'Google Slides Presentation',
    description:
      'Paste a Google Slides link to open it in its own window. Place that window where you want it; the cast window floats over it, so the leaderboard stays on top of the slides. Make sure the presentation is shared with anyone who has the link.',
    urlLabel: 'Presentation link',
    urlHint: 'https://docs.google.com/presentation/d/...',
    showing: 'The presentation is running in its own window.',
    placement:
      'Drag the presentation window to the screen you want, then use full screen to hide its frame. The cast window floats over it wherever they overlap.',
  },

  action: {
    show: 'Show',
    hide: 'Hide',
    next: 'Next slide',
    previous: 'Previous slide',
    blackout: 'Black screen',
    unblackout: 'Show slides',
    fullscreen: 'Full screen',
    exitFullscreen: 'Leave full screen',
    close: 'Close',
  },

  error: {
    invalidUrl: 'That does not look like a Google Slides link.',
    noCastWindow: 'Open the cast window first.',
    notShared:
      'Google asked for a sign-in. Share the presentation with anyone who has the link.',
    loadFailed: 'The presentation could not be loaded.',
  },
};
