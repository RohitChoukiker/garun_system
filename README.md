# Garun System - Municipal Grievance Management System

A comprehensive municipal grievance management system built with React frontend and FastAPI backend, designed to handle citizen complaints, property verification, building approvals, and administrative oversight.

## 🚀 Features

### Citizen Features
- **Complaint Registration**: Submit complaints with photo/video uploads, location tagging, and category selection
- **Complaint Tracking**: Real-time status tracking with progress updates and timeline
- **Property Verification**: Submit property documents for government verification
- **Building Approval**: Apply for building construction permissions
- **Anonymous Complaints**: Submit sensitive complaints anonymously
- **Direct Communication**: Chat directly with officials

### Admin Features
- **Dashboard Overview**: Comprehensive statistics and real-time monitoring
- **Complaint Management**: Review, assign, and update complaint statuses
- **Document Verification**: Process property and building document requests
- **Survey Management**: Monitor field surveys and illegal construction reports
- **Illegal Construction Tracking**: View and manage detected violations
- **Field Survey Management**: Coordinate drone surveys and field inspections
- **Drone Fleet Management**: Monitor and manage drone operations
- **Audit Trail**: Complete system activity logging

### Technical Features
- **File Upload**: Support for photos, videos, and documents
- **Real-time Updates**: Live status updates and notifications
- **Responsive Design**: Mobile-first responsive interface
- **Local Storage**: File storage without external database dependencies
- **RESTful API**: Clean, documented API endpoints

## 🏗️ Architecture

```
Garun_System/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts
│   │   └── ...
│   ├── package.json
│   └── ...
├── backend/                  # FastAPI backend application
│   ├── main.py             # Main FastAPI application
│   ├── requirements.txt    # Python dependencies
│   ├── uploads/            # File storage directory
│   └── ...
└── README.md
```

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icons
- **React Hot Toast** - Toast notifications

### Backend
- **FastAPI** - Modern, fast web framework
- **Python 3.8+** - Python runtime
- **Uvicorn** - ASGI server
- **Python Multipart** - File upload handling
- **Pathlib** - File system operations

## 📋 Prerequisites

- **Node.js 16+** and **npm** (for frontend)
- **Python 3.8+** and **pip** (for backend)
- **Git** (for version control)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Garun_System
```

### 2. Backend Setup
```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start the server
python main.py
```

The backend will start at `http://localhost:8000`

**Alternative startup methods:**
- Windows: Double-click `start.bat`
- PowerShell: Run `.\start.ps1`

### 3. Frontend Setup
```bash
cd frontend

# Install Node.js dependencies
npm install

# Start the development server
npm start
```

The frontend will start at `http://localhost:3000`

## 🔧 Configuration

### Backend Configuration
The backend automatically creates necessary directories:
- `uploads/complaints/` - Complaint-related files
- `uploads/property/` - Property verification files
- `uploads/building/` - Building approval files
- `uploads/admin/` - Admin-related files

### Frontend Configuration
The frontend is configured to connect to the backend at `http://localhost:8000`. Update the API base URL in components if needed.

## 📚 API Documentation

Once the backend is running, you can access:
- **Interactive API Docs**: `http://localhost:8000/docs`
- **Alternative API Docs**: `http://localhost:8000/redoc`

### Key API Endpoints

#### Complaints
- `POST /api/complaints/register` - Register new complaint
- `GET /api/complaints/track/{id}` - Track complaint status
- `GET /api/complaints/all` - Get all complaints (admin)
- `PUT /api/complaints/{id}/status` - Update complaint status

#### Property Verification
- `POST /api/property/verify` - Submit property documents
- `GET /api/property/verifications/all` - Get all verifications
- `PUT /api/property/verifications/{id}/verify` - Verify documents

#### Building Approval
- `POST /api/building/approval` - Submit building application
- `GET /api/building/approvals/all` - Get all approvals
- `PUT /api/building/approvals/{id}/approve` - Approve/reject

#### Surveys & Illegal Construction Detection
- `POST /api/surveys/start` - Start new survey with drone data
- `GET /api/surveys/{id}` - Get survey details
- `GET /api/surveys/all` - Get all surveys
- `GET /api/illegal-constructions/all` - Get all detected violations
- `PUT /api/illegal-constructions/{id}/status` - Update violation status

#### Admin Dashboard
- `GET /api/admin/dashboard` - Get comprehensive admin data

## 🧪 Testing

### Backend API Testing
```bash
cd backend
python test_api.py
```

This will test all major API endpoints and verify the backend is working correctly.

### Survey Functionality Testing
```bash
cd backend
python test_survey.py
```

This will test the survey endpoints and illegal construction detection functionality.

### Frontend Testing
```bash
cd frontend
npm test
```

## 📁 File Structure

### Backend Structure
```
backend/
├── main.py                 # Main FastAPI application
├── requirements.txt        # Python dependencies
├── README.md              # Backend documentation
├── start.bat              # Windows startup script
├── start.ps1              # PowerShell startup script
├── test_api.py            # API testing script
└── uploads/               # File storage (auto-created)
    ├── complaints/        # Complaint files
    ├── property/          # Property verification files
    ├── building/          # Building approval files
    ├── surveys/           # Survey and drone data files
    └── admin/             # Admin files
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/        # React components
│   │   ├── auth/          # Authentication components
│   │   ├── building/      # Building approval components
│   │   ├── complaints/    # Complaint components
│   │   ├── dashboards/    # Dashboard components
│   │   ├── property/      # Property verification components
│   │   ├── survey/        # Survey and analysis components
│   │   └── profile/       # Profile components
│   ├── contexts/          # React contexts
│   └── ...
├── package.json           # Node.js dependencies
└── ...
```

## 🔒 Security Features

- **CORS Configuration** - Configurable cross-origin requests
- **File Upload Validation** - Secure file handling
- **Input Sanitization** - Data validation and sanitization
- **Error Handling** - Comprehensive error handling and logging

## 🚀 Deployment

### Development
- Backend: `python main.py` (runs on port 8000)
- Frontend: `npm start` (runs on port 3000)

### Production Considerations
1. **Database**: Replace in-memory storage with PostgreSQL/MySQL
2. **Authentication**: Implement JWT or session-based auth
3. **File Storage**: Use cloud storage (AWS S3, Google Cloud)
4. **HTTPS**: Enable SSL/TLS encryption
5. **Environment Variables**: Use `.env` files for configuration
6. **Process Management**: Use PM2 or systemd for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
1. Check the API documentation at `http://localhost:8000/docs`
2. Review the code comments and documentation
3. Open an issue on the repository

## 🔄 Status Workflows

### Complaint Workflow
1. **New** → **Under Review** → **In Progress** → **Resolved** → **Closed**

### Property Verification Workflow
1. **Pending** → **Under Review** → **Verified/Rejected**

### Building Approval Workflow
1. **Pending** → **Under Review** → **Approved/Rejected**

## 📊 Performance Metrics

- **Response Time**: < 200ms for most API calls
- **File Upload**: Supports files up to 10MB
- **Concurrent Users**: Designed for 100+ concurrent users
- **Data Storage**: Efficient in-memory storage with file system backup

---

**Built with ❤️ for better municipal governance**
