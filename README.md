# AyurTrace - Blockchain Botanical Traceability DApp

A comprehensive blockchain-based distributed application for end-to-end traceability of Ayurvedic herbs, featuring permissioned network simulation, smart contracts, and consumer verification.

## 🌟 Features

### Blockchain Network Simulation
- **Permissioned Network**: Simulates Hyperledger Fabric with role-based access control
- **Smart Contracts**: Enforces geo-fencing, seasonal restrictions, quality thresholds, and conservation limits
- **Digital Signatures**: Cryptographic validation of all transactions
- **Consensus Mechanism**: PBFT (Practical Byzantine Fault Tolerance) simulation

### Organization Dashboards
- **Farmer Cooperative**: GPS-enabled harvest collection with smart contract validation
- **Processing Facility**: Multi-step processing workflow with parameter tracking
- **Testing Laboratory**: Quality assurance with certificate generation
- **Manufacturer**: Final product QR code generation and batch management

### Consumer Portal
- **QR Code Scanning**: Camera-enabled QR scanning with validation
- **Provenance Visualization**: Interactive journey map and timeline
- **Certificate Verification**: Sustainability and quality proof validation
- **Product Authentication**: Blockchain-verified authenticity

### Mobile-First Data Capture
- **GPS Integration**: Automatic location capture with accuracy metrics
- **Offline Support**: Local storage with sync when connectivity restored
- **Photo Upload**: Species verification through image capture
- **Smart Validation**: Real-time smart contract compliance checking

## 🏗️ Architecture

### Data Models (FHIR-Compliant)
```typescript
- CollectionEvent: Harvest data with GPS coordinates and quality metrics
- ProcessingStep: Manufacturing steps with parameters and timestamps
- QualityTest: Lab results with certificate hashes and compliance status
- Provenance: Complete chain of custody with sustainability proofs
```

### Smart Contract Rules
- **Geo-Fencing**: GPS-based harvesting zone validation
- **Seasonal Controls**: Time-based harvesting restrictions
- **Conservation Limits**: Sustainable yield management
- **Quality Thresholds**: Automated quality gate enforcement

### Security Features
- **Role-Based Access**: Organization-specific permissions
- **Certificate-Based Auth**: X.509 certificate simulation
- **Data Integrity**: Blockchain hash verification
- **Audit Trail**: Immutable transaction logging

## 🚀 Quick Start

### Demo Credentials
Select any organization to access the permissioned blockchain network:
- **Rajasthan Farmer Cooperative** (Farmer role)
- **Ayur Processing Ltd.** (Processor role)
- **BioTest Laboratories** (Lab Technician role)
- **HerbalLife Manufacturing** (Manufacturer role)

### Demo QR Code
Try the consumer portal with: `QR_ASH-2024-001_demo`

## 📱 Usage Workflows

### 1. Farmer Harvest Collection
1. Access Farmer Dashboard
2. Use "New Harvest Collection" 
3. Capture GPS location automatically
4. Enter species and quality metrics
5. Validate against smart contracts
6. Submit to blockchain network

### 2. Processing & Testing
1. Processor scans batch QR codes
2. Add processing steps with parameters
3. Lab technician submits test results
4. System validates quality thresholds
5. Automatic compliance checking

### 3. Consumer Verification
1. Scan product QR code
2. View complete provenance journey
3. Verify sustainability certificates
4. Check quality test results
5. Confirm blockchain authenticity

## 🔧 Technical Implementation

### Blockchain Simulation
- **Transaction Logging**: Comprehensive blockchain transaction simulation
- **Network Status**: Real-time network health monitoring
- **Smart Contract Engine**: Rule-based validation system
- **Consensus Simulation**: PBFT consensus mechanism modeling

### Integration Points
- **RESTful APIs**: Ready for blockchain network integration
- **ERP Connectivity**: Hooks for existing quality management systems
- **Mobile SDK**: React Native compatible components
- **Web3 Ready**: Prepared for Web3 wallet integration

### Data Standards
- **FHIR Compliance**: Healthcare data standard compatibility
- **JSON-LD Support**: Semantic web integration
- **ISO Standards**: GS1, ISO 8601, ISO 3166 compliance
- **Audit Logging**: Complete transaction audit trails

## 🌱 Conservation Features

### Smart Contract Enforcement
- **Daily Harvest Limits**: Per-zone sustainable extraction limits
- **Seasonal Protection**: Monsoon and breeding season restrictions
- **Population Health**: Plant density and regeneration tracking
- **Predictive Analytics**: Optimal harvest window recommendations

### Sustainability Tracking
- **Conservation Status**: Real-time ecosystem health monitoring
- **Community Impact**: Fair trade and community development tracking
- **Carbon Footprint**: Supply chain environmental impact assessment
- **Biodiversity Protection**: Species population sustainability metrics

## 🔗 API Endpoints

### Blockchain Operations
- `POST /api/blockchain/collection-events` - Submit harvest data
- `POST /api/blockchain/processing-steps` - Add processing steps
- `POST /api/blockchain/quality-tests` - Submit test results
- `GET /api/blockchain/batches/{batchId}` - Get batch history
- `GET /api/blockchain/provenance/{qrCode}` - Consumer verification

### Network Management
- `GET /api/blockchain/network/status` - Network health
- `POST /api/blockchain/smart-contracts/validate` - Rule validation
- `GET /api/blockchain/conservation/status` - Conservation metrics

## 🏆 SIH Demonstration Features

### Live Demo Scenarios
1. **Real-time Harvest**: GPS-enabled field data collection
2. **Processing Workflow**: Multi-step manufacturing process
3. **Quality Assurance**: Lab testing and certification
4. **Consumer Experience**: QR scanning and provenance viewing
5. **Conservation Monitoring**: Sustainability tracking and alerts

### Blockchain Visualization
- Network status dashboard with real-time metrics
- Transaction history with block confirmations
- Smart contract rule enforcement visualization
- Conservation status and predictive analytics

## 🔧 Production Deployment

### Blockchain Integration
Replace simulation services with actual blockchain connectors:
- Hyperledger Fabric SDK for Node.js
- Corda integration modules
- Web3 provider configuration
- Certificate authority setup

### Infrastructure Requirements
- Kubernetes cluster for microservices
- MongoDB/PostgreSQL for off-chain metadata
- IPFS for photo and document storage
- SMS gateway for low-connectivity support

This implementation provides a comprehensive foundation for the SIH demonstration while being architected for seamless integration with actual blockchain infrastructure in production deployment.