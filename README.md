# KTU-QGen 🎓

**KTU-QGen** is an AI-powered academic question paper generation system specifically designed for university internal examinations (Series Tests). It automates the creation of high-quality, balanced, and syllabus-aligned exam papers using LLMs.

---

## 🚀 Key Features

- **AI-Powered Generation**: Instantly generate complete question papers from syllabus units using Llama 3 / Mistral via HuggingFace Inference API.
- **Dual Generation Modes**:
  - **Auto Mode**: Full paper generation in one click.
  - **Manual Selection**: Teachers can pick from a candidate pool of AI-suggested questions.
- **Diagram Support**: Native integration with **Mermaid.js** for generating and rendering technical diagrams (DFA, NFA, Flowcharts, etc.).
- **Originality & Plagiarism**: 
  - **AI Originality Check**: Estimates the likelihood of questions being copied from textbooks.
  - **Internal Similarity Check**: Ensures no duplication by checking against the local Question Bank.
- **Academic Dashboard**: Track generation history, curriculum progress, and faculty statistics.
- **Auth System**: Role-based access control for Faculty, HODs, and Admins.
- **Export Ready**: Clean, academic-style print layout with dynamic question numbering.

---

## 🛠️ Tech Stack

- **Frontend**: React (19), Vite, Tailwind CSS, Lucide React, Mermaid.js.
- **Backend**: Django (5), Django REST Framework.
- **Database**: SQLite (Default) / PostgreSQL.
- **AI Engine**: HuggingFace Inference API (Meta-Llama-3-8B-Instruct).

---

## 🏁 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- HuggingFace API Key

### 1. Backend Setup (Django)

```bash
# Clone the repository
git clone <repo-url>
cd ktu-qgen

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Setup Environment Variables
# Create a .env file in the root
HUGGINGFACE_API_KEY=your_hf_key_here

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start server
python manage.py runserver
```

### 2. Frontend Setup (React/Vite)

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## 📝 Configuration

### Environment Variables (`.env`)
| Variable | Description |
|----------|-------------|
| `HUGGINGFACE_API_KEY` | Required for AI generation and plagiarism checks. |
| `DEBUG` | Set to `True` for development. |
| `SECRET_KEY` | Django secret key. |

---

## 📐 Exam Structure (Default)
The system is configured for the **50-Mark Series Test** format:
- **Part A**: 5 Questions × 3 Marks = 15 Marks (Knowledge/Recall).
- **Part B**: 5 Choice-Pairs (Attend either A or B) × 7 Marks = 35 Marks (Application/Analysis).
- **Total**: 50 Marks.
- **Time**: 1.5 - 2 Hours.

---

## 📜 License
This project is developed for academic purposes.
