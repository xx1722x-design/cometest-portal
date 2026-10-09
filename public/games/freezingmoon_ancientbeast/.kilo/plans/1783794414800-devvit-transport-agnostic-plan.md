# Transport-Agnostic Multiplayer + Devvit Backend

## Context
Ancient Beast already has a transport-agnostic seam, but it is only half-realized:

- `ITransport` (`src/multiplayer/types.ts:56`) defines `connect/send/sendTo/sendExcept/onMessage/...`.
- `LobbyClient` (`src/multiplayer/LobbyClient.ts:14`) is the game-facing "NetworkManager" — the game only calls `createMatch/joinMatch/sendAction/getLocalPlayer/...` and never touches a transport directly.
- `INetworkBackend` (`src/multiplayer/types.ts:97`; currently named `ILobbyProvider`) sits between `LobbyClient` and the transport, owning lobby orchestration (join handshake, host fan-out, heartbeat, match-start). Renamed because it spans pre-game lobby *and* in-game relay — it is the pluggable network backend, not just a lobby.
- Two implementations exist: `PeerTransport` (`src/multiplayer/transport/PeerTransport.ts`) and `PeerLobbyProvider` (`src/multiplayer/PeerLobbyProvider.ts`).

The **only** thing wired up is PeerJS (p2p, one player is host). The selection is hard-coded: `Game.createLobby` → `new LobbyClient(this)` → default `new PeerLobbyProvider()` → default `new PeerTransport()` (game.ts:731-733, LobbyClient.ts:18).

Goal: make the game pluggable so a move is delivered without the game caring how. We add a **Devvit** backend (Reddit) as the first new module — it is asynchronous (server relay via Redis + `fetch` endpoints), and paves the way for Hono WebSocket / Pear later. Per user: build the **full** Devvit app (client transport + provider + server relay), since Reddit supplies the required infra.

## Key decisions (assumptions documented)
1. **Subreddit-menu entrypoint** — users launch Ancient Beast from a **"Play"** menu item in `r/AncientBeast`, not from a post. The custom post type still exists as a generic WebView container, but the primary UX is the menu button.
2. **Full Devvit app** — client `DevvitTransport` + `DevvitLobbyProvider` **and** a Devvit server (`devvit.json`, `server.ts`, custom post type).
3. **Async interface** — change `ITransport.send/sendTo/sendExcept` to return `Promise<void>`. `onMessage`/callbacks stay sync. PeerTransport updated to await and return resolved promises (callers fire-and-forget — backward compatible at runtime).
4. **Server = host relay** — Devvit relay is the authoritative "host": it stores lobby state in Redis, assigns player slots, and fans out moves. `DevvitLobbyProvider` reuses the existing `isHost`/forwarding shape, with the server as host.
5. **Client↔server via `fetch` + polling** (Devvit "Web" model): the vanilla canvas client uses `fetch()` to relative server endpoints; the server persists a capped message log in Redis; clients poll for new entries by cursor. This matches "Devvit API is async" and mirrors how a future Hono/Pear transport would look.
6. **Queue + recency-aware matchmaking** — the queue logic lives entirely in `/internal/*` endpoints on the Devvit server. Recency tracking is Redis-backed with 24h TTL. The Blocks `onPress` handler joins the queue, polls `/api/queue/status`, and navigates the user into the WebView once matched.
7. **No `submitCustomPost` / no Reddit API drift** — we do not create posts programmatically. Moderators manually create Ancient Beast posts in `r/AncientBeast`; the post is just a launcher container.

## Plan

