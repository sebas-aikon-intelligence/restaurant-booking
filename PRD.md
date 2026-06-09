# PRD — Software multi-restaurante de reservas

## 1) Resumen del producto
Plataforma SaaS para restaurantes que permite a cada negocio administrar sus reservas desde un panel privado, con acceso por usuario y contraseña, configuración personalizada de zonas, mesas, horarios, eventos, menú y comunicación con clientes.

Cada restaurante tendrá:
- Su propio acceso.
- Su propia configuración.
- Su propio subdominio o enlace de reservas.
- Sus propias imágenes, mesas, zonas y eventos.

El cliente final solo verá la experiencia de reservas.

---

# 2) Objetivo del producto
Construir una solución moderna, premium y escalable que permita:
- A los restaurantes administrar sus reservas sin fricción.
- A los clientes reservar de forma visual e intuitiva.
- Mostrar mesas, zonas y eventos de manera clara.
- Centralizar mensajes, reservas y configuración en un solo software.
- Vender el producto como SaaS multi-tenant.

---

# 3) Alcance funcional
## Incluye
- Login por restaurante.
- Gestión de zonas.
- Gestión de mesas.
- Mapa visual de mesas.
- Fotos por mesa.
- Gestión de horarios.
- Gestión de eventos.
- Gestión de menú.
- Gestión de clientes.
- Bandeja de mensajes de WhatsApp dentro del sistema.
- Página pública de reservas por restaurante.
- Landing comercial del software.
- Suscripción y acceso al sistema.

## No incluye
- Dashboard con métricas.
- Analítica avanzada.
- Reportería BI.
- Sitio web completo del restaurante.
- Panel financiero.

---

# 4) Arquitectura general del sistema
## Frontend
- Next.js
- Despliegue en Vercel
- Diseño responsive
- UI premium, moderna y minimalista

## Backend / datos
- Supabase como base principal para:
  - Autenticación
  - Base de datos
  - Storage de imágenes
  - Gestión de usuarios

## Notificaciones
- Resend para correos transaccionales
- Posibles alertas de confirmación, cambios y recordatorios

## Modelo multi-restaurante
- Un mismo sistema para muchos restaurantes
- Cada restaurante ve solo su propia información
- Separación lógica por tenant / restaurante
- Subdominio o enlace único por restaurante

---

# 5) Tipos de usuario
## 1. Administrador del restaurante
Puede configurar todo lo relacionado con su operación y reservas.

## 2. Staff / recepción
Puede gestionar reservas, mensajes y disponibilidad.

## 3. Cliente final
Hace reservas desde la página pública.

## 4. Superadmin interno
Administra restaurantes, planes, acceso y soporte.

---

# 6) Funcionalidades del panel interno

## A. Autenticación y acceso
### Funcionalidades
- Registro / creación de cuenta por restaurante.
- Inicio de sesión con correo y contraseña.
- Recuperación de contraseña.
- Sesión persistente.
- Roles de usuario.

### Reglas
- Cada restaurante solo accede a sus datos.
- Los usuarios solo ven lo que corresponde a su restaurante.

---

## B. Menú lateral del sistema
No habrá dashboard. El menú lateral solo tendrá:
- Mensajes
- Reservas
- Mesas y zonas
- Menú
- Eventos
- Clientes
- Configuración

Cada sección debe ser simple, clara y operativa.

---

## C. Mensajes
### Objetivo
Centralizar los mensajes que llegan desde WhatsApp dentro del software.

### Funcionalidades
- Bandeja de entrada de mensajes.
- Ver conversación por cliente.
- Responder o registrar seguimiento.
- Identificar conversación asociada a cliente o reserva.
- Estado del mensaje:
  - Nuevo
  - En proceso
  - Resuelto

### Consideración importante
Si WhatsApp no se integra directamente en esta primera fase, el sistema debe al menos permitir:
- Visualizar mensajes sincronizados.
- Adjuntar observaciones internas.
- Relacionar el mensaje con una reserva o cliente.

---

## D. Reservas
### Funcionalidades
- Ver lista de reservas.
- Filtrar por fecha, estado, zona, mesa o cliente.
- Crear reserva manualmente.
- Editar reserva.
- Cancelar reserva.
- Cambiar mesa o zona.
- Confirmar asistencia.
- Marcar no show.

### Estados de reserva
- Pendiente
- Confirmada
- Cancelada
- Completada
- No asistió

---

## E. Mesas y zonas
Esta es una de las partes más importantes.

### Funcionalidades de zonas
- Crear zonas como:
  - Interior
  - Terraza
  - Exterior
  - Jardín
  - VIP
  - Barra
- Editar nombre de la zona.
- Activar o desactivar zonas.
- Definir capacidad por zona.

### Funcionalidades de mesas
- Crear mesas manualmente.
- Definir número o nombre de la mesa.
- Asignar zona.
- Definir capacidad.
- Cargar foto de la mesa.
- Marcar estado de la mesa.
- Ordenarlas visualmente en el mapa.

### Mapa de mesas
- Vista gráfica del espacio.
- Cada mesa debe verse en su posición real o aproximada.
- El cliente debe identificar dónde se sentará.
- Las mesas deben poder mostrar foto o preview.

### Estados de mesa
- Disponible
- Reservada
- Ocupada
- Bloqueada
- Fuera de servicio

---

## F. Horarios
### Funcionalidades
- Definir horarios por día de la semana.
- Crear turnos por franja horaria.
- Bloquear fechas especiales.
- Configurar días cerrados.
- Definir duración de reserva.
- Limitar cupos por horario.

