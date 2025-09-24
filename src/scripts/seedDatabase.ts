import 'dotenv/config';
import { database } from '../config/database';
import { Organization } from '../models/Organization';
import { User } from '../models/User';
import { CollectionEvent } from '../models/CollectionEvent';
import { ProcessingStep } from '../models/ProcessingStep';
import { QualityTest } from '../models/QualityTest';
import { Provenance, SmartContractRule } from '../models/Provenance';

class DatabaseSeeder {
  async run() {
    try {
      console.log('🌱 Starting database seeding...');
      
      // Connect to database
      await database.connect();
      
      // Clear existing data (optional - remove in production)
      await this.clearCollections();
      
      // Seed data in order due to dependencies
      const organizations = await this.seedOrganizations();
      const users = await this.seedUsers(organizations);
      const smartContractRules = await this.seedSmartContractRules();
      const collectionEvents = await this.seedCollectionEvents(users);
      const processingSteps = await this.seedProcessingSteps(users);
      const qualityTests = await this.seedQualityTests(users);
      const provenance = await this.seedProvenance(organizations);
      
      console.log('✅ Database seeding completed successfully!');
      console.log('📊 Seeded data summary:');
      console.log(`   - Organizations: ${organizations.length}`);
      console.log(`   - Users: ${users.length}`);
      console.log(`   - Smart Contract Rules: ${smartContractRules.length}`);
      console.log(`   - Collection Events: ${collectionEvents.length}`);
      console.log(`   - Processing Steps: ${processingSteps.length}`);
      console.log(`   - Quality Tests: ${qualityTests.length}`);
      console.log(`   - Provenance Records: ${provenance.length}`);
      
      await database.disconnect();
      
    } catch (error) {
      console.error('❌ Error seeding database:', error);
      throw error;
    }
  }
  
  async clearCollections() {
    console.log('🗑️  Clearing existing collections...');
    await Promise.all([
      Organization.deleteMany({}),
      User.deleteMany({}),
      CollectionEvent.deleteMany({}),
      ProcessingStep.deleteMany({}),
      QualityTest.deleteMany({}),
      Provenance.deleteMany({}),
      SmartContractRule.deleteMany({})
    ]);
  }
  
  async seedOrganizations() {
    console.log('🏢 Seeding organizations...');
    
    const organizations = [
      {
        name: 'Rajasthan Farmer Cooperative',
        type: 'FarmerCoop',
        location: {
          lat: 26.5671,
          lng: 74.3571,
          address: 'Jodhpur District, Rajasthan, India'
        },
        certifications: ['Organic India', 'Fair Trade', 'Sustainable Harvest']
      },
      {
        name: 'Ayur Processing Ltd.',
        type: 'ProcessingFacility',
        location: {
          lat: 26.8500,
          lng: 74.6000,
          address: 'Jaipur Industrial Area, Rajasthan, India'
        },
        certifications: ['ISO 9001', 'ISO 14001', 'HACCP']
      },
      {
        name: 'BioTest Laboratories',
        type: 'TestingLab',
        location: {
          lat: 28.6139,
          lng: 77.2090,
          address: 'New Delhi, India'
        },
        certifications: ['NABL', 'ISO 17025', 'WHO-GMP']
      },
      {
        name: 'HerbalLife Manufacturing',
        type: 'Manufacturer',
        location: {
          lat: 19.0760,
          lng: 72.8777,
          address: 'Mumbai, Maharashtra, India'
        },
        certifications: ['FDA', 'ISO 9001', 'Organic India']
      }
    ];
    
    return await Organization.insertMany(organizations);
  }
  
  async seedUsers(organizations: any[]) {
    console.log('👥 Seeding users...');
    
    const users = [
      {
        name: 'Rajesh Kumar',
        email: 'rajesh@farmercoop.org',
        password: 'farmer123',
        organizationId: organizations[0]._id.toString(),
        role: 'farmer',
        permissions: ['create_collection_event', 'view_own_batches']
      },
      {
        name: 'Dr. Priya Sharma',
        email: 'priya@ayurprocessing.com',
        password: 'processor123',
        organizationId: organizations[1]._id.toString(),
        role: 'processor',
        permissions: ['create_processing_step', 'view_batches', 'transfer_custody']
      },
      {
        name: 'Dr. Anil Gupta',
        email: 'anil@biotestlabs.com',
        password: 'lab123',
        organizationId: organizations[2]._id.toString(),
        role: 'lab_tech',
        permissions: ['create_quality_test', 'view_batches', 'approve_batches']
      },
      {
        name: 'Sunita Patel',
        email: 'sunita@herballife.com',
        password: 'manufacturer123',
        organizationId: organizations[3]._id.toString(),
        role: 'manufacturer',
        permissions: ['create_final_product', 'generate_qr', 'view_all_batches']
      }
    ];
    
    return await User.insertMany(users);
  }
  
