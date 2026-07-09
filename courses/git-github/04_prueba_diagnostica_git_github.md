---
title: "Prueba Diagnóstica — Manejo de Repositorios con Git y GitHub"
course: "Tecnología"
course_code: "TEC"
level: "Semestres intermedios/avanzados"
type: "Prueba diagnóstica"
language: "Bash / Git"
difficulty: "Intermedio — Avanzado"
estimated_time: "90 minutos"
total_points: 100
date: "2026-07-02"
author: "Asistente de Docencia"
---

# Prueba Diagnóstica
## Manejo de Repositorios con Git y GitHub

---

| | |
|---|---|
| **Nombre completo** | _______________________________________________ |
| **Código estudiantil** | _______________________________________________ |
| **Grupo / Semestre** | _______________________________________________ |
| **Fecha** | _______________________________________________ |

---

> **Instrucciones generales**
>
> - Esta es una prueba de diagnóstico. Su propósito es identificar tu nivel de manejo actual con Git y GitHub, **no asignarte una calificación definitiva**.
> - Responde con honestidad. Si no sabes una respuesta, déjala en blanco: es información útil para el docente.
> - Dispones de **90 minutos**.
> - Puedes usar la terminal si el docente lo autoriza.
> - No se permite consultar apuntes, documentación ni internet durante la prueba, a menos que el docente lo indique.

---

| Sección | Tema evaluado | Puntos |
|---------|--------------|--------|
| A | Selección múltiple — Conceptos y comportamiento de Git | 20 |
| B | Verdadero o Falso con justificación | 15 |
| C | Completar el comando | 20 |
| D | Análisis de salidas de Git | 25 |
| E | Caso integrador | 20 |
| | **Total** | **100** |

---

## Sección A — Selección múltiple

> **Instrucción:** Encierra en un círculo la letra de la única respuesta correcta. Cada pregunta vale **2 puntos**.

---

**A1.** ¿Cuál de los siguientes comandos elimina el último commit del historial local, pero conserva todos sus cambios en el **área de staging**?

a) `git reset --hard HEAD~1`  
b) `git reset --soft HEAD~1`  
c) `git revert HEAD`  
d) `git rm --cached .`  

---

**A2.** En un flujo de trabajo con forks, ¿cuál es la función del remoto llamado convencionalmente **`upstream`**?

a) Es un alias de `origin` creado automáticamente al hacer fork  
b) Apunta al repositorio original del que se hizo el fork  
c) Es la rama principal del repositorio forkeado  
d) Es el servidor intermediario donde GitHub aloja los Pull Requests  

---

**A3.** ¿Cuál es la diferencia fundamental entre `git merge` y `git rebase`?

a) Solo `merge` puede manejar conflictos; `rebase` los ignora automáticamente  
b) `rebase` crea un commit de fusión explícito; `merge` no  
c) `merge` preserva el historial completo con todos sus divergentes; `rebase` reescribe el historial como si los cambios siempre hubieran ocurrido sobre otra base  
d) `rebase` únicamente funciona con ramas locales  

---

**A4.** ¿Cuál es la diferencia entre `git stash pop` y `git stash apply`?

a) `pop` aplica el stash más reciente y **lo elimina** de la lista; `apply` lo aplica y **lo conserva** en la lista  
b) `pop` aplica todos los stashes disponibles; `apply` solo aplica el primero  
c) `pop` descarta los cambios del stash sin aplicarlos al directorio de trabajo  
d) No hay diferencia funcional; son sinónimos con distinta sintaxis  

---

**A5.** Un compañero ejecutó `git reset --hard HEAD~3` sobre una rama compartida y perdió 3 commits de trabajo. ¿Qué herramienta de Git permite recuperar las referencias a esos commits?

a) `git log --all`  
b) `git fsck --lost-found`  
c) `git reflog`  
d) `git log --orphan`  

---

**A6.** ¿Cuál de las siguientes afirmaciones sobre `git cherry-pick <hash>` es correcta?

a) Fusiona la rama completa de donde proviene el commit indicado  
b) Copia el commit especificado y lo aplica en la rama actual asignándole un **nuevo hash**  
c) Mueve (no copia) el commit a la rama actual, eliminándolo de su rama de origen  
d) Solo puede aplicarse a commits cuya rama de origen ha sido fusionada con master  

---

**A7.** En GitHub, cuando se fusiona un Pull Request con la estrategia **"Squash and merge"**, ¿qué ocurre con el historial de commits de la rama?

