# Plan: integrar en el simulador los flujos del tour del menú

Fuente: `docs/deco/ejemplos/recorrido_general.mp4` (58 s, tour por el menú principal y Ajustes).
Destino: `deco/Simulador-TPlay.html` (archivo único; estado por clases sobre `.decoder`; secciones `#sec-*`; navegación por `handleKeydown` → `navigateCurrentLayer` / `selectCurrentItem` / `remoteBack`).
Branch: `feat/sim-boot-bars-live-tv` (o una nueva a partir de ella).

## Convenciones a respetar
- UI en español con tildes; `var` y funciones globales; comentarios `/* ── … ── */`.
- Cada sección con su barra y foco propio, como `reset-option` / `selectResetOption`.
- Back por niveles en `remoteBack`; Home vuelve al HOME.
- Test por flujo en `deco/tests/` (Playwright + firefox, helpers `check`/`press`/`cls`/`has`), siguiendo `test-factory-reset.mjs`.

## Orden propuesto (una entrega por ítem, con test)

| Prio | Ítem | Alcance | Tamaño |
|------|------|---------|--------|
| 1 | **Ajustes usuario › General / Idioma** | Panel de valores por opción + pista "Presione OK para modificar: …". General: Auto apagado (Desactivado), Duración banner (5 segundos), Tiempo recordatorios (5 minutos), Modo de inicio (Canal 1002), Rutina de mantenimiento (No permitida), Próxima rutina (N/A). Idioma: Menú / Audio / Subtítulos (Español, Español, Apagado). OK rota el valor (reusar `frCycle`). | S |
| 2 | **Control parental (Ajustes)** | Barra: Cambiar PIN, Recordar PIN, Definir edades, Activación de bloqueo de canales, Canales bloqueados, Tplay Adulto, Cambiar código PIN de compra. Panel de valores (1 hora, Desactivado, Activado, 4 canales, Activado, —). Reusar `#pinModal` para Cambiar PIN. | M |
| 3 | **Grupo de canales** | Pantalla "Gestión de grupos" con pista. | XS |
| 4 | **Apps** | Completar la grilla: fila 1 Telecentro Play (Series y Películas), Netflix, Prime Video, YouTube, Telecentro Play (últimas 24 hs); fila 2 YouTube Kids, Disney+, Star+. Foco navegable con flechas. | S |
| 5 | **TV** | Estado "Volver a TV" en la barra al entrar y tarjeta del canal en reproducción (Ariel en su salsa, 11:15–13:00). | S |
| 6 | **Guía** | OK abre la guía: miniatura del programa arriba, grilla horaria (HOY 11:00–13:30), canales 13–18, programa resaltado, línea de hora actual, pie con atajos (Atrás, Más, OK ir al canal, Saltar día, Cambiar canal, Grupo de canales). Datos en un array JS; foco con flechas; Back vuelve. | L |
| 7 | **Mi Contenido › Grabaciones** | Menú: Mis grabaciones / Grabaciones programadas; en programadas, Crear abre el formulario (canal, fecha, hora de inicio, duración, protegido, espacio "0 de 20 hs", Cancelar grabación / Aplicar). Campos con `‹ ›` que cambian valor. | L |
| 8 | **Adultos** | Pista "Presione OK para acceder al modo Adultos" sobre la pantalla de PIN. El video no muestra qué pasa después. | XS |

Tallas: XS < 30 líneas, S ~50–100, M ~100–150, L > 150.

## Antes de implementar cada ítem
Extraer frames a 1 s del tramo correspondiente del video para fijar textos, orden de opciones y distancias exactas (el muestreo a 3 s dejó huecos).

| Tramo aprox. | Ítem |
|--------------|------|
| 0–6 s | TV, Guía (apertura) |
| 6–24 s | Guía, Mi Contenido, Grabaciones |
| 24–30 s | Apps |
| 30–54 s | Ajustes usuario |
| 54–58 s | Adultos |

## Fuera de alcance
Buscar, Kids, Video, Visita guiada por voz, Grabaciones de Ajustes y Sistema (no aparecen en este video). Detalle de un programa de la Guía y "Mis grabaciones" (el video no los abre): se inferirían, así que se dejan para después.

## Verificación
1. Correr el test existente `deco/tests/test-factory-reset.mjs` en cada entrega: el reset de fábrica no debe cambiar.
2. Un test nuevo por ítem (navegar con flechas, OK, Back, valor visible).
3. Comparar capturas del simulador (`SHOT_DIR`) contra los frames del video.

## Riesgo
Solo UI del simulador; sin datos persistentes ni contratos externos. El único punto compartido es la navegación (`navigateCurrentLayer`, `remoteBack`): cada entrega debe pasar el test de reset y los `deco/tests/test-*.mjs` existentes.
