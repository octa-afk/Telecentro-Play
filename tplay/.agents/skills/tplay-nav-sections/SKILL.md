---
name: tplay-nav-sections
description: "Trigger: agregar, cambiar o revisar secciones y barras de navegación en el simulador TPlay (deco_v2.html): ítem nuevo en la barra principal, sección #sec-*, subsección dentro de AJUSTES, barra de opciones hija, pestañas o pantalla con foco propio. Usar siempre que se pida 'agregar una sección al menú', 'nueva barra', 'nuevo nivel de navegación', 'una opción en Ajustes' o replicar el diseño/comportamiento de los menús existentes, aunque no se nombre el archivo. No aplica a la versión vieja (app.js / styles.css / README)."
---

# Nuevas secciones de navegación en TPlay (`deco_v2.html`)

El objetivo no es solo que la sección nueva funcione: es que sea **indistinguible** de las que ya existen — misma geometría de barra, mismo estado preview/entered, mismo centrado, mismo comportamiento de Back. Todo lo que sigue sale del código actual; no hace falta inventar valores.

## Modelo mental

Todo el menú se apoya en tres cosas, y solo tres:

1. **Dónde estoy** → clases de estado en `.decoder` (`settings-mode`, `settings-sistema-entered`, `conexion-entered`, …).
2. **Qué ítem está seleccionado** → la clase `.active` sobre el ítem. No hay índices en JS para los menús.
3. **Qué sección se ve** → `.visible` sobre `#sec-*`.

Cada nivel tiene dos estados visuales:

| Estado | Clase en `.decoder` | Aspecto |
| --- | --- | --- |
| **Preview** | `...-active` | La barra hija se asoma **sin ítem activo**, texto apagado, **sin borde propio**. El separador lo dibuja la barra padre. |
| **Entered** | `...-entered` | La barra tiene el foco: ítem activo cyan con subrayado, texto normal, **borde inferior 1px**. |

Jerarquía vigente:

```
#navBar (.nav-item)
└─ AJUSTES → #settingsNav (.subnav-item)
   ├─ Ajustes usuario → #userNav (.settings-option)
   │  └─ General → #generalNav (.general-option)
   └─ Sistema → #sistemaNav (.sistema-option)
      ├─ Diagnóstico → título DIAGNÓSTICO + #diagnosticoNav (.diagnostico-option)
      └─ Conexión → #conexionTabs (.conexion-tab)
         └─ WIFI → #wifiJoinScreen → #wifiPasswordScreen
```

Reglas que explican el resto del diseño:

- **El separador pertenece a la barra de arriba.** Una barra hija en preview nunca lleva borde; si lo llevara, aparecerían dos líneas. (Comentarios en el CSS: "la barra hija nunca lleva borde propio".)
- **Las barras hijas van después de la padre en el DOM**, dentro de `#sec-ajustes`, porque el CSS usa selectores de hermanos (`~`).
- **Al entrar, la barra padre se oculta**; al volver con Back se la restaura junto con el preview. El Back nunca salta dos niveles.
- **Cada clase de estado se registra en tres lugares**: `resetSettingsState()`, la lista de limpieza de `selectSetting()` y `remoteBack()`. Si falta uno, el estado queda pegado al reentrar.

## Antes de escribir: ubicar los anclajes

Los números de línea se mueven. Buscá por nombre:

```bash
grep -n "function resetSettingsState\|function selectSetting\|function selectSistemaOption\|function navigateCurrentLayer\|function selectCurrentItem\|function remoteBack\|function handleKeydown" deco_v2.html
grep -n "general-options-bar\|sistema-options-bar\|conexion-tabs\|settings-sistema-active" deco_v2.html
grep -n 'id="generalNav"\|id="sistemaNav"\|id="settingsNav"' deco_v2.html
```

## Receta 1 — Sección de primer nivel

La más simple. `selectNav()` ya hace todo: limpia el estado de Ajustes, mueve `.active`, muestra `#sec-<data-section>` y centra.

1. Agregá el ítem en `#navBar`:
   ```html
   <div class="nav-item" data-section="radios" onclick="selectNav(this)">RADIOS</div>
   ```
