# Docdot Lecture Assistant - Setup Guide

## 🚀 Quick Setup

### 1. Database Setup

Run the database migration to create the required tables:

```bash
node setup-database.js
```

This will create the following tables in your Supabase database:
- `lectures` - Core lecture metadata
- `lecture_transcripts` - Raw and processed transcripts
- `lecture_notes` - Live and final notes
- `lecture_processing_logs` - Processing status tracking

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in your project root with:

```env
# Supabase Configuration
SUPABASE_URL=https://jncxejkssgvxhdurmvxy.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key-here
DATABASE_URL=postgresql://postgres:your-password@db.jncxejkssgvxhdurmvxy.supabase.co:5432/postgres

# Gemini AI Configuration
GEMINI_API_KEY=your-gemini-api-key-here

# Server Configuration
NODE_ENV=development
PORT=5000
```

### 4. Start the Application

```bash
npm run dev
```

## 🎯 Features Implemented

### ✅ Core Features
- **Record Tab** - Added to navigation header
- **Lecture Recording UI** - Complete interface for recording lectures
- **Real-time Simulation** - Live transcript and notes generation
- **Database Schema** - Complete PostgreSQL schema with RLS policies
- **Backend API** - Full REST API for lecture management
- **Gemini AI Integration** - AI-powered note generation and summarization

### 🔄 AI Processing Pipeline
1. **Transcription** - Mixed language detection and translation
2. **Live Notes** - Real-time note generation during recording
3. **Comprehensive Summary** - Post-lecture AI processing
4. **Exam Questions** - Auto-generated practice questions
5. **Research Context** - Additional medical context and research

### 📊 Database Tables

#### `lectures`
- Core lecture metadata (title, module, topic, lecturer)
- Recording status and duration
- Audio file storage

#### `lecture_transcripts`
- Raw transcript (mixed languages)
- Unified English transcript
- Language detection and confidence scores

#### `lecture_notes`
- Live notes (generated during recording)
- Final notes (post-processing)
- Key points, medical terms, research context
- Processing status tracking

#### `lecture_processing_logs`
- Step-by-step processing tracking
- Error logging and debugging
- Performance metrics

## 🔧 API Endpoints

### Lecture Management
- `POST /api/lectures/start-recording` - Start a new lecture recording
- `POST /api/lectures/:id/stop-recording` - Stop recording and trigger AI processing
- `GET /api/lectures/:userId` - Get user's lectures with filtering
- `DELETE /api/lectures/:id` - Delete a lecture and all related data

### Transcripts & Notes
- `GET /api/lectures/:id/transcript` - Get lecture transcript
- `GET /api/lectures/:id/notes` - Get lecture notes
- `POST /api/lectures/generate-live-notes` - Generate live notes from transcript

### Processing Status
- `GET /api/lectures/:id/processing-status` - Get AI processing status and logs

## 🎨 Frontend Components

### Record Page (`/record`)
- **Recording Controls** - Start, pause, stop recording
- **Metadata Form** - Lecture title, module, topic, lecturer
- **Live Transcript** - Real-time transcript display
- **Live Notes** - AI-generated notes during recording
- **History Tab** - View and manage past lectures

### Navigation Integration
- Added "Record" tab to main navigation
- Integrated with existing Docdot UI components

## 🔒 Security Features

### Row Level Security (RLS)
- Users can only access their own lectures
- Automatic data isolation by user ID
- Secure API endpoints with authentication

### Data Protection
- Cascade deletion for related records
- Proper error handling and logging
- Input validation and sanitization

## 🚀 Next Steps

### Phase 1: Real Audio Processing
- Integrate actual Speech-to-Text service
- Implement audio file upload and storage
- Add WebSocket support for real-time streaming

### Phase 2: Advanced AI Features
- Custom prompt engineering for medical content
- Integration with medical knowledge bases
- Advanced summarization and research capabilities

### Phase 3: Enhanced UI/UX
- Audio playback with transcript synchronization
- Advanced search and filtering
- Export functionality (PDF, Word, etc.)

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify your Supabase credentials
   - Check if the database is accessible
   - Ensure RLS policies are properly set

2. **Gemini AI Error**
   - Verify your GEMINI_API_KEY is set
   - Check API quota and limits
   - Review error logs for specific issues

3. **Recording Not Working**
   - Check browser permissions for microphone
   - Verify HTTPS connection (required for media access)
   - Test with different browsers

### Debug Mode
Enable debug logging by setting:
```env
NODE_ENV=development
DEBUG=lecture:*
```

## 📞 Support

For issues or questions:
1. Check the console logs for error messages
2. Review the processing logs in the database
3. Test individual API endpoints with Postman/curl
4. Verify all environment variables are set correctly

## 🎉 Success!

Once everything is set up, you should be able to:
1. Navigate to the Record tab
2. Fill in lecture information
3. Start recording (simulation mode)
4. See live transcript and notes generation
5. View processed lectures in the history tab

The system is now ready for real-world testing and further development!
