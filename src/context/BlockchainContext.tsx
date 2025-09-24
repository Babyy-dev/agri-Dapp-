import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { CollectionEvent, ProcessingStep, QualityTest, Provenance, SmartContractRule } from '../types/blockchain';
import { BlockchainService } from '../services/BlockchainService';
import { DatabaseService } from '../services/DatabaseService';

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
  const [smartContractRules, setSmartContractRules] = useState<SmartContractRule[]>([]);

  useEffect(() => {
    // Load data from database or demo data
    const loadData = async () => {
      try {
        const [demoData, rules] = await Promise.all([
          BlockchainService.getDemoData(),
          BlockchainService.getSmartContractRules()
        ]);
        
        setCollectionEvents(demoData.collectionEvents);
        setProcessingSteps(demoData.processingSteps);
        setQualityTests(demoData.qualityTests);
        setProvenance(demoData.provenance);
        setSmartContractRules(rules);
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };
    
    loadData();
  }, []);

  const addCollectionEvent = async (event: CollectionEvent) => {
    try {
      const isValid = await validateHarvesting(event);
      if (!isValid) {
        throw new Error('Harvesting validation failed - check geo-fencing, seasonal restrictions, or conservation limits');
      }
      
      // Save to database
      const savedEvent = await DatabaseService.createCollectionEvent({ ...event, approved: true });
      setCollectionEvents(prev => [...prev, savedEvent as CollectionEvent]);
      await BlockchainService.logTransaction('collection_event', event);
    } catch (error) {
      console.error('Error adding collection event:', error);
      throw error;
    }
  };

  const addProcessingStep = async (step: ProcessingStep) => {
    try {
      const savedStep = await DatabaseService.createProcessingStep(step);
      setProcessingSteps(prev => [...prev, savedStep as ProcessingStep]);
      await BlockchainService.logTransaction('processing_step', step);
    } catch (error) {
      console.error('Error adding processing step:', error);
      throw error;
    }
  };

  const addQualityTest = async (test: QualityTest) => {
    try {
      const savedTest = await DatabaseService.createQualityTest(test);
      setQualityTests(prev => [...prev, savedTest as QualityTest]);
      await BlockchainService.logTransaction('quality_test', test);
    } catch (error) {
      console.error('Error adding quality test:', error);
      throw error;
    }
  };

  const generateProvenance = async (batchId: string): Promise<Provenance> => {
    try {
      const provData = await BlockchainService.generateProvenance(batchId);
      setProvenance(prev => [...prev.filter(p => p.batchId !== batchId), provData]);
      return provData;
    } catch (error) {
      console.error('Error generating provenance:', error);
      throw error;
    }
  };

  const validateHarvesting = async (event: CollectionEvent): Promise<boolean> => {
    try {
      const rules = smartContractRules.length > 0 ? smartContractRules : await BlockchainService.getSmartContractRules();
      return await BlockchainService.validateHarvesting(event, rules);
    } catch (error) {
      console.error('Error validating harvesting:', error);
      return false;
    }
  };

  const getBatchHistory = async (batchId: string) => {
    try {
      return await BlockchainService.getBatchHistory(batchId);
    } catch (error) {
      console.error('Error fetching batch history:', error);
      return [];
    }
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