import { generatePixPayload } from './pix';

describe('pix utils', () => {
  describe('generatePixPayload', () => {
    const defaultOptions = {
      key: '12345678909',
      name: 'John Doe',
      city: 'Sao Paulo',
      amount: 100.5,
      description: 'Teste'
    };

    it('should generate a valid looking Pix payload', () => {
      const payload = generatePixPayload(defaultOptions);

      // Basic checks for Pix payload structure
      expect(payload).toContain('000201'); // Payload Format Indicator
      expect(payload).toContain('br.gov.bcb.pix'); // GUI
      expect(payload).toContain('52040000'); // MCC
      expect(payload).toContain('5303986'); // Currency BRL
      expect(payload).toContain('5406100.50'); // Amount
      expect(payload).toContain('5802BR'); // Country Code
      expect(payload).toContain('6304'); // CRC indicator
    });

    it('should sanitize merchant name and city', () => {
      const payload = generatePixPayload({
        ...defaultOptions,
        name: 'João D’oe',
        city: 'São Paulo'
      });

      expect(payload).toContain('5908JOAO DOE');
      expect(payload).toContain('6009SAO PAULO');
    });

    it('should handle missing description', () => {
      const payload = generatePixPayload({
        ...defaultOptions,
        description: undefined
      });

      expect(payload).not.toContain('TESTE');
      expect(payload).toContain('0014br.gov.bcb.pix011112345678909');
    });

    it('should use default transactionId *** if not provided', () => {
      const payload = generatePixPayload(defaultOptions);
      expect(payload).toContain('62070503***');
    });
  });
});