2. Agregá la sección como hermana dentro de `.content-area`:
   ```html
   <div class="section" id="sec-radios">
     <div class="section-label">Radios</div>
     <!-- contenido: reutilizá .card-grid, .content-card, .apps-grid, etc. -->
   </div>
   ```
3. Nada más, salvo que la sección necesite subniveles tipo Ajustes: ahí sí, espejá el patrón de la Receta 2 con su propio contenedor y sus propias clases de estado (no reutilices las de `settings-*`).

No agregues estilos al ítem: `.nav-item` ya define 33px/800, mayúsculas, subrayado cyan y centrado.

## Receta 2 — Subsección de Ajustes con barra de opciones

Este es el patrón que hay que copiar para cualquier opción nueva de `#settingsNav` (por ejemplo **Video**, que hoy existe en la subnav pero no tiene barra propia). Usá estos nombres y reemplazá `video` por tu sección:

| Pieza | Ejemplo |
| --- | --- |
| atributo del ítem | `data-settings="video"` |
| clase de preview | `settings-video-active` |
| clase de entered | `settings-video-entered` |
| contenedor | `<div class="video-options-bar" id="videoNav">` |
| ítems | `.video-option` |
| flag de hijo (solo si hay un nivel más) | `video-option-active` |

### Paso 1 — HTML

En `#settingsNav`, el ítem (si ya existe, no lo dupliques):

```html
<div class="subnav-item" data-settings="video" onclick="selectSetting(this)">Video</div>
```

La barra va **después** de las barras existentes, como hermana dentro de `#sec-ajustes`:

```html
<div class="video-options-bar" id="videoNav">
  <div class="video-option" onclick="selectVideoOption(this)">Modo de imagen</div>
  <div class="video-option" onclick="selectVideoOption(this)">Resolución</div>
</div>
```

### Paso 2 — CSS

Copiá el bloque de `.general-options-bar` y renombrá. Los valores no se tocan.

```css
/* ── video-options-bar ───────────────────────────────────── */
.video-options-bar {
  display: none;
}

/* Preview y entered comparten geometría; el borde es lo único que cambia. */
.decoder.settings-mode.settings-video-active .video-options-bar,
.decoder.settings-video-entered .video-options-bar {
  display: flex;
  align-items: center;
  overflow-x: auto;
  scrollbar-width: none;
  white-space: nowrap;
  height: 58px;
  gap: 45px;
  padding: 0 50%;
}

.decoder.settings-mode.settings-video-active .video-options-bar::-webkit-scrollbar,
.decoder.settings-video-entered .video-options-bar::-webkit-scrollbar {
  display: none;
}

.video-option {
  flex: 0 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  cursor: pointer;
  text-transform: uppercase;
  font-size: 33px;
  font-weight: 800;
  line-height: 1;
  position: relative;
  color: rgba(230, 240, 247, 0.62);
  transition: color 0.15s;
}

/* Entered: recién acá la barra dibuja su propio separador. */
.decoder.settings-video-entered .video-options-bar {
  border-bottom: 1px solid var(--line);
}

/* Al entrar, la barra nueva reemplaza a la subnav, igual que usuario y
   sistema: el foco de la pantalla queda en un solo nivel. Si tu barra está
   un nivel más abajo, ocultá su barra padre en lugar de #settingsNav. */
.decoder.settings-video-entered #settingsNav {
  display: none;
}.decoder.settings-video-entered .video-option {
  color: rgba(246, 250, 255, 0.92);
}

/* El .active se estiliza SOLO dentro de entered: así el preview nunca
   muestra un ítem resaltado, aunque el DOM conserve la clase. */
.decoder.settings-video-entered .video-option.active {
  color: var(--cyan);
}

.decoder.settings-video-entered .video-option.active::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: -2px;
  height: 3px;
  background: var(--cyan);
}
```

> Si tu barra cuelga de `#sistemaNav` (como Diagnóstico), `#settingsNav` ya está oculta por `settings-sistema-entered`, pero además tenés que ocultar la barra de Sistema con la **cadena de clases completa**: `.decoder.settings-mode.settings-sistema-active.diagnostico-entered .sistema-options-bar { display: none; }`. Con menos especificidad pierde contra la regla que la muestra con `display:flex` y quedan dos barras.

