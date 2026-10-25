# Portfolio Álvaro Mora

#https://mooranzvfx.github.io/portfolio/

Sitio estático (HTML + CSS + JS). Sin build, sin npm.

## Estructura
```
index.html
css/style.css
js/main.js
videos.json
img/alvaro.jpg   ← tu foto de "Sobre mí" (opcional)
```

## 1. Configurar
Abre `js/main.js` y edita el bloque `CONFIG` del principio:
`CLOUD_NAME`, `TAG`, `NAME`, `CATEGORIES`, `CONTACT` y `ABOUT_PHOTO`.
Mientras `CLOUD_NAME` empiece por `TU_`, verás fotos de demostración.
Velocidades y duraciones están en `MOTION`; los colores, en `:root` de `css/style.css`.

## 2. Activar el listado público por etiqueta en Cloudinary
1. Entra en Cloudinary → **Settings → Security**.
2. En **Restricted media types**, desmarca **Resource list** (permite `/image/list/`).
3. Etiqueta tus fotos con `portfolio` (o la etiqueta que pongas en `TAG`).
4. Comprueba que abre: `https://res.cloudinary.com/TU_CLOUD/image/list/portfolio.json`

Las fotos nuevas aparecen solas al etiquetarlas. Para títulos y descripciones, usa `CAPTIONS` en `main.js`.

## 3. Vídeos de YouTube
Edita `videos.json`: acepta cualquier formato de enlace (watch, youtu.be, embed, shorts).
Cada entrada puede ser un texto o un objeto con `url`, `position` (1 = primero), `title` y `desc`.

## 4. Publicar en GitHub Pages
1. Crea un repositorio y sube todos los archivos a la raíz.
2. **Settings → Pages → Build and deployment**: Source = *Deploy from a branch*, rama `main`, carpeta `/ (root)`.
3. En 1-2 minutos estará en `https://TU_USUARIO.github.io/NOMBRE_REPO/`.

## Notas
- Respeta `prefers-reduced-motion`; en móvil se desactivan cursor, tilt y parallax de ratón.
- Los vídeos usan `youtube-nocookie.com`; el iframe se elimina al cerrar el visor.
