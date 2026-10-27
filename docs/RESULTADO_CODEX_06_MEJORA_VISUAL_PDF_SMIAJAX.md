# CODEX 06 — Estado visual de espera de PDF

Fecha: 26 de octubre de 2026, America/Panama. **Implementado y verificado localmente; pendiente de aceptación del usuario en el portal.** Sin commit, push, despliegue ni cambios productivos.

## Alcance y preservación del trabajo previo

Se inspeccionaron openAuthenticatedDocument, sus quince consumidores, el tema vigente y las pruebas. Al comenzar existían cambios locales de CODEX 05: CAndRWizardPage.js y tests/lastPayroll.test.cjs en web; ruta/middleware, prueba e informes de last-payroll en cloud. Se preservaron. Esta fase no vuelve a implementar ni corrige aquel trabajo.

No se modificaron backend, autenticación, rutas, nombres de archivo, Axios/interceptor, pantallas consumidoras, reglas financieras ni configuración de servidor. Los archivos theme tampoco se editaron. La única implementación funcional CODEX 06 está en el utilitario de PDF; el resto son ajustes de pruebas y este informe.

| Archivo de ia-system-web | Cambio de CODEX 06 |
|---|---|
| src/utils/documentDownload.js:3–68 | Importa paleta/tipografía vigentes y construye una espera visual con DOM seguro. |
| src/utils/documentDownload.js:71–94,114–126,166 | Traduce al español los errores controlados y sustituye el texto plano por showDocumentLoading. |
| tests/documentDownload.test.cjs | Amplía el DOM simulado, carga los módulos reales de tokens, actualiza expectativas de idioma y añade pruebas focalizadas de espera/seguridad/limpieza. |
| tests/lastPayroll.test.cjs:122 | Ajuste mínimo sobre el archivo previo de CODEX 05: su aserción de integridad ya no exige que el helper PDF sea idéntico a HEAD, porque esta fase lo modifica deliberadamente. Las demás aserciones de last-payroll se conservan. |
| docs/RESULTADO_CODEX_06_MEJORA_VISUAL_PDF_SMIAJAX.md | Este informe. |

La antigua aserción equivalente en documentDownload.test.cjs también conserva la integridad de todos los consumidores y deja de exigir helper idéntico. El helper mantiene cobertura funcional específica; no se eliminó la regresión de seguridad para aceptar la visual.

## Tema real reutilizado y presentación

Se revisaron src/theme/index.js, palette.js, typography.js, overrides/Card.js, overrides/Button.js y globalStyles.js, además de CircularProgress/Backdrop y LoadingButton en pantallas actuales. El tema configura una paleta clara, sin selector/modo oscuro activo; los colores primary.dark/darker son tonos de paleta, no un modo oscuro. La espera respeta el tema claro, sin inventar una adaptación oscura independiente.

| Fuente/patrón existente | Uso en la espera |
|---|---|
| palette.background.default = #F9FAFB | Fondo de la pestaña |
| palette.background.paper = #fff | Tarjeta central |
| palette.text.primary = #212B36 | Título y texto principal |
| palette.text.secondary = #637381 | Explicación |
| palette.primary.main = #2065D1 | Arco circular de espera |
| palette.grey[200] y palette.divider | Pista del círculo y borde ligero de tarjeta |
| typography.fontFamily | Public Sans, sans-serif, sin nuevas cargas de fuentes |
| typography.h6 y body2 | Tamaño base, peso y line-height del título; explicación de 14 px |
| Espaciado MUI predeterminado de 8 px | Separación de 8/24/32 px, como el padding de las tarjetas existentes |
| shape.borderRadius=6, duplicado por MuiCard | Radio de 12 px para la tarjeta |
| CircularProgress de las pantallas | Indicador circular de 40 px, indeterminado, sin números ni porcentajes |

La tarjeta centrada muestra únicamente **«Preparando documento»** y **«El PDF se abrirá aquí cuando esté listo»**, con el círculo encima. Ancho máximo 420 px, padding exterior de 24 px y ajuste a viewport móvil. No hay botones adicionales, logos nuevos ni iconos remotos; no se cargan recursos CDN ni se añaden dependencias.

La familia tipográfica procede del tema, pero about:blank no hereda las declaraciones @font-face del portal. Se permite la alternativa sans-serif disponible si Public Sans no existe localmente; no se dispara una petición externa para imponerla. Si se cambia en el futuro el modo/espaciado/radio del tema, revisar esta correspondencia visual; paleta y tipografía sí se importan directamente.

## Construcción segura y accesibilidad