a) Los commits se reorganizan cronológicamente en `master` sin modificación  
b) Todos los commits de la rama se comprimen en **un único commit** que se agrega a `master`  
c) Los commits se replican idénticos en `master` manteniendo sus hashes originales  
d) Solo el commit más reciente de la rama se agrega a `master`; los anteriores se descartan  

---

**A8.** ¿Qué efecto tiene agregar un archivo al `.gitignore` si ese archivo **ya está siendo rastreado** por Git?

a) Git deja de rastrearlo automáticamente a partir del siguiente commit  
b) El archivo aparece como ignorado en `git status` pero sigue en el historial  
c) `.gitignore` **no tiene ningún efecto** sobre archivos ya rastreados; primero deben retirarse del tracking con `git rm --cached`  
d) Git lo marca como "ignorado" pero sigue incluyéndolo en cada `git push`  

---

**A9.** Estás en la rama `master` y ejecutas `git fetch origin`. ¿Cuál es el resultado inmediato en tu directorio de trabajo?

a) Los archivos del directorio de trabajo se actualizan con los cambios del remoto  
b) Se descargan los cambios del remoto pero **no se aplican** al directorio de trabajo ni a la rama local  
c) Se hace un merge automático de `origin/master` con la rama local `master`  
d) Git muestra los cambios disponibles pero solicita confirmación antes de descargar  

---

**A10.** ¿Qué información devuelve `git shortlog -sn`?

a) El historial de ramas con número de commits por rama, en orden de creación  
b) El número de commits por autor, ordenados de mayor a menor  
c) Las estadísticas de líneas agregadas y eliminadas por autor  
d) Los commits de una rama que no han sido fusionados con ninguna otra  

---

## Sección B — Verdadero o Falso con justificación

> **Instrucción:** Indica si la afirmación es **Verdadera (V)** o **Falsa (F)** y justifica tu respuesta en máximo 3 líneas. La respuesta vale **1 punto** y la justificación vale **2 puntos**. Total por ítem: **3 puntos**.

---

**B1.** `git reset --hard` es siempre irreversible: una vez ejecutado, los commits eliminados no pueden recuperarse bajo ninguna circunstancia.

**V / F** ___

**Justificación:**

&nbsp;

&nbsp;

---

**B2.** Un *fork* es una funcionalidad nativa de Git que puede ejecutarse desde la línea de comandos con `git fork <url>`.

**V / F** ___

**Justificación:**

&nbsp;

&nbsp;

---

**B3.** `git pull origin master` es funcionalmente equivalente a ejecutar `git fetch origin` seguido de `git merge origin/master`.

**V / F** ___

**Justificación:**

&nbsp;

&nbsp;

---

**B4.** Los tags anotados creados localmente se publican automáticamente en el repositorio remoto cada vez que se ejecuta `git push origin master`.

**V / F** ___

**Justificación:**

&nbsp;

&nbsp;

---

**B5.** Si dos desarrolladores modifican archivos **distintos** en la misma rama y hacen push al mismo tiempo, Git garantiza que no habrá conflictos al fusionar sus cambios.

**V / F** ___

**Justificación:**

&nbsp;

&nbsp;

---

## Sección C — Completar el comando

> **Instrucción:** Escribe el comando de Git exacto que resuelve cada escenario. Incluye flags y argumentos necesarios. Cada ítem vale **2 puntos**.

---

**C1.** Crear una nueva rama llamada `feature/autenticacion` y cambiarte a ella en un **solo comando**.

```bash
$
```

---

**C2.** Subir la rama local `feature/autenticacion` al remoto por **primera vez** y establecer tracking automático hacia `origin`.

```bash
$
```

---

**C3.** Listar únicamente los commits que existen en la rama `develop` y **no están** en la rama `master`.

```bash
$
```

---

**C4.** Deshacer el último commit conservando todos sus cambios en el **área de staging** (no en el directorio de trabajo sin rastrear).

```bash
$
```

---

**C5.** Aplicar el **segundo stash** de la lista (`stash@{1}`) sin eliminarlo de la pila de stashes.

```bash
$
```

---

**C6.** Modificar únicamente el **mensaje** del commit más reciente, sin cambiar el contenido de los archivos, y sin abrir el editor interactivo.

```bash
$
```

---

**C7.** Ver qué autor modificó cada una de las líneas **10 a 30** del archivo `src/Main.java`, junto con el hash de commit correspondiente.

