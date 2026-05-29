/**
 * Utility to generate Pix Static QR Code (BRCode)
 * Following EMV QRCPS / Pix Bacen standards
 */

function crc16(data: string): string {
  let crc = 0xffff;
  const polynomial = 0x1021;

  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ polynomial;
      } else {
        crc <<= 1;
      }
    }
  }

  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, '0');
}

function formatField(id: string, value: string): string {
  const length = value.length.toString().padStart(2, '0');
  return `${id}${length}${value}`;
}

function sanitize(text: string): string {
  return (text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-zA-Z0-9 ]/g, '') // Keep only alpha-numeric and space
    .trim();
}

interface PixOptions {
  key: string;
  name: string;
  city: string;
  amount: number;
  description?: string;
  transactionId?: string;
}

export function generatePixPayload({
  key,
  name,
  city,
  amount = 0,
  description,
  transactionId = '***'
}: PixOptions): string {
  const sanitizedName = sanitize(name).slice(0, 25).toUpperCase();
  const sanitizedCity = sanitize(city).slice(0, 15).toUpperCase();
  const sanitizedDescription = description
    ? sanitize(description).slice(0, 25)
    : '';

  // Ensure amount is a number and fixed to 2 decimals
  const safeAmount = (typeof amount === 'number' ? amount : 0).toFixed(2);

  // Merchant Account Information
  const gui = formatField('00', 'br.gov.bcb.pix');
  const keyField = formatField('01', key);
  const infoValue = sanitizedDescription
    ? gui + keyField + formatField('02', sanitizedDescription)
    : gui + keyField;

  const fields: string[] = [
    formatField('00', '01'), // Payload Format Indicator
    formatField('26', infoValue), // Merchant Account Information
    formatField('52', '0000'), // Merchant Category Code
    formatField('53', '986'), // Currency (BRL)
    formatField('54', safeAmount), // Transaction Amount
    formatField('58', 'BR'), // Country Code
    formatField('59', sanitizedName), // Merchant Name (Max 25)
    formatField('60', sanitizedCity), // Merchant City (Max 15)
    formatField('62', formatField('05', transactionId.slice(0, 25))) // Additional Data Field
  ];

  const payload = fields.join('') + '6304';
  return payload + crc16(payload);
}