Todos los elementos se crean con createElement, appendChild, replaceChildren y textContent; los estilos de tokens se asignan mediante propiedades DOM. El stylesheet contiene únicamente reglas controladas de layout/animación, sin input HTTP ni nombre de archivo. No se usan innerHTML, document.write, insertAdjacentHTML, importaciones CSS remotas o URLs de recursos.

El nombre de archivo conserva su asignación segura a document.title y al título del iframe, como antes; no se inserta en la tarjeta ni en CSS/HTML. La espera no muestra URLs, tokens, detalles internos o respuestas del servidor.

El documento indica lang=es y viewport móvil. El estado tiene role=status, aria-live=polite, aria-atomic y referencias al título/explicación. El círculo es decorativo para el lector de pantalla: no anuncia valores ficticios. Su animación discreta de rotación se detiene con prefers-reduced-motion: reduce, conservando el estado textual. Se comprobó contraste aproximado de 14,35:1 para el título y 4,88:1 para la explicación sobre blanco. Esto no es una auditoría completa de accesibilidad ni una prueba con lector de pantalla.

## Flujo autenticado y visor conservados

openAuthenticatedDocument(path, filename) conserva la firma y los mismos consumidores. La validación de URL/origen HTTPS/query ocurre antes de abrir. window.open continúa antes de cualquier await, seguido de opener=null, título y espera síncrona. No se añadieron peticiones ni esperas previas a la reserva de pestaña.

Se mantienen Axios singleton e interceptor Bearer, responseType blob, Accept PDF, timeout de 60 s y las comprobaciones status 200 / Blob / MIME application/pdf / firma %PDF-. Una respuesta JSON/HTML, incluso 2xx/201, no se abre como PDF. En error se cierra la pestaña y se usa react-toastify con mensajes controlados en español. Se conserva la identificación interna de Unauthenticated. sin mostrar texto arbitrario de servidor.

Ante PDF válido, el iframe existente reemplaza todo el contenido de la espera. Su estilo, File/nombre, ObjectURL y visor nativo no se rediseñaron. La CSS añadida solo aplica a clases de la espera; no cambia el PDF ni agrega controles de impresión/guardado.

La liberación del ObjectURL y su intervalo siguen intactos: pagehide o detección de pestaña cerrada, sin revocar al cargar el iframe ni con timeout arbitrario. También se conserva la limpieza si falla el montaje del visor después de crear la URL. La animación usa CSS, sin timers de progreso nuevos.

## Pruebas ejecutadas

```text
node --experimental-vm-modules --test --test-reporter=spec tests/documentDownload.test.cjs tests/lastPayroll.test.cjs
tests 62
pass 62
fail 0
skipped 0
```

Son 47 pruebas de descarga documental y las 15 existentes de last-payroll. Los escenarios pertinentes incluyen:

- Espera en español y asociación de tokens reales, status accesible, viewport/reduced-motion y ausencia de porcentajes/datos externos.
- Nombre de archivo con caracteres HTML tratado como texto, sin inserción HTML ni petición de recursos.
- Transición a iframe y ausencia de revocación prematura, cleanup idempotente, varias pestañas y cierre anticipado durante la petición.
- Popup bloqueado; URL malformada, HTTP, otro origen y query: no petición/recurso creado en los casos rechazados.
- 401/403/404/429/500/503; timeout/red; JSON/HTML con 2xx/201 y Blob con MIME/firma incompatibles.
- Fallo de DOM al crear el iframe tras crear un ObjectURL: URL revocada, pestaña cerrada, sin timer colgado ni detalle interno visible.
- Integridad de consumidores, controlador/modelo y seis rutas de descarga, más la regresión aislada previa de reportes y last-payroll.

En una primera ejecución, una aserción visual buscó el símbolo % también en estilos CSS y rechazó los valores legítimos 100%/50%. Se corrigió para buscar porcentajes ficticios solo en texto visible; no se cambió la implementación para satisfacerla. Las ejecuciones posteriores terminaron sin fallos.

### Comprobación en navegador con fixture sintética

Se usó Playwright sobre about:blank, con el código real del helper y tokens resueltos desde los archivos actuales. Axios y window.open se sustituyeron en el harness para controlar una promesa pendiente y mostrar el estado sin contactar la API. No fue una sesión real del portal ni una prueba HTTP de Sanctum/CORS.

