# BuzzMaster

BuzzMaster is a user-friendly application for hosting quiz shows with physical input devices, such as PlayStation buzzers.

## Online Version

The online version of BuzzMaster can be found [here](https://marvin-wtt.github.io/BuzzMaster/#/).
Some features might not be available in the online version.

## Key Features

### Buzzer Questions

Participants compete to be the first to press the red buzzer and answer the question.

### Quiz Questions

Participants select one of four options within a given time frame.

### Stopwatch Mode

Tracks the time taken for each participant to press the red button.

### Leaderboard

Keeps track of points gained or lost throughout the quiz show.
Points can be updated either directly after a question / game or manually in the leaderboard.
When choosing to update the points manually, either new points can be set or the current points can be updated using simple algebra.

### Energy Saving Notification

Shows a notification when a controller is about to go into energy saving mode.
The feature is available for a controller after the first button press.

### Remote Control

A mobile-friendly companion app that allows the host to control the game (start rounds, manage points, and reset buzzers) while walking around. The app connects over the local network and is secured by a dynamic 4-digit PIN.

### Google Slides Presentation

Runs a Google Slides deck in its own window next to the cast screen, so the questions and the scores share the projector.
The presentation window can be moved and resized freely, and the cast window floats over it, keeping the leaderboard readable on top of the slides.
Slides are advanced from the remote control, which can also black out the presentation between rounds without losing the current slide.
The presentation needs to be shared with anyone who has the link.

## Installation

> [!Note]
> Please note that there might be a security warning when downloading and executing the installer due to the lack of code signing.
> This is because obtaining a certificate for code signing is prohibitively expensive.

Download the installer from the latest release and follow the installation steps.

Once the application is started, it will check for new versions. Once a new version is available, it will be installed on the next launch automatically.

## Troubleshooting

Playstation 2 Buzz devices are recognised as a malfunctioning USB-hub instead of a HID-Device on windows.
Follow these steps to update the driver manually:

1. Open the device-manager
2. Right-click the USB-Hub and select `update-driver`
3. Select `Search for driver software on the computer`
4. Select `Select from a list of device drivers on the computer`
   5.From the list, select the entry `USB Input Device` or `USB HID Device`

## Development

```sh
npm install
npm run dev
```

Build executable for production:

```sh
npm ci
npm run build
```

## Contributing

Contributions are welcome! Feel free to submit pull requests with new features, bug fixes, or improvements.

## License

Please refer to the [LICENCE](LICENCE) file for licensing information.

## Credits

Logo designed by drawingfreddie
