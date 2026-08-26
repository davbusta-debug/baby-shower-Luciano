# Informe de revisión final

Fecha de auditoría: 26 de agosto de 2026.

## Resultado

La versión incluida en esta carpeta superó cinco recorridos completos. En cada recorrido se enviaron los tres formularios: confirmación de asistencia, reserva de regalo y deseo para El Cielo de Lucianito.

## Registros de prueba

| Prueba | Asistencia | Adultos | Niños | Niñas | Regalo reservado | Reserva publicada | Deseo publicado |
| --- | --- | ---: | ---: | ---: | --- | --- | --- |
| Prueba automatizada 3 | Sí | 2 | 0 | 0 | Detergente para bebé | 26/08/2026 00:06:39 | 26/08/2026 00:06:44 |
| Prueba automatizada 4 | No | 1 | 0 | 0 | Crema contra rozaduras | 26/08/2026 00:07:46 | 26/08/2026 00:07:51 |
| Prueba automatizada 5 | Sí | 2 | 1 | 0 | Tutos de muselina | 26/08/2026 00:08:13 | 26/08/2026 00:08:19 |
| Prueba automatizada 6 | Sí | 1 | 0 | 1 | Pack de dos mantas | 26/08/2026 00:09:22 | 26/08/2026 00:09:28 |
| Prueba automatizada 7 | No | 1 | 0 | 0 | Aceite de masajes | 26/08/2026 00:10:58 | 26/08/2026 00:11:05 |

Las respuestas de asistencia se enviaron correctamente al formulario privado. Como esa hoja requiere iniciar sesión, la familia debe confirmar visualmente allí los cinco nombres antes de borrar las pruebas.

## Comprobaciones realizadas

- 35 recursos gráficos realmente utilizados comprobaron respuesta HTTP 200 en GitHub Pages.
- 39 archivos raster locales fueron abiertos y validados; no se detectaron imágenes dañadas.
- La página generó 42 imágenes en cada recorrido.
- Ninguna imagen visible carece de texto alternativo.
- No existen identificadores HTML duplicados.
- No existen rutas locales faltantes.
- La portada, las seis ilustraciones editoriales, las fotografías de regalos y las tres experiencias se revisaron.
- Se probaron respuestas afirmativas y negativas de asistencia.
- Se probaron cantidades diferentes de adultos, niños y niñas.
- Se probaron observaciones normales, alergias y necesidades especiales.
- La confirmación permanece en el capítulo II y no desplaza al usuario al cielo.
- Los cinco regalos cambiaron inmediatamente a estado reservado.
- La reserva permanece después de recargar mientras Google publica la hoja.
- Los cinco deseos aparecieron inmediatamente como estrellas.
- Cada estrella respondió al clic y mostró nombre, deseo y fecha.
- El agradecimiento reemplazó correctamente cualquier estado de carga.
- Los cinco deseos y las cinco reservas aparecieron en las hojas públicas.
- Se verificó el botón de experiencias y su derivación a los datos bancarios.
- Se añadió un tiempo máximo de espera a la lectura de Google Sheets.
- Se añadió sustitución automática si una imagen de producto no puede cargarse.
- El contenido ahora es visible por defecto aunque falle la animación de aparición.

## Limpieza posterior

Después de revisar este informe, busca y elimina de las tres hojas todas las filas cuyos nombres sean `Prueba automatizada 3`, `Prueba automatizada 4`, `Prueba automatizada 5`, `Prueba automatizada 6` y `Prueba automatizada 7`.

No elimines las filas reales de invitados ni las reservas reales.