### Ejemplo
- Lunes a jueves: 12:00 p.m. a 10:00 p.m.
- Viernes y sábado: 12:00 p.m. a 11:30 p.m.
- Domingo: 12:00 p.m. a 8:00 p.m.

---

## G. Menú
### Funcionalidades
- Crear o editar categorías.
- Agregar platos o productos.
- Cargar nombre, descripción, precio y foto.
- Marcar productos destacados.
- Activar o desactivar productos.

### Uso dentro de reservas
- El cliente puede ver el menú antes de reservar.
- El restaurante puede mostrar productos clave para mejorar la experiencia.

---

## H. Eventos
### Funcionalidades
- Crear eventos especiales.
- Cargar imagen del evento.
- Cargar título, descripción y fecha.
- Mostrar eventos en carrusel dentro del flujo de reserva.
- Activar o desactivar eventos.
- Relacionar eventos con mesas o zonas especiales.

### Ejemplos de eventos
- Cena de San Valentín
- Partido importante
- Música en vivo
- Cumpleaños
- Fin de año
- Brunch especial

### UX del cliente
Cuando el cliente reserve, verá un carrusel de eventos destacados antes o durante el proceso de selección.

---

## I. Clientes
### Funcionalidades
- Lista de clientes que han reservado.
- Ver historial por cliente.
- Buscar por nombre, correo o teléfono.
- Ver reservas anteriores.
- Identificar clientes frecuentes.

### Información útil
- Nombre
- Correo
- Teléfono
- Reservas realizadas
- Notas internas

---

## J. Configuración
### Funcionalidades
- Editar nombre del restaurante.
- Editar logo.
- Editar foto principal.
- Editar imágenes de la página de reservas.
- Editar contacto.
- Editar subdominio o URL.
- Editar colores o identidad visual.
- Configurar horarios generales.
- Configurar zonas.
- Configurar políticas.
- Configurar notificaciones por correo.

### Importante
La configuración debe ser muy sencilla, porque el usuario restaurante no necesariamente es técnico.

---

# 7) Página pública de reservas
Esta es la página que verá el cliente final.

## Objetivo
Permitir que el usuario reserve de forma visual, rápida y clara.

---

## Secciones de la experiencia de usuario

### 1. Encabezado
- Nombre del restaurante
- Imagen principal
- Logo si existe
- Botón de reserva

### 2. Selección de fecha
- Calendario interactivo
- Días disponibles resaltados
- Días cerrados deshabilitados

### 3. Selección de hora
- Horarios disponibles por franja
- Horarios no disponibles ocultos o deshabilitados

### 4. Selección de número de personas
- Selector numérico simple
- Validación según capacidad

### 5. Selección de zona
- Interior
- Terraza
- Exterior
- Jardín
- VIP
- Barra

### 6. Selección visual de mesa
- Mapa interactivo de mesas
- Foto de cada mesa
- Capacidad visible
- Estado de disponibilidad

### 7. Carrusel de eventos
- Imágenes destacadas
- Opción de ver eventos especiales
- Inspiración para reservar en fechas especiales

### 8. Datos del cliente
- Nombre
- Correo
- Teléfono
- Comentarios opcionales

### 9. Confirmación
- Resumen de la reserva
- Zona y mesa elegida
- Fecha y hora
- Política de cancelación
- Botón final para confirmar

### 10. Confirmación final
- Mensaje de éxito
- Código de reserva
- Correo enviado
- Instrucciones si aplica

---

# 8) Funcionalidades clave del flujo público
## Funcionalidades obligatorias
- Ver disponibilidad en tiempo real.
- Elegir zona antes de elegir mesa.
- Ver foto de la mesa.
- Ver eventos destacados.
- Reservar sin crear cuenta.
- Confirmar por correo.
- Mostrar experiencia visual premium.

## Funcionalidades deseables
- Recomendación de zona según tipo de reserva.
- Mensajes personalizados según ocasión.
- Reserva para cumpleaños, aniversario o evento.
- Posibilidad de requerir confirmación manual del restaurante.

---

# 9) Landing comercial del software
Esto sí es aparte del motor de reservas.

## Objetivo
Explicar el producto de forma clara, minimalista y premium para que el restaurante:
- Entienda qué hace el software.
- Vea su valor.
- Inicie sesión o se suscriba.

---

## Secciones recomendadas de la landing

### 1. Hero principal
- Título claro
- Subtítulo corto
- CTA 1: Iniciar sesión
- CTA 2: Solicitar demo / Suscribirse

### 2. Qué resuelve
- Reservas visuales
- Zonas y mesas
- Eventos especiales
- Menú conectado
- Mensajes centralizados

### 3. Cómo funciona
- Configura tu restaurante
- Publica tu enlace de reservas
- Recibe reservas automáticas
- Gestiona todo desde un solo panel

### 4. Capturas o mockups del sistema
- Vista del panel
- Vista del mapa de mesas
- Vista de la experiencia de reserva

### 5. Beneficios
- Más reservas
- Menos fricción
- Más control
- Mejor experiencia para el cliente

### 6. CTA final
- Crear cuenta
- Iniciar sesión
- Hablar con ventas

---

# 10) Reglas técnicas importantes
## Supabase
- Autenticación con Supabase Auth.
- Base de datos relacional.
- Storage para imágenes.
- Separación por restaurante.
- Políticas de acceso seguras.

## Resend
- Confirmación de reserva.
- Recuperación de contraseña.
- Notificaciones al restaurante.
- Correos automáticos por evento o cambio.

## Next.js + Vercel
- SSR o App Router según convenga.
- Rutas limpias.
- Buen rendimiento.
- SEO para la landing comercial.
- Escalable y fácil de mantener.