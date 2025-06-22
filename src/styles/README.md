# Sistema de Diseño Unificado - Web Subastas

## 🎨 Introducción

Este documento describe el sistema de diseño unificado implementado para la aplicación Web Subastas. El sistema está diseñado para mantener consistencia visual y funcional en toda la aplicación, con un enfoque en el centrado y la responsividad.

## 📁 Estructura de Archivos CSS

```
src/styles/
├── unified.css      # Sistema principal con variables y componentes base
├── layout.css       # Componentes de layout centrados
└── components/      # Componentes específicos (futuro)
```

## 🎯 Variables CSS Globales

### Colores

```css
/* Colores principales */
--primary-500: #1976d2    /* Azul principal */
--primary-50: #e3f2fd     /* Azul claro */

/* Colores semánticos */
--success-500: #2e7d32    /* Verde éxito */
--warning-500: #ed6c02    /* Naranja advertencia */
--error-500: #d32f2f      /* Rojo error */
--info-500: #0288d1       /* Azul información */

/* Colores neutros */
--grey-50 a --grey-900    /* Escala de grises */
```

### Espaciado

```css
--spacing-xs: 0.25rem     /* 4px */
--spacing-sm: 0.5rem      /* 8px */
--spacing-md: 1rem        /* 16px */
--spacing-lg: 1.5rem      /* 24px */
--spacing-xl: 2rem        /* 32px */
--spacing-2xl: 3rem       /* 48px */
--spacing-3xl: 4rem       /* 64px */
```

### Layout

```css
--max-width-sm: 24rem     /* 384px */
--max-width-md: 32rem     /* 512px */
--max-width-lg: 48rem     /* 768px */
--max-width-xl: 64rem     /* 1024px */
--max-width-2xl: 72rem    /* 1152px */
--max-width-3xl: 80rem    /* 1280px */
```

## 🏗️ Componentes de Layout

### Containers Centrados

```css
.app-container         /* Layout principal de la app */
/* Layout principal de la app */
.page-container        /* Container para páginas */
.content-container     /* Container para contenido */
.centered-content; /* Contenido completamente centrado */
```

### Secciones

```css
.section-centered      /* Sección estándar centrada */
/* Sección estándar centrada */
.section-narrow        /* Sección estrecha */
.section-wide; /* Sección amplia */
```

### Grids

```css
.items-grid           /* Grid responsive para productos */
/* Grid responsive para productos */
.items-grid-large     /* Grid con elementos más grandes */
.items-grid-small; /* Grid con elementos más pequeños */
```

## 🎨 Componentes Base

### Tarjetas

```css
.card                 /* Tarjeta base */
/* Tarjeta base */
.card-centered        /* Tarjeta centrada */
.card-hero            /* Tarjeta destacada */
.card-header          /* Header de tarjeta */
.card-content         /* Contenido de tarjeta */
.card-footer; /* Footer de tarjeta */
```

### Botones

```css
.btn                  /* Botón base */
/* Botón base */
.btn-primary          /* Botón principal */
.btn-secondary        /* Botón secundario */
.btn-success          /* Botón de éxito */
.btn-warning          /* Botón de advertencia */
.btn-error            /* Botón de error */
.btn-sm / .btn-lg; /* Tamaños de botón */
```

### Formularios

```css
.form-container       /* Container de formulario */
/* Container de formulario */
.form-group           /* Grupo de formulario */
.form-label           /* Etiqueta de formulario */
.form-input; /* Input de formulario */
```

## 🏷️ Sistema de Badges

```css
.badge                /* Badge base */
/* Badge base */
.badge-success        /* Badge de éxito */
.badge-warning        /* Badge de advertencia */
.badge-error          /* Badge de error */
.badge-info           /* Badge de información */
.badge-neutral; /* Badge neutral */
```

## 📱 Clases Utilitarias

### Flexbox

```css
.flex                 /* display: flex */
/* display: flex */
.flex-col            /* flex-direction: column */
.items-center        /* align-items: center */
.justify-center      /* justify-content: center */
.justify-between; /* justify-content: space-between */
```

### Espaciado

```css
.m-{size}            /* margin */
.mt-{size}           /* margin-top */
.mb-{size}           /* margin-bottom */
.p-{size}            /* padding */
/* Donde {size} puede ser: xs, sm, md, lg, xl */
```

### Texto

```css
.text-center         /* text-align: center */
/* text-align: center */
.text-xs a .text-2xl /* font-size variations */
.font-bold           /* font-weight: 700 */
.font-semibold; /* font-weight: 600 */
```

