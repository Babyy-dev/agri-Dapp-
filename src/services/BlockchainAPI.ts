import { CollectionEvent, ProcessingStep, QualityTest, Provenance } from '../types/blockchain';

export interface BlockchainTransaction {
  id: string;
  type: 'collection_event' | 'processing_step' | 'quality_test' | 'provenance_generation';
  data: any;
  timestamp: string;
  blockHeight: number;
  hash: string;
  previousHash: string;
  organizationId: string;
  signature: string;
}

export interface NetworkStatus {
  totalBlocks: number;
  totalTransactions: number;
  averageBlockTime: number;
  networkHealth: 'active' | 'degraded' | 'offline';
  consensusType: string;
  activeNodes: number;
  lastBlockTimestamp: string;
}

export class BlockchainAPI {
  private static baseUrl = '/api/blockchain';
  
  // In a real implementation, these would be HTTP calls to the blockchain API
  static async submitTransaction(type: string, data: any, organizationId: string): Promise<BlockchainTransaction> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const transaction: BlockchainTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: type as any,
      data,
      timestamp: new Date().toISOString(),
      blockHeight: await this.getNextBlockHeight(),
      hash: this.generateHash(JSON.stringify({ type, data, organizationId })),
      previousHash: await this.getLatestBlockHash(),
      organizationId,
      signature: this.generateSignature(organizationId, data)
    };
    
    console.log('🔗 Blockchain Transaction Submitted:', transaction);
    return transaction;
  }

  static async getNetworkStatus(): Promise<NetworkStatus> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const totalTransactions = Math.floor(Math.random() * 1000) + 100;
    return {
      totalBlocks: Math.floor(totalTransactions / 5) + 1,
      totalTransactions,
      averageBlockTime: 2.3,
      networkHealth: 'active',
      consensusType: 'PBFT',
      activeNodes: 5,
      lastBlockTimestamp: new Date().toISOString()
    };
  }

  static async queryBatchHistory(batchId: string): Promise<BlockchainTransaction[]> {
    // Simulate querying blockchain for all transactions related to a batch
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // In real implementation, this would query the actual blockchain
    return [];
  }

  static async validateSmartContract(
    contractType: 'geo_fence' | 'seasonal' | 'quality' | 'conservation',
    parameters: any
  ): Promise<{ valid: boolean; errors: string[] }> {
    // Simulate smart contract validation
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const errors: string[] = [];
    
    switch (contractType) {
      case 'geo_fence':
        if (!this.isInAllowedZone(parameters.lat, parameters.lng, parameters.species)) {
          errors.push('Location outside approved harvesting zones');
        }
        break;
        
      case 'seasonal':
        const month = new Date().getMonth() + 1;
        if (![10, 11, 12, 1, 2].includes(month)) {
          errors.push('Harvesting not permitted in current season');
        }
        break;
        
      case 'quality':
        if (parameters.moisture > 12) {
          errors.push('Moisture content exceeds maximum threshold (12%)');
        }
        break;
    }
    
    return { valid: errors.length === 0, errors };
  }

  private static async getNextBlockHeight(): Promise<number> {
    const status = await this.getNetworkStatus();
    return status.totalBlocks + 1;
  }

  private static async getLatestBlockHash(): Promise<string> {
    // In real implementation, get from actual blockchain
    return `0x${Math.random().toString(16).substr(2, 64)}`;
  }

  private static generateHash(data: string): string {
    // Simulate SHA-256 hash
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `0x${Math.abs(hash).toString(16).padStart(64, '0')}`;
  }

  private static generateSignature(organizationId: string, data: any): string {
    // Simulate digital signature
    return `sig_${organizationId}_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
  }

  private static isInAllowedZone(lat: number, lng: number, species: string): boolean {
    // Ashwagandha zones
    if (species === 'Withania somnifera') {
      return (lat >= 26.0 && lat <= 27.0 && lng >= 74.0 && lng <= 75.0) ||
             (lat >= 22.0 && lat <= 23.0 && lng >= 77.0 && lng <= 78.0);
    }
    return true;
  }
}