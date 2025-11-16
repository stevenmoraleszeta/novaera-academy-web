# 🎓 ZETA Academia - Online Learning Platform

![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react)
![Firebase](https://img.shields.io/badge/Firebase-11.9.1-FFCA28?style=for-the-badge&logo=firebase)
![License](https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge)

A modern, full-stack online learning platform built with Next.js, offering interactive courses in programming (Python), Excel, SQL, and more. The platform supports both self-paced online courses and live interactive sessions, with integrated payment processing, user authentication, and comprehensive admin management.

## ✨ Introduction

ZETA Academia is a comprehensive e-learning platform designed to help students unlock their potential through high-quality programming and technical courses. The platform features:

- **Online Courses**: Self-paced learning with recorded classes and interactive content
- **Live Courses**: Real-time interactive sessions with expert instructors
- **User Management**: Complete authentication and profile management system
- **Payment Integration**: Secure PayPal payment processing
- **Admin Dashboard**: Comprehensive admin panel for course and student management
- **Project Services**: Support for university project completion
- **Private Tutoring**: One-on-one personalized learning sessions

## 🚀 Technologies Used

### Frontend
- **Next.js 15.2.4** - React framework with App Router
- **React 19.0.0** - UI library
- **CSS Modules** - Scoped styling
- **React Icons** - Icon library
- **Typed.js** - Animated typing effects
- **React Syntax Highlighter** - Code syntax highlighting

### Backend & Services
- **Firebase 11.9.1** - Authentication, Firestore database, and Storage
- **PayPal API** - Payment processing
- **Axios** - HTTP client for API requests
- **Custom REST API** - Backend services integration

### Analytics & Performance
- **Vercel Analytics** - Web analytics
- **Vercel Speed Insights** - Performance monitoring
- **Google Analytics 4** - Enhanced tracking

### Development Tools
- **ESLint** - Code linting
- **Next.js Lint** - Framework-specific linting rules

## ⚙️ Installation

### Prerequisites

- Node.js 18.x or higher
- npm, yarn, pnpm, or bun
- Firebase project setup
- PayPal developer account (for payment processing)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd novaera-academy-web
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file in the root directory and add the following variables:
   ```env
   # See .env.example for detailed descriptions
   NEXT_PUBLIC_API_URL=your_api_url_here
   PAYPAL_CLIENT_ID=your_paypal_client_id
   PAYPAL_SECRET=your_paypal_secret
   NEXT_PUBLIC_GA_MEASUREMENT_ID=your_ga_measurement_id
   ```

4. **Configure Firebase**
   
   Update `src/firebase/firebase.js` with your Firebase configuration, or use environment variables for better security.

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

### Build for Production

```bash
npm run build
npm start
```

## 🧩 Project Structure

```
novaera-academy-web/
├── public/                 # Static assets
│   ├── *.svg              # SVG icons and images
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── admin/         # Admin dashboard pages
│   │   ├── cursos-en-linea/    # Online courses pages
│   │   ├── cursos-en-vivo/     # Live courses pages
│   │   ├── login/         # Authentication pages
│   │   ├── payment/       # Payment processing
│   │   ├── userProfile/   # User profile management
│   │   └── page.jsx       # Home page
│   ├── components/        # Reusable React components
│   │   ├── adminButton/
│   │   ├── courseCardMenu/
│   │   ├── courseComponent/
│   │   ├── courseVideo/
│   │   ├── footer/
│   │   ├── navbar/
│   │   └── ...            # Other components
│   ├── context/           # React Context providers
│   │   ├── AuthContext.js
│   │   └── ModalContext.js
│   ├── features/          # Feature-specific modules
│   │   └── RequireAuth.js
│   ├── firebase/          # Firebase configuration
│   │   └── firebase.js
│   ├── hooks/             # Custom React hooks
│   │   ├── useAuth/
│   │   ├── useFetchCourses/
│   │   ├── useFirebaseAuth.js
│   │   └── ...            # Other hooks
│   ├── pages/             # API routes
│   │   └── api/
│   ├── utils/             # Utility functions
│   │   ├── analytics.js
│   │   ├── firebaseAuthCustom.js
│   │   └── ...            # Other utilities
│   └── assets/            # Images and media files
├── .env.example           # Environment variables template
├── .gitignore            # Git ignore rules
├── LICENSE               # License file
├── next.config.mjs       # Next.js configuration
├── package.json          # Dependencies and scripts
└── README.md             # This file
```

## 🔑 Key Features

### Authentication & Authorization
- Firebase Authentication with Google Sign-In
- Custom email/password authentication
- Protected routes with middleware
- Role-based access control (Admin/Student)

### Course Management
- Dynamic course listing and filtering
- Course detail pages with video playback
- Progress tracking for students
- Resource management (downloads, links)

### Payment System
- PayPal integration for secure payments
- Order creation and capture
- Payment status tracking

### Admin Features
- Student management (CRUD operations)
- Course administration
- Project management
- User analytics

### User Experience
- Responsive design for all devices
- Loading states and error handling
- SEO optimization with metadata
- Performance optimizations

## 🚢 Deployment

This application is optimized for deployment on **Vercel**, the recommended platform for Next.js applications.

### Vercel Deployment

1. **Connect your repository** to Vercel
2. **Configure environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy

### Alternative Deployment Options

- **Netlify**: Supports Next.js with proper configuration
- **AWS Amplify**: Full-stack deployment with AWS services
- **Render**: Simple deployment with Docker support
- **Railway**: Modern deployment platform with database support

### Environment Variables for Production

Ensure all environment variables from `.env.example` are configured in your deployment platform's environment settings.

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🔒 Security Features

- X-Frame-Options header protection
- X-Content-Type-Options security headers
- Referrer-Policy configuration
- Secure authentication with Firebase
- Environment variable protection

## 📜 License

**Copyright (c) 2025 Steven Morales Fallas**

All rights reserved. Redistribution, modification, reproduction, sublicensing, or any form of transaction (including commercial, educational, or promotional use) involving this repository, its source code, or derived works is strictly prohibited without the explicit and personal written authorization of the Lead Developer, Steven Morales Fallas.

Unauthorized commercial use, resale, or licensing of this repository or its contents is strictly forbidden and will be subject to applicable legal action.

For licensing inquiries, please contact the repository owner.

## 👨‍💻 Developer

**Steven Morales Fallas**  
Full Stack Developer

---

## 🤝 Contributing

This is a proprietary project. For collaboration inquiries, please contact the repository owner.

## 📧 Contact

For questions, support, or licensing inquiries, please reach out through the appropriate channels.

---

**Built with ❤️ using Next.js and Firebase**