### Animaciones

```css
.animate-fade-in     /* Animación de aparición */
/* Animación de aparición */
.animate-slide-in    /* Animación de deslizamiento */
.animate-pulse       /* Animación de pulso */
.loading-shimmer; /* Efecto shimmer para carga */
```

## 🎯 Estados de Componentes

### Estados de Página

```css
.loading-state-centered    /* Estado de carga centrado */
/* Estado de carga centrado */
.empty-state-centered      /* Estado vacío centrado */
.error-state-centered; /* Estado de error centrado */
```

### Acciones

```css
.actions-centered          /* Acciones centradas */
/* Acciones centradas */
.actions-spaced; /* Acciones espaciadas */
```

## 📱 Responsive Design

### Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Clases Responsive

```css
.hide-mobile         /* Ocultar en móvil */
/* Ocultar en móvil */
.hide-desktop; /* Ocultar en desktop */
```

## 🎨 Navegación

### Navbar

```css
.app-navbar          /* Navbar principal */
/* Navbar principal */
.navbar-content      /* Contenido del navbar */
.navbar-brand        /* Marca/logo */
.navbar-menu         /* Menú de navegación */
.navbar-link         /* Enlaces del navbar */
.navbar-actions; /* Acciones del navbar */
```

### Breadcrumbs

```css
.breadcrumbs         /* Container de breadcrumbs */
/* Container de breadcrumbs */
.breadcrumb-link     /* Enlaces de breadcrumb */
.breadcrumb-separator; /* Separador */
```

## 🦶 Footer

```css
.app-footer          /* Footer principal */
/* Footer principal */
.footer-content      /* Contenido del footer */
.footer-links        /* Enlaces del footer */
.footer-link         /* Link individual */
.footer-text; /* Texto del footer */
```

## 🚀 Ejemplos de Uso

### Página Básica

```html
<div class="page-container">
  <div class="page-header-centered">
    <h1 class="page-title-main">Título</h1>
    <p class="page-subtitle-main">Subtítulo</p>
  </div>

  <div class="section-centered">
    <!-- Contenido -->
  </div>
</div>
```

### Grid de Productos

```html
<div class="items-grid">
  <div class="card">
    <div class="card-content">
      <!-- Contenido del producto -->
    </div>
  </div>
</div>
```

### Formulario Centrado

```html
<div class="form-container">
  <form class="card">
    <div class="card-content">
      <div class="form-group">
        <label class="form-label">Label</label>
        <input class="form-input" type="text" />
      </div>

      <div class="actions-centered">
        <button class="btn btn-primary">Enviar</button>
        <button class="btn btn-secondary">Cancelar</button>
      </div>
    </div>
  </form>
</div>
```

### Estado Vacío

```html
<div class="empty-state-centered">
  <div class="empty-state-icon">📦</div>
  <h3 class="empty-state-title">No hay elementos</h3>
  <p class="empty-state-description">Descripción del estado vacío</p>
  <button class="btn btn-primary">Acción</button>
</div>
```

## ♿ Accesibilidad

- Todos los componentes incluyen estados de focus visibles
- Colores con contraste adecuado (WCAG AA)
- Soporte para `prefers-reduced-motion`
- Clases `.sr-only` para lectores de pantalla
- Navegación por teclado habilitada

## 🎨 Modo Oscuro (Preparado)

El sistema incluye variables preparadas para modo oscuro que se activan automáticamente con `prefers-color-scheme: dark`.

## 🔧 Personalización

### Agregar Nuevos Colores

```css
:root {
  --custom-color-500: #your-color;
  --custom-color-50: #your-light-color;
}
```

### Crear Nuevos Componentes

```css
.new-component {
  /* Usar variables existentes */
  background: var(--grey-50);
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  /* ... */
}
```

## 📝 Mejores Prácticas

1. **Usa siempre las variables CSS** en lugar de valores hardcodeados
2. **Mantén la consistencia** usando las clases predefinidas
3. **Prioriza los componentes centrados** para mejor UX
4. **Testea en dispositivos móviles** regularmente
5. **Usa animaciones sutiles** para mejorar la experiencia
6. **Mantén la accesibilidad** como prioridad

## 🔄 Actualizaciones

El sistema es modular y fácil de actualizar. Las variables globales permiten cambios rápidos en toda la aplicación.

---

_Última actualización: Enero 2025_
