import { TicketGenerator } from './ticket';

/**
 * Shorthand function to print a ticket.
 * @param {Array|Object} facturas - The invoice(s) data.
 * @param {number} recibido - The amount received.
 * @param {number} cambio - The change amount.
 * @param {Object} options - Customization options (width, company, atendio, onAfterPrint).
 */
export const printTicket = (facturas, recibido = 0, cambio = 0, options = {}) => {
    const generator = new TicketGenerator(options);
    generator.generate(facturas, recibido, cambio);
};

export { TicketGenerator };
export default printTicket;
