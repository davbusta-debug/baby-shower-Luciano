# Baby Shower de Luciano

Esta es la **versión final** de la invitación. Es una página estática, pensada como cuento ilustrado y lista para publicar en GitHub Pages. No requiere instalar programas, usar un servidor ni contratar un backend. La versión anterior permanece en la carpeta principal del proyecto.

Esta versión no reproduce música y mantiene oculto el álbum familiar hasta después del nacimiento de Luciano.

## Abrir la invitación

Abre `index.html` con doble clic. Para una prueba más parecida a la publicación final, abre la carpeta con un editor como Visual Studio Code y usa una extensión de servidor local, aunque no es obligatorio.

## Publicar en GitHub Pages

1. Crea una cuenta en [GitHub](https://github.com) si aún no tienes una.
2. Crea un repositorio nuevo, por ejemplo `baby-shower-luciano`.
3. Sube todos los archivos y carpetas de este proyecto, sin cambiar la estructura.
4. En el repositorio, abre **Settings** y luego **Pages**.
5. En **Build and deployment**, selecciona **Deploy from a branch**.
6. Elige la rama `main` y la carpeta `/(root)`.
7. Guarda. GitHub mostrará, en unos minutos, el enlace público de la invitación.

No borres `index.html`, `css/`, `js/` ni `assets/`: son necesarios para que todo se vea correctamente.

## Dónde cambiar cada cosa

| Quiero cambiar… | Archivo | Qué editar |
| --- | --- | --- |
| Textos, secciones y estructura | `index.html` | El texto visible entre etiquetas HTML |
| Colores, tamaños, espaciado y animaciones | `css/style.css` | Las variables que comienzan con `--` al principio del archivo |
| Fecha de nacimiento, regalos, experiencias y configuración | `js/data.js` | Los datos agrupados al inicio del archivo |
| Comportamientos: contador, formularios, regalos y estrellas | `js/app.js` | Solo si se desea cambiar el funcionamiento |
| Ilustraciones editoriales | `assets/editorial/` | Sustituir el archivo manteniendo el mismo nombre o actualizar su ruta |

Haz una copia de seguridad antes de editar. Si algo sale mal, vuelve a abrir la copia original.

## Cambiar la fecha del contador

Abre `js/data.js` y busca `birthDate`. Mantén el formato `AAAA-MM-DD`. Por ejemplo:

```js
birthDate: '2026-11-11'
```

El capítulo I calcula automáticamente los días restantes. Al llegar a la fecha, mostrará que Luciano ya está aquí.

## Cambiar colores

En `css/style.css`, al comienzo están los colores principales. Cada color tiene un nombre sencillo: noche, crema, dorado, rojo y tinta. Cambia solo el valor que sigue a los dos puntos. Por ejemplo, un valor como `#0b1b38` representa un azul oscuro.

## Cambiar ilustraciones

Las ilustraciones incluidas son originales y están hechas como archivos livianos para que la página cargue rápido. Para reemplazar una:

1. Guarda el nuevo archivo dentro de la carpeta correspondiente de `assets/`.
2. Intenta usar imágenes comprimidas y de tamaño razonable: WebP, JPG o SVG.
3. En `index.html`, cambia la ruta `src` por la ruta del nuevo archivo.
4. Actualiza también el texto `alt` para describir la nueva imagen a personas que usan lectores de pantalla.

La identidad está pensada para conservar al viajero de cabello café claro, el zorro, la rosa y el planeta como protagonistas.

## Actualizar la lista de regalos

La lista actual fue preparada a partir de `Regalos baby shower (1).xlsx` y vive en `js/data.js`, dentro de `GIFTS`.

Cada regalo tiene este formato:

```js
{ id:'ejemplo', name:'Nombre del regalo', price:12990, link:'https://...', category:'care', image:'assets/gifts/generic-care.svg' }
```

- `name`: nombre visible.
- `price`: valor sin puntos ni símbolo de peso.
- `link`: dirección del producto. Déjalo vacío si no hay enlace.
- `category`: `essential`, `care`, `clothing` o `feeding`.
- `image`: fotografía propia o ilustración de referencia.

No hace falta ordenar manualmente: la página deja primero los regalos ya aportados y luego ordena los disponibles desde el de mayor valor al más pequeño. Si no tienes foto, usa una de las imágenes genéricas dentro de `assets/gifts/`. Las tarjetas se generan solas; no copies ni pegues HTML de tarjetas.

## Cambiar experiencias

En `js/data.js`, busca `EXPERIENCES`. Puedes modificar título, precio, frase e icono. La experiencia de fútbol ya está dedicada a Alexis Sánchez. Procura que los textos sean breves y respeten el tono cariñoso y juguetón del libro.

## Datos bancarios

Los datos actuales están en `bank`, dentro de `js/data.js`: Vanessa Sanchez, Cuenta RUT de Banco Estado. Para modificarlos, cambia únicamente los valores entre comillas. La página traduce automáticamente los nombres técnicos a etiquetas sencillas como “Titular”, “Banco” y “Número de cuenta”.

## Álbum familiar y música

Ambas funciones fueron retiradas de esta versión por decisión de la familia. Cuando Luciano nazca, se puede crear una nueva portada o preportada y volver a incorporar un álbum sin alterar esta invitación final. Para una carga rápida, conviene usar fotografías JPG o WebP de menos de 1 MB.

## Conectar Google Forms

La maqueta funciona localmente para pruebas incluso sin conexión externa. Para recibir confirmaciones reales:

1. Crea un Google Form de asistencia con los campos: Nombre, Asistiré, Adultos, Niños, Niñas y Observaciones.
2. Crea otro Google Form con: Nombre y Deseo para Luciano.
3. Vincula cada formulario a su Google Sheet desde la pestaña **Respuestas**.
4. Copia las direcciones de envío y los identificadores `entry.xxxxx` de cada campo.
5. Pégalos en `SITE.forms` dentro de `js/data.js`.

La configuración se deja vacía a propósito: solo la familia puede crear los formularios y decidir dónde se almacenan datos personales. Mientras esté vacía, las pruebas se guardan únicamente en el navegador de cada visitante.

## Conectar El Cielo de Lucianito a Google Sheets

Para que las estrellas se compartan entre todos:

1. Usa el formulario de deseos conectado a una hoja de cálculo.
2. Publica la pestaña de respuestas como CSV desde **Archivo → Compartir → Publicar en la web**.
3. Copia el enlace CSV en `sheetCsv` dentro de `SITE.forms` en `js/data.js`.
4. Conserva columnas para nombre, mensaje y fecha.

Al eliminar una fila de esa hoja, el mensaje dejará de aparecer la próxima vez que se recargue la página. No se necesita Firebase ni base de datos propia.

## Accesibilidad y rendimiento

La página incluye navegación por teclado, enlace para saltar al contenido, alternativas de texto en imágenes, contraste cuidado y respeto por `prefers-reduced-motion`. Las imágenes de regalos usan carga diferida y los dibujos se mantienen ligeros para favorecer una carga rápida.

Antes de publicar cambios grandes, abre la página en un teléfono y en un computador, confirma que los botones sean fáciles de tocar y revisa que todos los enlaces lleven al lugar correcto.
