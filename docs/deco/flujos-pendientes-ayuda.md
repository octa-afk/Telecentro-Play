# Flujos de la ayuda oficial aún no implementados en `deco/`

Fuente: <https://ayuda.telecentro.com.ar/telecentro-play-en-el-decodificador-smart/>
("¿Cómo usar Telecentro Play en tu Decodificador Smart?"). Casi todos los pasos
de ese artículo están en imágenes; lo de abajo sale del texto y de esas
imágenes (control remoto + captura de la TV). Revisado el 2026-11-25 contra
`deco/Simulador-TPlay.html`.

## Estado actual del simulador (relevante)

- Existe el **tour del menú** (`tour-guia`, `tour-grab`, `tour-apps`): Guía
  (navegar celdas con ↑↓←→), Mi contenido › Grabaciones (pestañas *Mis
  grabaciones / Programadas / Crear*, pantallas estáticas) y Apps (grilla de
  tiles con foco).
- **No existe** reproductor de TV en vivo en el simulador (ni overlay de canal,
  ni menú INFO, ni control de transporte). La TV de fondo es el banner de
  Home; la única "TV" es la del final del asistente de fábrica.

## Resumen

| # | Flujo de la ayuda | Estado |
|---|-------------------|--------|
| 1 | Ver contenido desde el principio | Pendiente |
| 2 | Grabar (botón rojo / INFO) | Pendiente (hay pantallas de Grabaciones, pero no el disparo desde la TV) |
| 3 | Pausar y retroceder en vivo | Pendiente |
| 4 | Ver las últimas 24 hs | Parcial (guía y tile existen; falta el comportamiento) |
| 5 | Series y películas / Apps | Parcial (tiles sin acción; falta abrir la app) |

Prerrequisito común de 1, 2 y 3: un **modo "TV en vivo"** (pantalla con canal
sintonizado + overlay de canal + menú INFO).

---

## Flujo 1 — Ver contenido desde el principio

Imagen: "Empezar desde el principio en tu decodificador Smart".

1. Mirando un canal en vivo, pulsar **INFO**.
2. Aparece el menú de funciones: `AUDIO · SUBTÍTULOS · EMPEZAR DESDE EL PRINCIPIO`
   (la opción se destaca en celeste; leyenda: "PRESIONAR OK PARA EMPEZAR DESDE EL PRINCIPIO").
3. Se muestra la ficha del programa: título, rango horario con barra de
   **tiempo transcurrido** (ej. `09:40 - 11:20`), sinopsis, canal (`1062 - FOX PREMIUM ACTION HD`).
4. Pulsar **OK** sobre "Empezar desde el principio" → el programa reinicia desde el inicio.

Para el simulador: menú INFO con foco en opciones, ficha del programa, y estado
"desde el principio" (contador de atraso = tiempo transcurrido).

## Flujo 2 — Grabar contenido

Texto: "Tenés 2 formas de poner a grabar tu contenido". Notas: **20 hs** de
capacidad; el tiempo disponible se ve desde la **app Telecentro Play › menú
"Configuración de tu perfil" › "Gestión de grabaciones"** (eso es de la app
mobile, no del deco).

**Forma A — botón rojo (●) del control**
1. Mirando un canal, pulsar el botón rojo.
2. Se abre el diálogo de grabación del programa (ej. "SOL DE MEDIANOCHE"):
   - `HORA DE INICIO` (ej. 09:47 · Hoy) y `HORA DE FINALIZACIÓN` (09:50 · Hoy) — duración del evento.
   - `TIEMPO DE GUARDA DE INICIO` `‹ ›` (ej. 15 min: minutos *antes* de que empiece el contenido).
   - `TIEMPO DE GUARDA DE FIN` `‹ ›` (ej. 15 min: minutos *después* de que termine).
   - Botones `VALIDAR` / `CERRAR`.
3. Ajustar guardas con ←/→ y confirmar con **VALIDAR**.

**Forma B — botón INFO**
1. Pulsar **INFO** en el canal en vivo.
2. En el menú `CERRAR · GRABAR · AUDIO · SUBTÍTULOS · EMPEZAR…` ir a **GRABAR**
   (leyenda: "PRESIONAR OK PARA CREAR UNA GRABACIÓN PARA ESTE PROGRAMA").
