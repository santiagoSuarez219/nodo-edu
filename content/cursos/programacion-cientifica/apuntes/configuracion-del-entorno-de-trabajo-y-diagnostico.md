> Hacer esta demostración con una **cuenta de GitHub de prueba del docente**
> (no la personal), para poder mostrar el flujo completo — incluida la
> generación de un PAT en pantalla — sin exponer credenciales propias.

## Paso 1 — Tour de Colab: celdas de código y de texto

En `colab.research.google.com`, crear un notebook nuevo (`Archivo → Notebook
nuevo`) y mostrar:

- Botón `+ Código` → nueva celda → escribir y ejecutar con `Shift + Enter`:

```python
nombre = "Ana"
print(f"Hola, {nombre}. Bienvenida al curso.")
```

- Botón `+ Texto` → nueva celda → escribir en Markdown:

```text
## Ejercicio 1: suma de dos números
Este ejercicio calcula la suma de dos valores ingresados por el usuario.
```

Punto a resaltar: la celda de texto **no ejecuta nada**, solo se formatea; la
de código sí corre y muestra su salida justo debajo.

## Paso 2 — Crear el repositorio del curso en GitHub

En `github.com`, con sesión iniciada:

1. `+` (esquina superior derecha) → **New repository**.
2. Nombre: `curso-programacion-cientifica`. Visibilidad: **Public** (así el
   docente puede ver el trabajo sin que el estudiante deba invitarlo como
   colaborador).
3. Marcar **Add a README file** al crear el repositorio.
4. Ya creado, usar el botón **Add file → Create new file** para crear
   `ejercicios/README.md` (basta con escribir `ejercicios/README.md` como
   nombre de archivo; GitHub crea la carpeta automáticamente).

Árbol resultante:

```text
curso-programacion-cientifica/
├── ejercicios/
│   └── README.md
└── README.md
```

## Paso 3 — Generar el Personal Access Token (PAT)

En GitHub: avatar (esquina superior derecha) → **Settings** → **Developer
settings** (al final del menú lateral) → **Personal access tokens** →
**Fine-grained tokens** → **Generate new token**.

Configurar en pantalla, explicando cada campo:

| Campo | Valor a usar en la demo |
|---|---|
| Token name | `colab-curso-programacion-cientifica` |
| Expiration | 90 días (o la duración del semestre, si el proveedor lo permite) |
| Repository access | **Only select repositories** → elegir `curso-programacion-cientifica` |
| Permissions | **Contents: Read and write** (es el único permiso que Colab necesita para leer y subir notebooks) |

Clic en **Generate token** → GitHub muestra el token **una sola vez**
(`ghp_xxxxxxxxxxxxxxxxxxxx`). Copiarlo de inmediato: si se pierde la pantalla
sin copiarlo, hay que generar uno nuevo.

> ⚠️ Punto de énfasis para el grupo: este token reemplaza a la contraseña.
> Nadie debe pegarlo en una celda del notebook ni compartirlo por chat.

## Paso 4 — Guardar el token como Colab Secret

De vuelta en Colab:

1. Ícono de llave 🔑 en la barra lateral izquierda → **Secrets**.
2. **+ Add new secret**.
3. Nombre: `GITHUB_TOKEN` (exacto, en mayúsculas — el estudiante lo va a
   necesitar tal cual más adelante en el curso).
4. Valor: pegar el PAT copiado en el Paso 3.
5. Activar el interruptor **Notebook access** para que el notebook actual
   pueda usarlo.

## Paso 5 — Flujo A: subir el notebook a GitHub (push)

En el notebook con la celda de código y la celda de texto del Paso 1:

1. `Archivo → Guardar una copia en GitHub`.
2. Colab pide autorizar el acceso a GitHub la primera vez — aceptar.
3. Seleccionar el repositorio `curso-programacion-cientifica`.
4. Ruta del archivo: `ejercicios/sesion-01-demo.ipynb`.
5. Mensaje describiendo el cambio: `Primer notebook de la sesión 1`.
6. Confirmar.

Verificación en pantalla: recargar la página del repositorio en GitHub y
mostrar que `ejercicios/sesion-01-demo.ipynb` ya aparece listado.

## Paso 6 — Traer los cambios más recientes (pull)

1. Cerrar la pestaña del notebook (o abrir uno nuevo en blanco).
2. `Archivo → Abrir notebook` → pestaña **GitHub**.
3. Buscar `curso-programacion-cientifica` en el campo de repositorio.
4. Seleccionar `ejercicios/sesion-01-demo.ipynb` de la lista.

Verificación en pantalla: el notebook que se abre debe mostrar exactamente el
contenido subido en el Paso 5 — misma celda de código, mismo resultado, misma
celda de texto.

> Al cerrar la sesión, **revocar el PAT de demostración** desde `Settings →
> Developer settings → Personal access tokens` — es una buena práctica de
> higiene de credenciales y refuerza en el grupo que un token se puede
> invalidar en cualquier momento sin tocar la contraseña.

## Errores frecuentes y cómo intervenir

| Síntoma observable | Causa probable | Intervención sugerida |
|---|---|---|
| Al hacer clic en "Guardar una copia en GitHub", Colab no muestra el repositorio en la lista | El repositorio se creó como privado y el PAT no tiene permisos suficientes, o el estudiante nunca autorizó el acceso de Colab a GitHub | Revisar visibilidad del repo y repetir la autorización desde `Archivo → Guardar una copia en GitHub` |
| El secret no funciona / Colab pide autenticarse de nuevo cada vez | El interruptor **Notebook access** del secret quedó apagado | Volver al panel de llave 🔑 y activarlo para el notebook actual |
| El PAT "no sirve" al momento de subir | Se generó con **Repository access: Public repositories** en vez de seleccionar el repo específico, o el permiso de **Contents** quedó en solo lectura | Regenerar el token con **Only select repositories** → el repo del curso, y **Contents: Read and write** |
| El estudiante subió el notebook pero a la carpeta equivocada (o a la raíz) | No completó el campo de ruta (`ejercicios/...`) en el diálogo de "Guardar una copia en GitHub" | Repetir el paso especificando la ruta completa; mover el archivo desde la interfaz de GitHub si ya quedó mal ubicado |
| Al reabrir con `Archivo → Abrir notebook → GitHub`, ve una versión vieja o vacía | Buscó en el repositorio equivocado, o seleccionó un notebook distinto al que acaba de subir | Confirmar en GitHub cuál es el nombre exacto del archivo subido y repetir la búsqueda con ese nombre |
| El navegador bloquea la ventana emergente de autorización de GitHub | Bloqueador de pop-ups activo | Permitir pop-ups para `colab.research.google.com` y reintentar |
| El PAT copiado tiene espacios o quedó incompleto | Copió el token antes de que GitHub terminara de mostrarlo, o el portapapeles capturó texto adicional | Generar un token nuevo — el anterior no se puede recuperar, solo revocar |
