# Imágenes por Categoría

Esta carpeta contiene las imágenes que se asignan automáticamente a los items según su categoría principal.

## Imágenes disponibles:
- `tecnologia.jpg` - Para categorías de tecnología, electrónicos, smartphones, computadores
- `musica.jpg` - Para categorías de música, instrumentos
- `deportes.jpg` - Para categorías de deportes, fitness
- `hogar.jpg` - Para categorías de hogar, casa, muebles
- `ropa.jpg` - Para categorías de ropa, vestimenta, moda
- `libros.jpg` - Para categorías de libros, literatura, educación
- `autos.jpg` - Para categorías de automóviles, vehículos
- `default.jpg` - Imagen por defecto cuando no hay categoría

## Cómo agregar nuevas categorías:
1. Agrega la imagen correspondiente a esta carpeta
2. Actualiza el mapeo en `src/hooks/useItems.ts` en la función `getCategoryImage`

## Formato recomendado:
- Tamaño: 300x200 píxeles
- Formato: JPG o PNG
- Calidad: Optimizada para web
