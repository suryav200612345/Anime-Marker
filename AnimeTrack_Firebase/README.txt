OTAKULOG — ANIME TRACKER + ANDROID TELEGRAM IMPORT

PROJECT FILES
- index.html                 Main dashboard, AniList lookup, Firebase Auth/Firestore, episode importer
- manifest.webmanifest       Installable PWA manifest with Android video Share Target
- sw.js                      Offline shell and Android file-share handler
- icons/icon-192.png         PWA icon
- icons/icon-512.png         PWA icon
- firebase.json              Firebase Hosting + Firestore rules deployment config
- .firebaserc                Selects Firebase project anime-maker-d2725
- firestore.rules            Per-user private Firestore rules
- deploy-firebase.bat        Windows deployment helper

FEATURES
- Track Watching, Completed, Plan to watch, On hold, and Dropped anime.
- Store episode progress, totals, ratings, year, format, source, poster, notes, and airing details.
- Search AniList for anime posters and catalogue metadata.
- Filter, search, sort, continue-watching panel, +1/-1 episode controls, and JSON export.
- Save locally when signed out; sync the library and progress to Firestore when signed in.
- Share one or more Telegram video files to the installed OtakuLog PWA from Android's Share menu.
- Use the manual Android Downloads/file picker if Telegram does not offer OtakuLog in its Share menu.
- Detect common filename patterns such as S02E05, 2x05, Season 2 Episode 5, Episode 5, fansub names like "Anime - 05", and four-digit episode numbers like "One Piece - 1111".
- Search AniList using the detected title; review the title and episode before saving.
- Queue shared videos one at a time, store download history, and detect duplicate season/episode imports.
- Downloaded episodes do not automatically count as watched. The "Also update my watched progress" checkbox is OFF by default.

FIREBASE CONFIGURATION
Your Firebase Web App configuration for anime-maker-d2725 is already inserted in index.html. Firebase JavaScript SDK 13.4.0 is loaded from the official CDN. Analytics initializes only when supported.

1. Open https://console.firebase.google.com/project/anime-maker-d2725/authentication
2. Choose Get started if needed, then enable Email/Password under Sign-in method.
3. Open https://console.firebase.google.com/project/anime-maker-d2725/firestore
4. Create a Cloud Firestore database if it does not already exist.
5. Deploy the included firestore.rules file. The rules permit each signed-in user to read/write only their own users/{uid}/anime documents.
6. If sign-in reports auth/unauthorized-domain, add anime-maker-d2725.web.app under Authentication > Settings > Authorized domains.

DEPLOY TO FIREBASE HOSTING (REQUIRED FOR ANDROID SHARE TARGET)
The Share Target requires OtakuLog to be hosted over HTTPS and installed on the Android device. Firebase Hosting provides the HTTPS site.

On Windows, open this extracted project folder and either double-click deploy-firebase.bat or run these commands in a terminal:

  npm install -g firebase-tools
  firebase login
  firebase deploy

The included .firebaserc selects anime-maker-d2725. The deploy command publishes Hosting and the Firestore rules configured in firebase.json. To publish just the website, use:

  firebase deploy --only hosting

After deployment, the site will be available at a URL such as:
  https://anime-maker-d2725.web.app

INSTALL ON ANDROID + TELEGRAM
1. Open https://anime-maker-d2725.web.app in Chrome on your Android phone.
2. Open Chrome's three-dot menu and choose Install app (or Add to Home screen).
3. Launch OtakuLog once after installation so the service worker is active.
4. In Telegram, open a downloaded video and tap Share.
5. Choose OtakuLog from Android's share targets.
6. Confirm the detected anime and episode, review the AniList suggestion, then tap Save episode details.
7. Sign in to OtakuLog to sync your library and watched progress to Firebase.

MANUAL IMPORT
Open OtakuLog and tap Import downloaded video > Choose video from Downloads. Android's system picker may hide Telegram's private cache; sharing the downloaded file directly from Telegram is usually more reliable.

IMPORTANT LIMITATIONS + PRIVACY
- A normal website cannot silently monitor Telegram's Downloads folder. Android sharing works only after installing the PWA from HTTPS and when Telegram shares the actual video file to Android's Share menu.
- If OtakuLog is not listed in Telegram's Share menu, use the manual picker or confirm that the PWA was installed from Chrome and launched once.
- Filename parsing is heuristic. Always review the suggested anime and episode, especially if the filename is unusual or ambiguous.
- The video itself is NOT uploaded to Firebase or stored in the anime library. The service worker reads only the filename, MIME type, and file size. Firestore stores anime/episode metadata and the filename history.
- The tracker uses Cloud Firestore for the watchlist/progress. The Realtime Database URL and Storage bucket are present in the Firebase config but are not used by this build; video files are not uploaded.
- The Firebase Web API key is a client configuration identifier, not a service-account secret. Never put a service-account JSON/private key in index.html. Keep Firestore Rules published and consider HTTP referrer restrictions for the API key after deployment.
