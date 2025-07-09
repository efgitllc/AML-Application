# AML Monitoring System - Frontend

A comprehensive Anti-Money Laundering (AML) monitoring system built with React, TypeScript, and Material-UI.

## 🚀 Features

### Core Functionality
- **Dashboard**: Real-time analytics with interactive charts and metrics
- **Customer Management**: Comprehensive customer profiles with risk assessment
- **Transaction Monitoring**: Advanced transaction analysis and filtering
- **Alert Management**: Intelligent alert handling and investigation workflows
- **Case Management**: Complete case lifecycle management
- **Settings**: System configuration and rule management

### Technical Features
- **TypeScript**: Full type safety with comprehensive type definitions
- **Material-UI v7**: Modern, accessible UI components
- **Responsive Design**: Mobile-first responsive layout
- **Real-time Updates**: Live data refresh capabilities
- **Advanced Filtering**: Multi-criteria search and filtering
- **Data Export**: Export functionality for reports and data
- **Interactive Charts**: Recharts integration for data visualization

## 🏗️ Architecture

### Component Structure
```
src/
├── components/
│   └── layout/
│       └── MainLayout.tsx          # Main application layout
├── pages/
│   ├── Dashboard.tsx               # Analytics dashboard
│   ├── Customers.tsx               # Customer management
│   ├── Transactions.tsx            # Transaction monitoring
│   ├── Alerts.tsx                  # Alert management
│   ├── Cases.tsx                   # Case management
│   └── Settings.tsx                # System settings
├── types/
│   └── index.ts                    # TypeScript type definitions
├── mocks/
│   └── index.ts                    # Mock data for development
└── theme.ts                        # Material-UI theme configuration
```

### Key Components

#### Dashboard
- **MetricCardComponent**: Interactive metric cards with trend indicators
- **RecentAlertsWidget**: Real-time alert notifications
- **TransactionVolumeChart**: Area chart for transaction volume analysis
- **RiskDistributionChart**: Pie chart for risk level distribution
- **TransactionTypesChart**: Bar chart for transaction type analysis
- **SystemHealthWidget**: System status monitoring

#### Customer Management
- **CustomerDetailsDialog**: Comprehensive customer profile viewer
- **Individual/Corporate Customer Support**: Separate handling for different customer types
- **Risk Assessment Integration**: Built-in risk scoring and analysis
- **Transaction History**: Customer-specific transaction tracking
- **Case Association**: Link customers to related cases and alerts

#### Transaction Monitoring
- **TransactionDetailsDialog**: Detailed transaction analysis
- **Advanced Filtering**: Multi-criteria transaction filtering
- **Risk Scoring**: Real-time risk assessment
- **Alert Integration**: Automatic alert generation for suspicious transactions
- **Bulk Operations**: Mass transaction processing capabilities

#### Alert Management
- **AlertDetailsDialog**: Comprehensive alert investigation interface
- **Investigation Workflow**: Structured investigation process
- **Assignment System**: Alert assignment and tracking
- **Status Management**: Complete alert lifecycle management
- **Related Data Linking**: Connect alerts to customers, transactions, and cases

#### Case Management
- **CaseDetailsDialog**: Full case management interface
- **Investigation Notes**: Collaborative investigation documentation
- **Document Management**: Case file and evidence handling
- **Timeline Tracking**: Complete case history and status changes
- **Assignment Workflow**: Case assignment and responsibility tracking

## 🎨 Design System

### Theme
- **Primary Color**: Deep Blue (#1a237e)
- **Secondary Colors**: Material Design color palette
- **Typography**: Roboto font family
- **Spacing**: 8px base unit
- **Breakpoints**: Mobile-first responsive design

### Color Coding
- **Risk Levels**: Green (Low), Orange (Medium), Red (High), Dark Red (Critical)
- **Status Indicators**: Green (Success), Orange (Warning), Red (Error), Gray (Inactive)
- **Transaction Types**: Color-coded by transaction category
- **Alert Severity**: Consistent color scheme across all components

## 📊 Data Management

### Type System
Comprehensive TypeScript interfaces for:
- **User Management**: User, Role, Permission, UserActivity, UserSession
- **Customer Management**: Customer, IndividualCustomer, CorporateCustomer, CustomerReview
- **Transaction Monitoring**: Transaction, TransactionAlert, TransactionPattern, TransactionRule
- **Case Management**: Case, CaseNote, CaseDocument, CaseAssignment, CaseStatusHistory
- **Alert System**: Alert, TransactionAlert, InvestigationNote, StatusHistory
- **Analytics**: DashboardStats, MetricCard, ChartData, SystemHealth

### Mock Data
Extensive mock data covering:
- 50+ customers (individual and corporate)
- 200+ transactions with realistic patterns
- 100+ alerts with various severity levels
- 30+ cases with complete workflows
- User management data
- Risk assessment data
- Analytics and reporting data

## 🔧 Development

### Prerequisites
- Node.js 18+
- npm or yarn
- TypeScript 5+

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Variables
Create a `.env` file with:
```
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_TITLE=AML Monitoring System
```

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- **Mobile**: < 600px
- **Tablet**: 600px - 960px
- **Desktop**: > 960px

All components adapt to different screen sizes with:
- Collapsible navigation on mobile
- Responsive grid layouts
- Touch-friendly interactions
- Optimized data tables

## 🔒 Security Features

- **Type Safety**: Full TypeScript coverage prevents runtime errors
- **Input Validation**: Client-side validation for all forms
- **Secure Routing**: Protected routes and navigation
- **Data Sanitization**: XSS protection for user inputs
- **Session Management**: Secure session handling

## 🧪 Testing

### Test Coverage
- Component unit tests
- Integration tests for workflows
- E2E tests for critical paths
- Accessibility testing
- Performance testing

### Running Tests
```bash
npm run test
```

## 📈 Performance

### Optimization Features
- **Code Splitting**: Lazy loading of route components
- **Bundle Optimization**: Tree shaking and minification
- **Caching**: Efficient data caching strategies
- **Virtual Scrolling**: Large dataset handling
- **Debounced Search**: Optimized search performance

### Performance Metrics
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.5s
- **Cumulative Layout Shift**: < 0.1

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📚 Documentation

### Component Documentation
Each component includes:
- TypeScript interfaces
- Props documentation
- Usage examples
- Accessibility notes

### API Integration
Ready for backend integration with:
- RESTful API endpoints
- WebSocket connections for real-time updates
- Error handling and retry logic
- Loading states and user feedback

## 🤝 Contributing

### Development Guidelines
- Follow TypeScript best practices
- Use Material-UI components consistently
- Maintain responsive design principles
- Write comprehensive tests
- Document new features

### Code Style
- ESLint configuration for consistent code style
- Prettier for code formatting
- Conventional commits for version control
- Component-first architecture

## 📄 License

This project is part of the AML Monitoring System and follows enterprise licensing terms.

## 🔗 Related Projects

- **Backend API**: Django REST API with comprehensive AML models
- **Database**: PostgreSQL with optimized AML data structures
- **Documentation**: Comprehensive system documentation

---

**Built with ❤️ for financial compliance and security**