```bash
$
```

---

**C8.** Eliminar la rama remota `feature/login-viejo` del servidor `origin` sin eliminar la rama local.

```bash
$
```

---

**C9.** Crear un tag anotado llamado `v2.1.0` con el mensaje `"Release estable de autenticación"` apuntando al commit con hash `a3f7c21`.

```bash
$
```

---

**C10.** Mostrar el log completo en formato gráfico de una sola línea, incluyendo todas las ramas locales y remotas con sus etiquetas decoradas.

```bash
$
```

---

## Sección D — Análisis de salidas de Git

> **Instrucción:** Lee con atención cada salida de Git y responde las preguntas que se plantean. Las respuestas deben ser precisas y justificadas.

---

### D1. Análisis de historial — `git log` *(6 puntos)*

Se ejecutó el siguiente comando en un repositorio:

```bash
$ git log --all --graph --decorate --oneline
```

Y se obtuvo esta salida:

```
* 9e1a4d2 (HEAD -> feature/pagos, origin/feature/pagos) Agregar validación de tarjeta
* 6f8c0b1 Implementar módulo de pagos
* 3a2d7e5 Conectar pasarela de pagos
| * c4b8f3a (origin/master, master) Hotfix: corregir error en autenticación OAuth
| * 7e0d2c9 Actualizar dependencias de seguridad
|/
* b1f4a80 Agregar módulo de usuarios
* 0a3c2f1 Commit inicial
```

a) *(1 pt)* ¿En qué rama se encuentra actualmente el repositorio local y está sincronizada con el remoto? Explica cómo lo identificas en la salida.

&nbsp;

&nbsp;

b) *(1 pt)* ¿Cuántos commits tiene la rama `feature/pagos` que **no están** en `master`?

&nbsp;

c) *(2 pts)* El desarrollador necesita incorporar los commits `c4b8f3a` y `7e0d2c9` de `master` en su rama `feature/pagos`. Escribe la secuencia de comandos que ejecutaría para hacerlo de forma **no destructiva** (sin reescribir el historial).

```bash
$
$
$
```

d) *(2 pts)* Otro desarrollador propone usar `git rebase master` en lugar de `git merge master` para la tarea del punto c). ¿Cuál sería la diferencia en el historial resultante? ¿Cuándo sería apropiado usar rebase y cuándo no?

&nbsp;

&nbsp;

&nbsp;

---

### D2. Análisis de estado — `git status` *(7 puntos)*

Un desarrollador ejecutó `git status` y obtuvo lo siguiente:

```
On branch develop
Your branch is ahead of 'origin/develop' by 3 commits.
  (use "git push" to publish your local commits)

Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
        modified:   src/controllers/UserController.java
        new file:   src/models/TokenModel.java

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
        modified:   src/services/AuthService.java

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        config/.env
        logs/error.log
        target/
```

a) *(1 pt)* ¿Cuántos archivos tienen cambios que **sí irían** en el próximo `git commit` tal como está el repositorio ahora?

&nbsp;

b) *(1 pt)* Escribe el comando para agregar **únicamente** `AuthService.java` al staging.

```bash
$
```

c) *(2 pts)* El desarrollador nota que `config/.env` contiene claves de API y contraseñas. ¿Por qué aparece como *untracked* en lugar de *ignored*? ¿Qué dos acciones debe tomar para que nunca llegue al repositorio remoto?

&nbsp;

&nbsp;

&nbsp;

d) *(1 pt)* ¿Qué representa `target/` en el contexto de un proyecto Java? ¿Debería estar en el repositorio? ¿Cómo lo excluirías?

&nbsp;

&nbsp;

e) *(2 pts)* El desarrollador quiere hacer push, pero el mensaje dice que está "3 commits ahead of origin/develop". Un compañero de equipo también hizo push a `origin/develop` mientras tanto. Describe paso a paso qué debe hacer antes de ejecutar `git push` para no perder el trabajo de ninguno.

&nbsp;

&nbsp;

&nbsp;

---

### D3. Diagnóstico de error — mensaje de rechazo *(6 puntos)*

Al ejecutar `git push origin master`, el desarrollador recibió este mensaje:

```
To https://github.com/empresa/sistema-ventas.git
 ! [rejected]        master -> master (non-fast-forward)
error: failed to push some refs to 'https://github.com/empresa/sistema-ventas.git'
hint: Updates were rejected because the tip of your current branch is behind
hint: its remote counterpart. Integrate the remote changes (e.g.
hint: 'git pull ...') before pushing again.
hint: See the 'Note about fast-forwards' in 'git push --help' for details.
```

