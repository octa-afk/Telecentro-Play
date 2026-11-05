# TPlay — Simulador de interfaz de TV

Interfaz HTML/CSS/JS que emula un decodificador en resolución fija 1280×720.  
Archivo único: `deco_v1_standalone.html` (CSS y JS inlineados, sin dependencias locales).

---

## Archivos

| Archivo | Descripción |
|---|---|
| `deco_v1_standalone.html` | Archivo principal. Contiene HTML, CSS y JS en un solo archivo. |
| `deco_v1.html` | Versión original separada (requiere `styles.css` y `app.js` en la misma carpeta). |
| `styles.css` | Estilos originales (solo necesarios si usás `deco_v1.html`). |
| `app.js` | JS original (solo necesario si usás `deco_v1.html`). |

> **Recomendado**: usar `deco_v1_standalone.html`. Se puede abrir directo desde el explorador de archivos sin servidor local.

---

## Cómo correr

```bash
# Opción A — abrir directo (funciona con el standalone)
open deco_v1_standalone.html

# Opción B — con live-server (cualquiera de los dos archivos)
cd /ruta/al/proyecto
live-server --port=8000
```

---

## Nomenclatura de barras

El simulador tiene tres barras de navegación horizontales, cada una con el mismo diseño visual (fuente 33px 800, subrayado cyan en el ítem activo, scroll centrado). Se nombran así:

### nav-bar — Barra principal
- **ID en el DOM**: `#navBar`
- **Clase de ítems**: `.nav-item`
- **Función JS**: `selectNav(el)`
- **Contenido**: BUSCAR · HOME · TV · Kids! · GUÍA · MI CONTENIDO · APPS · AJUSTES · ADULTOS
- **Visible**: siempre, excepto cuando el decoder está en `settings-mode`

### subnav-bar — Barra de ajustes
- **ID en el DOM**: `#settingsNav`
- **Clase de ítems**: `.subnav-item`
- **Función JS**: `selectSetting(el)`
- **Contenido**: Ajustes usuario · Video · Visita guiada por voz · Grabaciones · Sistema
- **Visible**: siempre dentro de la sección AJUSTES. En `settings-mode` toma el lugar de la nav-bar (misma altura, mismo estilo).

### user-options-bar — Barra de opciones de usuario
- **ID en el DOM**: `#userNav`
- **Clase de ítems**: `.settings-option`
- **Función JS**: `selectUserOption(el)`
- **Contenido**: General · Idioma · Control parental · Grupo de canales
- **Visible**: solo cuando el ítem activo de la subnav-bar es "Ajustes usuario". Tiene dos estados (ver abajo).

---

## Estados del decoder (clases en `.decoder`)

La lógica de navegación se maneja completamente a través de clases CSS en el elemento `.decoder`. Cada estado activa o desactiva partes de la UI vía selectores CSS.

```
.decoder
  ├── (sin clases extra)              → Estado base: nav-bar visible, sección HOME
  ├── .settings-mode                  → Estado 1: dentro de AJUSTES
  ├── .settings-mode
  │     + .settings-usuario-active    → Estado 2: preview de opciones de usuario
  └── .settings-mode
        + .settings-usuario-active
        + .settings-usuario-entered   → Estado 3: dentro de las opciones de usuario
```

### Estado base
- La nav-bar es la barra activa.
- Las flechas ◀/▶ navegan entre secciones.
- No hay clases extra en `.decoder`.

### Estado 1 — `settings-mode`
- Se activa al presionar OK sobre AJUSTES, o al hacer click en cualquier ítem de la subnav-bar.
- La nav-bar se oculta (`display: none`).
- La subnav-bar ocupa su lugar y pasa a comportarse igual que la nav-bar.
- Las flechas ▲/▼ navegan entre ítems de la subnav-bar.
- ATRAS vuelve al estado base.

### Estado 2 — `settings-mode` + `settings-usuario-active`
- Se activa al posicionarse sobre "Ajustes usuario" en la subnav-bar (por flechas o click).
- La user-options-bar aparece debajo de la subnav-bar como **preview**.
- Los ítems de la user-options-bar se muestran en color apagado, **sin ninguno resaltado**.
- Las flechas ▲/▼ siguen navegando la subnav-bar.
- OK sobre "Ajustes usuario" avanza al Estado 3.
- Navegar a otro ítem de la subnav-bar quita `settings-usuario-active`.