### 1. Make `ITransport` async
File: `src/multiplayer/types.ts`
- `send(data): Promise<void>`, `sendTo(peerId, data): Promise<void>`, `sendExcept(peerId, data): Promise<void>`.
- `connect` already returns `Promise<void>`; leave `disconnect`, `getMyId`, and all `on*` callbacks unchanged.
- Update `PeerTransport` (`src/multiplayer/transport/PeerTransport.ts`): wrap the existing `connection.send(cleaned)` in a promise; `send`/`sendTo`/`sendExcept` become `async` and `return await ...` (best-effort, swallow errors). No behavior change.
   - `PeerLobbyProvider.sendGameMessage` → `void this.transport.send(message)` (fire-and-forget). `LobbyClient.sendAction` → `async sendAction(message): Promise<void>`; existing callers (`sendMultiplayerMove`, `sendMultiplayerAbility`, action sends in game.ts) fire-and-forget (no await needed). `PeerLobbyProvider` is renamed to keep the `INetworkBackend` contract name consistent (class name stays `PeerLobbyProvider`; only the interface `ILobbyProvider` → `INetworkBackend`).

### 2. Devvit client transport
New file: `src/multiplayer/transport/DevvitTransport.ts` — implements `ITransport`.
- Constructor takes a `DevvitApi` boundary (default = browser `fetch` + a poll clock) so it is unit-testable without Reddit:
  ```ts
  interface DevvitTransportDeps {
    fetchImpl?: typeof fetch;
    pollIntervalMs?: number;
  }
  ```
- `connect(lobbyId, { isHost })`:
   - `POST /api/lobby/:code/join` `{ name, isHost }` → returns `{ myId, playerIndex }`. Store `myId`, set `isHost` flag.
   - Start poll loop: `GET /api/lobby/:code/messages?after=<cursor>&playerId=<myId>` returns `[{ cursor, from, message }]`. For each:
     - fire `onMessage(message, from)`;
     - detect roster diffs via `GET /api/lobby/:code/state?playerId=<myId>` → fire `onPeerJoin`/`onPeerLeave`;
     - advance cursor.
   - Resolve once first poll returns our own join ack (or after first successful state read).
- `send(message)` → `POST /api/lobby/:code/message` `{ message, playerId }` (async). `sendTo`/`sendExcept` delegate to `send`; server handles authoritative routing.
- `disconnect()` clears the poll interval and `POST /api/lobby/:code/leave`.
- `onConnected` fired after first successful poll/state read.
- `getMyId()` returns the server-assigned id.

### 3. Devvit lobby provider
New file: `src/multiplayer/DevvitLobbyProvider.ts` — implements `INetworkBackend`, adapted from `PeerLobbyProvider` (`src/multiplayer/PeerLobbyProvider.ts`).
- `createLobby(config, code?)`:
   - If `code` not provided, generate one locally first; `POST /api/lobby` with the code (or let server generate one).
   - `await this.transport.connect(code, { isHost: true })`
   - Mirror Peer `createLobby` state init; `emitLobbyUpdate()`.
- `joinLobby(code)`:
   - `await this.transport.connect(code, { isHost: false })`
   - Await first state/player-joined event that gives us a `playerIndex`; mirror Peer join promise logic with 3s timeout.
- `handleTransportMessage`: reuse Peer orchestration for `player-joined`, `lobby-joined`, `match-start`, `match-loaded`, action messages (`isActionMessage`), `player-left`, `heartbeat`.
   - Host checks become "am I the lobby creator" (server returns `isHost` on join) — same `this.isHost()` shape.
   - Fan-out for actions/match-loaded is done by the **server**, so provider just calls `this.transport.send(message)` like a normal client.
- `markMatchStarted`: `POST /api/lobby/:code/start` (server writes `match-start` into log + sets state `playing`; all clients receive it via poll).
- `getLocalPlayer`/`getLobbyState`: source of truth is server state updated on each poll/state read.
- Heartbeat: server records `lastSeen` in Redis and reports stale players as `left` in `state`, so provider fires `player-left`.

