# 🚀 AstroRAG

ASTRO is a futuristic, space-themed web application serving as a front-end for a Retrieval-Augmented Generation (RAG) AI. It enables users to query a specialized knowledge base—NASA bioscience research—and receive AI-generated answers grounded in source documents.

The user journey starts with a visually stunning, animated landing page and transitions into a clean, intuitive chat interface.

---

## ✨ Features

- **Dynamic Landing Page**: Fully animated entry to capture the user's first query.
- **Real-time Chat Interface**: Displays conversation flow between user and AI.
- **RAG API Integration**: Fetches AI-generated answers backed by source documents.
- **Source Document Display**: Lists documents used by the AI, with relevance indicators (High, Medium, Low).
- **Hybrid Search Mode**: Toggle between database-only (`db-only`) and web-augmented (`hybrid`) search.
- **Voice-to-Text Input**: Integrates browser Speech Recognition API for hands-free queries.
- **File/Image Upload**: UI for uploading files/images to expand query capabilities.
- **Responsive Design**: Clean, modern interface for all screen sizes.
- **Animated UI**: Dynamic starfield background and subtle animations for a polished experience.

---

## 🛠️ Tech Stack

- **Frontend**: React.js (with Hooks), **Vite*
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Language**: JavaScript (ES6+) & JSX

---

## ⚙️ Setup and Installation

To run ASTRO locally, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/astro-ai-research-engine.git
   ```

2. **Navigate to the project directory:**
   ```bash
   cd astro-ai-research-engine
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start the development server:**
   ```bash
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to use the application.

---

## 🔧 Configuration

Primary configuration variables are located at the top of `App.js`:

```javascript
const API_ENDPOINT = 'https://rag-ai-tutorial.hemanth3292.workers.dev/query';
const TOP_K = 10;
const SCORE_THRESHOLD = 0.5;
```

- **API_ENDPOINT**: Backend API URL for queries.
- **TOP_K**: Number of source documents to retrieve.
- **SCORE_THRESHOLD**: Score threshold for "High" relevance (final rating set by backend in `sourceDetails`).

---

## 🔌 API Endpoint

The frontend communicates with a backend service via GET requests:

- **Endpoint**: `https://rag-ai-tutorial.hemanth3292.workers.dev/query`
- **Method**: GET

**Query Parameters:**

- `query` (string): User's question (URL-encoded)
- `top_k` (integer): Number of source documents to return
- `mode` (string): One of:
  - `'db-only'`: Search internal knowledge base only
  - `'hybrid'`: Augment search with external web results

---
