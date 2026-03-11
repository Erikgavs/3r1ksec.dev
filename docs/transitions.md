# Documentación de Transiciones — 3r1ksec.dev

## Índice

1. [Animación de entrada de cards (projects.css)](#animación-de-entrada-de-cards-projectscss)

---

## Animación de entrada de cards (projects.css)

### Concepto

Al abrir `projects.html`, las cards aparecen con un efecto de **fade-in + deslizamiento hacia arriba**, escalonadas para que las de la fila superior aparezcan primero.

### CSS

#### Estado inicial y animación

```css
.card {
    opacity: 0;
    transform: translateY(25px);
    animation: cardReveal 0.6s ease forwards;
}

@keyframes cardReveal {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
```

- `opacity: 0` + `translateY(25px)` → la card empieza invisible y 25px más abajo
- `animation: cardReveal 0.6s ease forwards` → en 0.6s sube a su posición y aparece
- `forwards` → mantiene el estado final (`opacity: 1`) después de terminar

#### Delays escalonados

```css
main:first-of-type .card:nth-child(1) { animation-delay: 0.15s; }
main:first-of-type .card:nth-child(2) { animation-delay: 0.3s; }
main:nth-of-type(2) .card:nth-child(1) { animation-delay: 0.45s; }
main:nth-of-type(2) .card:nth-child(2) { animation-delay: 0.6s; }
```

| Card       | Fila | Delay  |
|------------|------|--------|
| eJPTv2     | 1    | 0.15s  |
| SkillHub   | 1    | 0.3s   |
| Scraber    | 2    | 0.45s  |
| Notepad    | 2    | 0.6s   |

Las cards de la fila de arriba (`main:first-of-type`) aparecen antes que las de abajo (`main:nth-of-type(2)`). Dentro de cada fila, la de la izquierda aparece antes que la de la derecha.

### Línea de tiempo visual

```
0.00s   ── página carga ──────────────────────────
0.15s   ┌─ eJPTv2 ─────┐  empieza fade-in + subida
0.30s   ┌─ SkillHub ────┐  empieza fade-in + subida
0.45s   ┌─ Scraber ─────┐  empieza fade-in + subida
0.60s   ┌─ Notepad ─────┐  empieza fade-in + subida
0.75s   └─ eJPTv2 ──────┘  animación completa
0.90s   └─ SkillHub ────┘  animación completa
1.05s   └─ Scraber ─────┘  animación completa
1.20s   └─ Notepad ─────┘  animación completa
```

Duración total: ~1.2 segundos hasta que todas las cards son visibles.
