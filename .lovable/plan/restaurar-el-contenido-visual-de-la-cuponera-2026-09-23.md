# Restaurar el contenido visual de la cuponera

## Objetivo
Volver a mostrar en la portada los banners, logos y tarjetas de cupones que ya existen.

## Cambios
1. Habilitar la lectura pública de marcas, categorías, cupones y banners, manteniendo la edición limitada a administradores.
2. Extender un año la vigencia de los 15 cupones de ejemplo vencidos para que superen el filtro de fecha actual.
3. Comprobar en escritorio que aparecen los tres banners activos, las tarjetas y sus imágenes disponibles.
4. Revisar la portada y el detalle de un cupón para confirmar que no queden imágenes rotas ni errores visibles.

## Hallazgos confirmados
- La base contiene 9 categorías, 10 marcas, 15 cupones y 3 banners activos.
- Los permisos de lectura pública no están concedidos en esas tablas, aunque sí existen reglas de acceso.
- Los 15 cupones vencieron entre mayo y agosto de 2026; la fecha actual del sistema es septiembre de 2026.
- Los banners tienen imágenes de referencia, pero la mayoría de las marcas todavía no tiene logo cargado.

## Alcance
Esta corrección recuperará el contenido existente. No inventará logos nuevos para las marcas que aún no tienen uno.
