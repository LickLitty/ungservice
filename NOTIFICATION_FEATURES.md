# Notification and Rating System Features

## Overview
This document describes the notification system and rating features implemented in the UngService application.

## Notification System

### Features
- **Real-time notifications**: Users receive instant notifications for important events
- **Push notifications**: Browser-based push notifications for desktop and mobile
- **In-app notifications**: Notification dropdown in the navbar with unread count
- **Notification management**: Mark as read, mark all as read functionality

### Notification Types
1. **New Messages** (`new-message`)
   - Triggered when someone sends a message
   - Shows sender name and message preview

2. **Job Applications** (`job-request`)
   - Triggered when someone applies for your job
   - Shows applicant name and job title

3. **Application Status** (`application-accepted`, `application-rejected`)
   - Triggered when your job application is accepted or rejected
   - Shows job title and status

4. **Job Reminders** (`job-reminder`)
   - Triggered 1 hour before a job starts
   - Shows job title and start time

### Implementation
- **NotificationService**: Handles creating and managing notifications
- **NotificationContext**: Global state management for notifications
- **NotificationDropdown**: UI component for displaying notifications
- **Firebase Integration**: Real-time notifications using Firestore

## Rating and Review System

### Features
- **5-star rating system**: Users can rate each other from 1-5 stars
- **Review comments**: Detailed feedback with minimum 10 characters
- **Rating statistics**: Average rating, total reviews, rating distribution
- **User profiles**: Comprehensive profiles showing ratings and reviews
- **Automatic rating updates**: User ratings update automatically when new reviews are added

### Review Process
1. **Job completion**: Reviews can only be submitted after job completion
2. **Bidirectional reviews**: Both employer and worker can review each other
3. **One review per job**: Users can only review each other once per job
4. **Rating calculation**: Average rating calculated automatically

### Implementation
- **ReviewService**: Handles creating and managing reviews
- **ReviewForm**: UI component for submitting reviews
- **UserProfile**: Displays user ratings, reviews, and statistics
- **JobCard**: Shows employer ratings on job listings

## User Profile System

### Features
- **Comprehensive profiles**: Shows user information, ratings, and history
- **Rating display**: Visual star ratings with average scores
- **Review history**: Complete list of reviews received
- **Job history**: List of completed jobs
- **Statistics**: Rating distribution and completion statistics

### Profile Sections
1. **Overview**: Summary of ratings and recent activity
2. **Reviews**: Complete list of reviews with comments
3. **Jobs**: History of completed jobs

## Job Application System

### Features
- **Application tracking**: Real-time status updates for job applications
- **Notification integration**: Automatic notifications for application events
- **Status management**: Pending, accepted, rejected statuses
- **Duplicate prevention**: Users can only apply once per job

### Application Flow
1. **Apply**: Worker submits application
2. **Notification**: Employer receives notification
3. **Review**: Employer reviews application
4. **Decision**: Accept or reject application
5. **Notification**: Worker receives status update

## Technical Implementation

### Services
- `NotificationService`: Handles all notification operations
- `ReviewService`: Manages reviews and ratings
- `JobService`: Handles job applications and status updates

### Components
- `NotificationDropdown`: Notification UI in navbar
- `UserProfile`: User profile display
- `ReviewForm`: Review submission form
- `NotificationSettingsPage`: Notification preferences

### Context Providers
- `NotificationProvider`: Global notification state
- `AuthProvider`: User authentication state

### Database Structure
- `notifications`: Collection for user notifications
- `reviews`: Collection for user reviews
- `jobApplications`: Collection for job applications
- `users`: Updated with rating and completed jobs count

## Usage

### For Users
1. **Enable notifications**: Go to notification settings and enable push notifications
2. **View notifications**: Click the bell icon in the navbar
3. **Check profiles**: Click on user names to view their profiles
4. **Leave reviews**: After job completion, leave reviews for other users
5. **Track applications**: Monitor job application status in real-time

### For Developers
1. **Add new notification types**: Extend the Notification type in types/index.ts
2. **Create notifications**: Use NotificationService.createNotification()
3. **Subscribe to notifications**: Use NotificationService.subscribeToNotifications()
4. **Handle reviews**: Use ReviewService for all review operations
5. **Update user ratings**: Call ReviewService.updateUserRating() after new reviews

## Future Enhancements
- Email notifications
- SMS notifications
- Notification preferences per type
- Review response system
- Rating verification system
- Advanced filtering and search for reviews 