3. **OK** → mismo diálogo de la Forma A.

Para el simulador: la grabación creada debería aparecer en Mi contenido ›
Grabaciones › *Grabaciones programadas* (hoy estático).

## Flujo 3 — Pausar y retroceder en vivo

Imagen: "Pausar y retroceder en vivo con tu Decodificador Smart".

1. En un canal en vivo, usar los comandos de transporte del control:
   ⏪ retroceder · ▶ play · ⏩ avanzar · ■ stop · ⏸ pausa.
2. Al pausar se muestra el ícono de pausa a la izquierda de la pantalla y el
   overlay del canal con la barra del programa.
3. Aparece un **contador** (ej. `- 2s`) con los segundos de atraso respecto de la TV en vivo.
4. El overlay también muestra el programa actual/siguiente (`08:15 (95 min) Sol de medianoche` → `09:50 Christmas Land`)
   y el recuadro "START OVER"; pie: `: MÁS` (INFO) y `: MOSTRAR EN PIP`.

Para el simulador: estado pausado/atrasado con contador que crece mientras está
en pausa, y retorno al vivo (▶ hasta alcanzar el directo o botón **TV**).

## Flujo 4 — Ver las últimas 24 hs

Texto: "Mirá cómo acceder al contenido de las últimas 24 hs". Imagen: "Ver últimas 24 hs en tu deco Smart".

1. Pulsar **GUÍA** (botón del control) → grilla de programación (`HOY`, línea de hora actual).
2. Navegar con las flechas hacia la **izquierda** (programación ya emitida)
   o usar **⏭/⏮ "Saltar 24 hs"**; las celdas pasadas muestran el ícono de
   "ver desde el principio". Pie: `ATRÁS · i MÁS · SALTAR 24HS · C+/C- CAMBIAR CANAL`.
3. **OK** sobre un programa emitido → se reproduce.
4. Botón **TV** (verde/azul al pie del control) → vuelve a la programación en vivo.

Ya está: el tour de Guía con navegación de celdas y el footer "Saltar 24hs".
Falta: celdas pasadas (hoy la fila solo avanza), salto de 24 hs, OK que reproduce,
y la tecla **TV** para volver al vivo.

## Flujo 5 — Ver series y películas (y Apps)

Texto: "Mirá qué fácil es acceder a tus series y películas y a todas las Apps de tu decodificador Smart". Imagen: "Series y películas en tu deco Smart".

1. Pulsar el botón **APPS** del control.
2. Se abre `APPS` (menú superior: `… HOME · GUÍA · MI CONTENIDO · APPS · AJUSTES`)
   con tiles: **Series & Películas · Netflix · YouTube · Últimas 24 hs de TV · Ayuda**.
3. Elegir el tile con las flechas y **OK**.

Ya está: grilla de Apps con foco (`tour-apps`).
Falta: tecla/botón **APPS** como atajo; tile **Ayuda** (la captura lo muestra,
el simulador no); **OK** sobre los tiles (entrar a Series y películas y a
Últimas 24 hs de TV, que debería llevar al Flujo 4).

> Nota: el simulador tiene además Prime Video, YouTube Kids, Disney+ y STAR+
> que no aparecen en esta captura (que es de 2018); no se tocan.

## Atajos de control remoto que aparecen en las imágenes

`INFO` · botón rojo `●` · `⏪ ▶ ⏩ ■ ⏸` · `GUÍA` · `APPS` · `TV` · `ATRÁS`.
Hoy el simulador solo mapea ←↑→↓, Enter, Escape y Home/Exit (`handleKeydown`).

## Pendiente de confirmar

- Las imágenes son de 2018 (la UI puede haber cambiado). Conviene validar con
  un deco Smart real antes de implementar; las reglas del repo piden no
  inventar pantallas.
- Textos exactos del diálogo de grabación y del overlay en vivo salen de esas
  capturas; si hay discrepancias con el deco actual, gana el deco.
