# Marketing Studio

A full-stack AI-powered marketing studio application designed for generating and managing marketing assets. The platform uses advanced generative AI models (including Flux image-to-image) to create stunning marketing templates and images, supported by a secure, unified backend.

## 🚀 Features

- **AI Image Generation**: Built-in support for generative AI features using `google-genai` and Hugging Face (`flux_i2i_service.py`, `template-gen.py`).
- **Secure Authentication**: Robust authentication system with JWT token management, OTP email verification via SMTP, and Google OAuth2 login.
- **Modern Frontend**: A highly responsive, dynamic frontend built with React, Vite, TanStack Router/Start, Tailwind CSS, and Radix UI components.
- **Unified Python Backend**: A high-performance API powered by FastAPI and Uvicorn.
- **Database Integration**: Seamless data persistence using MongoDB Atlas with Motor (async driver).

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19, Vite
- **Routing & Data Fetching**: TanStack Router, TanStack Query, TanStack Start
- **Styling & UI**: Tailwind CSS v4, Radix UI Primitives, Lucide React icons
- **State Management**: React Hook Form, Zod (validation)

### Backend
- **Framework**: FastAPI, Uvicorn
- **AI/ML Integration**: Google GenAI, Hugging Face Hub, Pillow
- **Database**: MongoDB (via `motor`)
- **Security & Auth**: Authlib, passlib, python-jose, itsdangerous
- **Environment Management**: python-dotenv

## 📁 Project Structure

```text
marketing-studio/
├── backend/            # FastAPI backend application
│   ├── main.py         # Entry point for the FastAPI server
│   └── ...             # API routes, auth logic, and AI services
├── frontend/           # React frontend application
│   └── adbee-ai-studio-main/ # Main frontend workspace
├── requirements.txt    # Python dependencies
└── .env                # Environment variables (MongoDB URI, API keys, etc.)
```

## ⚙️ Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Python (v3.10 or higher)
- MongoDB Atlas Cluster
- Hugging Face / Google GenAI API Keys

### Backend Setup

1. **Navigate to the root directory**:
   ```bash
   cd marketing-studio
   ```

2. **Create a virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Environment Variables**:
   Update the `.env` file in the root/backend directory with your MongoDB Atlas URI, API keys, and SMTP credentials.

5. **Run the backend server**:
   ```bash
   cd backend
   uvicorn main:app --reload --port 4000
   ```

### Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd marketing-studio/frontend/adbee-ai-studio-main
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

The frontend will start on your local development port, proxying API requests to the FastAPI backend.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
