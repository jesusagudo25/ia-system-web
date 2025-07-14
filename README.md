# 🧾 Interpreters Billing System – Web App

Aplicación web para la gestión de servicios de interpretación, generación de facturas, planillas de pago y reportes administrativos.

Desarrollada como proyecto freelance, esta aplicación busca centralizar el control de ingresos, intérpretes, agencias, facturación y pagos en una sola plataforma digital.

---

## 🌐 Tech Stack

- **Frontend:** React, React Router, Context API
- **Estilos:** Tailwind CSS / Material UI

---

## 🔐 Autenticación

- Ingreso con correo electrónico y contraseña
- Registro con nombre, correo y contraseña
- Recuperación de contraseña vía correo electrónico

---

## 🧭 Dashboard

**Resumen general para el usuario:**

- 👥 Total de Agencias
- 🧑‍💼 Total de Intérpretes
- 💰 Ingresos Mensuales
- 📉 Egresos Mensuales
- 🌍 Lenguajes más solicitados
- 📊 Ingresos por mes
- 👤 Gestión de cuenta (bloque lateral derecho)

---

## 📄 Generación de Factura

> Módulo principal de la aplicación

Permite registrar un nuevo **servicio de interpretación**, que se refleja automáticamente en el historial y en la generación de planillas. Cada servicio incluye:

- Agencia
- Intérprete
- Fecha
- Lenguaje
- Descripción
- Monto
- Estado: Abierto, Cerrado, Pagado

---

## 📚 Historial de Servicios

Visualización completa de todos los servicios registrados con las siguientes columnas:

- Invoice #
- Fecha
- Agencia
- Intérprete
- Estado (`Abierto`, `Cerrado`, `Pagado`)
- Acciones según estado:
  - **Pagado:** Ver factura, Anular
  - **Abierto:** Ver orden
  - **Cerrado:** Sin acciones

---

## 🧾 Planilla de pagos

Las planillas se generan **quincenalmente**, pero los pagos solo se efectúan cuando se han cumplido **45 días desde el servicio**.

- Debe incluir todos los servicios dentro del rango válido.
- Visualización de total por intérprete y servicios prestados.

⚙️ Filtros:
- Rango de fechas
- Intérprete

---

## 📈 Reportes

Generación de reportes con filtros:

- Rango de fechas
- Agencia / Intérprete
- Tipo de servicio
- Estado de pago

---

## ⚙️ Gestión de Entidades (Manage)

Panel administrativo para crear, editar y desactivar:

1. Usuarios
2. Agencias
3. Intérpretes
4. Invoices
5. Descriptions
6. Lenguajes

---

## 👤 Autor

Proyecto personal de jagudo2514@gmail.com.
