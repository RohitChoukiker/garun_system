# Garun System Backend

This is the FastAPI backend for the Garun System, providing APIs for complaint management, property verification, building approval, and admin dashboard functionality.

## Features

- **Complaint Management**: Register, track, and manage citizen complaints
- **Property Verification**: Submit and verify property documents
- **Building Approval**: Apply for and manage building construction permissions
- **Admin Dashboard**: Comprehensive admin interface for managing all requests
- **File Upload**: Handle photo, video, and document uploads
- **Status Tracking**: Real-time status updates and progress tracking

## API Endpoints

### Complaints
- `POST /api/complaints/register` - Register a new complaint
- `GET /api/complaints/track/{complaint_id}` - Track complaint status
- `GET /api/complaints/user/{user_id}` - Get user's complaints
- `GET /api/complaints/all` - Get all complaints (admin)
- `PUT /api/complaints/{complaint_id}/status` - Update complaint status

### Property Verification
- `POST /api/property/verify` - Submit property documents for verification
- `GET /api/property/verifications/all` - Get all verifications (admin)
- `PUT /api/property/verifications/{ticket_id}/verify` - Verify documents

### Building Approval
- `POST /api/building/approval` - Submit building approval application
- `GET /api/building/approvals/all` - Get all approvals (admin)
- `PUT /api/building/approvals/{ticket_id}/approve` - Approve/reject application

### Admin Dashboard
- `GET /api/admin/dashboard` - Get comprehensive admin data

### Utility
- `GET /uploads/{file_path}` - Download uploaded files
- `GET /health` - Health check endpoint

## Setup Instructions

1. **Install Python Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the Server**
   ```bash
   python main.py
   ```
   Or using uvicorn directly:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

3. **Access the API**
   - API Base URL: `http://localhost:8000`
   - Interactive API Docs: `http://localhost:8000/docs`
   - Alternative API Docs: `http://localhost:8000/redoc`

## File Structure

```
backend/
├── main.py              # Main FastAPI application
├── requirements.txt     # Python dependencies
├── README.md           # This file
└── uploads/            # File upload directory (created automatically)
    ├── complaints/     # Complaint-related files
    ├── property/       # Property verification files
    ├── building/       # Building approval files
    └── admin/          # Admin-related files
```

## Data Storage

Currently, the backend uses in-memory storage for demonstration purposes. In production, you should:

1. Use a proper database (PostgreSQL, MySQL, etc.)
2. Implement proper authentication and authorization
3. Add data validation and sanitization
4. Implement proper error handling and logging
5. Add rate limiting and security measures

## CORS Configuration

The backend is configured to allow CORS from all origins for development. In production, restrict this to your frontend domain:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## File Upload

The backend handles various file types:
- **Photos**: JPG, PNG, JPEG
- **Videos**: MP4, AVI, MOV
- **Documents**: PDF, DOC, DOCX

Files are stored locally in the `uploads/` directory with unique filenames to prevent conflicts.

## Status Workflow

### Complaints
1. **New** → **Under Review** → **In Progress** → **Resolved** → **Closed**

### Property Verification
1. **Pending** → **Under Review** → **Verified/Rejected**

### Building Approval
1. **Pending** → **Under Review** → **Approved/Rejected**

## Error Handling

The API returns appropriate HTTP status codes:
- `200` - Success
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

## Development Notes

- The backend generates unique IDs for all requests
- File uploads are handled asynchronously
- All timestamps are in ISO format
- The admin dashboard provides real-time statistics
- Mock data is included for demonstration purposes

## Production Considerations

1. **Database**: Replace in-memory storage with a proper database
2. **Authentication**: Implement JWT or session-based authentication
3. **File Storage**: Use cloud storage (AWS S3, Google Cloud Storage) instead of local storage
4. **Security**: Add input validation, rate limiting, and security headers
5. **Monitoring**: Add logging, metrics, and health checks
6. **Backup**: Implement data backup and recovery procedures