| Comprobación | Resultado observado |
|---|---|
| Escritorio 1280×800 | Tarjeta centrada de 420 px; colores computados del tema; sin desbordamiento. Captura inspeccionada. |
| Móvil 360×640 | Tarjeta de 312 px, textos legibles y sin overflow horizontal. Captura inspeccionada. |
| Movimiento reducido | CSS computada animation-name: none; estado textual permanece. |
| Recursos de la espera | Cero entradas de recursos de red; sin CDN/fuentes remotas. |
| PDF válido sintético | PDF estructurado de una página generado en memoria; promesa resuelta con status/MIME correctos. Espera desaparece; iframe blob se muestra en visor PDF nativo de Chromium. Captura inspeccionada con contenido y controles nativos. |
| Consola | Cero mensajes de error o warning en el harness. |

Se cerró la pestaña de prueba al terminar. Las cuatro capturas/snapshot generadas automáticamente por Playwright en .playwright-mcp del cwd cloud se trasladaron a una carpeta temporal exclusiva de esta verificación, sin tocar archivos previos. No se incorporaron artefactos de esta prueba al backend ni se alteró su código. Impresión y guardado efectivos siguen pendientes de prueba manual; ver los controles del visor no equivale a imprimir/guardar.

### Build y avisos previos

```text
npm.cmd run build
exit code 0
Compiled with warnings.
```

Build local generado e ignorado por Git; no publicado. Se observaron las mismas 271 advertencias ESLint en 37 archivos y las mismas seis categorías del build CODEX 05: no-unused-vars, arrow-body-style, react-hooks/exhaustive-deps, react/prop-types, react/no-unused-prop-types y prefer-destructuring. Sin advertencias nuevas en documentDownload.js. Sigue el aviso previo caniuse-lite desactualizado de Browserslist. No se ejecutó su actualización ni se corrigió lint ajeno al alcance.

`git diff --check` pasó en ambos repositorios. Git puede advertir normalización LF/CRLF del helper/tests; no son errores de whitespace. No cambiaron dependencias, lockfiles, App.js ni archivos del tema. No se ejecutaron pruebas Laravel, porque esta fase no cambia backend y sigue sin PHP/vendor; no se atribuye PASS HTTP a las pruebas simuladas.

## Riesgos y verificación manual pendiente

1. En ensayo con fixtures, abrir las seis familias desde sus controles reales, con red lenta para observar la espera y posterior PDF. Confirmar popup real y que la apertura continúa ocurriendo dentro del gesto del usuario.
2. Probar impresión/guardado tardíos, varias pestañas, cierre antes/después de recibir bytes y navegación atrás/adelante. El comportamiento de visores, BFCache y nombres al guardar depende del navegador.
3. Probar los errores controlados y popup bloqueado en el portal; comprobar toast en español, cierre de espera y ausencia de errores de consola. No usar documentos sensibles ni tokens en URLs.
4. Comprobar móvil, zoom, preferencia de movimiento reducido y lector de pantalla. La espera sigue el tema claro existente aun si el sistema operativo prefiere oscuro; no se creó un modo nuevo.
5. Si el entorno tiene CSP más restrictiva que la usada en la prueba, verificar estilos inline/about:blank sin relajar políticas de seguridad. Cualquier necesidad de nonce u otra adaptación requiere revisión concreta; no se cambió CSP/Nginx.

La aceptación final del usuario en el portal queda pendiente. No se certifica el despliegue ni se reabren decisiones de autenticación o almacenamiento de CODEX 02–05.

## Estado final y reversión exclusiva de CODEX 06

Web conserva el trabajo anterior CAndRWizardPage.js/tests/lastPayroll.test.cjs. El delta nuevo es el helper, documentDownload.test.cjs, la exclusión comentada de helper idéntico en lastPayroll.test.cjs y este informe. En la última comprobación cloud estaba limpio y su HEAD había pasado a da88882 por una operación ajena a esta fase: se verificó que conserva la protección last-payroll de CODEX 05. Codex no creó ese commit ni modificó backend en CODEX 06.

```text
ia-system-web:
 M src/pages/CAndRWizardPage.js                 (trabajo previo CODEX 05)
 M src/utils/documentDownload.js                (CODEX 06)
 M tests/documentDownload.test.cjs              (CODEX 06)
?? docs/RESULTADO_CODEX_06_MEJORA_VISUAL_PDF_SMIAJAX.md
?? tests/lastPayroll.test.cjs                   (previo, con ajuste mínimo CODEX 06)

ia-system-cloud:
(limpio al finalizar)
```

Para revertir solo CODEX 06, respaldar diff y retirar los hunks de helper/documentDownload.test.cjs y el ajuste comentado de lastPayroll.test.cjs. Conservar íntegros el handler y pruebas de last-payroll de CODEX 05; no restaurar ni borrar ese archivo de pruebas completo, que ya existía sin seguimiento al iniciar esta fase. No tocar rutas/middleware backend ni informes previos. No se ejecutó rollback ni se crearon commits o despliegues.
