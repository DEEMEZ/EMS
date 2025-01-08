# DEEMEZ Expense Management System

A modern, responsive web application for managing organizational expenses. Built with Next.js, React, TypeScript, and MongoDB, featuring real-time search, filtering, and a clean, intuitive interface.

## 🌟 Features

- **Organization & Expense Management**
  - Full CRUD operations for organizations
  - Real-time search and filtering
  - Status tracking (Active, Inactive, Pending)
  - Expense tracking capabilities
  - Pagination support

- **Modern Tech Stack**
  - Next.js 15 with App Router
  - React 19
  - TypeScript
  - MongoDB
  - Tailwind CSS
  - Framer Motion animations

- **User Experience**
  - Clean, modern interface
  - Real-time updates
  - Responsive design
  - Smooth animations
  - Comprehensive error handling

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/DEEMEZ/expense-management.git
   cd expense-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🛠️ Technical Requirements

- Node.js >= 18.17.0
- npm >= 9.6.7
- MongoDB >= 5.0.0

## 📁 Project Structure

```
expense-management/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   └── page.tsx           # Main page
├── components/            # React components
├── models/               # MongoDB models
├── types/                # TypeScript types
└── utils/                # Helper functions
```

## 💻 Development

Run these commands for development:
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm start` - Production server
- `npm run lint` - ESLint check

## 📝 API Documentation

### Endpoints

- `GET /api/organization` - List organizations
- `POST /api/organization` - Create organization
- `PUT /api/organization` - Update organization
- `DELETE /api/organization` - Delete organization

Query Parameters:
- `page` - Page number
- `limit` - Items per page
- `search` - Search term
- `status` - Status filter

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file.

## 🌟 About DEEMEZ

DEEMEZ is committed to creating open-source solutions for business management. Our tools help organizations streamline their operations with modern, efficient software.

## 📧 Contact

DEEMEZ Organization
- GitHub: [DEEMEZ](https://github.com/DEEMEZ)
- Website: [deemez.com](https://deemez.com)

## 🚀 Roadmap

- [ ] Multi-currency support
- [ ] Expense reports generation
- [ ] Budget tracking
- [ ] User authentication
- [ ] Role-based access
- [ ] Data visualization
- [ ] Export functionality

---

Made with ❤️ by DEEMEZ