RECEPCIÓN Y CONTROL DE MATERIA PRIMA EN PLANTA DE PRODUCCIÓN

1) OBJETIVO DEL SISTEMA

Digitalizar y estandarizar la recepción de materia prima contra Orden de Compra y Factura, capturando trazabilidad completa (proveedor → lote → OC → factura), verificaciones de calidad e inocuidad, y soportes documentales exigidos por normativa sanitaria colombiana (BPM/Resolución 2674 de 2013 y guías de MinSalud/INVIMA), con integración a futuro con ERP y auditoría. 

2) MÓDULOS FUNCIONALES

2.1 Recepción (núcleo)
•	Búsqueda/lectura de OC (No. de OC, proveedor, ítems, cantidades esperadas).
•	Registro de factura (No., fecha, valor, adjunto PDF).
•	Lotes por ítem (lote, fecha fabricación, vencimiento, cantidad recibida, UM).
•	Condiciones de transporte y cadena de frío (si aplica): placas/transportista, temperaturas a la recepción, integridad de empaque, estado sensorial, fotos.
•	Checklists BPM por categoría (cárnicos, lácteos, secos, frutas/verduras, congelados), con criterios de aceptación/rechazo.
•	No conformidades (mermas, rechazos totales/parciales, cuarentena) y acciones correctivas (devoluciones, reproceso, comunicación a proveedor).
•	Liberación de lote (rol Calidad) antes de ingreso a inventario productivo.
•	Etiquetado interno (códigos de lote/QR con trazabilidad).

2.2 Gestión documental (cumplimiento)
Adjuntar/validar al recibir:
•	Registro/Permiso/Notificación Sanitaria INVIMA del alimento/ingrediente según riesgo (o exención cuando aplica). 
•	Certificado de Análisis (COA) del lote cuando aplique (p. ej., microbiología, humedad, Brix, etc.). (Base: controles de calidad y programas sanitarios). 
•	Certificados de transporte/temperatura para refrigerados/congelados (bitácoras de Temperatura, evidencia de que el medio garantiza cadena de frío). 
•	Evidencia de rotulado/etiquetado conforme (verificación contra Resol. 5109 de 2005). 
•	Habilitaciones específicas según rubro (ej.: cárnicos Decreto 1500, lácteos Decreto 616 – parametrizable por categoría).
•	Planillas de recepción (listas de chequeo BPM) y fotos de estado a la entrega.

Nota: La Resolución 2674 de 2013 exige programas sanitarios y control de ingreso de materias primas, registros de recepción, trazabilidad por lotes y cumplimiento de condiciones sanitarias; MinSalud/INVIMA indican conservar registros de transporte y temperaturas para materias primas refrigeradas/congeladas. 

2.3 Maestros y parametrización
•	Proveedores (razón social, NIT, contactos, habilitaciones sanitarias, vigencias documentales).
•	Ítems (categoría sanitaria, unidad, vida útil, T° objetivo, documentos exigidos por categoría, criterios de QC).
•	Tipos de certificados y checklists por categoría (versionables).
•	Causales de no conformidad y flujos de aprobación.

2.4 Trazabilidad y consulta
•	Consulta (proveedor→OC→factura→lotes→consumos).
•	Rastreo por lote (hacia adelante y hacia atrás).
•	Tableros: recepción por proveedor, rechazos, temperaturas fuera de rango, vencimientos próximos, documentos por vencer.

2.5 Integraciones en el futuro
•	ERP (Siesa): lectura de OC, devolución de cantidades recibidas/rechazadas, y opcional ingreso de inventario tras liberación de Calidad.
•	Directorio (Entra ID): SSO y control de roles.
•	Impresoras/lectores: etiquetas de lote con QR/Code128.
•	Sensores (opcional): termómetros Bluetooth (captura automática).

2.6 Seguridad y auditoría
•	Bitácora inalterable (quién, qué, cuándo, antes/después).
•	Perfiles: Recepción/Almacén, Calidad, Compras, Administrador, Auditor.
•	Retención de documentos y cifrado en reposo.

3) REQUERIMIENTOS LEGALES MÍNIMOS A CUBRIR EN EL FLUJO

