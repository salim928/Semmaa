## SemmaAI Mobile – Ghana Agricultural Companion App

This is the Expo / React Native mobile companion for the Ghana Agricultural Bot.  
It talks to the FastAPI backend in the repo root and provides a farmer-friendly interface.

### Prerequisites

- Node.js + npm
- Expo CLI (installed automatically via `npx expo`)
- Backend API running from the root project (`uvicorn src.api_app:app --reload --port 8000`)

### 1. Configure API base URL

Edit `config/api.ts` and set `LOCAL_IP` to your computer’s local IP address on the same network as your phone/emulator:

```ts
const LOCAL_IP = '192.168.x.x'; // replace with your IPv4 address
```

In development, the app will call:

```text
http://<LOCAL_IP>:8000
```

If you configured `MOBILE_API_KEY` on the backend, make sure `MOBILE_API_KEY` in `config/api.ts` matches it so requests are authorized.

### 2. Install dependencies & run

```bash
cd mobile-new
npm install
npx expo start
```

Use the QR code in the terminal / browser to open the app in Expo Go, or run on an emulator.

### 3. Core flows in the app

- **Onboarding & login**: Simple phone-based mock login via `AuthContext` (`mockLogin` – no real backend yet).
- **Home → AI Advisor**: Opens the chat screen and calls `POST /ask` with the detected or selected location.
- **Home → Market**: Shows marketplace UI; prices are seeded from `/market/crops` + `/market/prices` plus mock items.
- **Weather card on Home**: Uses location permissions and `GET /weather?loc=<town>` to summarize conditions.
- **Chat feedback**: Each AI reply has thumbs up/down; taps send `POST /feedback` with rating and location.

You can customize copy, languages, and flows by editing files under the `app/` and `context/` directories.
