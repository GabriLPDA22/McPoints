<div align="center">
<img src="assets/icon-only.png" alt="McPoints" width="96" />

# McPoints

### Tu colección de números de pedido de McDonald's, en el móvil.

`v2.0.0`  •  `Android`  •  `Distribución independiente`  •  `Licencia MIT`

<br>

## [⬇️ Descargar McPoints 2.0.0 (APK)](https://github.com/GabriLPDA22/McPoints/releases/download/v2.0.0/McPoints-2.0.0.apk)

Descarga directa · Instalación manual · Sin Google Play

</div>

---

## Qué es

Cada vez que pides en McDonald's te dan un número. McPoints lo escanea (o lo apuntas a mano) y
lo guarda en tu colección personal: de dónde salió el pedido, cuándo, cuántas veces lo has
conseguido y qué canales aún te faltan por completar para ese mismo número.

No es una app oficial de McDonald's, ni se conecta a ningún servidor: todo vive en tu teléfono.

## Novedades en 2.0

La versión 2.0 es un rediseño completo de la app, no un lavado de cara:

- **Identidad propia**, inspirada en tickets térmicos, escáneres y perforaciones — sin copiar la
  marca oficial de McDonald's.
- **Escáner e iconografía renovados**: iconos propios para kiosco, caja, app, McAuto y delivery,
  además de un lector OCR que reconoce el ticket completo, no solo el número.
- **Idioma**: la app está disponible en **Español**, **English** y **Português (Portugal)**,
  seleccionable desde Ajustes.
- **Modo claro como tema principal** (con un modo oscuro a juego, no al revés).
- **Splash screen, navegación, historial y pantallas de detalle** rediseñados de arriba a abajo.

## Características

<table>
  <tr>
    <td width="50%" valign="top">
      <h3>🎫 Colección real</h3>
      <p>Cada número entra en tu colección tal y como aparece en el ticket, de 1 a varios dígitos. Sin rellenos ni recortes.</p>
    </td>
    <td width="50%" valign="top">
      <h3>📍 Contexto de cada pedido</h3>
      <p>McPoints reconoce de dónde salió el pedido (kiosco, caja, app, McAuto, delivery) y cómo se entregó, y lo guarda junto al número.</p>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>🔁 El mismo número, por vías distintas</h3>
      <p>Conseguir el <code>2323</code> en un kiosco y volver a conseguirlo en el McAuto no son dos números repetidos: es un número con dos orígenes por completar.</p>
    </td>
    <td width="50%" valign="top">
      <h3>📷 Escáner de tickets</h3>
      <p>Encuadra el ticket completo con la cámara. McPoints lee el número y busca en el resto del texto las pistas de origen y entrega.</p>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>🔍 Búsqueda y filtros</h3>
      <p>Localiza cualquier número al instante y filtra tu colección por origen, longitud o fecha.</p>
    </td>
    <td width="50%" valign="top">
      <h3>🕓 Historial</h3>
      <p>Cada avistamiento queda registrado con fecha, hora y método de detección.</p>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>🌐 Multi-idioma</h3>
      <p>Español, English y Português (Portugal), con sus propios nombres y unidades de fecha/hora.</p>
    </td>
    <td width="50%" valign="top">
      <h3>🌗 Modo claro y oscuro</h3>
      <p>Tema claro como principal y un oscuro a juego. La información nunca se codifica solo con el color.</p>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top" colspan="2">
      <h3>💾 100% local</h3>
      <p>Guardado automático en el dispositivo, con exportación e importación de tu colección. Sin cuentas, sin servidores.</p>
    </td>
  </tr>
</table>

## Lo que McPoints no hace

McDonald's no publica cómo genera los números de pedido. Hay una hipótesis razonable — que
`2323` sea el terminal 23 con el pedido 23 — pero **no está confirmada**, así que la app
**no la aplica**: guarda y muestra el número exactamente como está impreso. Si no puede
determinar el origen de un pedido, dice "desconocido" en lugar de adivinar.

Toda la investigación, con su nivel de confianza y sus fuentes, está en
[`Docs/research/domain-findings.md`](Docs/research/domain-findings.md), y el criterio que
haría falta para activar esa interpretación está fijado por adelantado en
[`Docs/research/hypothesis-validation.md`](Docs/research/hypothesis-validation.md).