  async seedSmartContractRules() {
    console.log('📜 Seeding smart contract rules...');
    
    const rules = [
      {
        type: 'geo_fence',
        species: 'Withania somnifera',
        parameters: {
          allowedZones: [
            { name: 'Rajasthan Zone A', bounds: [[26.0, 74.0], [27.0, 75.0]] },
            { name: 'Madhya Pradesh Zone B', bounds: [[22.0, 77.0], [23.0, 78.0]] }
          ]
        },
        active: true,
        description: 'Geo-fencing rules for Ashwagandha harvesting zones'
      },
      {
        type: 'seasonal',
        species: 'Withania somnifera',
        parameters: {
          harvestingMonths: [10, 11, 12, 1, 2], // Oct-Feb
          closedMonths: [6, 7, 8, 9] // Monsoon protection
        },
        active: true,
        description: 'Seasonal harvesting restrictions for Ashwagandha'
      },
      {
        type: 'conservation',
        species: 'Withania somnifera',
        parameters: {
          maxDailyHarvest: 100, // kg per day per zone
          minPlantAge: 12, // months
          sustainablePercentage: 0.3 // max 30% of available plants
        },
        active: true,
        description: 'Conservation limits for sustainable Ashwagandha harvesting'
      },
      {
        type: 'quality',
        species: 'Withania somnifera',
        parameters: {
          maxMoisture: 12, // %
          minWithanolides: 0.3, // %
          maxPesticides: 0.01, // ppm
          requiredDNAMatch: true
        },
        active: true,
        description: 'Quality thresholds for Ashwagandha acceptance'
      }
    ];
    
    return await SmartContractRule.insertMany(rules);
  }
  
  async seedCollectionEvents(users: any[]) {
    console.log('🌾 Seeding collection events...');
    
    const events = [
      {
        batchId: 'ASH-2024-001',
        lat: 26.5671,
        lng: 74.3571,
        timestamp: new Date('2024-01-15T06:30:00Z'),
        collectorId: users[0]._id.toString(),
        species: 'Withania somnifera',
        initialQualityMetrics: {
          moisture: 8.5,
          visual_quality: 'excellent',
          estimated_yield: 45.2
        },
        photos: ['harvest_001.jpg', 'harvest_002.jpg'],
        harvestingZone: 'Rajasthan Zone A',
        approved: true,
        smartContractValidation: {
          geoFenceValid: true,
          seasonalValid: true,
          conservationValid: true,
          qualityValid: true,
          validationRules: ['geo_fence', 'seasonal', 'conservation', 'quality']
        }
      },
      {
        batchId: 'ASH-2024-002',
        lat: 26.5800,
        lng: 74.3600,
        timestamp: new Date('2024-01-16T07:00:00Z'),
        collectorId: users[0]._id.toString(),
        species: 'Withania somnifera',
        initialQualityMetrics: {
          moisture: 9.2,
          visual_quality: 'good',
          estimated_yield: 38.7
        },
        photos: ['harvest_003.jpg'],
        harvestingZone: 'Rajasthan Zone A',
        approved: true,
        smartContractValidation: {
          geoFenceValid: true,
          seasonalValid: true,
          conservationValid: true,
          qualityValid: true,
          validationRules: ['geo_fence', 'seasonal', 'conservation', 'quality']
        }
      }
    ];
    
    return await CollectionEvent.insertMany(events);
  }
  
