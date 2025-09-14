export interface QRCodeData {
  batchId: string;
  productName: string;
  manufacturerId: string;
  timestamp: string;
  verificationUrl: string;
  digitalSignature: string;
}

export class QRCodeService {
  private static baseUrl = window.location.origin;

  static generateQRCode(batchId: string, productName: string, manufacturerId: string): QRCodeData {
    const timestamp = new Date().toISOString();
    const verificationUrl = `${this.baseUrl}/verify/${batchId}`;
    
    return {
      batchId,
      productName,
      manufacturerId,
      timestamp,
      verificationUrl,
      digitalSignature: this.generateDigitalSignature(batchId, manufacturerId, timestamp)
    };
  }

  static parseQRCode(qrCodeString: string): QRCodeData | null {
    try {
      // Handle both JSON format and simple batch ID format
      if (qrCodeString.startsWith('{')) {
        return JSON.parse(qrCodeString);
      } else if (qrCodeString.startsWith('QR_')) {
        // Legacy format: QR_BATCHID_TIMESTAMP
        const parts = qrCodeString.split('_');
        if (parts.length >= 2) {
          return {
            batchId: parts.slice(1, -1).join('_'),
            productName: 'Ayurvedic Product',
            manufacturerId: 'unknown',
            timestamp: new Date().toISOString(),
            verificationUrl: `${this.baseUrl}/verify/${parts.slice(1, -1).join('_')}`,
            digitalSignature: 'legacy'
          };
        }
      }
      return null;
    } catch (error) {
      console.error('Failed to parse QR code:', error);
      return null;
    }
  }

  static verifyQRCodeSignature(qrData: QRCodeData): boolean {
    const expectedSignature = this.generateDigitalSignature(
      qrData.batchId,
      qrData.manufacturerId,
      qrData.timestamp
    );
    
    return qrData.digitalSignature === expectedSignature || qrData.digitalSignature === 'legacy';
  }

  private static generateDigitalSignature(batchId: string, manufacturerId: string, timestamp: string): string {
    // Simulate ECDSA signature
    const data = `${batchId}:${manufacturerId}:${timestamp}`;
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `sig_${Math.abs(hash).toString(16).padStart(16, '0')}`;
  }

  // Generate printable QR code data URL (SVG)
  static generateQRCodeSVG(data: string): string {
    // Simple QR code visualization (in real implementation, use qrcode library)
    const size = 200;
    const modules = 21; // Standard QR code is 21x21 modules
    const moduleSize = size / modules;
    
    let svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<rect width="${size}" height="${size}" fill="white"/>`;
    
    // Generate pattern based on data hash
    const hash = this.simpleHash(data);
    for (let i = 0; i < modules; i++) {
      for (let j = 0; j < modules; j++) {
        if ((hash + i * modules + j) % 3 === 0) {
          const x = i * moduleSize;
          const y = j * moduleSize;
          svg += `<rect x="${x}" y="${y}" width="${moduleSize}" height="${moduleSize}" fill="black"/>`;
        }
      }
    }
    
    svg += '</svg>';
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  private static simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  // Batch QR code validation
  static async validateBatchQR(qrCode: string): Promise<{
    valid: boolean;
    batchId?: string;
    errors: string[];
  }> {
    const errors: string[] = [];
    
    const qrData = this.parseQRCode(qrCode);
    if (!qrData) {
      errors.push('Invalid QR code format');
      return { valid: false, errors };
    }

    if (!this.verifyQRCodeSignature(qrData)) {
      errors.push('QR code signature verification failed');
    }

    // Check if batch exists in blockchain
    // In real implementation, query blockchain
    const batchExists = qrData.batchId.length > 0;
    if (!batchExists) {
      errors.push('Batch not found in blockchain');
    }

    return {
      valid: errors.length === 0,
      batchId: qrData.batchId,
      errors
    };
  }
}