Si tu sección tiene un nivel más (una barra hija de esta barra), esa barra hija va **sin borde** y el separador lo dibuja esta, solo mientras el ítem con hijo esté seleccionado (mismo criterio que `conexion-option-active` en Sistema):

```css
.decoder.settings-mode.settings-video-active.video-option-active .video-options-bar {
  border-bottom: 1px solid var(--line);
}
```

### Paso 3 — JS: selección desde la subnav

En `selectSetting(el)`:

1. Agregá las clases nuevas a la lista de `dec.classList.remove(...)` (junto a `settings-sistema-entered`, etc.): **`'settings-video-entered'`** y, si aplica, **`'video-option-active'`**.
2. Limpiá los ítems de la barra nueva, junto a los otros `querySelectorAll`:
   ```js
   document.querySelectorAll('.video-option').forEach(function(n) { n.classList.remove('active'); });
   ```
3. Agregá la rama, después de la de `sistema` y antes del `centerNavItem` final:
   ```js
   if (setting === 'video') {
     dec.classList.add('settings-video-active');
     // centra la primera opción del preview para que quede alineada con el
     // ítem activo de la subnav, igual que al entrar formalmente
     centerPreviewFirst('videoNav', '.video-option');
   } else dec.classList.remove('settings-video-active');
   ```

> `centerPreviewFirst()` usa `document.querySelector()` global: el selector de tus ítems debe ser único en toda la página.

### Paso 4 — JS: entrar a la barra

```js
function selectVideoOption(el) {
  var dec = getDecoder();
  dec.classList.add('settings-video-entered');
  document.querySelectorAll('.video-option').forEach(function(n) { n.classList.remove('active'); });
  el.classList.add('active');
  centerNavItem(el, 'videoNav');

  // Solo si este ítem abre otra barra debajo:
  // if (el.getAttribute('data-videooption') === 'resolucion') {
  //   dec.classList.add('video-option-active');
  //   centerPreviewFirst('resolucionNav', '.resolucion-option');
  // } else dec.classList.remove('video-option-active');
}
```

En `resetSettingsState()` sumá **las tres** clases nuevas (`settings-video-active`, `settings-video-entered` y, si existe, `video-option-active`) a su `classList.remove(...)`, y `.video-option` a su `querySelectorAll` de limpieza. Si te olvidás de la de preview, al reentrar a Ajustes queda una barra fantasma; si te olvidás de la de entered, queda un foco viejo.

### Paso 5 — JS: teclado y Back

Tres enganches, en este orden:

```js
function isVideoOptionMode() {
  return getDecoder().classList.contains('settings-video-entered');
}

// navigateCurrentLayer(): antes de la rama genérica de settings-mode
} else if (isVideoOptionMode()) {
  moveNav('.video-option', direction, selectVideoOption);

// selectCurrentItem(): dentro de la rama settings-mode, junto a usuario/sistema
} else if (setting === 'video') {
  selectVideoOption(getActiveItem('.video-option'));
```

Y un nivel nuevo en `remoteBack()`, **antes** de la rama de `settings-mode`:

```js
// ── Nivel N: Opciones de Video → Subnav de Ajustes ──
if (dec.classList.contains('settings-video-entered')) {
  dec.classList.remove('settings-video-entered', 'video-option-active');
  document.querySelectorAll('.video-option').forEach(function(n) { n.classList.remove('active'); });
  setTimeout(function() {
    var activeSetting = document.querySelector('.subnav-item.active') || document.querySelector('.subnav-item');
    if (activeSetting) centerNavItem(activeSetting, 'settingsNav', true);
    centerPreviewFirst('videoNav', '.video-option');
  }, 0);
  return;
}
```

Por qué el `setTimeout(0)` y el `instant`: al salir de entered la barra cambia de layout y el scroll se recalcula recién en el siguiente frame; `centerNavItem(..., true)` evita animar una barra que estuvo oculta.

### Paso 6 — Verificar

Ver "Verificación" al final.

## Receta 3 — Un nivel más: pestañas o pantalla con foco propio