### 4. Provider selection (the pluggability seam)
- New `src/multiplayer/provider.ts`:
  ```ts
  export function getNetworkMode(): 'peer' | 'devvit' {
    const url = new URLSearchParams(window.location.search);
    if (url.get('net') === 'devvit') return 'devvit';
    return 'peer';
  }
  export function createLobbyProvider(): INetworkBackend {
    return getNetworkMode() === 'devvit' ? new DevvitLobbyProvider() : new PeerLobbyProvider();
  }
  ```
- `Game.createLobby` / `joinLobbyByCode` (game.ts:731, 741): `this.lobby = new LobbyClient(this, createLobbyProvider());`
- Export new types/classes from `src/multiplayer/index.ts`.

### 5. Devvit server + post + menu (the "infra Reddit gives")
**No Hono / no extra web framework.** Devvit supplies the HTTP server surface (`Devvit.addServerHandler`) and Redis (`context.redis`) directly. Keep the Devvit server dependency-free beyond `devvit` itself.

New files under `src/devvit/`:
- `server.ts` — compiled to `dist/server/index.cjs` via esbuild.
  - `POST /api/lobby` → create lobby; store `ab:lobby:{code}:meta`, `ab:lobby:{code}:players`, `ab:lobby:{code}:log`, `ab:lobby:{code}:cursor` in Redis with TTL.
  - `POST /api/lobby/:code/join` → register player; assign `playerIndex`; return `{ myId, playerIndex, isHost }`; append `player-joined` message to log.
  - `POST /api/lobby/:code/message` → validate sender; append `{ cursor, from, message }` to capped Redis sorted set (keep last ~256).
  - `GET /api/lobby/:code/messages?after=&playerId=` → return entries with `score > after`; mark `playerId` as seen.
  - `GET /api/lobby/:code/state?playerId=` → return `{ players, config, status, host }`; compute `left` from heartbeat `lastSeen` staleness; mark `playerId` as seen; refresh TTL.
  - `POST /api/lobby/:code/start` → set `status=playing`, write `match-start` message into log.
  - `POST /api/lobby/:code/leave` → remove player, write `player-left`; clean up Redis keys if last player.
  - **`POST /internal/queue/join`** — Block-side entry called from the menu `onPress`. Adds the caller to the matchmaking queue and tries to find an opponent immediately:
    - Reads `context.userId` from the event.
    - Pushes `{ playerId, queuedAt }` onto Redis list `ab:queue`.
    - Pops candidates from the queue. For each candidate:
      - Checks `ab:recent:{caller}:{candidate}` and `ab:recent:{candidate}:{caller}`.
      - If neither exists → preferred match.
      - If both exist and the oldest queued player has been waiting > `RECENT_RETRY_MS` (e.g. 10s) → allow rematch.
    - On match: creates lobby via `/api/lobby` logic, removes both players from queue, writes `ab:recent:{a}:{b}` and `ab:recent:{b}:{a}` with 24h TTL, returns `{ status: 'matched', lobbyCode }`.
    - On no match: returns `{ status: 'waiting' }`.
  - **`GET /api/queue/status?playerId=`** — polled by the Blocks `onPress` loop. Returns current queue status:
    - `{ status: 'waiting' }` if still queued or not yet matched.
    - `{ status: 'matched', lobbyCode }` if a lobby was created for this player (set after `/internal/queue/join` succeeds).

