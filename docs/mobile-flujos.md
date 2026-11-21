# Telecentro Play mobile — inventario de flujos

Fuente: capturas de la app real (SM-S711B), un toque por vez, volviendo con back del sistema. Sin datos personales: nombres, números de cliente y dispositivos reales no se anotan.

Estado: **relevado** = recorrido y verificado; **pendiente** = no recorrido aún; **no operar** = acción destructiva o sensible, solo se describe.

## Flujo 1 — Configuración (relevado)

Entrada: engranaje arriba a la derecha de **Inicio**.

Pantalla "Configuración": lista vertical de 7 ítems.

| Ítem | Pantalla que abre | Contenido | Estado |
|------|-------------------|-----------|--------|
| Mis datos | "Mis datos" | Avatar, bloque "Grabaciones en tu cuenta" (horas disponibles y grabadas), usuario, número de cliente, botón "Gestión de almacenamiento" | relevado (solo lectura; datos personales no anotados) |
| Gestión de dispositivos | "Gestión de dispositivos" | Sección "Este dispositivo" (teléfono), botón "Cerrar todas las sesiones", aviso "hasta 5 dispositivos", sección "Otros dispositivos activos (N)" con botón ❌ por dispositivo | relevado; **no operar** "Cerrar todas las sesiones" ni ❌ |
| Mis canales | "Mis canales" | Subtítulo "Gestioná la visualización de tus canales favoritos y más vistos"; toggles "Mostrar mis canales favoritos" y "Mostrar mis canales más vistos" (ambos ON) | relevado; toggles no tocados |
| Notificaciones | "Notificaciones" | Toggle "Notificaciones push" (ON) + texto "Las notificaciones están activadas. Te compartiremos todas las novedades de T-Play." | relevado; toggle no tocado |
| Detalles técnicos | "Detalles técnicos" | Logo, "Versión", "Dispositivo", "Sistema" (solo lectura) | relevado |
| Ayuda y legales | "Ayuda y legales" | Bloques "Ayuda" (link a ayuda), "Política de privacidad", "Términos y condiciones", "Licencia de terceros" | relevado; **no tocar links** (salen de la app) |
| Cerrar sesión | — | — | **no operar** (destructiva) |

Navegación verificada: back del sistema (keyevent 4) desde cada subpantalla vuelve a Configuración; desde Configuración vuelve a Inicio.

Pendiente de confirmar: si Configuración y pestaña **Más** muestran las mismas opciones (paso de Fase 0 del plan).

### Implementación en el simulador

- Simulador: `Simulador-TPlay-mobile.html` (pantallas `#sec-configuracion`, `#sec-mis-datos`, `#sec-gestion-dispositivos`, `#sec-mis-canales`, `#sec-notificaciones`, `#sec-detalles-tecnicos`, `#sec-ayuda-legales`).
- Test: `tplay/tests/test-mobile-configuracion.mjs` (todo PASS).
- Datos mostrados: ejemplos. Nombre, número de cliente y dispositivos reales no se replican.
- Acciones destructivas e interacciones de la app real (Cerrar todas las sesiones, ❌, Cerrar sesión, toggles, links) quedan **inertes** en el simulador.
- Navegación: engranaje abre Configuración; ítems abren su pantalla; ‹ y Escape vuelven un nivel; la pestaña Inicio vuelve a la raíz.
- Pendiente: verificar en la app real la pestaña Más (¿repite estas opciones?).

## Pestaña Más (relevado)

Toque en **Más** abre un menú flotante sobre la pantalla actual (la pantalla de fondo queda atenuada) con 3 opciones: **Películas**, **Series**, **Guía**. Back cierra el menú. No es el mismo contenido que Configuración.

## Búsqueda (relevado parcialmente)

Entrada: pestaña **Buscar**. Pantalla "Búsqueda" con engranaje arriba a la derecha, campo "¿Qué estás buscando?" (se abre con el teclado), sección "Búsquedas recientes:" con ✕ por cada búsqueda (borra historial real: **no operar**).

- Relevado: pantalla, campo y lista de recientes. No se escribió ninguna búsqueda ni se operó el ✕.
- Observado: un back con el teclado abierto volvió a Configuración (no solo cerró el teclado). Pendiente confirmar el comportamiento con un solo back.
- Pendiente: resultados de una búsqueda (solo con consulta de ejemplo autorizada).

### Implementación en el simulador (Más, Búsqueda, TV en vivo)