Si la sección necesita una pantalla completa (como Conexión → WIFI), el patrón es:

1. Una clase `*-entered` para las pestañas (`.conexion-tabs`) y una `*-mode` para la pantalla (`wifi-join-mode`, `wifi-password-mode`).
2. Al entrar, el título reemplaza a la barra padre: `.conexion-title` se muestra y `.sistema-options-bar` se oculta con `.conexion-entered`.
3. La pantalla nueva intercepta el teclado **antes** del ruteo genérico (`handleKeydown` → `handleRemoteAction`) y se sale por su propia rama en `remoteBack()`, antes de las ramas de menú.
4. Los índices JS (`wifiJoinIndex`, `kbIndex`) solo se justifican para grillas/pantallas, nunca para barras horizontales.

Copiá `selectConexionTab` / `activateConexionTab` / `enterWifiJoin` como referencia, no `selectConexionOption` (ver "Código muerto").

## Variante — barra que queda como título (como Diagnóstico)

Cuando la sección tiene una barra de opciones que debe **seguir visible** mientras se navegan sus ítems, no la dejes como única barra al entrar: agregale un título que ocupe el lugar de la barra padre. Es el mismo patrón que Conexión (`CONEXIÓN` + pestañas WIFI/ETHERNET) y el que usa Diagnóstico (`DIAGNÓSTICO` + Resumen/WiFi-ETH/DVB-C/CAS).

Diferencia clave con la Receta 2:

- **Receta 2** (usuario, sistema): al entrar, la barra hija *es* la barra superior.
- **Esta variante**: al entrar, se muestra un título de 58px y la barra hija queda **debajo**, siempre visible. El título es lo que "reemplaza" a la barra padre.

### HTML

El título va **antes** de la barra de opciones en el DOM, para que quede arriba al apilarse:

```html
<div class="diagnostico-title" id="diagnosticoTitle">DIAGNÓSTICO</div>
<div class="diagnostico-options-bar" id="diagnosticoNav">
  <div class="diagnostico-option" onclick="selectDiagnosticoOption(this)">Resumen</div>
  <div class="diagnostico-option" onclick="selectDiagnosticoOption(this)">WiFi/ETH</div>
</div>
```

### CSS

El título es una copia de `.conexion-title`; no lleva borde (el borde lo dibuja la barra de opciones de abajo):

```css
.diagnostico-title {
  display: none;
  align-items: center;
  justify-content: center;
  height: 58px;
  font-size: 33px;
  font-weight: 800;
  line-height: 1;
  color: var(--text);
  text-transform: uppercase;
  white-space: nowrap;
}

.decoder.settings-mode.settings-sistema-active.diagnostico-entered .diagnostico-title {
  display: flex;
}

/* La barra de Sistema deja su lugar al título; la barra hija se queda. */
.decoder.settings-mode.settings-sistema-active.diagnostico-entered .sistema-options-bar {
  display: none;
}
```

Y la barra hija mantiene su regla de entered con `border-bottom:1px` (no se oculta al navegar sus ítems). Verificado a 1280×720: título en `top:104–162` y barra de opciones en `162–220` estable mientras se recorren las 4 opciones.

### JS

No hace falta tocar `selectDiagnosticoOption`: alcanza con que agregue `diagnostico-entered`. El título aparece por CSS y `remoteBack` lo oculta al quitar esa clase. Esa es toda la lógica.

## Invariantes visuales

| Pieza | Valor exacto |
| --- | --- |
| barra | `height:58px; gap:45px; padding:0 50%; display:flex; align-items:center; overflow-x:auto; scrollbar-width:none; white-space:nowrap` |
| ítem | `font-size:33px; font-weight:800; line-height:1; text-transform:uppercase; height:100%; flex:0 0 auto; position:relative; cursor:pointer` |
| preview | color `rgba(230, 240, 247, 0.62)`, sin `.active`, sin borde |
| entered | color `rgba(246, 250, 255, 0.92)`, `border-bottom:1px solid var(--line)` |
| ítem activo | `color: var(--cyan)` + subrayado `3px` en `bottom:-2px` |
| título de sección | `display:flex; align-items:center; justify-content:center; height:58px; font-size:33px; font-weight:800; text-transform:uppercase`, sin borde |
| nav principal y subnav en settings | `border-bottom:2px solid var(--line)` |
| tokens | `--cyan:#16b9f7; --line:rgba(18,177,235,0.58)` (definidos en `.decoder`) |