### Estado 3 — `settings-mode` + `settings-usuario-active` + `settings-usuario-entered`
- Se activa al presionar OK sobre "Ajustes usuario" (o al hacer click directo en una opción).
- La subnav-bar se oculta.
- La user-options-bar queda sola, con **"General" resaltado** por defecto.
- Las flechas ◀/▶ navegan entre ítems de la user-options-bar.
- ATRAS vuelve al Estado 2 (preview), quitando `settings-usuario-entered` y deseleccionando opciones.

---

## Mapa de navegación completo

```
HOME (estado base)
│
├── ◀/▶  →  nav-bar: BUSCAR · HOME · TV · Kids! · GUÍA · MI CONTENIDO · APPS · AJUSTES · ADULTOS
│
└── OK sobre AJUSTES  →  Estado 1: settings-mode
    │
    ├── ▲/▼  →  subnav-bar: Ajustes usuario · Video · Visita guiada · Grabaciones · Sistema
    │
    ├── Al posicionarse sobre "Ajustes usuario"  →  Estado 2: + settings-usuario-active
    │   └── (preview: user-options-bar visible pero sin ítem activo)
    │
    ├── OK sobre "Ajustes usuario"  →  Estado 3: + settings-usuario-entered
    │   ├── ◀/▶  →  user-options-bar: General · Idioma · Control parental · Grupo de canales
    │   └── ATRAS  →  Estado 2 (preview)
    │
    └── ATRAS desde Estado 1 o 2  →  Estado base
```

---

## Funciones JS clave

| Función | Descripción |
|---|---|
| `selectNav(el)` | Activa un ítem de la nav-bar y muestra su sección. Limpia todos los estados de ajustes. |
| `selectSetting(el)` | Activa un ítem de la subnav-bar. Agrega `settings-mode`, quita `settings-usuario-entered`. Si el ítem es "usuario" agrega `settings-usuario-active`. |
| `selectUserOption(el)` | Activa un ítem de la user-options-bar. Agrega `settings-usuario-entered`. |
| `enterUsuarioOptions()` | Transición al Estado 3. Agrega `settings-usuario-entered` y activa "General" por defecto. |
| `centerNavItem(el, navId)` | Centra un ítem dentro de su barra (scroll suave). Funciona para las tres barras. |
| `isSettingsMode()` | `true` si `.decoder` tiene la clase `settings-mode`. |
| `isUserOptionMode()` | `true` si `.decoder` tiene la clase `settings-usuario-entered`. |
| `remoteBack()` | Retrocede un nivel: Estado 3 → 2 → 1 → base. |
| `handleRemoteAction(action)` | Punto de entrada para todas las acciones del control remoto y teclado. |

---

## Control remoto

El panel `.remote-panel` (esquina inferior derecha) y el teclado usan `handleRemoteAction(action)` con las siguientes acciones:

| Acción | Teclado | Botón |
|---|---|---|
| `left` | ← | ◀ |
| `right` | → | ▶ |
| `up` | ↑ | ▲ |
| `down` | ↓ | ▼ |
| `ok` | Enter | OK |
| `back` | Escape | ATRAS |
| `home` | Home | ⌂ |
| `exit` | — | SALIR |

---

## Plantilla de prompt para reanudar con un nuevo agente

```
Contexto: Proyecto TPlay — simulador de interfaz de TV en HTML/CSS/JS.
Archivo principal: deco_v1_standalone.html (todo inlineado, sin dependencias locales).

Estados del decoder (.decoder):
  - (base)                                          → nav-bar activa
  - .settings-mode                                  → subnav-bar activa
  - .settings-mode + .settings-usuario-active       → preview de user-options-bar (sin ítem activo)
  - .settings-mode + .settings-usuario-active
    + .settings-usuario-entered                     → user-options-bar activa, General resaltado

Barras y sus IDs:
  - nav-bar         → #navBar         / .nav-item      / selectNav()
  - subnav-bar      → #settingsNav    / .subnav-item   / selectSetting()
  - user-options-bar→ #userNav        / .settings-option / selectUserOption()

Estado actual: [describir últimos cambios]
Objetivo: [describir qué hay que hacer]
Restricciones: mantener layout fijo 1280×720, no modificar CSS salvo que sea necesario.
```

---

*Versión: README reescrito con nomenclatura de barras y mapa de estados.*
