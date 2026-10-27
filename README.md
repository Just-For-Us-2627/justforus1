# Just for You ♡ — shared romantic website

A responsive, password-protected romantic website with an animated envelope and shared content.

## Features
- Password gate and envelope-opening animation.
- Shared live letter with automatic saving and polling updates.
- Shared photo memories gallery with captions, image compression, and remove buttons.
- A “Reasons I love you” reveal button.
- Shared song URL and a player (use a direct HTTPS audio file URL; playback is user-initiated).
- Shared special-date countdown.
- Two separate shared letters and a shared message board.
- Responsive mobile layout and reduced-motion support.

## Requirements
- Node.js 18 or newer.
- npm.

## Run locally
1. Extract the ZIP and open a terminal in the project folder.
2. Run `npm install`.
3. Set a private password and start the server:

   **macOS/Linux**
   ```bash
   LETTER_PASSWORD='replace-with-a-long-private-password' npm start
   ```

   **Windows PowerShell**
   ```powershell
   $env:LETTER_PASSWORD='replace-with-a-long-private-password'; npm start
   ```

4. Open `http://localhost:3000` in your browser.
5. To let someone in another location use it, deploy the Node.js project to a host that supports Node.js and persistent writable storage, set `LETTER_PASSWORD` in the host's environment variables, and share the deployed HTTPS URL. `localhost` works only on your own device.

## Storage and privacy notes
- Data is stored in `data/letter.json` and `data/experience.json`. Keep the `data` directory persistent when deploying or updates can be lost on redeploy/restart.
- Anyone with the shared password can view and edit all shared letters, gallery entries, and messages. This is a shared-password private-link experience, not individual user accounts.
- Simultaneous edits to the same content can overwrite one another; coordinate edits if both people are typing at once.
- The server uses a simple in-memory session-token list. Restarting the server invalidates existing sessions; users can unlock again.
- The gallery stores compressed images as data in the JSON file. For a large gallery or production deployment, move image storage to object storage and shared data to a database.
- For a public deployment, use HTTPS, a strong password, persistent storage, backups, and server-side rate limiting.
- The song field expects a direct HTTPS audio file link, not a Spotify/YouTube webpage link. Only share audio you have permission to use.
