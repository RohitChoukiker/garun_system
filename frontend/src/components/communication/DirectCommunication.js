import React, { useState, useContext, useEffect, useRef } from 'react';
import { Send, MessageSquare, User, Phone, Mail, Clock, AlertCircle } from 'lucide-react';
import AuthContext from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const DirectCommunication = () => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [officials, setOfficials] = useState([]);
  const messagesEndRef = useRef(null);

  const departments = [
    'Municipal Corporation',
    'Road Maintenance',
    'Sanitation Department',
    'Water Supply',
    'Building Authority',
    'Traffic Police',
    'General Complaints'
  ];

  // Mock officials data
  const mockOfficials = {
    'Municipal Corporation': [
      { id: 1, name: 'Mr. Sharma', designation: 'Municipal Commissioner', status: 'online', lastSeen: '2 min ago' },
      { id: 2, name: 'Mrs. Patel', designation: 'Deputy Commissioner', status: 'online', lastSeen: '5 min ago' }
    ],
    'Road Maintenance': [
      { id: 3, name: 'Mr. Kumar', designation: 'Road Engineer', status: 'online', lastSeen: '1 min ago' },
      { id: 4, name: 'Mr. Singh', designation: 'Supervisor', status: 'offline', lastSeen: '2 hours ago' }
    ],
    'Sanitation Department': [
      { id: 5, name: 'Mrs. Gupta', designation: 'Sanitation Officer', status: 'online', lastSeen: '3 min ago' }
    ],
    'Water Supply': [
      { id: 6, name: 'Mr. Verma', designation: 'Water Engineer', status: 'offline', lastSeen: '1 hour ago' }
    ],
    'Building Authority': [
      { id: 7, name: 'Mr. Joshi', designation: 'Building Inspector', status: 'online', lastSeen: '10 min ago' }
    ],
    'Traffic Police': [
      { id: 8, name: 'Mr. Tiwari', designation: 'Traffic Inspector', status: 'online', lastSeen: '5 min ago' }
    ],
    'General Complaints': [
      { id: 9, name: 'Mrs. Reddy', designation: 'Public Relations Officer', status: 'online', lastSeen: '1 min ago' }
    ]
  };

  useEffect(() => {
    if (selectedDepartment) {
      setOfficials(mockOfficials[selectedDepartment] || []);
      // Load chat history for selected department
      loadChatHistory();
    }
  }, [selectedDepartment]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = () => {
    // Mock chat history - in real app this would come from API
    const mockHistory = [
      {
        id: 1,
        sender: 'official',
        name: 'Mr. Sharma',
        message: 'Hello! How can I help you today?',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        department: selectedDepartment
      },
      {
        id: 2,
        sender: 'user',
        name: user?.name || 'Citizen',
        message: 'I have a complaint about road conditions in my area.',
        timestamp: new Date(Date.now() - 240000).toISOString(),
        department: selectedDepartment
      },
      {
        id: 3,
        sender: 'official',
        name: 'Mr. Sharma',
        message: 'I understand your concern. Could you please provide more details about the location and specific issues?',
        timestamp: new Date(Date.now() - 180000).toISOString(),
        department: selectedDepartment
      }
    ];
    setMessages(mockHistory);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      sender: 'user',
      name: user?.name || 'Citizen',
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      department: selectedDepartment
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate official response
    setTimeout(() => {
      const officialResponse = {
        id: Date.now() + 1,
        sender: 'official',
        name: officials[0]?.name || 'Official',
        message: 'Thank you for your message. I will look into this matter and get back to you shortly.',
        timestamp: new Date().toISOString(),
        department: selectedDepartment
      };
      setMessages(prev => [...prev, officialResponse]);
    }, 2000);

    toast.success('Message sent successfully!');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const connectToDepartment = (department) => {
    setSelectedDepartment(department);
    setIsConnected(true);
    toast.success(`Connected to ${department}`);
  };

  const disconnect = () => {
    setSelectedDepartment('');
    setIsConnected(false);
    setMessages([]);
    setOfficials([]);
    toast.success('Disconnected from chat');
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Direct Communication</h1>
          <p className="text-gray-600">Chat directly with government officials and get real-time updates</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Department Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Department</h3>
              
              {!isConnected ? (
                <div className="space-y-3">
                  {departments.map((dept) => (
                    <button
                      key={dept}
                      onClick={() => connectToDepartment(dept)}
                      className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{dept}</span>
                        <MessageSquare className="h-5 w-5 text-primary-600" />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">Connected to:</h4>
                    <button
                      onClick={disconnect}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Disconnect
                    </button>
                  </div>
                  <div className="p-3 bg-primary-50 rounded-lg">
                    <p className="font-medium text-primary-900">{selectedDepartment}</p>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-900 mb-3">Available Officials:</h5>
                    <div className="space-y-2">
                      {officials.map((official) => (
                        <div key={official.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className={`w-3 h-3 rounded-full ${
                            official.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{official.name}</p>
                            <p className="text-sm text-gray-600">{official.designation}</p>
                          </div>
                          <span className="text-xs text-gray-500">{official.lastSeen}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg h-[600px] flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {isConnected ? `Chat with ${selectedDepartment}` : 'Select a department to start chatting'}
                    </h3>
                    {isConnected && (
                      <p className="text-sm text-gray-600">
                        {officials.filter(o => o.status === 'online').length} official(s) online
                      </p>
                    )}
                  </div>
                  {isConnected && (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600">Connected</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {!isConnected ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <MessageSquare className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                      <p className="text-gray-500">Select a department to start chatting with officials</p>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <MessageSquare className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                      <p className="text-gray-500">No messages yet. Start the conversation!</p>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs font-medium opacity-75">
                            {message.name}
                          </span>
                          <span className="text-xs opacity-75">
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm">{message.message}</p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              {isConnected && (
                <div className="p-4 border-t border-gray-200">
                  <div className="flex space-x-3">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message here..."
                      rows={2}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <Send className="h-4 w-4" />
                      <span>Send</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why Use Direct Communication?</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Real-time Updates</h4>
              <p className="text-gray-600">Get instant responses and real-time updates on your complaints and queries</p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <User className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Direct Access</h4>
              <p className="text-gray-600">Connect directly with the officials responsible for your area and issues</p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Quick Resolution</h4>
              <p className="text-gray-600">Faster problem resolution through direct communication and immediate feedback</p>
            </div>
          </div>
        </div>

        {/* Guidelines */}
        <div className="mt-8 bg-yellow-50 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-6 w-6 text-yellow-600 mt-1" />
            <div>
              <h4 className="font-medium text-yellow-900 mb-2">Chat Guidelines</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Be respectful and professional in your communication</li>
                <li>• Provide clear and specific information about your issue</li>
                <li>• Officials are available during working hours (9 AM - 6 PM)</li>
                <li>• For urgent matters, use the emergency contact numbers</li>
                <li>• Keep the conversation focused on your specific issue</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectCommunication;
