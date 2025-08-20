# Garun System - Frontend

A modern, responsive government grievance management system built with React JSX and Tailwind CSS.

## ⚡ Quickstart

1. Install Node.js 16+.
2. In a terminal, run:

```powershell
cd frontend
npm install
npm start
```

Then open http://localhost:3000

Test emails: `admin@gmail.com`, `incharge@gmail.com`, `user@gmail.com` (any password)

## 🚀 Features

### Authentication System
- **Login**: Restricted to three authorized email addresses:
  - `user@gmail.com` (Citizen)
  - `admin@gmail.com` (Administrator)
  - `incharge@gmail.com` (Department Incharge)
- **Signup**: Open for citizens with comprehensive registration form
- **Role-based Access Control**: Different dashboards for different user types

### Citizen Dashboard
- **5 Major Functionalities**:
  1. **Register Your Complaint**: Photo/video upload, location tagging, category selection
  2. **Track Complaint Status**: Real-time progress monitoring
  3. **Verify Property Documents**: Document verification with officials
  4. **Apply for Building Approval**: Building plan submission
  5. **Direct Communication**: Chat with officials
  6. **Anonymous Complaints**: Submit sensitive issues anonymously

### Admin Dashboard
- **System Overview**: Comprehensive statistics and monitoring
- **Department Performance**: Track all departments' efficiency
- **Priority Alerts**: SLA breaches and urgent notifications
- **User Management**: Add, edit, or remove system users
- **Analytics**: Detailed system performance reports

### Incharge Dashboard
- **Team Management**: Monitor team members and performance
- **SLA Monitoring**: Track compliance and deadlines
- **Complaint Assignment**: Distribute work among team members
- **Performance Metrics**: Individual and team performance tracking

### Profile Management
- **Comprehensive Profile**: All registration details editable
- **Account Security**: Password and 2FA management
- **Preferences**: Language, notifications, and privacy settings

## 🛠️ Technology Stack

- **Frontend Framework**: React 18.2.0
- **Styling**: Tailwind CSS 3.3.0
- **Routing**: React Router DOM 6.8.1
- **Icons**: Lucide React
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast
- **Date Handling**: Date-fns

## 📁 Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── Login.js
│   │   │   ├── Signup.js
│   │   │   └── ProtectedRoute.js
│   │   ├── dashboards/
│   │   │   ├── CitizenDashboard.js
│   │   │   ├── AdminDashboard.js
│   │   │   └── InchargeDashboard.js
│   │   └── profile/
│   │       └── Profile.js
│   ├── contexts/
│   │   └── AuthContext.js
│   ├── App.js
│   ├── index.js
│   └── index.css
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Open your browser** and navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## 🔐 Login Credentials

### Test Accounts

| Email | Role | Password | Dashboard |
|-------|------|----------|-----------|
| `user@gmail.com` | Citizen | Any password | Citizen Dashboard |
| `admin@gmail.com` | Administrator | Any password | Admin Panel |
| `incharge@gmail.com` | Department Incharge | Any password | Incharge Dashboard |

**Note**: This is a frontend-only demo. In production, proper authentication would be implemented.

## 🎨 Design Features

- **Government-Style Design**: Professional, trustworthy appearance
- **Responsive Layout**: Works on all device sizes
- **Light Theme**: Clean, modern interface
- **Accessibility**: Proper contrast and readable fonts
- **Interactive Elements**: Hover effects and smooth transitions

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Tablet Support**: Responsive grid layouts
- **Desktop Experience**: Full-featured desktop interface
- **Touch Friendly**: Large touch targets for mobile users

## 🔧 Customization

### Colors
The color scheme can be customized in `tailwind.config.js`:
- Primary colors (blues)
- Secondary colors (grays)
- Success colors (greens)
- Warning colors (yellows)
- Danger colors (reds)

### Components
All components use Tailwind CSS utility classes and custom component classes defined in `src/index.css`.

## 📊 Key Features

### Complaint Management
- **Unique ID Generation**: Automatic complaint tracking
- **Multi-Channel Intake**: Web, mobile, call center support
- **Geo-Tagging**: Location-based complaint mapping
- **Category Selection**: Organized complaint types
- **Document Upload**: Photo, video, and PDF support

### Case Tracking
- **Status Updates**: New → In-progress → Resolved → Closed
- **SLA Timers**: Deadline monitoring and alerts
- **Escalation System**: Automatic escalation for SLA breaches
- **Audit Trail**: Complete action history

### Communication
- **Two-Way Chat**: Citizen-official communication
- **Acknowledgements**: Auto-generated receipts
- **Feedback System**: Satisfaction ratings
- **Notifications**: SMS and email updates

## 🚧 Future Enhancements

- **Real-time Chat**: WebSocket-based messaging
- **File Upload**: Cloud storage integration
- **Push Notifications**: Browser and mobile notifications
- **Offline Support**: Service worker implementation
- **Multi-language**: Internationalization support
- **Advanced Analytics**: Charts and reporting tools

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is developed for government use and follows government design guidelines.

## 🆘 Support

For technical support or questions, please contact the development team.

---

**Built with ❤️ for better government services**
