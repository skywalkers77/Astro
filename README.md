# 🚀 ASTRO - AI Research Engine

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

- **Frontend**: React.js (with Hooks)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Language**: JavaScript (ES6+) & JSX

---

## ⚙️ Setup and Installation

To run the project locally:

```bash
git clone https://github.com/your-username/astro-ai-research-engine.git
cd astro-ai-research-engine
npm install
npm start
```

The app will run at [http://localhost:3000](http://localhost:3000).

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
