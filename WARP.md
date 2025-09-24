# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

AyurTrace is a comprehensive blockchain-based distributed application for end-to-end traceability of Ayurvedic herbs. It simulates a permissioned network with role-based access control, smart contracts, and consumer verification systems.

## Development Commands

### Core Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

### Database Commands
```bash
# Seed database with demo data
npm run db:seed

# Reset database (clear and reseed)
npm run db:reset
```

### Development Server
The development server runs on Vite and supports hot module replacement. Access at `http://localhost:5173` by default.

**Note**: The application requires MongoDB running on `localhost:27017` by default. Configure connection in `.env` file.

## Architecture Overview

### Context-Based State Management
The application uses React Context for state management with two primary contexts:
- **AuthContext** (`src/context/AuthContext.tsx`): Handles user authentication and role-based permissions
- **BlockchainContext** (`src/context/BlockchainContext.tsx`): Manages blockchain operations, smart contract validations, and data flow

### Role-Based Dashboard System
The main application renders different dashboards based on user roles:
- **Farmer Dashboard**: GPS-enabled harvest collection with smart contract validation
- **Processor Dashboard**: Multi-step processing workflow with parameter tracking  
- **Lab Dashboard**: Quality assurance testing with certificate generation
- **Manufacturer Dashboard**: Final product QR code generation and batch management
- **Consumer Portal**: QR scanning, provenance visualization, and certificate verification

### Smart Contract Simulation
The `SmartContractService` (`src/services/SmartContractService.ts`) enforces business rules:
- **Geo-fencing**: GPS-based harvesting zone validation
- **Seasonal Controls**: Time-based harvesting restrictions  
- **Conservation Limits**: Sustainable yield management
- **Quality Thresholds**: Automated quality gate enforcement

### Data Models (FHIR-Compliant)
Key blockchain data structures in `src/types/blockchain.ts`:
- **CollectionEvent**: Harvest data with GPS coordinates and quality metrics
- **ProcessingStep**: Manufacturing steps with parameters and timestamps
- **QualityTest**: Lab results with certificate hashes and compliance status
- **Provenance**: Complete chain of custody with sustainability proofs

### MongoDB Integration
The application uses MongoDB for persistent data storage with Mongoose ODM:
- **Database Configuration**: Connection managed via `src/config/database.ts`
- **Models**: Mongoose schemas in `src/models/` directory
- **Service Layer**: Database operations abstracted through `src/services/DatabaseService.ts`
- **Seeding**: Demo data can be populated using `npm run db:seed`
- **Environment**: Configure database URI in `.env` file

## Key Service Architecture

### Blockchain Services Layer
- **BlockchainService**: Core blockchain transaction logging and hash generation
- **SmartContractService**: Rule validation and conservation status monitoring
- **BlockchainAPI**: Interface for blockchain network operations
- **DatabaseService**: MongoDB operations and data persistence
- **AnalyticsService**: Data aggregation and reporting
- **NotificationService**: Real-time alerts and compliance notifications

### Utility Services
- **QRCodeService**: QR code generation and validation
- **MobileGeoService**: GPS integration and location accuracy
- **geoValidation**: Geographic boundary and zone validation utilities

## Component Architecture

### Reusable UI Components
- **AnimatedCard**: Base card component with hover animations
- **LoadingSpinner**: Loading states for async operations
- **Toast**: Notification system with auto-dismiss
- **PulsingDot**: Status indicators for network/blockchain state

### Mobile-First Data Capture
- **MobileDataCapture**: GPS-enabled field data collection
- **QRScanner**: Camera-enabled QR scanning with validation
- **InteractiveMap**: Geospatial visualization for harvest locations

### Specialized Components
- **ProvenanceViewer**: Complete supply chain journey visualization
- **ConservationTracker**: Real-time sustainability monitoring
- **ComplianceReporter**: Regulatory compliance dashboard
- **BlockchainVisualizer**: Network status and transaction visualization

## Development Patterns

### Mock Authentication System
The app uses a mock authentication system with predefined users for different organization roles. Select any organization during login to access role-specific features.

Demo credentials:
- Rajasthan Farmer Cooperative (Farmer role)
- Ayur Processing Ltd. (Processor role)  
- BioTest Laboratories (Lab Technician role)
- HerbalLife Manufacturing (Manufacturer role)

### Smart Contract Integration Points
All blockchain operations are validated against smart contract rules before submission. The validation system checks:
- Geographic boundaries for harvesting locations
- Seasonal restrictions based on calendar dates
- Conservation limits to prevent over-harvesting
- Quality thresholds for moisture and visual assessment

### Blockchain Transaction Logging
Every significant action triggers a blockchain transaction log with:
- Unique transaction ID and hash
- Block height simulation
- Timestamp and data payload
- Digital signature simulation

## Styling and UI Framework

### Tailwind CSS Configuration
- Uses custom gradient backgrounds and animations
- Mobile-first responsive design approach
- Custom CSS animations in `src/index.css` for enhanced UX
- Component-level styling with Tailwind utility classes

### Animation System
The app includes extensive CSS animations:
- Hover effects with scale and translate transforms
- Ripple effects on interactive elements
- Fade-in animations for page transitions
- Magnetic button effects for enhanced interactivity

## Production Deployment Notes

### Blockchain Integration
The current implementation uses simulated blockchain services. For production:
- Replace `BlockchainService` with actual Hyperledger Fabric SDK
- Implement Web3 wallet integration
- Configure certificate authority for digital signatures
- Set up IPFS for photo and document storage

### API Endpoints Structure
The application is architected with clear API endpoint definitions (documented in README.md) for:
- Collection event submission
- Processing step tracking
- Quality test results
- Batch history retrieval
- Network status monitoring

### Environment Requirements
- Node.js environment with ES modules support
- TypeScript compilation with strict mode enabled
- MongoDB 4.4+ running locally or accessible via connection string
- Modern browser with ES2020+ support for optimal performance

### Database Setup
1. Install and start MongoDB locally
2. Copy `.env.example` to `.env` and configure `MONGODB_URI`
3. Run `npm run db:seed` to populate with demo data
4. Access collections: organizations, users, collectionevents, processingsteps, qualitytests, provenances, smartcontractrules