a) *(1 pt)* ¿Por qué fue rechazado el push? Explica con tus propias palabras qué significa *non-fast-forward* en este contexto.

&nbsp;

&nbsp;

b) *(2 pts)* Escribe la secuencia mínima de comandos para resolver la situación y lograr hacer el push exitosamente.

```bash
$
$
$
```

c) *(2 pts)* Existe un flag que permite **forzar** el push ignorando este rechazo: `git push --force`. ¿Cuándo sería aceptable usarlo y cuándo sería peligroso? Da un ejemplo concreto de cada caso.

&nbsp;

&nbsp;

&nbsp;

d) *(1 pt)* ¿Cuál es la diferencia entre `git push --force` y `git push --force-with-lease`? ¿Cuál de los dos es más seguro y por qué?

&nbsp;

&nbsp;

---

### D4. Resolución de conflicto *(6 puntos)*

Al hacer merge de la rama `feature/seguridad` hacia `develop`, Git no pudo fusionar automáticamente el archivo `src/services/AuthService.java`. Al abrirlo, el desarrollador encontró:

```java
<<<<<<< HEAD (Current Change)
public String authenticate(String email, String password) {
    return authService.login(email, md5Hash(password));
}
=======
public String authenticate(String email, String password) {
    if (email == null || password == null) {
        throw new IllegalArgumentException("Las credenciales no pueden ser nulas");
    }
    return authService.login(email, sha256Hash(password));
}
>>>>>>> feature/seguridad (Incoming Change)
```

a) *(1 pt)* ¿Qué representa la sección marcada con `HEAD`? ¿Y la marcada con `feature/seguridad`?

&nbsp;

&nbsp;

b) *(2 pts)* ¿Cuáles son las diferencias técnicas entre las dos versiones del método? Identifica al menos dos.

&nbsp;

&nbsp;

c) *(1 pt)* Desde el punto de vista de **seguridad y buenas prácticas**, ¿cuál versión recomendarías conservar y por qué?

&nbsp;

&nbsp;

d) *(2 pts)* Escribe el contenido final del método tal como debería quedar después de resolver el conflicto (**sin marcadores** `<<<<<<<`, `=======`, `>>>>>>>`), y luego escribe los comandos de Git para finalizar el merge.

```java
// Versión final resuelta:



```

```bash
# Comandos para finalizar:
$
$
```

---

## Sección E — Caso integrador

> **Instrucción:** Lee el escenario con atención y responde las preguntas de forma ordenada y justificada. Esta sección vale **20 puntos** en total.

---

### Escenario

Eres el **líder técnico** de un equipo de tres desarrolladores que trabajan en el repositorio `origin/master` de un sistema de inventarios. El estado actual del repositorio es el siguiente:

```
* f3a9c12 (HEAD -> master, origin/master) Agregar módulo de reportes
* 2b7d4e8 Implementar búsqueda de productos
* 1c0f6a3 Configurar base de datos
* 9a2e1b0 Commit inicial
```

Se presentan los siguientes eventos **simultáneamente**:

- **Desarrollador A** ha estado trabajando en la rama `feature/exportar-excel` durante 4 días con 6 commits. Aún no ha hecho push.
- **Desarrollador B** acaba de subir directamente a `master` el commit `e5d1a7f` que introduce un **error crítico** que rompe el módulo de reportes en producción.
- **Desarrollador C** está a punto de hacer push de su rama `feature/notificaciones` y acaba de hacer `git pull origin master` con los cambios del Desarrollador B sin darse cuenta del error.

---

**E1.** *(4 pts)* Como líder técnico, lo primero es revertir el daño en `master`. Describe dos estrategias distintas para deshacer el commit problemático (`e5d1a7f`) en el repositorio remoto. Indica cuándo usarías cada una y sus consecuencias sobre el historial compartido.

**Estrategia 1:**

&nbsp;

&nbsp;

**Estrategia 2:**

&nbsp;

&nbsp;

---

**E2.** *(4 pts)* El Desarrollador A necesita actualizar su rama `feature/exportar-excel` con los cambios corregidos de `master` sin perder sus 6 commits de trabajo. Escribe la secuencia exacta de comandos que le indicarías ejecutar.

```bash
$
$
$
$
$
```