  async seedProcessingSteps(users: any[]) {
    console.log('⚙️ Seeding processing steps...');
    
    const steps = [
      {
        batchId: 'ASH-2024-001',
        stepType: 'drying',
        parameters: {
          method: 'shade_drying',
          duration_hours: 72,
          final_moisture: 6.2
        },
        timestamp: new Date('2024-01-18T14:00:00Z'),
        processorId: users[1]._id.toString(),
        temperature: 25,
        humidity: 45,
        duration: 4320, // 72 hours in minutes
        qualityControlPassed: true
      },
      {
        batchId: 'ASH-2024-001',
        stepType: 'grinding',
        parameters: {
          mesh_size: 80,
          particle_size: 'fine'
        },
        timestamp: new Date('2024-01-20T10:00:00Z'),
        processorId: users[1]._id.toString(),
        duration: 120, // 2 hours
        qualityControlPassed: true
      }
    ];
    
    return await ProcessingStep.insertMany(steps);
  }
  
  async seedQualityTests(users: any[]) {
    console.log('🧪 Seeding quality tests...');
    
    const tests = [
      {
        batchId: 'ASH-2024-001',
        testType: 'pesticide',
        result: 'pass',
        values: {
          chlorpyrifos: 0.002,
          malathion: 0.001,
          ddt: 0.0
        },
        certificateHash: '0xa1b2c3d4e5f6',
        timestamp: new Date('2024-01-22T09:00:00Z'),
        labId: users[2]._id.toString(),
        compliance: true,
        testMethodology: 'LC-MS/MS',
        equipment: 'Agilent 6470 Triple Quad',
        technician: 'Dr. Anil Gupta'
      },
      {
        batchId: 'ASH-2024-001',
        testType: 'potency',
        result: 'pass',
        values: {
          withanolides: 2.8,
          withanoside_iv: 0.45,
          withanoside_vi: 0.32
        },
        certificateHash: '0xf6e5d4c3b2a1',
        timestamp: new Date('2024-01-22T11:00:00Z'),
        labId: users[2]._id.toString(),
        compliance: true,
        testMethodology: 'HPLC',
        equipment: 'Waters 2695 HPLC',
        technician: 'Dr. Anil Gupta'
      }
    ];
    
    return await QualityTest.insertMany(tests);
  }
  
  async seedProvenance(organizations: any[]) {
    console.log('📋 Seeding provenance records...');
    
    const provenanceRecords = [
      {
        batchId: 'ASH-2024-001',
        chainOfCustody: [
          {
            organizationId: organizations[0]._id.toString(),
            timestamp: new Date('2024-01-15T06:30:00Z'),
            action: 'Harvested Withania somnifera',
            location: { lat: 26.5671, lng: 74.3571 }
          },
          {
            organizationId: organizations[1]._id.toString(),
            timestamp: new Date('2024-01-18T14:00:00Z'),
            action: 'Processing: drying',
            location: { lat: 26.8500, lng: 74.6000 }
          },
          {
            organizationId: organizations[1]._id.toString(),
            timestamp: new Date('2024-01-20T10:00:00Z'),
            action: 'Processing: grinding',
            location: { lat: 26.8500, lng: 74.6000 }
          },
          {
            organizationId: organizations[2]._id.toString(),
            timestamp: new Date('2024-01-22T09:00:00Z'),
            action: 'Quality test: pesticide',
            location: { lat: 28.6139, lng: 77.2090 }
          }
        ],
        sustainabilityProofs: [
          {
            type: 'organic',
            certificateId: 'ORG-2024-001',
            issuedBy: 'India Organic Certification Agency',
            validUntil: new Date('2025-12-31')
          },
          {
            type: 'sustainable_harvest',
            certificateId: 'SH-2024-001',
            issuedBy: 'Forest Conservation Council',
            validUntil: new Date('2025-06-30')
          }
        ],
        finalProduct: {
          qrCode: 'QR_ASH-2024-001_demo',
          productName: 'Premium Ashwagandha Root Powder',
          manufacturerId: organizations[3]._id.toString(),
          batchSize: 50,
          expiryDate: new Date('2026-12-31')
        },
        verified: true
      }
    ];
    
    return await Provenance.insertMany(provenanceRecords);
  }
}

// Run seeder if called directly
if (require.main === module) {
  const seeder = new DatabaseSeeder();
  seeder.run()
    .then(() => {
      console.log('🎉 Database seeding finished successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database seeding failed:', error);
      process.exit(1);
    });
}

export default DatabaseSeeder;