El `padding: 0 50%` es lo que permite centrar cualquier ítem con `centerNavItem()`; si lo sacás, el centrado deja de funcionar.

## Errores que rompen la consistencia

- **Olvidar `resetSettingsState()`** → al salir y volver a Ajustes aparece una barra o un foco viejo. Es el error más frecuente.
- **No poner el `else` que quita `*-active`** → dos previews visibles a la vez.
- **Ocultar la barra padre con menos especificidad que su `display:flex`** → la barra padre sigue visible y quedan dos barras apiladas. Copiá la cadena completa que ya usa el estado entered existente (`.decoder.settings-mode.settings-sistema-active.conexion-entered .sistema-options-bar`), no un `.decoder.mi-entered .bar` suelto.
- **Poner borde a la barra hija en preview** → doble línea con la barra padre.
- **Estilar `.mi-option.active` sin condicionar a `*-entered`** → el preview muestra un ítem cyan. (El código actual tiene este bug con `.sistema-option.active`; no lo repliques.)
- **No limpiar `.active` al volver con Back** → el preview reaparece resaltado. `remoteBack` actual lo hace bien con pestañas, no con `.sistema-option`; tu nivel nuevo debe limpiarlo.
- **Insertar la barra hija antes de la padre** → los selectores `~` no matchean y el preview no aparece.
- **Usar un selector genérico en `centerPreviewFirst`** → centra el ítem de otra barra.
- **Crear índices JS paralelos** (`miIndex`) → se desincronizan con `.active`; usá `moveNav()`.
- **Copiar medidas "a ojo"** → 58/45/33 y los colores son los que hacen que la sección se vea parte del mismo menú.

## Código muerto y documentación obsoleta

No lo copies ni lo tomes como referencia:

- `selectConexionOption()` referencia `#conexionNav` y `.conexion-option`, que no existen.
- `.settings-section` y `.user-subnav-bar` son CSS sin DOM.
- El comentario "conexion-options-bar" nombra a lo que hoy es `.conexion-tabs`.
- `README.md`, `app.js` y `styles.css` describen la v1 (`deco_v1_standalone.html`, tres barras). El archivo vigente es `deco_v2.html`.
- `settings-options` es la barra de opciones de **Ajustes usuario**, no un contenedor genérico de ajustes.

## Verificación

### Automática

```bash
cd /home/octa/Descargas/tplay
node test-nav.mjs          # smoke de entrada/salida a Ajustes (solo logs)
```

`test-consistencia.mjs` codifica las invariantes (centrado ±6px, borde padre 1px / hijo 0px, preview sin activo, Back restaura), pero está desactualizado: usa `#conexionNav` y `#wifiScreen`, que ya no existen, y falla antes de medir. No lo interpretes como regresión; usalo como especificación de lo que hay que cumplir.

### Manual (Playwright o el simulador)

1. **Preview**: al moverte por la subnav, la barra nueva aparece con la primera opción centrada, sin ítem resaltado y **sin** línea propia; la línea la dibuja la subnav.
2. **Entered**: OK entra, la primera opción queda `.active` (cyan + subrayado), centrada (±6px), la barra muestra su borde de 1px y la subnav se oculta.
3. **Back**: Escape vuelve **un** nivel, restaura la subnav con la opción correcta centrada y el preview sin ítem activo.
4. **Reentrada**: salir a HOME y volver a Ajustes arranca limpio (sin borde, sin activo, primera opción).
5. **Home/Exit**: desde cualquier profundidad vuelve a HOME y no deja clases de estado.
6. **Layout**: a 1280×720 no aparece scrollbar horizontal visible y la barra mide 58px de alto.

Si la sección nueva agrega un tercer nivel o una pantalla, agregá esos dos pasos al mismo recorrido (entrar, moverse, Back) antes de darla por terminada.
