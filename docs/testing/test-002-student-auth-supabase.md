# test-002 — Autenticación de usuarios con Supabase

## Casos de prueba

---

### TC-001 — Registro con email y contraseña
**Precondición:** El correo no está registrado en Supabase.
**Pasos:**
1. Ir a `/registro`.
2. Completar nombre, correo, contraseña y confirmación de contraseña.
3. Hacer clic en "Crear cuenta".
**Resultado esperado:** Redirige a `/registro/confirmar`. El navbar no muestra aún sesión activa.
**Estado:** ✅ Aprobado

---

### TC-002 — Confirmación de email
**Precondición:** TC-001 completado. El correo de confirmación fue recibido.
**Pasos:**
1. Abrir el correo de confirmación enviado por Supabase.
2. Hacer clic en el enlace de confirmación.
**Resultado esperado:** El enlace redirige al sitio (vía `/auth/callback`). La sesión queda activa y el navbar muestra el `UserMenu` con las iniciales del usuario.
**Estado:** ✅ Aprobado

---

### TC-003 — Login con credenciales válidas
**Precondición:** Cuenta confirmada existente.
**Pasos:**
1. Ir a `/login`.
2. Ingresar correo y contraseña correctos.
3. Hacer clic en "Iniciar sesión".
**Resultado esperado:** Redirige a `/`. El navbar muestra el `UserMenu` con las iniciales del nombre.
**Estado:** ⬜ Pendiente

---

### TC-004 — Login con credenciales incorrectas
**Precondición:** Cuenta confirmada existente.
**Pasos:**
1. Ir a `/login`.
2. Ingresar correo correcto y contraseña incorrecta.
3. Hacer clic en "Iniciar sesión".
**Resultado esperado:** No redirige. Se muestra el mensaje "Correo o contraseña incorrectos." en rojo.
**Estado:** ⬜ Pendiente

---

### TC-005 — Cierre de sesión
**Precondición:** Sesión activa.
**Pasos:**
1. Hacer clic en el `UserMenu` (iniciales en navbar).
2. Hacer clic en "Cerrar sesión".
**Resultado esperado:** Redirige a `/`. El navbar muestra el botón "Iniciar sesión".
**Estado:** ⬜ Pendiente

---

### TC-006 — Protección de ruta `/cuenta` sin sesión
**Precondición:** Sin sesión activa (o sesión cerrada).
**Pasos:**
1. Navegar directamente a `/cuenta` en el browser.
**Resultado esperado:** Redirige a `/login?redirectTo=%2Fcuenta`.
**Estado:** ⬜ Pendiente

---

### TC-007 — Redirección post-login a `/cuenta`
**Precondición:** TC-006 ejecutado (estar en `/login?redirectTo=%2Fcuenta`).
**Pasos:**
1. Ingresar credenciales correctas.
2. Hacer clic en "Iniciar sesión".
**Resultado esperado:** Redirige a `/cuenta` (no a `/`).
**Estado:** ⬜ Pendiente

---

### TC-008 — Rutas públicas accesibles sin sesión
**Precondición:** Sin sesión activa.
**Pasos:**
1. Navegar a `/`.
2. Navegar a `/estructuras-de-datos`.
3. Navegar a `/estructuras-de-datos/git-github` (o cualquier lección existente).
**Resultado esperado:** Todas retornan 200. El contenido es visible sin login.
**Estado:** ⬜ Pendiente

---

### TC-009 — Visualización de perfil en `/cuenta`
**Precondición:** Sesión activa.
**Pasos:**
1. Ir a `/cuenta`.
**Resultado esperado:** Se muestra el correo y la fecha de registro en `AccountInfoCard`. El formulario tiene el nombre precargado.
**Estado:** ⬜ Pendiente

---

### TC-010 — Edición de perfil
**Precondición:** Sesión activa, en `/cuenta`.
**Pasos:**
1. Cambiar el nombre en el campo "Nombre completo".
2. Ingresar carrera y semestre.
3. Hacer clic en "Guardar cambios".
**Resultado esperado:** Mensaje verde "Perfil actualizado correctamente." El `UserMenu` en el navbar refleja el nuevo nombre (tras recargar la página).
**Estado:** ⬜ Pendiente

---

### TC-011 — Recuperación de contraseña
**Precondición:** Cuenta confirmada existente.
**Pasos:**
1. Ir a `/recuperar-password`.
2. Ingresar el correo registrado.
3. Hacer clic en "Enviar enlace de recuperación".
4. Abrir el correo recibido y hacer clic en el enlace.
5. Ingresar una nueva contraseña y confirmarla.
6. Hacer clic en "Cambiar contraseña".
**Resultado esperado:** Redirige a `/login`. El usuario puede iniciar sesión con la nueva contraseña.
**Estado:** ⬜ Pendiente

---

### TC-012 — Recuperación de contraseña con correo no registrado
**Precondición:** Ninguna.
**Pasos:**
1. Ir a `/recuperar-password`.
2. Ingresar un correo que no existe en el sistema.
3. Hacer clic en "Enviar enlace de recuperación".
**Resultado esperado:** Se muestra el mismo mensaje de éxito genérico. No se revela si el correo existe.
**Estado:** ⬜ Pendiente

---

### TC-013 — UserMenu — navegación por teclado
**Precondición:** Sesión activa.
**Pasos:**
1. Con teclado (Tab), enfocar el botón del `UserMenu` en el navbar.
2. Presionar Enter para abrir el dropdown.
3. Verificar que el foco se mueve a "Mi cuenta".
4. Presionar Escape.
**Resultado esperado:** El dropdown se abre, el primer ítem recibe foco. Al presionar Escape, el dropdown se cierra y el foco vuelve al botón del menú.
**Estado:** ⬜ Pendiente

---

### TC-014 — Reenvío de email de confirmación
**Precondición:** Registro completado (TC-001) pero correo no confirmado.
**Pasos:**
1. Ir a `/registro/confirmar`.
2. Ingresar el correo usado en el registro.
3. Hacer clic en "Reenviar correo de confirmación".
**Resultado esperado:** Se muestra "Correo reenviado. Revisa tu bandeja de entrada." Se recibe un nuevo email de confirmación.
**Estado:** ⬜ Pendiente

---

### TC-015 — Modo oscuro en páginas de auth
**Precondición:** Modo oscuro activo en el browser/sistema.
**Pasos:**
1. Visitar `/login`, `/registro`, `/recuperar-password` y `/cuenta`.
**Resultado esperado:** Todos los fondos, textos, bordes e inputs respetan el tema oscuro definido en `DESIGN.md`. No hay elementos con colores crudos de paleta.
**Estado:** ⬜ Pendiente
