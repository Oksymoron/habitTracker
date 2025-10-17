# PWA Configuration Guide - Automatyczne aktualizacje

## ✅ Co zostało skonfigurowane

### 1. **next-pwa** - Workbox integration
- `skipWaiting: true` - Nowy SW aktywuje się natychmiast
- `register: true` - Automatyczna rejestracja
- `reloadOnOnline: true` - Odświeżanie po powrocie online

### 2. **Strategie cachowania**
- **HTML (navigate)**: `NetworkFirst` - zawsze próbuj sieci najpierw (timeout 5s)
- **/_next/static/**: `CacheFirst` - pliki z hashem, immutable, cache 1 rok
- **Obrazy**: `CacheFirst` - cache 30 dni
- **API**: `NetworkFirst` - timeout 5s, fallback na cache
- **Convex API**: `StaleWhileRevalidate` - natychmiastowa odpowiedź z cache + update w tle

### 3. **Service Worker (public/sw.js)**
- `skipWaiting()` w install event
- `clients.claim()` w activate event
- Automatyczne czyszczenie starych cache'y
- Wysyłanie wiadomości do klientów o aktualizacji

### 4. **Obsługa aktualizacji w app**
- Detekcja nowego SW co 60 sekund
- Banner "NOWA WERSJA - Odśwież" na dole ekranu
- Automatyczny reload po kliknięciu "ODŚWIEŻ"
- Nasłuchiwanie na `controllerchange` event

### 5. **Nagłówki cache**
- HTML: `no-cache, no-store, must-revalidate`
- Static assets: `max-age=31536000, immutable`
- Service Worker: `max-age=0, must-revalidate`

---

## 📱 iOS Safari - Specjalne uwagi

### Problem: iOS często nie odświeża SW natychmiast
Safari na iOS ma bardziej konserwatywne podejście do Service Workers:

1. **Sprawdzanie aktualizacji**:
   - iOS sprawdza SW max raz na 24h (jeśli użytkownik nie usuwa PWA)
   - Można wymusić sprawdzenie przez `registration.update()`

2. **skipWaiting na iOS**:
   - iOS może opóźniać `skipWaiting()` do momentu zamknięcia wszystkich kart
   - Nasze rozwiązanie: wymuszamy `clients.claim()` + `postMessage`

3. **Rekomendacje dla iOS**:
   ```javascript
   // W app/page.tsx już zaimplementowane:
   - Check for updates co 60s (gdy app jest aktywny)
   - Nasłuchiwanie na controllerchange
   - Pokazywanie bannera z "ODŚWIEŻ"
   ```

4. **Testing na iOS**:
   - Otwórz DevTools w Safari (Mac)
   - Settings → Safari → Advanced → Web Inspector
   - Inspect PWA na iPhone
   - Console pokaże logi `[SW]` i `[PWA]`

### Debugging iOS PWA:
```javascript
// W Safari Console (Mac):
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => {
    console.log('SW state:', reg.active?.state);
    console.log('SW update:', reg.installing || reg.waiting);
  });
});

// Force update:
navigator.serviceWorker.getRegistrations().then(regs => {
  regs[0]?.update();
});
```

---

## ☁️ Vercel - Typowe problemy i rozwiązania

### Problem 1: Edge Cache cachuje stary SW
**Objaw**: Po deployu nowa wersja nie pojawia się przez kilka minut

**Rozwiązanie**:
```json
// vercel.json (już dodane)
{
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" }
      ]
    }
  ]
}
```

### Problem 2: Build cache powoduje stare pliki
**Objaw**: Po build nowy SW ma stare treści precache

**Rozwiązanie**:
1. W Vercel Dashboard → Project Settings → Git
2. Wyłącz "Automatically expose System Environment Variables" (jeśli powoduje problemy)
3. Clear build cache ręcznie jeśli potrzebne

### Problem 3: Production deployment nie jest "main"
**Objaw**: Pierwszy link (habit-tracker-three-pi.vercel.app) nie aktualizuje się

**Rozwiązanie**:
1. Vercel Dashboard → Settings → Domains
2. Ustaw `habit-tracker-git-main-...vercel.app` jako Production Domain
3. LUB: Deploy z main branch i promuj jako Production

### Problem 4: Stary SW blokuje nowy
**Objaw**: Banner aktualizacji nie pokazuje się

**Debugging**:
```javascript
// Chrome DevTools → Application → Service Workers
// Sprawdź "Update on reload"
// Kliknij "Unregister" i odśwież

// Lub w konsoli:
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.unregister());
  location.reload();
});
```

---

## 🔄 Jak działa aktualizacja (flow)

### 1. Deploy na Vercel
```
User robi git push → Vercel builduje → Nowy SW.js z nowym hash
```

### 2. Użytkownik otwiera app
```
1. App sprawdza aktualizację co 60s: registration.update()
2. Jeśli nowy SW dostępny → event "updatefound"
3. Nowy SW instaluje się → state: "installing"
4. Po instalacji → state: "installed"
5. App pokazuje banner "NOWA WERSJA"
```

### 3. Użytkownik klika "ODŚWIEŻ"
```
1. postMessage({ type: "SKIP_WAITING" }) do nowego SW
2. SW wywołuje skipWaiting() + clients.claim()
3. Event "controllerchange" w app
4. App robi window.location.reload()
5. Nowa wersja załadowana!
```

---

## 🧪 Testowanie aktualizacji lokalnie

### 1. Build production lokalnie:
```bash
npm run build
npm start
```

### 2. Otwórz http://localhost:3000 w Chrome
- DevTools → Application → Service Workers
- Zaznacz "Update on reload"

### 3. Zmień coś w kodzie i zrób build ponownie
```bash
npm run build
```

### 4. Odśwież stronę
- Powinien pojawić się banner "NOWA WERSJA"
- Kliknij "ODŚWIEŻ"
- Strona powinna się przeładować z nową wersją

---

## 📊 Monitoring w produkcji

### Logi w konsoli:
```
[PWA] Service Worker registered: ...
[SW] Workbox loaded successfully
[SW] Installing new service worker...
[SW] Activating new service worker...
[SW] Notifying client about update: ...
[PWA] New service worker found
[PWA] New SW state: installed
[PWA] New service worker installed, showing update banner
[PWA] User clicked update button
[PWA] Controller changed, reloading page
```

### Metrics do śledzenia:
- Ile czasu zajmuje wykrycie nowego SW? (powinno być <60s)
- Ile użytkowników klika "ODŚWIEŻ"? (conversion rate)
- Czy iOS users mają więcej problemów? (check error logs)

---

## 🚀 Deployment checklist

Przed każdym deployem:
- [ ] Sprawdź czy `skipWaiting: true` w next.config.js
- [ ] Sprawdź czy SW ma `clients.claim()` w activate
- [ ] Test na iOS Safari (Add to Home Screen)
- [ ] Test na Chrome Android
- [ ] Sprawdź logi w Vercel Function Logs
- [ ] Clear cache w Vercel jeśli potrzebne
- [ ] Verify że pierwszy link (production) aktualizuje się

---

## 🐛 Troubleshooting

### Banner nie pokazuje się:
1. Sprawdź console logs - czy `[PWA] New service worker found`?
2. Check DevTools → Application → Service Workers - czy jest waiting worker?
3. Wymuś update: `registration.update()` w konsoli

### iOS nie aktualizuje:
1. Sprawdź czy app jest Added to Home Screen (nie Safari tab)
2. Usuń app z home screen i dodaj ponownie
3. Check Safari → Develop → [Your iPhone] → Inspect

### Vercel deployment stale:
1. Settings → Deployment Protection → Off (dla testów)
2. Clear build cache: redeploy with "Clear cache" option
3. Check domain - czy to production czy preview?

### Offline nie działa:
1. Sprawdź czy SW jest zarejestrowany
2. Check Network tab - czy requesty idą przez SW?
3. Application → Cache Storage - czy są cached resources?

---

## 📚 Przydatne linki

- [Workbox Strategies](https://developers.google.com/web/tools/workbox/modules/workbox-strategies)
- [iOS PWA Guide](https://medium.com/@firt/progressive-web-apps-on-ios-are-here-d00430dee3a7)
- [Vercel Headers](https://vercel.com/docs/projects/project-configuration#headers)
- [Service Worker Lifecycle](https://web.dev/service-worker-lifecycle/)
- [next-pwa docs](https://github.com/shadowwalker/next-pwa)