## Instalación (APK)

1. **Descarga** [`McPoints-2.0.0.apk`](https://github.com/GabriLPDA22/McPoints/releases/download/v2.0.0/McPoints-2.0.0.apk) desde el enlace de arriba.
2. **Habilita "Instalar apps desconocidas"** (u "Orígenes desconocidos") para tu navegador o gestor de archivos, en Ajustes → Seguridad de tu Android.
3. **Abre el APK descargado** y sigue las instrucciones en pantalla.
4. Listo — abre McPoints y empieza tu colección.

> [!WARNING]
> **La app no está firmada con un certificado oficial de distribución**, así que Android puede
> avisarte de un posible riesgo al instalarla. El código es público en este repositorio y puedes
> revisarlo o compilarlo tú mismo (ver más abajo). Aun así, **instalar APKs fuera de Google Play
> se hace bajo tu propia responsabilidad**. Si tienes dudas, analiza el archivo con
> [VirusTotal](https://www.virustotal.com/) o [Koodous](https://koodous.com/) antes de instalar.
>
> McPoints no está disponible en Google Play ni en ninguna tienda oficial. Esta es su única vía
> de distribución.

## Requisitos

- Android 5.1 (Lollipop) o superior.
- ~50 MB de espacio libre.
- Cámara, solo si quieres usar el escáner (el número también se puede introducir a mano).
- No requiere cuenta, registro ni conexión a internet.

## Desarrollo local

McPoints es una PWA construida con **React + Vite**, empaquetada como app Android con
**Capacitor**.

```bash
git clone https://github.com/GabriLPDA22/McPoints.git
cd McPoints
npm install
npm run dev          # http://localhost:3000, con hot reload
```

Otros comandos útiles:

```bash
npm run build        # build de producción (carpeta build/)
npm run test         # tests unitarios (Vitest)
npm run test:watch   # tests en modo watch
```

## Compilar y ejecutar en Android Studio

1. Instala [Android Studio](https://developer.android.com/studio) (incluye el SDK de Android y
   un JDK compatible).
2. Instala las dependencias del proyecto y sincroniza Capacitor con Android:

   ```bash
   npm install
   npm run cap:sync     # build web + npx cap sync android
   ```

3. Abre el proyecto Android en Android Studio:

   ```bash
   npx cap open android
   ```

   (o abre directamente la carpeta `android/` desde Android Studio: *File → Open*).

4. Espera a que Gradle sincronice, conecta un dispositivo o arranca un emulador, y pulsa **Run ▶**.

Para generar tú mismo un APK desde la línea de comandos, sin abrir Android Studio:

```bash
cd android
./gradlew assembleDebug      # genera android/app/build/outputs/apk/debug/app-debug.apk
```

> El proyecto no incluye un keystore de release (no está en el repositorio por seguridad). Un
> `assembleRelease` sin keystore propio genera un APK sin firmar; el APK que se distribuye en los
> [releases](https://github.com/GabriLPDA22/McPoints/releases) de este repositorio se firma con
> el keystore de debug estándar de Android, el mismo motivo del aviso de seguridad de más arriba.

## Documentación del proyecto

- [`Docs/design/`](Docs/design) — sistema de diseño, taxonomía de orígenes/entregas/pagos y flujos de UX.
- [`Docs/research/`](Docs/research) — investigación sobre el formato de los números de pedido.

## Avisos importantes

- McPoints **no está afiliada oficialmente con McDonald's Corporation** ni con ninguna de sus
  subsidiarias. Es un proyecto independiente, creado por y para coleccionistas.
- La app **no recopila, almacena ni transmite datos personales**. Toda tu colección se guarda
  únicamente en tu dispositivo.
- Distribución **exclusivamente independiente** (APK de este repositorio). No se distribuye por
  ninguna tienda de aplicaciones oficial.
- Desarrollada con fines de **uso personal y para compartir entre amigos** coleccionistas.

## Licencia

Este proyecto está licenciado bajo la **Licencia MIT** — ver [`LICENSE.md`](LICENSE.md) para más detalles.

---

<div align="center">

*McPoints — hecho por coleccionistas, para coleccionistas.*

</div>
