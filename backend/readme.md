# EduVerse AI

EduVerse AI is an AI-powered educational platform developed to help students and teachers with learning, assignments, notes generation, exam preparation, and performance tracking.

The main purpose of this project is to make learning easier by using Generative AI. Instead of manually creating notes, question papers, and assignment feedback, users can generate them with the help of AI.

This project is built using FastAPI, MongoDB, and Large Language Models (LLMs).

---

# Project Overview

EduVerse AI provides different features for students, teachers, and administrators.

### Students can:

* Ask questions to the AI Tutor
* Generate study notes
* Generate exam questions
* Submit assignments
* View performance and activity history

### Teachers can:

* Create assignments
* Review student submissions
* Monitor student performance
* Access teacher dashboard analytics

### Administrators can:

* View platform statistics
* Monitor users and activities
* Access overall analytics

---

# Features

## User Management

* User Registration
* User Login
* JWT Authentication
* Role-Based Access Control
* Student Profiles
* Teacher Profiles

---

## AI Features

### AI Tutor

Students can ask academic questions and receive AI-generated answers.

### AI Notes Generator

Generate study notes for any topic.

### AI Exam Generator

Generate question papers automatically.

### AI Assignment Evaluation

Evaluate student assignments using AI and provide:

* Marks
* Strengths
* Weaknesses
* Suggestions
* Final Feedback

### AI Voice Teacher

Convert generated content into speech for audio learning.

---

# Assignment Management

## Teacher Side

* Create Assignments
* View Assignments
* Manage Assignments

## Student Side

* Submit Assignments
* Receive AI Evaluation
* View Submission History

---

# File Upload Support

The platform supports:

* PDF Files
* DOCX Files
* TXT Files

Uploaded files are parsed and converted into text for processing.

---

# History Module

All important activities are stored in history.

Examples:

* AI Tutor Requests
* Notes Generation
* Exam Generation
* Assignment Evaluation

Users can:

* View History
* View Personal History
* Delete History

---

# Analytics Dashboard

## Student Dashboard

* Assignments Submitted
* Notes Generated
* Exams Generated
* Total Activities

## Teacher Dashboard

* Assignments Created
* Submissions Received
* Total Students

## Admin Dashboard

* Total Users
* Total Students
* Total Teachers
* Total Assignments
* Total Submissions
* Most Used Feature
* Latest Activity

---

# Leaderboard

Students are ranked based on:

* Assignments Submitted
* Average Score

The leaderboard helps track student performance.

---

# Tech Stack

## Backend

* Python
* FastAPI

## Database

* MongoDB

## Authentication

* JWT Authentication
* Password Hashing

## AI Integration

* OpenRouter API
* Large Language Models (LLMs)

## File Processing

* PyPDF2
* python-docx

## Voice Generation

* gTTS

---

# Installation

## Clone Repository

```bash
git clone https://github.com/mrsingh1072/EduVerse-AI.git
```

```bash
cd EduVerse-AI
```

## Create Virtual Environment

```bash
python -m venv venv
```

## Activate Environment

### Windows

```bash
venv\Scripts\activate
```

### Linux / Mac

```bash
source venv/bin/activate
```

## Install Dependencies

```bash
pip install -r requirements.txt
```

## Run Server

```bash
uvicorn app.main:app --reload
```

Server will run on:

```text
http://127.0.0.1:8000
```

---

# Environment Variables

Create a `.env` file and add:

```env
OPENROUTER_API_KEY=your_api_key
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET_KEY=your_secret_key
```

---

# Project Structure

backend/

├── api/

├── database/

├── dependencies/

├── models/

├── schemas/

├── services/

├── utils/

└── main.py

---

# API Modules

## Authentication

* Login
* Token Generation

## Users

* Registration
* Profile Management

## AI

* Tutor
* Notes Generator
* Exam Generator
* Assignment Evaluation

## Assignments

* Create Assignment
* Submit Assignment

## Analytics

* Student Dashboard
* Teacher Dashboard
* Admin Dashboard
* Leaderboard

## History

* Activity Tracking

---

# Future Improvements

Currently, EduVerse AI is an LLM-based educational platform.

Future versions may include Retrieval-Augmented Generation (RAG) to provide more accurate and personalized responses.

Possible future improvements:

### PDF-Based Question Answering

Students can upload study material and ask questions directly from uploaded documents.

### Personalized Study Assistant

The system can remember learning materials and provide topic-specific guidance.

### Course Knowledge Base

Teachers can upload course content and students will receive answers based only on approved study materials.

### Smart Revision Assistant

Generate:

* Summaries
* Important Questions
* Revision Notes
* Flashcards

from uploaded notes.

### Research Paper Assistant

Upload research papers and generate:

* Summaries
* Key Findings
* Important Concepts
* Question Answering

### Multi-Document Learning

Search and generate answers using multiple uploaded documents.

---

# Current Status

Version 1 focuses on LLM-based educational assistance using Generative AI.

Future versions may include:

* RAG-based document question answering
* Personalized study assistant
* Vector database integration
* Multi-document learning

---

# Author

Saurabh Kumar

GitHub:
https://github.com/mrsingh1072

LinkedIn:
https://www.linkedin.com/in/saurabh-singh-959b48323/

---

# License

This project is developed for learning and educational purposes.