1.	Recepción documentada de materias primas con verificación sanitaria y registros (BPM) — Res. 2674/2013. 
2.	Trazabilidad por lotes (identificación de lotes, fechas, vencimientos y registros de recepción). 
3.	Cadena de frío y transporte: registro de Temperatura en recepción y evidencia de condiciones del medio de transporte para alimentos que lo requieran. 
4.	Verificación de rotulado/etiquetado conforme a Resol. 5109/2005 en el punto de recepción (cuando aplique). 
5.	Programas sanitarios/PRP: control de ingreso de materias primas, proveedores y etapas del proceso (documentación y evidencias). 

NOTA: La app parametriza exigencias adicionales por rubro (cárnicos/lácteos, etc.) y mantiene vigencias de registros/documentos por proveedor/ítem.

4) FLUJO DE PROCESO (ALTO NIVEL)

1.	Pre-recepción: Se identifica OC abierta → cita con proveedor (opcional).
2.	Check-in: Se validan documentos exigidos según ítem/categoría; captura de temperatura si aplica.
3.	Inspección: Checklists BPM (sensorial, integridad, T°, rótulo, vida útil restante mínima configurable).
4.	Registro: Se crean lotes por ítem y se asocian a factura/PO; adjuntos (PDF/imagen).
5.	Resultado: Aceptado / Rechazo parcial / Rechazo total / Cuarentena.
6.	Calidad: Liberación o rechazo definitivo con CAPA si procede.
7.	Integración ERP: Posteo a inventario/nota de recepción o devolución.
8.	Etiquetado: Impresión de etiqueta interna con QR (lote, vencimiento, T° objetivo).
9.	Seguimiento: KPIs, vencimientos y alertas.

REQUERIMIENTOS TÉCNICOS (IIS/BACKEND/DEVOPS)
Arquitectura
•	Backend: ASP.NET Core 8 (C#) + EF Core (code-first, migraciones).
•	Frontend: React/TypeScript (o Razor/Blazor si prefieres full .NET), UI responsiva para tablets en muelle.
•	Autenticación: Microsoft Entra ID (Azure AD) OpenID/OAuth2 (SSO) con roles por claims.
•	Base de datos: SQL Server 2019/2022 (HA opcional: AG o cluster).
•	Almacenamiento de adjuntos:
o	Opción A: Azure Blob Storage (SAS, lifecycle policies).
o	Opción B: File share interno con path UNC 



















DOCUMENTACIÓN POR ETAPAS
1. Llegada de Vehículo
•	El vehículo arriba al muelle de descarga.
•	Se realiza inspección y se llena el formato “Inspección de vehículos transportadores de materia prima”.
2. Verificación de Documentos
•	Se recibe la Factura del proveedor.
•	Se verifica la Factura contra la Orden de Compra (OC).
3. Descargue
•	Al abrir las puertas del vehículo, se realiza medición de temperatura.
•	Se verifican todos los parámetros de aceptación de la materia prima.
•	La materia prima se pesa y cuenta según sea el caso, para luego comparar con Factura y OC.
•	Si un producto llega faltante, se documenta la novedad y se realiza Nota Crédito.
•	Si el producto es cárnico, antes de abrir las puertas debe estar presente una persona de Calidad para validar que cumple con los requerimientos.
4. Registro
•	Se diligencia el formato de parámetros de aceptación.
5. Aprobación / Rechazo
•	Se procede con la rotulación de canastas de productos aprobados, indicando:
o	Nombre
o	Proveedor
o	Cantidad
o	Lote
o	Fecha de vencimiento
•	Reglas:
o	El lote siempre será el mismo asignado por el proveedor.
o	El lote de verduras corresponde a la fecha del día de recepción.
o	Si un producto llega sin rótulo, se rechaza (excepto verduras).
o	Si el producto presenta poca vida útil, se consulta autorización para su aceptación o rechazo.
o	Si llega un producto con menor fecha de vencimiento que otro recibido previamente, se rechaza automáticamente por incumplir la rotación (PEPS).
6. Almacenamiento
•	Una vez aprobado el producto, se determina su ubicación según tipo:
o	CD (Centro de Despacho)
o	CP (Centro de Producción)
