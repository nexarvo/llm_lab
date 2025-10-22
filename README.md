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

### UI/UX Decision

For the UI/UX, I wanted to create a UI which is very simple, easy-to-use and recognizable. By recognizable I mean, most of people use ChatGPT, Claude, Gemini for their daily use, so our UI/UX should be similar to that so that it is easy for the eyes and easy to migrate.

### Generate Response Decision

Generating multiple LLM responses is a technical challenge because it comes with failure, rate limiting and time consuming. There are 3 approaches we can take:

1. Sequential route: go with loops and generate the responses one after another. The issue with this is it is long running in the background and in the frontend the API call is also long running so by default it timeouts after 60sec and we can change it but it is not a good idea to have long running frontend call because it is in-transit and could have security issues.
2. Concurrent route: Add concurrency and retires. Currently we have this. Every LLM call is performed as a separate backend worker/task and if it fails/rate limited the server will backoff and retry again upto 2 times. This solved the time consumption but the issue with long running frontend API call is still there.
3. Frontend Polling: We can have some very complex solutions like pub/sub, event driven architecture or web sockets but for this take home they are over kill. I have gone with a very simple solution that the response generation API will create a experiment in the database and create a background task to perform the response generation and return early. Now the frontend have the experiment id and it will check the status after 2-3 seconds and update the UI. The concurrency still work as it is.

### Database Decision

I could have added supabase for database but as we are not having Auth and not storing API keys so going with solutions like supabase adds a network overhead. Instead I have gone with Sqlite which is fast, easy to setup and native.

### Assumptions

1. I have taken a decision that the response generation API will be atomic which means that whether every response will succeed or it will fail early. In simple words it is all or none. Our current system is capable of handling retry(from frontend) for single failed response with currently I have chosen atomic behavior.
2. User will provide the API key. In production environments adding API keys to secrets is not feasible so I have provided user interface to add API keys. They are not logged/stored anywhere in the backend and also they are maintained in zustand keystore and they are cleaned after website is closed or refreshed.

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
- **Tailwind CSS** - Styling abstraction
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
