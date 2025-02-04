# UniP-Forums

A modern university forum platform built with Node.js, Express, and EJS templating engine. The platform provides a space for university students and staff to engage in discussions, share knowledge, and build community.

## Features

- **User Management**
  - User registration and authentication
  - Role-based access control (Admin, Moderator, User)
  - User profile management
  - User invitation system

- **Forum Structure**
  - Multiple forum categories
  - Thread management
  - Sticky threads
  - Thread status (Open/Closed)
  - Post editing and deletion

- **Moderation Tools**
  - Content reporting system
  - Report management interface
  - User activity monitoring
  - Content moderation actions

- **Admin Features**
  - Forum category management
  - User role management
  - System-wide announcements
  - User data export

## Tech Stack

- **Backend**: Node.js, Express
- **View Engine**: EJS
- **Database**: PostgreSQL
- **Frontend**: Bootstrap 5, Custom CSS
- **Icons**: Bootstrap Icons

## Project Structure

```
UniP-Forums/
├── config/         # Configuration files
├── middleware/     # Express middleware
├── models/         # Data models
├── public/         # Static assets
│   ├── css/       # Stylesheets
│   └── js/        # Client-side JavaScript
├── routes/        # Route handlers
├── views/         # EJS templates
└── app.js         # Application entry point
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in `.env`
4. Start the server:
   - For production:
     ```bash
     npm start
     ```
   - For development (with auto-reload):
     ```bash
     npm run dev
     ```

## TODO List

### User Management
- [ ] Implement user edit functionality in `users.js`
- [ ] Add password reset functionality
- [ ] Implement user profile customization
- [ ] Add email verification for new registrations
- [ ] Implement user activity tracking

### Forum Features
- [ ] Add rich text editor for posts
- [ ] Implement thread categorization with tags
- [ ] Add thread subscription feature
- [ ] Implement thread search functionality
- [ ] Add file attachment support for posts

### Moderation
- [ ] Enhance report management system
- [ ] Add batch moderation actions
- [ ] Implement moderation logs
- [ ] Add automated content filtering
- [ ] Create moderator dashboard with analytics

### Admin Features
- [ ] Complete forum statistics dashboard
- [ ] Add bulk user management tools
- [ ] Implement system-wide announcements
- [ ] Add backup and restore functionality
- [ ] Create admin activity logs

### UI/UX Improvements
- [ ] Add dark mode support
- [ ] Implement responsive design improvements
- [ ] Add loading states for actions
- [ ] Improve error messages and notifications
- [ ] Add keyboard shortcuts for common actions

### Security
- [ ] Implement rate limiting
- [ ] Add CSRF protection
- [ ] Enhance input validation
- [ ] Add session management
- [ ] Implement security logs

### Performance
- [ ] Add caching layer
- [ ] Optimize database queries
- [ ] Implement pagination for long lists
- [ ] Add lazy loading for images
- [ ] Optimize client-side assets

### Testing
- [ ] Add unit tests
- [ ] Implement integration tests
- [ ] Add end-to-end testing
- [ ] Create test documentation
- [ ] Set up CI/CD pipeline

## Contributing

Please read our contributing guidelines before submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team. 