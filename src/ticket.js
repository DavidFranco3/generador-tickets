import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { numberToSpanishWords } from './utils/numberToWords';
import { printIframe } from './utils/printer';

export class TicketGenerator {
    constructor(options = {}) {
        this.width = options.width || 80;
        this.margin = options.margin || 5;
        this.contentWidth = this.width - (this.margin * 2);
        this.company = options.company || null;
        this.atendio = options.atendio || null;
        this.onAfterPrint = options.onAfterPrint || null;
    }

    /**
     * Generate and print a ticket for one or more invoices.
     */
    generate(facturas, recibido = 0, cambio = 0) {
        if (!facturas || (Array.isArray(facturas) && facturas.length === 0)) return;

        const doc = new jsPDF({
            unit: 'mm',
            format: [this.width, 300] // Dynamic height if needed, auto-truncated later
        });

        let facturasArray = [];
        if (!Array.isArray(facturas) && facturas.facturas) {
            facturasArray = facturas.facturas;
        } else {
            facturasArray = Array.isArray(facturas) ? facturas : [facturas];
        }

        const firstEntity = facturasArray[0] || facturas;
        let y = 10;
        const centerX = this.width / 2;

        // --- Header / Branding ---
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(this.width < 60 ? 10 : 12);
        const companyName = this.company?.nombre || "TICKET DE PAGO";
        doc.text(companyName, centerX, y, { align: 'center' });
        y += (this.width < 60 ? 5 : 6);

        doc.setFontSize(this.width < 60 ? 7 : 8);
        doc.setFont('helvetica', 'normal');

        if (this.company?.rfc) {
            doc.text(`RFC: ${this.company.rfc}`, centerX, y, { align: 'center' });
            y += 4;
        }
        if (this.company?.telefono) {
            doc.text(`Tel: ${this.company.telefono}`, centerX, y, { align: 'center' });
            y += 4;
        }

        // Address
        const addressLines = [];
        if (this.company?.calle) {
            let addr = this.company.calle;
            if (this.company.numero_exterior) addr += ` #${this.company.numero_exterior}`;
            addressLines.push(addr);
        }
        if (this.company?.colonia) addressLines.push(this.company.colonia);
        if (this.company?.cp) addressLines.push(`C.P. ${this.company.cp}`);

        const fullAddress = addressLines.join(' ');
        if (fullAddress.trim()) {
            const splitAddress = doc.splitTextToSize(fullAddress, this.contentWidth);
            doc.text(splitAddress, centerX, y, { align: 'center' });
            y += (splitAddress.length * 4);
        }

        y += 2;
        doc.setLineWidth(0.2);
        doc.line(this.margin, y, this.width - this.margin, y);
        y += 5;

        // --- Ticket Info ---
        doc.setFont('helvetica', 'bold');
        const nota = firstEntity.numero_control || facturas.numero_control || facturas.folio_operacion || 'N/A';
        doc.text(`FOLIO: ${nota}`, this.margin, y);
        y += 4;

        doc.setFont('helvetica', 'normal');
        const paymentDate = facturas.fecha_pago || firstEntity.operacion_pago?.fecha_pago || new Date().toLocaleDateString('es-MX');
        const paymentTime = facturas.hora_pago || firstEntity.operacion_pago?.hora_pago || new Date().toLocaleTimeString('es-MX');
        doc.text(`FECHA: ${paymentDate} ${paymentTime}`, this.margin, y);
        y += 4;

        if (this.atendio) {
            doc.text(`ATENDIÓ: ${this.atendio}`, this.margin, y);
            y += 4;
        }

        const metodo = firstEntity.metodo_pago || facturas.metodo_pago || "N/A";
        doc.text(`MÉTODO DE PAGO: ${metodo}`, this.margin, y);
        y += 5;

        doc.line(this.margin, y, this.width - this.margin, y);
        y += 5;

        // --- Client Details ---
        const getClientName = (f) => f.client?.nombre || f.client_nombre || facturas.client?.nombre || "PÚBLICO EN GENERAL";
        const uniqueClients = [...new Set(facturasArray.map(getClientName))];
        
        doc.setFont('helvetica', 'bold');
        doc.text(uniqueClients.length > 1 ? "CLIENTES:" : "CLIENTE:", this.margin, y);
        y += 4;
        doc.setFont('helvetica', 'normal');

        const clientNamesStr = uniqueClients.join(', ');
        const splitName = doc.splitTextToSize(clientNamesStr, this.contentWidth);
        doc.text(splitName, this.margin, y);
        y += (splitName.length * 4);
        y += 2;

        doc.setFont('helvetica', 'bold');
        doc.text("DESGLOSE DE SERVICIOS", centerX, y, { align: 'center' });
        y += 4;

        // --- Table ---
        const tableBody = [];
        let currentClient = null;

        facturasArray.forEach(f => {
            const clientName = getClientName(f);
            if (uniqueClients.length > 1 && clientName !== currentClient) {
                tableBody.push([{ content: `>> ${clientName.toUpperCase()}`, colSpan: 3, styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } }]);
                currentClient = clientName;
            }
            const concept = `${(f.contract?.plan?.nombre || 'SERVICIO').toUpperCase()} (${f.periodo || 'N/A'})`;
            tableBody.push([f.numero_control || '-', concept, `$${parseFloat(f.monto_pagado || f.total || 0).toFixed(2)}`]);
        });