- Simulador: `Simulador-TPlay-mobile.html` (`#sec-busqueda`, `#sec-tv-en-vivo`, menú `#masPopup`).
- Tests: `tplay/tests/test-mobile-busqueda-tv.mjs` (todo PASS).
- Más: abre y cierra el menú flotante (Escape o tocar fuera); sus opciones son inertes; la pestaña Más queda activa mientras está abierto.
- Búsqueda: campo y recientes de ejemplo. ✕ y búsqueda inertes (no se borra historial ni se buscan resultados).
- TV en vivo: vistas "Grupo de canales" (por defecto) y "Listado de canales"; el botón de filtro es inerte.
- Pendiente: el listado no se desplaza (en la captura hay canales debajo del corte, CH 201 y CH 202); resultados de búsqueda; comportamiento de back con teclado abierto en Búsqueda.

## Reproductor (bloqueado para captura)

Al reproducir TV en vivo, el teléfono pasa a horizontal y la pantalla sale negra en scrcpy y en `adb screencap`: Android bloquea la captura de contenido protegido. No hay forma de relevar los controles ni los banners desde la PC. **Pendiente**: fotos tomadas con otro dispositivo, o una descripción de quien tenga el teléfono en mano.

## Mi contenido (relevado)

Entrada: pestaña **Mi contenido**. Pantalla "Mi contenido" con engranaje arriba a la derecha (abre Configuración) y estado vacío:
- Ilustración de un play con "+" (sin texto).
- Título: "¡Accedé a T-Play desde tus dispositivos!"
- Texto: "Lo que veas se irá sumando en esta sección para **Continuar viendo**. También vas a poder encontrar acá tus **Grabaciones** y tus **Favoritos**."
- Botón "Explorá el contenido de T-Play": lleva a **Inicio** (en la captura, cargando con placeholders grises).

Implementado en el simulador: `#sec-mi-contenido` (estado vacío), test `tplay/tests/test-mobile-mi-contenido.mjs` (todo PASS). El botón "Explorá" vuelve a Inicio.

Pendiente: ver cómo se ve Mi contenido con contenido (Continuar viendo, Grabaciones, Favoritos). En la cuenta actual está vacío, así que no hay nada que capturar por ahora.

## Inicio actual y Películas (relevado)

**Inicio actual** (distinto del que está en el simulador): carrusel de banners con puntos de paginación (y botón "VER" en algunos), fila de accesos **Películas · Series · Guía**, y secciones "Lo más visto ahora" y "Ver últimas 24hs" (tarjetas de canal con CH y barra de progreso), "Viví el mejor Deporte", etc.

**Películas** (acceso desde Inicio): pantalla "Películas" con engranaje; la pestaña **Más** queda marcada en cyan. Contenido: carrusel con botón "VER" (3 puntos), fila de chips de canales ("VER TODAS", SPACE, TNT, film&arts, AMC…) y secciones de pósters "Las películas que te recomendamos" y "Heroes y Fantasia". Back vuelve a Inicio.

**Series** (acceso desde Inicio): igual que Películas, con carrusel (3 puntos), chips (SPACE seleccionado, TNT, G, film&arts, AMC) y la sección "Especiales" con un póster. Más queda marcada. El primer toque sobre el acceso no navegó (el carrusel se estaba moviendo); el segundo sí.

**Guía de canales** (acceso desde Inicio): filtro, categorías "Ver todos · Aire · Noticias · Deportes…", panel del programa en vivo (canal, botones favorito / reproducir / grabar, título, "EN VIVO", horario, info), línea de tiempo "HOY 20:30 · 21:00 · 21:30" con marcador de hora actual y grilla de canales 104 a 109 con el programa en curso resaltado. Más queda marcada.

Implementado en el simulador: Inicio actualizado (carrusel, accesos, "Lo más visto ahora", "Ver últimas 24hs", "Viví el mejor Deporte"), `#sec-peliculas`, `#sec-series`, `#sec-guia`. Tests: `test-mobile-inicio.mjs` y `test-mobile-peliculas-series-guia.mjs`. Las opciones del menú flotante Más siguen inertes (no se verificó que abran estas pantallas).

Pendiente: el Inicio y las demás pantallas no se desplazan; botones favorito/grabar e ícono de info de la Guía sin ícono; detalle de un programa; chips de canales sin función.

## Flujos siguientes (pendientes)

- Reproductor de TV en vivo (bloqueado para captura, ver arriba).
- Detalle de contenido (tocar un póster en Inicio)
- Inicio: el carrusel de banners (Black Friday), accesos rápidos Películas / Series / Guía y filas "Lo más visto ahora" / "Ver últimas 24hs" no están en `Simulador-TPlay-mobile.html`, que replica una versión anterior de Inicio con pósteres.
