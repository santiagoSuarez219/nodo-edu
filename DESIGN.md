# Sistema de Diseño

Decisiones de diseño para la plataforma educativa. Stack visual: **Flowbite + Tailwind CSS 4**.

---

## Tipografía

**JetBrains Mono** para todo el proyecto — texto, UI y código, sin excepciones.

```css
/* globals.css */
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap');

@theme {
  --font-sans: 'JetBrains Mono', 'ui-monospace', monospace;
  --font-body: 'JetBrains Mono', 'ui-monospace', monospace;
  --font-mono: 'JetBrains Mono', 'ui-monospace', monospace;
}
```

---

## Paleta Primitiva

| Escala | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 |
|--------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| **gray** | `#F9FAFB` | `#F3F4F6` | `#E5E7EB` | `#D1D5DB` | `#9CA3AF` | `#6B7280` | `#4B5563` | `#374151` | `#1F2937` | `#111827` |
| **blue** | `#EBF5FF` | `#E1EFFE` | `#C3DDFD` | `#A4CAFE` | `#76A9FA` | `#3F83F8` | `#1C64F2` | `#1A56DB` | `#1E429F` | `#233876` |
| **green** | `#F3FAF7` | `#DEF7EC` | `#BCF0DA` | `#84E1BC` | `#31C48D` | `#0E9F6E` | `#057A55` | `#046C4E` | `#03543F` | `#014737` |
| **red** | `#FDF2F2` | `#FDE8E8` | `#FBD5D5` | `#F8B4B4` | `#F98080` | `#F05252` | `#E02424` | `#C81E1E` | `#9B1C1C` | `#771D1D` |
| **yellow** | `#FDFDEA` | `#FDF6B2` | `#FCE96A` | `#FACA15` | `#E3A008` | `#C27803` | `#9F580A` | `#8E4B10` | `#723B13` | `#633112` |
| **purple** | `#F6F5FF` | `#EDEBFE` | `#DCD7FE` | `#CABFFD` | `#AC94FA` | `#9061F9` | `#7E3AF2` | `#6C2BD9` | `#5521B5` | `#4A1D96` |
| **pink** | `#FDF2F8` | `#FCE8F3` | `#FAD1E8` | `#F8B4D9` | `#F17EB8` | `#E74694` | `#D61F69` | `#BF125D` | `#99154B` | `#751A3D` |

> Nunca usar los valores crudos de la paleta directamente — usar siempre los tokens semánticos de abajo.

---

## Tokens Semánticos

```css
@theme {
  /* Texto */
  --color-body:              var(--color-gray-600);
  --color-body-subtle:       var(--color-gray-500);
  --color-heading:           var(--color-gray-900);
  --color-fg-brand:          var(--color-blue-700);
  --color-fg-brand-subtle:   var(--color-blue-200);
  --color-fg-brand-strong:   var(--color-blue-900);
  --color-fg-success:        var(--color-green-700);
  --color-fg-danger:         var(--color-red-700);
  --color-fg-warning:        var(--color-orange-600);
  --color-fg-disabled:       var(--color-gray-400);

  /* Fondos — jerarquía de superficies */
  --color-neutral-primary:        white;
  --color-neutral-secondary:      var(--color-gray-50);
  --color-neutral-tertiary:       var(--color-gray-100);
  --color-neutral-quaternary:     var(--color-gray-200);

  /* Brand */
  --color-brand-softer:    var(--color-blue-50);
  --color-brand-soft:      var(--color-blue-100);
  --color-brand:           var(--color-blue-700);
  --color-brand-medium:    var(--color-blue-200);
  --color-brand-strong:    var(--color-blue-800);

  /* Estados */
  --color-success:         var(--color-green-700);  /* emerald en Flowbite */
  --color-danger:          var(--color-red-700);    /* rose en Flowbite */
  --color-warning:         var(--color-yellow-500);

  /* Bordes */
  --color-border-light:    var(--color-gray-100);
  --color-border-default:  var(--color-gray-200);
  --color-border-brand:    var(--color-blue-200);
  --color-border-dark:     var(--color-gray-800);

  /* Border radius */
  --radius-xs:   4px;
  --radius-sm:   6px;
  --radius:      8px;
  --radius-base: 12px;
  --radius-lg:   16px;
}
```

---

## Modo Claro / Oscuro

| Elemento | Modo Claro | Modo Oscuro |
|----------|-----------|-------------|
| Fondo página | `bg-white` | `dark:bg-gray-900` |
| Fondo card / panel | `bg-white` | `dark:bg-gray-800` |
| Fondo sidebar | `bg-gray-50` | `dark:bg-gray-800` |
| Fondo input | `bg-white` | `dark:bg-gray-700` |
| Fondo hover nav | `hover:bg-gray-100` | `dark:hover:bg-gray-700` |
| Fondo deshabilitado | `bg-gray-100` | `dark:bg-gray-700` |
| Texto principal | `text-gray-900` | `dark:text-white` |
| Texto secundario | `text-gray-600` | `dark:text-gray-300` |
| Texto sutil | `text-gray-500` | `dark:text-gray-400` |
| Texto deshabilitado | `text-gray-400` | `dark:text-gray-500` |
| Texto placeholder | `placeholder:text-gray-500` | `dark:placeholder:text-gray-400` |
| Borde estándar | `border-gray-200` | `dark:border-gray-700` |
| Borde input | `border-gray-300` | `dark:border-gray-600` |
| Focus ring | `focus:ring-gray-200` | `dark:focus:ring-gray-700` |
| Botón primario | `bg-blue-700 text-white` | `dark:bg-blue-600` |
| Botón primario hover | `hover:bg-blue-800` | `dark:hover:bg-blue-700` |
| Badge éxito | `bg-green-100 text-green-800` | `dark:bg-green-900 dark:text-green-300` |
| Badge peligro | `bg-red-100 text-red-800` | `dark:bg-red-900 dark:text-red-300` |
| Badge advertencia | `bg-yellow-100 text-yellow-800` | `dark:bg-yellow-900 dark:text-yellow-300` |
| Badge info | `bg-blue-100 text-blue-800` | `dark:bg-blue-900 dark:text-blue-300` |

### Implementación

No hay toggle manual: el tema sigue siempre la preferencia del sistema operativo
(`prefers-color-scheme`), sin persistencia en `localStorage`.

```javascript
// Pegar en el <head> antes del bundle para evitar FOUC
var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
document.documentElement.classList.toggle('dark', prefersDark);
```

Además, un componente cliente (`components/ThemeInit.tsx`) escucha el evento
`change` de `matchMedia('(prefers-color-scheme: dark)')` para actualizar el
tema en vivo si el usuario cambia la preferencia del sistema sin recargar la página.

```css
/* globals.css — Tailwind v4 */
@custom-variant dark (&:where(.dark, .dark *));
```

---

## Componentes UI

- **Flowbite** — componente de primera elección.
- **shadcn/ui** — complemento cuando Flowbite no cubra el caso.
