import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { CollectionEvent, ProcessingStep, QualityTest, Provenance, SmartContractRule } from '../types/blockchain';
import { BlockchainService } from '../services/BlockchainService';

interface BlockchainContextType {
  collectionEvents: CollectionEvent[];
  processingSteps: ProcessingStep[];
  qualityTests: QualityTest[];
  provenance: Provenance[];
  smartContractRules: SmartContractRule[];
  addCollectionEvent: (event: CollectionEvent) => Promise<void>;
  addProcessingStep: (step: ProcessingStep) => Promise<void>;
  addQualityTest: (test: QualityTest) => Promise<void>;
  generateProvenance: (batchId: string) => Promise<Provenance>;
  validateHarvesting: (event: CollectionEvent) => Promise<boolean>;
  getBatchHistory: (batchId: string) => any[];
}

export const BlockchainContext = createContext<BlockchainContextType | undefined>(undefined);

export function BlockchainProvider({ children }: { children: ReactNode }) {
  const [collectionEvents, setCollectionEvents] = useState<CollectionEvent[]>([]);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([]);
  const [qualityTests, setQualityTests] = useState<QualityTest[]>([]);
  const [provenance, setProvenance] = useState<Provenance[]>([]);
  const [smartContractRules] = useState<SmartContractRule[]>(BlockchainService.getSmartContractRules());

  useEffect(() => {
    // Load demo data
    const demoData = BlockchainService.getDemoData();
    setCollectionEvents(demoData.collectionEvents);
    setProcessingSteps(demoData.processingSteps);
    setQualityTests(demoData.qualityTests);
    setProvenance(demoData.provenance);
  }, []);

  const addCollectionEvent = async (event: CollectionEvent) => {
    const isValid = await validateHarvesting(event);
    if (!isValid) {
      throw new Error('Harvesting validation failed - check geo-fencing, seasonal restrictions, or conservation limits');
    }
    
    setCollectionEvents(prev => [...prev, { ...event, approved: true }]);
    BlockchainService.logTransaction('collection_event', event);
  };

  const addProcessingStep = async (step: ProcessingStep) => {
    setProcessingSteps(prev => [...prev, step]);
    BlockchainService.logTransaction('processing_step', step);
  };

  const addQualityTest = async (test: QualityTest) => {
    setQualityTests(prev => [...prev, test]);
    BlockchainService.logTransaction('quality_test', test);
  };

  const generateProvenance = async (batchId: string): Promise<Provenance> => {
    const provData = BlockchainService.generateProvenance(
      batchId, 
      collectionEvents, 
      processingSteps, 
      qualityTests
    );
    setProvenance(prev => [...prev.filter(p => p.batchId !== batchId), provData]);
    return provData;
  };

  const validateHarvesting = async (event: CollectionEvent): Promise<boolean> => {
    return BlockchainService.validateHarvesting(event, smartContractRules);
  };

  const getBatchHistory = (batchId: string) => {
    return BlockchainService.getBatchHistory(batchId, collectionEvents, processingSteps, qualityTests);
  };

  return (
    <BlockchainContext.Provider value={{
      collectionEvents,
      processingSteps,
      qualityTests,
      provenance,
      smartContractRules,
      addCollectionEvent,
      addProcessingStep,
      addQualityTest,
      generateProvenance,
      validateHarvesting,
      getBatchHistory
    }}>
      {children}
    </BlockchainContext.Provider>
  );
}

export function useBlockchain() {
  const context = useContext(BlockchainContext);
  if (!context) {
    throw new Error('useBlockchain must be used within BlockchainProvider');
  }
  return context;
}