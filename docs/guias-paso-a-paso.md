# Guías paso a paso — Contenido borrador v1

Guías para acompañar al cliente durante una llamada, usando el Simulador de
Telecentro-Play. Cada paso dice: qué hacer con el control, qué se ve en la TV
y cuándo se considera cumplido (así después se detecta automáticamente en el
simulador).

Los dos flujos principales (los más usados con clientes) van primero.

---

## Guía 1 — Conexión a internet

**Objetivo:** dejar el decodificador conectado a internet, por Wi-Fi o cable
(Ethernet). Antes de arrancar: si el cliente tiene cable Ethernet al
decodificador, usar el paso opcional A; si usa Wi-Fi, seguir desde el paso 1.

### Paso 1 — Abrir Ajustes
- **Decirle al cliente:** con el control remoto, andá al menú **AJUSTES** de la barra superior y pulsá **OK**.
- **En pantalla:** aparece la barra `Ajustes usuario · Video · Visita guiada por voz · Grabaciones · Sistema`.
- **Se detecta cuando:** el decodificador entra en modo Ajustes (`settings-mode`).

### Paso 2 — Ir a "Sistema"
- **Decirle:** en la barra inferior, movete hasta **Sistema** y pulsá **OK**.
- **En pantalla:** opciones `Diagnóstico · Conexión · Canales · Reset`.
- **Se detecta cuando:** clase `settings-sistema-entered`.

### Paso 3 — Elegir "Conexión"
- **Decirle:** andá hasta **Conexión** y pulsá **OK**.
- **En pantalla:** aparece `CONEXIÓN` con las pestañas **WIFI / ETHERNET** y el estado `TIPO DE CONEXIÓN`.

### Paso 3-A (variante con cable) — Conexión por Ethernet
- **Decirle:** primero verificá que el cable amarillo esté bien enchufado en el decodificador y en el módem. Con el control, andá a la pestaña **ETHERNET**.
- **Fin:** cuando en pantalla `TIPO DE CONEXIÓN` muestra **ETHERNET** y estado CONECTADO.
- **Si no conecta:** pasar al cierre de la guía (troubleshooting).

### Paso 4 (variante Wi-Fi) — Configurar Wifi
- **Decirle:** quedate o volvé a la pestaña **WIFI** y pulsá **OK** sobre `PRESIONE OK PARA CONFIGURAR WIFI`.
- **En pantalla:** opciones `UNIRSE A OTRA RED / ATRÁS`.

### Paso 5 — Elegir la red
- **Decirle:** seleccioná **UNIRSE A OTRA RED** con OK, y en la lista de redes elegí la de tu casa.
- Tip para el agente: la red suele figurar con el nombre impreso en el módem.

### Paso 6 — Ingresar la contraseña
- **Decirle:** te va a pedir la clave de la red. Ingresala con el teclado en pantalla (con el control, te movés letra por letra) y al final anda a **SIGUIENTE**.
- **En pantalla:** teclado en pantalla con mensaje `ESTA RED ESTÁ PROTEGIDA…`, botones `ATRÁS / SIGUIENTE`.
- Error frecuente: confundir 0/O, 1/l/I. Si falla, se vuelve a pedir la clave.

### Paso 7 — Confirmar conexión
- **Decirle:** aguardá unos segundos mientras conecta.
- **Fin:** `TIPO DE CONEXIÓN` pasa a mostrar la red conectada (WIFI) y el ícono de internet de la barra superior queda activo.
- **Se detecta cuando:** estado de conexión ≠ `NO CONECTADO` en `#conexionTypeValue`.

### Cierre — Verificar que todo funciona
- **Decirle:** andá a **Ajustes › Sistema › Diagnóstico** y fijate que en **Resumen** el ESTADO diga CONECTADO.
- Si sigue sin conectar → escalado: reiniciar módem, chequear led del módem, derivar.

---

## Guía 2 — Reset de fábrica

**Objetivo:** devolver el decodificador al estado inicial cuando hay fallos que
no se resuelven (portal con error, apps que no cargan, etc.).

⚠️ **Advertencia para leer al cliente antes de empezar:** el reset de fábrica
borra la configuración (PIN de control parental, datos de red, grabaciones
programadas, recordatorios, grupos de canales). **No borra** las grabaciones ya
realizadas. Después del reset hay que configurar todo de nuevo.

### Paso 1 — Abrir Ajustes
- **Decirle:** con el control, andá al menú **AJUSTES** y pulsá **OK**.
- **Se detecta cuando:** clase `settings-mode`.

### Paso 2 — Ir a "Sistema"
- **Decirle:** en la barra inferior entrá a **Sistema** con OK.
- **Se detecta cuando:** clase `settings-sistema-entered`.

### Paso 3 — Elegir "Reset"
- **Decirle:** andá hasta **Reset** y pulsá **OK**.
- **En pantalla:** barra `Chequear asociación · Recargar portal · Reiniciar · Reset de fábrica · Reset de fábrica de Netflix`.
- **Se detecta cuando:** clase `reset-entered`.

### Paso 4 — "Reset de fábrica" con OK
- **Decirle:** movete hasta **Reset de fábrica** (no "Reiniciar" ni "…de Netflix") y pulsá **OK**.
- **En pantalla:** texto de confirmación con la advertencia + `Pulse OK para reiniciar el decodificador`.

### Paso 5 — Ingresar el PIN
- **Decirle:** te pide el PIN de control parental (el mismo que usás para canal de adultos). Ingresá los 4 dígitos con los números del control.
- Si el cliente no recuerda el PIN → escalar (no se puede avanzar).
- **En pantalla:** modal `Control parental — Ingrese PIN de Control Parental` con 4 casillas.
- **Se detecta cuando:** clase `pin-modal-mode` y acierta el PIN (el simulador acepta cualquier PIN de 4 dígitos).

### Paso 6 — Esperar el reinicio
- **Decirle:** el decodificador se va a reiniciar solo. Puede tardar algunos minutos; no lo desenchufes.
- **En pantalla:** logo 4K ULTRA HD, un destello de barras de color, pantalla negra y luego "Iniciando decodificador…" con puntos animados.

### Paso 7 — Configuración inicial post-reset
- Al volver, el decodificador queda como recién instalado: tocar revisar
  conexión a internet (usar Guía 1) y la descarga del portal.
- **Fin:** TV en vivo. Al entrar se ve el banner ("En Reproducción") y enseguida el candado "Canal sin suscripción (ID 121)"; el banner se oculta solo y vuelve con cualquier tecla.

---

## Flujos candidatos para más adelante
- Reiniciar decodificador (flujo corto, previo al reset de fábrica).
- Reset de fábrica de Netflix (cerrar sesión de la app Netflix).
- Configuración de PIN / control parental.
- Chequear asociación con el control remoto/asistencia (Wally).

## Notas de implementación (cuando se apruebe el contenido)
- Menú de guías en **panel lateral junto a la TV** (no interfiere con el control remoto).
- Cada flujo es un array de pasos: `{ texto, whatYouSee, check: () => … }`.
- `check` usa los mismos predicados existentes (`isSettingsMode()`, clases en `.decoder`), sin tocar el decodificador.
- Avance semi-automático con ✓ + botón "Siguiente ▸" para forzar avance manual.
- Panel estático liviano (sin gradientes/animaciones pesadas, consistente con la simplificación del fondo).