        const additionalConcepts = facturas.conceptos || firstEntity.operacion_pago?.conceptos || [];
        if (additionalConcepts.length > 0) {
            tableBody.push([{ content: `>> OTROS CONCEPTOS`, colSpan: 3, styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } }]);
            additionalConcepts.forEach(c => {
                tableBody.push(['-', c.descripcion.toUpperCase(), `$${parseFloat(c.monto).toFixed(2)}`]);
            });
        }

        doc.autoTable({
            startY: y,
            head: [['Folio', 'Concepto', { content: 'Total', styles: { halign: 'right' } }]],
            body: tableBody,
            theme: 'plain',
            styles: { fontSize: this.width < 60 ? 6 : 7, cellPadding: 1 },
            headStyles: { fontStyle: 'bold', borderBottom: 0.1 },
            margin: { left: this.margin, right: this.margin },
            columnStyles: { 0: { cellWidth: 12 }, 1: { cellWidth: 'auto' }, 2: { cellWidth: 18, halign: 'right' } },
            didDrawPage: (data) => { y = data.cursor.y; }
        });

        y += 5;
        doc.line(this.margin, y, this.width - this.margin, y);
        y += 5;

        // --- Totals ---
        const total = facturasArray.reduce((acc, f) => acc + parseFloat(f.monto_pagado || f.total || 0), 0) + 
                      additionalConcepts.reduce((acc, c) => acc + parseFloat(c.monto || 0), 0);

        doc.setFontSize(this.width < 60 ? 8 : 9);
        doc.setFont('helvetica', 'bold');
        doc.text("TOTAL PAGADO:", this.margin, y);
        doc.text(`$${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, this.width - this.margin, y, { align: 'right' });
        y += 5;

        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        const words = doc.splitTextToSize(`(${numberToSpanishWords(total)})`, this.contentWidth);
        doc.text(words, centerX, y, { align: 'center' });
        y += (words.length * 4);

        if (metodo.toUpperCase() === 'EFECTIVO' && (recibido > 0 || cambio > 0)) {
            y += 2;
            doc.text("TOTAL RECIBIDO:", this.margin, y);
            doc.text(`$${recibido.toFixed(2)}`, this.width - this.margin, y, { align: 'right' });
            y += 4;
            doc.setFont('helvetica', 'bold');
            doc.text("SU CAMBIO:", this.margin, y);
            doc.text(`$${cambio.toFixed(2)}`, this.width - this.margin, y, { align: 'right' });
            y += 6;
        }

        // --- Footer ---
        y += 5;
        doc.setFontSize(7);
        doc.setFont('helvetica', 'italic');
        const footer = "¡Gracias por su pago! Este ticket es para su control personal y no tiene valor fiscal.";
        const splitFooter = doc.splitTextToSize(footer, this.contentWidth);
        doc.text(splitFooter, centerX, y, { align: 'center' });

        const blob = doc.output('blob');
        printIframe(URL.createObjectURL(blob), true, this.onAfterPrint);
    }
}