- `main.tsx` (Blocks entry) — `Devvit.configure` + subreddit menu item:
  ```tsx
  import { Devvit } from '@devvit/public-api';

  Devvit.configure({
    redis: true,
    http: true,
  });

  Devvit.addMenuItem({
    label: 'Play Ancient Beast',
    description: 'Find an opponent and duel online',
    forUserType: 'user',
    location: 'subreddit',
    onPress: async (_event, context) => {
      const userId = context.userId;
      if (!userId) {
        context.ui.showToast('Please log in to play Ancient Beast');
        return;
      }

      const joinRes = await fetch('/internal/queue/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: userId }),
      });

      if (!joinRes.ok) {
        context.ui.showToast('Failed to join matchmaking');
        return;
      }

      const joinData = (await joinRes.json()) as { status: string; lobbyCode?: string };

      if (joinData.status === 'matched' && joinData.lobbyCode) {
        context.ui.navigateTo(`/index.html?net=devvit&lobby=${encodeURIComponent(joinData.lobbyCode)}`);
        return;
      }

      // Poll up to ~30s for a match
      const maxPolls = 30;
      for (let i = 0; i < maxPolls; i++) {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const statusRes = await fetch(`/api/queue/status?playerId=${encodeURIComponent(userId)}`);
        if (!statusRes.ok) continue;

        const statusData = (await statusRes.json()) as { status: string; lobbyCode?: string };
        if (statusData.status === 'matched' && statusData.lobbyCode) {
          context.ui.navigateTo(`/index.html?net=devvit&lobby=${encodeURIComponent(statusData.lobbyCode)}`);
          return;
        }
      }

      context.ui.showToast('No opponent found, try again!');
    },
  });
  ```

#### `devvit.json` (v1 schema, Devvit Web layout)
Root-level config using the v1 schema with `blocks` for the menu entrypoint and `post` for the WebView container:
```json
{
  "$schema": "https://developers.reddit.com/schema/config-file.v1.json",
  "name": "ancientbeast",
  "permissions": {
    "redis": true,
    "http": {
      "enable": true,
      "domains": ["*"]
    }
  },
  "post": {
    "dir": "deploy",
    "entrypoints": {
      "default": {
        "entry": "index.html",
        "height": "tall"
      }
    }
  },
  "blocks": {
    "entry": "src/devvit/main.tsx"
  },
  "server": {
    "dir": "dist/server",
    "entry": "index.cjs"
  },
  "dev": {
    "subreddit": "AncientBeast"
  },
  "marketingAssets": {
    "icon": "assets/icon.png"
  },
  "scripts": {
    "build": "webpack --mode=production && esbuild src/devvit/server.ts --bundle --platform=node --format=cjs --outfile=dist/server/index.cjs --external:node:* --main-fields=module,main"
  }
}
```
Notes:
- `post.entrypoints.default` uses only valid v1 fields (`entry`, `height`, `inline` — no `name`).
- `blocks.entry` points to the Blocks/TS file; the Devvit CLI compiles it automatically.
- `server.entry` points to the compiled CJS bundle produced by esbuild.
- `permissions.http.domains: ["*"]` allows the WebView client to call relative `/api/*` endpoints.
- `dev.subreddit` lets `devvit playtest` target `r/AncientBeast` without env vars.
- `scripts.build` lets `devvit upload` run the full production build in one step.
- `marketingAssets.icon` gives the Devvit dashboard a preview image.

#### `package.json` changes
- Add `@devvit/web/client` to `dependencies` (needed for `WebView` if we later add it to `main.tsx`; safe to include even if unused initially).
- Confirm `devvit` and `@devvit/server` are in `devDependencies` (already present at `^0.13.7`).
- Add `build:devvit` script:
  ```
  "build:devvit": "esbuild src/devvit/server.ts --bundle --platform=node --format=cjs --outfile=dist/server/index.cjs --external:node:* --main-fields=module,main"
  ```
- The existing `build` script (webpack) already creates `deploy/index.html`; no changes needed there.

### 6. URL param plumbing (`?net=devvit&lobby=...`)
`src/multiplayer/provider.ts` already reads `?net=devvit` from `window.location.search`. No change needed there.

The WebView loads `/index.html?net=devvit&lobby=<postIdOrLobbyCode>`. The existing `LobbyClient.parseUrlJoinCode()` reads `?join=` only, so we need a small addition in `src/multiplayer/LobbyClient.ts`:
- `parseUrlJoinCode()` should also accept a `lobby` query param as a fallback:
  ```ts
  parseUrlJoinCode(): LobbyCode | null {
    if (typeof window === 'undefined' || !window.location.search) {
      return null;
    }
    const params = new URLSearchParams(window.location.search);
    const join = params.get('join');
    const lobby = params.get('lobby');
    const code = join || lobby;
    if (!code) {
      return null;
    }
    return normalizeLobbyCode(code);
  }
  ```
