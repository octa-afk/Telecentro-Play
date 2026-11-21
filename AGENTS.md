# AGENTS.md — Telecentro Play · app mobile

Reglas y contexto para trabajar en el simulador de **Telecentro Play mobile** dentro de este repo.

## Contexto

El repo ya contiene el simulador del **decodificador** (`Simulador-TPlay.html`, 1280×720, archivo único). Lo de este documento es el simulador de la **app mobile**, que se construye aparte y recién después se decide cómo se integra.

- Fines: capacitación de asesores de soporte. Solo UI, sin operar servicios reales.
- Referencias: `docs/guias-paso-a-paso.md`, `docs/plan-integracion-tour.md`.

## Fuente de verdad de la interfaz

- **App real**: Samsung SM-S711B (Galaxy S23 FE), `ar.com.telecentro.ott`, 1080×2340 @ 450 dpi.
- **Capturas**: `adb -s <serial> exec-out screencap -p > shot.png` desde el teléfono.
- **Waydroid**: descartado para capturas — `screencap` no tiene readback y devuelve negro o se cuelga.
- **Todo es visual**: la única fuente es la captura de pantalla de la app. Nada del APK, de los datos del teléfono ni de la app.

## Uso del celular

- Trabajar **exclusivamente** sobre la app de TPlay. No tocar ninguna otra app, ajuste, notificación, cuenta o archivo del teléfono.
- Los toques se mandan con `adb shell input tap` y siempre caen dentro de la app.
- Volver atrás: `adb shell input keyevent 4` (back del sistema).
- Desplazamiento: se autorizan swipes (`adb shell input swipe`) dentro de la app para ver el resto de una pantalla. Verticales, de a uno, sobre el contenido (no sobre la barra inferior) y con captura después de cada uno.
- Nunca usar home, recents, barra de notificaciones, `am start` ni ningún comando que saque de la app. Si ya no se está en TPlay, parar y pedir que la abran.
- Un solo toque a la vez: capturar, verificar que la pantalla cambió como se esperaba, y recién ahí seguir. Si no coincide, parar.
- Si aparece login, PIN o cualquier pedido de credenciales: detenerse y consultar. No escribir credenciales.

## Convenciones del proyecto

- HTML + CSS, sin build, sin frameworks.
- `var` y funciones globales (no `let`/`const` en el simulador).
- Comentarios de sección con el formato `/* ── … ── */`.
- Cada pantalla con su sección `#sec-*` y su estado por clases.
- UI en español con tildes.
- Tests en `tplay/tests/` con Playwright (`check` / `press` / `cls` / `has`).

## Reglas

1. Usar el celular solo para la app de TPlay: no tocar absolutamente nada más que esa app.
2. Tomar solo capturas de pantalla para replicar diseño y flujos.
3. No leer nada del APK original, ni datos del teléfono, ni datos de la app. Todo es visual.
4. Los toques los manda el agente, siempre dentro de la app; el back del sistema está permitido, salir de la app nunca.
5. **La cuenta del teléfono es real.** No tocar nada que afecte al usuario real: no "Cerrar todas las sesiones", no las ❌ de dispositivos, no "Cerrar sesión", no toggles (notificaciones, canales), no links de Ayuda y legales (salen de la app). Solo lectura: capturar y volver.

## No hacer

- No inventar pantallas, textos ni flujos que no estén en la app real o en una captura.
- No commitear credenciales, capturas con datos personales ni APKs.
