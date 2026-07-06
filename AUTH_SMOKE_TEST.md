# Web-Admin Auth — Runtime Smoke Test

Verifies the httpOnly-cookie BFF (commit `8a03dcb`, findings WH1/WH2). Static
typecheck is green; this exercises the cookie / proxy / refresh / gate flow that
types can't prove. ~10 minutes end to end.

---

## 0. Prerequisites

1. **API running** — `cd apps/api && npm run start:dev`, reachable at
   `http://localhost:8000/api/v1` (matches `apps/web-admin/.env.local`
   `NEXT_PUBLIC_API_URL`).
2. **Accounts** — you need **(a)** a valid **admin** login and **(b)** a valid
   **non-admin** login (to prove the server-side role check).
3. **Run the admin** — `cd apps/web-admin && npm run dev` → `http://localhost:3000`.
4. Open **DevTools** and keep three tabs handy: **Application**, **Network**,
   **Console**.

> ⚠️ Cookies are marked `secure` only when `NODE_ENV=production`. Test dev over
> **http://localhost** (works) — if you test a **production build**, do it over
> **https**, or the secure cookies won't be set and auth will look broken.

### How to inspect (reference)
- **Cookies:** Application → Storage → Cookies → `http://localhost:3000`. Look for
  `admin_access` and `admin_refresh` with **HttpOnly ✓**, **SameSite Lax**, **Path /**.
- **httpOnly proof:** Console → run `document.cookie` — it must **NOT** contain
  `admin_access`/`admin_refresh`.
- **No token in JS:** Application → Local Storage → `localhost:3000` — there must be
  **no** `admin_token` / `admin_user` / `admin_refresh_token` (only `theme` is fine).
- **Network:** filter by `proxy` and `auth` to watch the requests and `Set-Cookie`.

---

## 1. Test cases

Each case: **do** → **expect** → **verify**. Start each block from a known state
(Application → **Clear site data** wipes cookies + storage).

### T1 — Cold start, not signed in
- **Do:** Clear site data. Go to `http://localhost:3000/`.
- **Expect:** lands on `/login`, no flash of the dashboard.
- **Verify:** URL is `/login` (the root redirect is decided server-side from the cookie).

### T2 — Direct dashboard access is gated (WH1)
- **Do:** With no cookies, go to `http://localhost:3000/dashboard/dashboard/users`.
- **Expect:** redirected to `/login` **before** any dashboard shell renders.
- **Verify:** Network → the `/dashboard/...` navigation returns a **307** redirect to
  `/login`. The admin UI never paints.

### T3 — Wrong password
- **Do:** On `/login`, submit a valid email + wrong password.
- **Expect:** error toast; stays on `/login`.
- **Verify:** Network → `POST /api/auth/login` is **4xx**; **no** `Set-Cookie: admin_access`.
  Cookies still empty.

### T4 — Valid NON-admin account (server-side role check)
- **Do:** Submit valid **non-admin** credentials.
- **Expect:** toast **"Admin access required"**; stays on `/login`.
- **Verify:** Network → `POST /api/auth/login` → **403**; **no** cookies set. *(This is the
  proof WH1 is enforced on the server, not the client.)*

### T5 — Valid ADMIN login (happy path + httpOnly proof)
- **Do:** Submit valid **admin** credentials.
- **Expect:** success toast → redirect to `/dashboard` → dashboard renders.
- **Verify (all four):**
  1. Network → `POST /api/auth/login` → **200**, response headers include
     `Set-Cookie: admin_access=…; HttpOnly` and `Set-Cookie: admin_refresh=…; HttpOnly`.
  2. Application → Cookies → `admin_access` + `admin_refresh` present, **HttpOnly ✓**,
     **SameSite Lax**.
  3. Console → `document.cookie` → does **not** include the tokens (httpOnly). ✅ WH2
  4. Application → Local Storage → **no** `admin_*` keys. ✅ WH2

### T6 — Data loads through the proxy
- **Do:** Go to a real-data page, e.g. `/dashboard/dashboard/users/kyc`.
- **Expect:** data (or the "all caught up" empty state) — not a blank/broken table.
- **Verify:** Network → requests target **`/api/proxy/…`** (same-origin), each **200**.
  The browser request carries **no** `Authorization` header — the token is attached
  **server-side** by the proxy. The BookLoop API is never called directly from the browser.

### T7 — Hard refresh keeps the session
- **Do:** On `/dashboard`, full reload (Cmd/Ctrl+R).
- **Expect:** stays on the dashboard; the admin's name still shows; no bounce to login.
- **Verify:** Network → `GET /api/proxy/auth/me` → **200** (layout re-hydrates the user
  from the cookie via the proxy).

### T8 — Transparent refresh on access-token expiry ⭐ (the key one)
- **Do (fast method):** Application → Cookies → **edit** the `admin_access` value to
  garbage (e.g. `broken`), leave `admin_refresh` intact. Then navigate to a data page
  (or reload one).
  *(Alternative: if the API's access-token TTL is short, just wait it out and click around.)*
- **Expect:** the request still **succeeds** — no error, no logout.
- **Verify:** Network → the `/api/proxy/…` call returns **200**, and its response has a
  fresh `Set-Cookie: admin_access=…`. Application → the `admin_access` value has changed.
  *(The proxy got a 401, refreshed with `admin_refresh`, rotated the cookie, and retried.)*

### T9 — Dead session redirects to login
- **Do:** Application → Cookies → corrupt **both** `admin_access` **and** `admin_refresh`
  (or delete `admin_refresh` and corrupt `admin_access`). Trigger a data fetch.
- **Expect:** bounced to `/login`.
- **Verify:** Network → `/api/proxy/…` → **401** with `Set-Cookie` **clearing** both
  cookies (Max-Age 0); browser navigates to `/login`. Cookies now empty.

### T10 — Logout
- **Do:** Click the sign-out control.
- **Expect:** redirect to `/login`; cookies gone.
- **Verify:** Network → `POST /api/auth/logout` → **200** with `Set-Cookie` clearing both
  cookies. Application → Cookies empty. Re-run **T2** — `/dashboard` bounces to `/login`.

### T11 — The old localStorage bypass no longer works ⭐ (the point of WH1)
- **Do:** Signed out (cookies cleared). In Console:
  ```js
  localStorage.setItem('admin_user', JSON.stringify({ role: 'admin' }));
  localStorage.setItem('admin_token', 'anything');
  ```
  Then go to `http://localhost:3000/dashboard/dashboard/users`.
- **Expect:** **still** redirected to `/login` — the gate reads the httpOnly cookie, not
  localStorage.
- **Verify:** URL `/login`; dashboard never renders. *(Pre-fix, this granted access.)*

### T12 — Signed-in visit to /login
- **Do:** While signed in, go to `/login`.
- **Expect:** middleware redirects to `/dashboard`.

### T13 — Mutations + confirmations (regression check, WM4)
- **Do:** On the KYC page (with a pending item) or users list, click **Approve/Reject** or
  **Ban**.
- **Expect:** a `confirm()` dialog appears; on **OK**, the action fires and a success toast
  shows.
- **Verify:** Network → e.g. `POST /api/proxy/users/<id>/kyc/approve` → **200**.

---

## 2. Failure-mode checks

- **API unreachable:** stop the API. Login → **502** "Could not reach the server" toast.
  On the dashboard, data pages show the **WM6 error state** (with **Try again**), not a
  blank table.
- **Multipart uploads:** N/A — the admin sends only JSON bodies, so the proxy's body
  forwarding is fine. (If a file-upload page is added later, the proxy's `request.text()`
  must be swapped for a stream/`arrayBuffer` pass-through.)

---

## 3. Pass criteria

Ship-ready when all of the following hold:

- [ ] **T5** — after login, **no `admin_*` in localStorage**, and `admin_access`/`admin_refresh`
      are **HttpOnly** and **unreadable** via `document.cookie`.
- [ ] **T4** — a valid non-admin is **rejected server-side (403)** with no cookie.
- [ ] **T11** — the **localStorage bypass fails**.
- [ ] **T2 / T10** — `/dashboard` is unreachable without a session, before and after logout.
- [ ] **T8** — access-token expiry **refreshes transparently**; **T9** — a dead session
      **redirects to login**.
- [ ] **T6 / T13** — reads and mutations both work through `/api/proxy`.

If any fail, capture the failing request/response (Network) + the Cookies panel and
we'll dig in.
