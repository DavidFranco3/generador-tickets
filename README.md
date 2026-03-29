# 🧾 Ticket Generator Pro

Una biblioteca de JavaScript moderna y ligera para la generación de tickets térmicos profesionales utilizando **jsPDF**. Diseñada para ser integrada fácilmente en sistemas de punto de venta (POS) y aplicaciones web que requieran impresión de recibos.

## ✨ Características

*   **📏 Soporte Multiformato**: Configuración nativa para tickets de 80mm (estándar) y 58mm (portátil).
*   **🔤 Conversión a Letras**: Traducción automática de montos numéricos a texto en español (Estilo MXN: Pesos 00/100 M.N.).
*   **💠 Diseño Adaptable**: Tablas inteligentes con `jspdf-autotable` que se ajustan al ancho del papel.
*   **📡 Impresión Directa**: Utiliza un iframe oculto para lanzar el diálogo de impresión del navegador sin interrumpir la UX.
*   **🏢 Personalización de Marca**: Incluye RFC, teléfono, dirección y logotipos textuales fácilmente.

## 🚀 Instalación

```bash
npm install generador-tickets
```

## 💻 Uso Básico

La forma más sencilla de imprimir un ticket es usando la función shorthand `printTicket`.

```javascript
import { printTicket } from 'generador-tickets';

const data = {
    numero_control: 'OP-1234',
    metodo_pago: 'EFECTIVO',
    facturas: [
        {
            numero_control: 'F-001',
            total: 1500.00,
            client: { nombre: 'JUAN PÉREZ' },
            contract: { plan: { nombre: 'INTERNET 50MB' } },
            periodo: 'MARZO 2026'
        }
    ]
};

const options = {
    width: 80, // Ancho en mm (80 o 58)
    company: {
        nombre: 'MI EMPRESA S.A.',
        rfc: 'ABC123456XYZ',
        telefono: '555-0123'
    },
    atendio: 'CAJERO 1'
};

// Generar e imprimir
printTicket(data, 2000, 500, options);
```

## 🛠️ API Reference

### `printTicket(data, recibido, cambio, options)`

Función principal para generar e imprimir de forma rápida.

*   **`data`** (Object): Objeto con la información del pago y las facturas.
*   **`recibido`** (Number): Monto entregado por el cliente.
*   **`cambio`** (Number): Cambio a entregar.
*   **`options`** (Object): Configuraciones adicionales.

### `TicketGenerator` (Clase)

Para un control más granular, puedes instanciar la clase directamente.

```javascript
import { TicketGenerator } from 'generador-tickets';

const generator = new TicketGenerator({
    width: 58,
    margin: 3,
    company: { ... }
});

generator.generate(facturas, recibido, cambio);
```

### Opciones de Configuración

| Propiedad | Tipo | Descripción | Default |
| :--- | :--- | :--- | :--- |
| `width` | `number` | Ancho del ticket en mm. | `80` |
| `margin` | `number` | Margen lateral en mm. | `5` |
| `company` | `object` | Información de la empresa (nombre, rfc, etc). | `null` |
| `atendio` | `string` | Nombre de la persona que realiza la venta. | `null` |
| `onAfterPrint` | `function` | Callback que se ejecuta tras cerrar el diálogo de impresión. | `null` |

## 📦 Dependencias

Este proyecto utiliza las siguientes librerías:
- [jsPDF](https://github.com/parallax/jsPDF) - Generación del documento base.
- [jsPDF-AutoTable](https://github.com/simonbengtsson/jspdf-autotable) - Generación de tablas de desglose.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.
