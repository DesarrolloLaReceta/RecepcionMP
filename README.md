# Recepción y Control de Materia Prima
### Planta de Producción
## Descripción general

---

Sistema web corporativo para digitalizar, estandarizar y auditar el proceso de recepción de materia prima en planta de producción, garantizando trazabilidad por lotes, control de calidad, cumplimiento BPM y soporte documental conforme a normativa sanitaria colombiana (INVIMA / Resolución 2674 de 2013).

El sistema está diseñado bajo principios de arquitectura limpia, preparado para integraciones futuras con ERP y despliegue en infraestructura empresarial.

---

### Objetivos del sistema

- Digitalizar el proceso de recepción contra Orden de Compra y Factura

- Garantizar trazabilidad completa (Proveedor → OC → Factura → Lote)

- Registrar verificaciones de calidad, inocuidad y cadena de frío

- Centralizar documentación sanitaria exigida

- Facilitar auditorías internas y externas

- Preparar la base para integración con ERP corporativo

---

### Módulos principales

- Recepción de Materia Prima

- Gestión de Lotes

- Checklists BPM por categoría

- No Conformidades y Acciones Correctivas

- Liberación de Lotes (Calidad)

- Gestión Documental

- Trazabilidad y Consultas

- Auditoría y Bitácora

---

### Arquitectura

El sistema sigue una arquitectura **Clean Architecture / Domain-Driven Design**:

```text
RecepcionMP
├── Domain          → Entidades, reglas de negocio, eventos
├── Application     → Casos de uso, DTOs, servicios
├── Infrastructure  → EF Core, repositorios, persistencia
├── Api             → ASP.NET Core 8 (REST)
└── Frontend        → React + TypeScript
```

#### Principios clave:

- Dominio independiente de infraestructura

- Estados explícitos en los flujos BPM

- Validaciones en el dominio, no en el frontend

- Auditoría obligatoria en entidades críticas

---

### Stack tecnológico
#### Backend

- ASP.NET Core 8

- C#

- Entity Framework Core

- SQL Server

- Arquitectura limpia (Domain / Application / Infrastructure)

#### Frontend

- React

- TypeScript

- Vite

- SPA optimizada para uso en tablets y escritorio

#### Infraestructura

- IIS

- Reverse Proxy hacia API

- Preparado para Microsoft Entra ID (Azure AD)

---

### Seguridad

- Autenticación basada en identidad corporativa (SSO – futuro)

- Roles por perfil (Recepción, Calidad, Compras, Auditor, Admin)

- Auditoría inalterable de acciones

- Protección de secretos mediante configuración por entorno

---

### Configuración de ambientes

El proyecto soporta separación de entornos:

- Development

- QA

- Production

Los archivos sensibles no se versionan:

- appsettings.Production.json

- Variables de entorno

- Secrets

---

### Despliegue (alto nivel)

- El código fuente se versiona en GitHub

- El servidor clona el repositorio

- Los builds se generan por ambiente

#### IIS expone:

- Frontend (React)

- /api → Backend ASP.NET Core

---

### Requisitos previos

- Windows Server 2019 / 2022

- IIS + ARR + URL Rewrite

- .NET 8 Hosting Bundle

- Node.js (solo para build)

- SQL Server

---

### Documentación

La documentación funcional y normativa se encuentra en el directorio:

/docs


#### Incluye:

- Flujos BPM

- Requerimientos sanitarios

- Consideraciones de auditoría

- Evolución del modelo

---

### Estado del proyecto

#### En desarrollo
Actualmente en fase de migración a infraestructura corporativa para pruebas internas y validación técnica.

---

### Autor

Jorge Rodríguez

Desarrollo de Software

Proyecto empresarial – Recepción y Control de Materia Prima

---

### Licencia

Uso interno corporativo.
Distribución o reutilización sujeta a autorización de la empresa.
