# AI-Powered Language Practice Platform

A full-stack web application designed to help users prepare for language proficiency tests like IELTS. The platform provides practice sessions for different skills, featuring objective scoring for reading comprehension and advanced, AI-powered grading for writing tasks.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black.svg?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg?logo=react)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.4+-green.svg?logo=mongodb)](https://www.mongodb.com/)
[![MUI](https://img.shields.io/badge/MUI-5-blue.svg?logo=mui)](https://mui.com/)

---

## Table of Contents

- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Core Architectural Concepts](#core-architectural-concepts)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Roadmap](#roadmap)
- [License](#license)

## Key Features

- **User Authentication**: Secure sign-in and session management using NextAuth.js.
- **Reading Practice**: Engage with various objective question types (e.g., MCQs, Fill-in-the-Blanks, True/False/NG) with instant scoring.
- **Writing Practice**: Submit essays for subjective writing tasks.
- **AI-Powered Grading**: Writing submissions are graded asynchronously by an external AI service, providing detailed feedback on multiple criteria (e.g., Task Achievement, Cohesion, Lexical Resource, Grammar).
- **Unified Results History**: A centralized dashboard to view all past practice sessions, with sorting, pagination, and deletion capabilities.
- **Detailed Session Breakdown**: Drill down into any session to see a question-by-question review of your answers, correct answers, and detailed AI feedback for writing tasks.
- **Responsive UI**: A clean and modern user interface built with Material-UI (MUI).

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Database**: [MongoDB](https://www.mongodb.com/)
- **ODM**: [Mongoose](https://mongoosejs.com/)
- **UI Library**: [Material-UI (MUI)](https://mui.com/)

## Core Architectural Concepts

The project's architecture is designed for scalability and maintainability, especially in handling different types of assessments.

1.  **Decoupled Grading Logic**: The system differentiates between objectively scored questions (Reading) and subjectively scored ones (Writing).
    - **Objective questions**  are graded instantly.
    - **Subjective questions** are sent to an external AI service for grading. The overall band score is stored on the `Answer` model, while the rich, detailed feedback is stored in a separate `WritingFeedback` model.

2.  **Asynchronous AI Grading Workflow**: To ensure a non-blocking user experience, AI grading follows an asynchronous pattern:
    - A user submits a writing `Answer`.
    - An API call is immediately triggered in the background to the AI grading service.
    - Upon receiving the response from the AI, the system updates the original `Answer` with the overall score and creates a linked `WritingFeedback` document with the detailed report.

3.  **Single Responsibility Models**: The database schema is normalized to prevent data duplication and ensure each model has a single, clear purpose.
    - `Answer`: Stores the user's raw input for a question.
    - `WritingFeedback`: Stores the detailed, structured results from the AI grader. This keeps the `Answer` model lean and clean.

4.  **Component-Driven UI**: The frontend is built with a clear separation of concerns. "Container" components (pages) handle data fetching and state management, while "Presentational" components (in the `components` directory) are responsible for rendering the UI based on props.

## Database Schema


## Project Structure

The project follows the standard Next.js App Router structure.

## Getting Started

Follow these instructions to get a local copy up and running for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MongoDB](https://www.mongodb.com/try/download/community) instance (local or cloud-hosted via MongoDB Atlas)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/ayoungagnes/CapstoneProject.git
    cd your-repo-name
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Set up environment variables:**
    - Create a file named `.env.local` in the project root.
    - Fill in the required values in `.env.local` (see [Environment Variables](#environment-variables) below).

4.  **Run the development server:**
    ```sh
    npm run dev
    ```

The application should now be running at [http://localhost:3000](http://localhost:3000).

## Environment Variables

The `.env.local` file is required to run the application.

```env
# MongoDB Connection String
MONGODB_URI="your_mongodb_connection_string"

# NextAuth.js Configuration
# Generate a secret with: openssl rand -base64 32
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="http://localhost:3000"

# OpenAI Service Configuration (for writing grading)
OPENAI_API_KEY="your_ai_service_api_key"
```

## Roadmap

Future enhancements could include:
- Speaking Practice: A new section for users to record audio and receive AI-based feedback on pronunciation and fluency.
- Admin Dashboard: A secure area for administrators to manage question banks.
- User Progress Tracking: Visual charts and statistics to track user performance over time.
- More Question Types: Expanding the variety of reading questions to fully match test standards.