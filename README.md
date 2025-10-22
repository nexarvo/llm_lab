# LLM Lab

An LLM testing and comparison platform that allows you to run experiments with multiple language models, compare their outputs, and analyze performance metrics.

## Quick Start

### Prerequisites

- Python 3.8+
- Node.js 18+
- npm

### 1. Clone and Setup Backend

```bash
cd backend
cp env.example .env
pip install -r requirements.txt
```

### 2. Setup Frontend

```bash
cd frontend
npm install
```

### 3. Run the Application

```bash
# backend
cd backend
python -m app.main

# frontend
cd frontend
npm run dev
```

Visit `http://localhost:3000` to access the application.

## Architecture

### Backend (FastAPI)

- **API Layer**: RESTful endpoints for LLM experiments, metrics, and management
- **Service Layer**: Business logic for experiment orchestration and LLM interactions
- **Provider Layer**: Pluggable LLM providers (OpenAI, Anthropic, Google, Ollama, etc.) using factory design principle.
- **Repository Layer**: Repositories to talk to database with separation of concern.
- **Data Layer**: SQLite database with SQLModel for experiment tracking

### Frontend (Next.js)

- **React Components**: Modern UI with shadcn/ui components
- **State Management**: Zustand for client state, React Query for server state
- **Real-time Updates**: Polling for experiment status and results
- **Export Features**: PDF generation for experiment reports

## Tech Stack

### Backend

- **FastAPI** - Modern Python web framework
- **SQLModel** - Database ORM with type safety
- **SQLite** - Lightweight database
- **Pydantic** - Data validation
- **httpx** - Async HTTP client
- **Alembic** - Database migrations

### Frontend

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Component library
- **React Query** - Server state management
- **Zustand** - Client state management
- **Chart.js** - Data visualization

## 🔧 Supported LLM Providers

| Provider       | Models                              | API Key Required |
| -------------- | ----------------------------------- | ---------------- |
| **OpenAI**     | GPT-4o, GPT-5                       | yes              |
| **Anthropic**  | Claude 3.7 Sonnet, Claude 4         | yes              |
| **Google**     | Gemini 2.5 Flash, Gemini 2.5 Pro    | yes              |
| **OpenRouter** | Various models via OpenRouter       | yes              |
| **Ollama**     | Local models (Llama, Mistral, etc.) | no               |
| **Mock**       | Testing/Development                 | no               |

## Features

### Experiment Management

- **Parameter Variations**: Test different temperature, top_p, and max_tokens values
- **Multi-Model Comparison**: Compare responses across different LLMs
- **Background Processing**: Long-running experiments in background with status tracking
- **Experiment History**: View and manage past experiments
- **API Keys**: Manage API keys

### Quality Metrics

- **Response Time**: Track generation speed
- **Token Usage**: Monitor token consumption
- **Quality Scores**: Automated quality assessment
- **Comparative Analysis**: Side-by-side model comparison

### Export

- **PDF Reports**: Generate detailed experiment reports
- **Data Export**: Download experiment data
- **Visualization**: Charts and graphs for analysis