This covers both the menu-launched path (`?lobby=`) and any legacy shared links (`?join=`).

### 7. Validation
- `src/__tests__/multiplayer/DevvitTransport.ts`: mock `fetchImpl`; assert `send` → `POST /message`; poll response → `onMessage` fired with correct peerId; roster shrink → `onPeerLeave`; `getMyId()` returns server-assigned id.
- `src/__tests__/multiplayer/DevvitLobbyProvider.ts`: mock transport; assert create/join resolves, `match-start` from poll flips `status=playing` and routes to `gameMessageHandlers`.
- `src/__tests__/multiplayer/PeerTransport.ts` (extend existing): assert async `send` resolves and still delivers.
- Run `npm run lint`, `npm run typecheck` (or `tsc --noEmit`).
- Run `npm run build:all` to produce `deploy/` + `dist/server/index.cjs`.
- Run `devvit build` to validate `devvit.json` against the CLI.
- Manual E2E: `devvit playtest`, click **Play Ancient Beast** in the subreddit menu, verify queue → match → WebView → lobby join → move relay.

## Risks / open questions
- **Devvit API drift**: exact names (`addServerHandler`, `addCustomPostType`, `WebView`) vary by `devvit` version — implementation agent must verify against the installed 0.13.x types before coding the server and `main.tsx`.
- **Menu `onPress` UX**: the onPress blocks the menu close until the handler resolves or the user navigates away. The polling loop uses `setTimeout` in a `for` loop; this is acceptable in Blocks runtime but could hit handler timeout limits if set too high. 30s polling is a safe default.
- **Queue atomicity**: if two menu clicks happen simultaneously, both handlers may read the same queue state before either writes. This is acceptable for a casual game queue; Redis single-threaded execution plus the short handler window makes race conditions rare. If needed later, move matching into a Lua script or single scheduled endpoint.
- **Polling latency** (~400ms in transport + 1s in menu loop) is fine for turn-based. If sub-second needed later, add `context.ui.webView.postMessage` server push.
- **Shared provider logic**: `DevvitLobbyProvider` duplicates much of `PeerLobbyProvider`. Optional follow-up: extract a `BaseRelayLobbyProvider` (heartbeat, join handshake, message dispatch) once a 3rd transport lands. Not required for this plan.
- **Reddit serverless Redis**: ensure message log is capped and cursors monotonic; set a Redis **TTL** (`EXPIRE`) on `lobby:{code}:*` keys and refresh it on each heartbeat/poll so abandoned lobbies are reclaimed automatically.

## Files touched (summary)
- `src/multiplayer/types.ts` (async send*)
- `src/multiplayer/transport/PeerTransport.ts` (await send)
- `src/multiplayer/transport/DevvitTransport.ts` (NEW)
- `src/multiplayer/DevvitLobbyProvider.ts` (NEW)
- `src/multiplayer/PeerLobbyProvider.ts` (fire-and-forget sendGameMessage)
- `src/multiplayer/LobbyClient.ts` (async sendAction + lobby param fallback)
- `src/multiplayer/index.ts` (exports)
- `src/multiplayer/provider.ts` (NEW selector)
- `src/game.ts` (pass provider into LobbyClient)
- `src/script.ts` (read `?lobby=` param for Devvit auto-join if needed)
- `src/devvit/server.ts`, `src/devvit/main.tsx` (NEW)
- `devvit.json` (NEW — v1 schema with blocks + post + server + menu)
- `package.json` (deps + scripts)
- `src/__tests__/multiplayer/*` (NEW tests)
