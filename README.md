# SillyTavern Second Confirmation

A small SillyTavern extension for adding a second confirmation popup to buttons.

It intercepts configured button clicks, asks the user to confirm, and only continues the original click after confirmation.


## Default Rules

The extension currently ships with confirmation rules for branch creation:

- chat message **Create Branch** button;
- alternate reply editor / swipe picker **Create Branch** button.

## Installation

Install it as a third-party SillyTavern extension:

1. Open **Extensions** in SillyTavern.
2. Use **Install extension**.
3. Enter this repository URL:

   ```text
   https://github.com/awaae001/SillyTavern-second-confirmation
   ```

4. Reload SillyTavern after installation.

## Usage

After the extension is loaded, configured buttons will ask for confirmation before their original action runs.

To disable or enable the behavior:

1. Open **Extensions** settings.
2. Find **Second Confirmation**.
3. Toggle **Enable branch creation confirmation**.

## How It Works

The extension listens for matching click events during the browser capture phase.

When a configured button is clicked:

1. the original click is stopped;
2. a confirmation popup is shown;
3. if confirmed, the click is replayed once;
4. the replayed click is allowed through without another confirmation.

## License

MIT
