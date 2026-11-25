# Simulador Telecentro Play

## Descripción del proyecto

Este repositorio contiene el desarrollo de un simulador web de las interfaces de **Telecentro Play**, tanto del decodificador como de su aplicación mobile.

El proyecto está desarrollado utilizando **HTML y CSS** y tiene como objetivo servir como herramienta de capacitación y orientación para los nuevos asistentes de soporte técnico y atención al cliente de Telecentro.

A través de este simulador, los asistentes pueden familiarizarse con las distintas interfaces, opciones y funcionalidades de las plataformas, permitiéndoles comprender mejor la experiencia del usuario y brindar asistencia más precisa durante las llamadas telefónicas de soporte.

## Objetivos

- **Reducir los tiempos de atención:** facilitar la resolución de dudas y consultas de los clientes durante las llamadas telefónicas.
- **Agilizar la capacitación:** permitir que los nuevos asesores se familiaricen con las interfaces mediante la práctica.
- **Mejorar la experiencia del asesor:** brindar una herramienta de consulta y aprendizaje que facilite la comprensión de las plataformas.
- **Optimizar la asistencia al cliente:** mejorar la capacidad de los asesores para guiar a los usuarios paso a paso en el uso del decodificador y la aplicación.

## Tecnologías utilizadas

- HTML5
- CSS


## ⚠️ Aclaración ⚠️

Este proyecto tiene fines exclusivamente educativos y de capacitación. Se trata de una simulación visual de las interfaces de Telecentro Play y no constituye una aplicación oficial ni permite operar sobre los servicios reales de Telecentro.
El desarrollo de las interfaces se realizó tomando como referencia material de acceso público disponible en Internet

## Estructura del repo

```
deco/      Simulador del decodificador (Simulador-TPlay.html, 1280×720) y sus tests/
mobile/    Simulador de la app mobile (Simulador-TPlay-mobile.html) y sus tests/
docs/      Guías, flujos, plan de integración y material de apoyo por plataforma
```

Cada plataforma es autocontenida. La app de Android TV se agregará como `android-tv/`.
Los tests usan Playwright (`npm install` en la raíz) y se corren con `node <plataforma>/tests/<test>.mjs`.
