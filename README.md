# Library Management System

A modern web application for managing a library's book collection, user interactions, and administrative tasks. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

### User Features
- User authentication (sign in/sign up)
- Browse and search books
- Borrow and return books
- View personal book collection
- Real-time notifications for due dates and book status
- Mobile-responsive interface

### Admin Features
- Secure admin dashboard
- Add, edit, and delete books
- Manage book inventory
- View all borrowing records
- User management

### Technical Features
- Modern UI with Tailwind CSS
- Responsive design for all devices
- Real-time notifications
- Secure authentication with NextAuth.js
- TypeScript for type safety
- MongoDB for data storage
- API routes for data management

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **State Management**: React Hooks

## Getting Started

### Prerequisites

- Node.js 18.x or later
- MongoDB instance
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd library-management
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory with the following variables:
```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
library-management/
├── app/
│   ├── admin/           # Admin dashboard pages
│   ├── auth/           # Authentication pages
│   ├── books/          # Book listing and details
│   ├── my-books/       # User's borrowed books
│   └── api/            # API routes
├── components/         # Reusable components
├── lib/               # Utility functions and configurations
└── public/            # Static assets
```

## Key Components

### Navigation
- Responsive navbar with mobile menu
- Role-based navigation items
- Notification system

### Books Management
- Book listing with search and filters
- Book details view
- Borrow/return functionality
- Admin book management

### User Interface
- Toast notifications for user feedback
- Confirmation dialogs for important actions
- Loading states and error handling
- Mobile-first responsive design

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Next.js team for the amazing framework
- MongoDB for the database solution
- Tailwind CSS for the styling system