Justifica por qué elegiste este enfoque (merge vs. rebase) en este contexto específico:

&nbsp;

&nbsp;

---

**E3.** *(4 pts)* El Desarrollador C ya tiene en su rama `feature/notificaciones` el commit erróneo de B (porque hizo `git pull` antes de que se detectara el problema). ¿Cómo debería proceder para limpiar su rama sin perder su propio trabajo?

```bash
$
$
$
```

&nbsp;

&nbsp;

---

**E4.** *(4 pts)* Una vez estabilizado el repositorio, decides implementar una **política de protección de ramas** en GitHub para que esto no vuelva a ocurrir. Describe al menos **tres reglas** que configurarías en la rama `master` desde la interfaz de GitHub (Settings → Branches → Branch protection rules) y el propósito de cada una.

| Regla | Propósito |
|---|---|
| | |
| | |
| | |

---

**E5.** *(4 pts)* Al final del sprint, el equipo necesita publicar la versión `v1.3.0` del sistema. Escribe la secuencia completa de comandos para:

a) Crear un tag anotado `v1.3.0` apuntando al commit limpio más reciente de `master`.  
b) Publicarlo en el repositorio remoto.  
c) Verificar que el tag aparece en el remoto.

```bash
$
$
$
```

Adicionalmente, ¿en qué se diferencia un tag **anotado** de un tag **ligero** en Git?

&nbsp;

&nbsp;

---

## Para uso del docente — Tabla de calificación

| Sección | Puntaje máximo | Puntaje obtenido |
|---------|---------------|------------------|
| A — Selección múltiple | 20 | |
| B — Verdadero o Falso | 15 | |
| C — Completar el comando | 20 | |
| D1 — Análisis de historial | 6 | |
| D2 — Análisis de estado | 7 | |
| D3 — Diagnóstico de error | 6 | |
| D4 — Resolución de conflicto | 6 | |
| E — Caso integrador | 20 | |
| **Total** | **100** | |

---

## Para uso del docente — Guía de interpretación diagnóstica

> Esta tabla permite identificar no solo el puntaje total, sino las **áreas específicas de debilidad** del estudiante según las secciones donde falle.

| Puntaje total | Diagnóstico general |
|---|---|
| 90 – 100 | **Dominio avanzado.** El estudiante puede incorporarse directamente a flujos de trabajo profesionales con Git y GitHub. |
| 75 – 89 | **Manejo sólido.** Comprende bien los conceptos fundamentales y comandos frecuentes. Puede tener vacíos en flujos avanzados (rebase, reflog, cherry-pick). |
| 60 – 74 | **Conocimiento funcional básico.** Maneja el flujo add → commit → push pero tiene dificultades con ramas, resolución de conflictos y colaboración en GitHub. |
| 40 – 59 | **Conocimiento parcial.** Solo domina comandos aislados. Necesita refuerzo en el modelo conceptual de Git y en el flujo de trabajo colaborativo. |
| 0 – 39 | **Requiere refuerzo significativo.** Se recomienda iniciar con fundamentos desde cero antes de avanzar al contenido del curso. |

### Mapa de competencias por sección

| Sección | Competencia evaluada | Si falla aquí... |
|---------|---------------------|------------------|
| A (selección múltiple) | Comprensión conceptual de comandos y su comportamiento | Reforzar teoría: estados de Git, diferencias entre comandos similares |
| B (V/F con justificación) | Profundidad conceptual y capacidad de argumentar | Revisar confusiones frecuentes: reset vs revert, fetch vs pull, tags |
| C (completar comandos) | Precisión en la sintaxis de la línea de comandos | Practicar comandos con ejercicios cortos y repetitivos |
| D1 (historial) | Lectura e interpretación del grafo de commits | Reforzar el modelo de ramificación y el flujo de merge/rebase |
| D2 (git status) | Diagnóstico del estado del repositorio en escenarios reales | Reforzar los 3 estados de Git y el staging area |
| D3 (error push) | Manejo de errores de sincronización con el remoto | Reforzar flujo colaborativo: pull antes de push, fast-forward |
| D4 (conflicto) | Resolución de conflictos de merge | Práctica de resolución manual de conflictos en editor |
| E (caso integrador) | Toma de decisiones técnicas en flujos de trabajo reales | Practicar con proyectos colaborativos completos en GitHub |

---

> 📝 **Nota:** El solucionario completo de esta prueba está disponible bajo solicitud al docente responsable. No distribuir a estudiantes.
