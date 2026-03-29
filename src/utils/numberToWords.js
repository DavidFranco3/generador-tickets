/**
 * Utility to convert numbers to Spanish words.
 * Optimized for currency (MXN pesetas/centavos style).
 * @param {number} number
 */
export const numberToSpanishWords = (number) => {
    const units = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
    const tens = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISEIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
    const tensOverTwenty = ['', '', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
    const hundreds = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

    /**
     * @param {number} n 
     */
    const convertGroup = (n) => {
        let output = '';
        if (n === 100) return 'CIEN';
        if (n > 100) {
            output += hundreds[Math.floor(n / 100)] + ' ';
            n %= 100;
        }

        if (n >= 10 && n <= 19) {
            output += tens[n - 10];
        } else {
            if (n >= 20) {
                const d = Math.floor(n / 10);
                const u = n % 10;
                if (d === 2 && u > 0) output += 'VEINTI' + units[u];
                else if (u > 0) output += tensOverTwenty[d] + ' Y ' + units[u];
                else output += tensOverTwenty[d];
            } else if (n > 0) {
                output += units[n];
            }
        }
        return output.trim();
    };

    if (number === 0) return 'CERO PESOS 00/100 M.N.';
    
    const integerPart = Math.floor(number);
    const decimalPart = Math.round((number - integerPart) * 100);
    
    let result = '';
    let n = integerPart;

    if (n >= 1000000) {
        const millions = Math.floor(n / 1000000);
        result += (millions === 1 ? 'UN MILLÓN ' : convertGroup(millions) + ' MILLONES ');
        n %= 1000000;
    }

    if (n >= 1000) {
        const thousands = Math.floor(n / 1000);
        result += (thousands === 1 ? 'MIL ' : convertGroup(thousands) + ' MIL ');
        n %= 1000;
    }

    if (n > 0) {
        result += convertGroup(n);
    }

    if (integerPart === 1 && result.trim() === 'UN') {
        result = 'UN PESO';
    } else {
        result += ' PESOS';
    }

    const decimals = decimalPart.toString().padStart(2, '0');
    return `${result} ${decimals}/100 M.N.`.trim().replace(/\s+/g, ' ');
};
