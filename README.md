<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# 🛡️ FairScan - Empowering Trust in AI

**An enterprise-grade, Multi-Modal AI Bias Auditing and Compliance platform powered by Google Gemini.**

[![React](https://img.shields.io/badge/React-19.0.0-blue.svg?style=for-the-badge&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-12.12.1-FFCA28.svg?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Gemini](https://img.shields.io/badge/Gemini_AI-Google-4285F4.svg?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

</div>

---

## 📖 The Problem
As AI models are increasingly deployed in high-stakes areas like hiring, finance, and healthcare, hidden algorithmic bias can lead to severely unfair and discriminatory outcomes. Currently, there is a critical lack of accessible, unified, and developer-friendly tools to easily audit AI decision-making systems and raw unstructured datasets (like text and PDFs) for bias against protected variables.

## 🚀 The Solution: FairScan
**FairScan** addresses this critical lack of unified tools. It seamlessly integrates into the AI development workflow, leveraging the advanced reasoning capabilities of **Google Gemini AI** to act as an automated "Bias Copilot." It automatically analyzes raw data, text, and PDF documents to catch algorithmic bias early in the development lifecycle.

By providing automated deep audit reports, regulatory readiness trackers, and an actionable "Developer Hub" for remediation fixes, FairScan empowers organizations to confidently build responsible, trustworthy, and completely unbiased AI.

---

## ✨ Core Features
*   📊 **Multi-Modal Audit Wizard:** Seamlessly upload raw unstructured data (PDFs, CSVs, and raw text blocks) for comprehensive bias auditing.
*   🧠 **Gemini-Powered Intelligence Core:** Context-aware, intelligent bias detection and extraction powered natively by the `@google/genai` SDK.
*   ⚖️ **Visual Diff Mode:** Compare the audit compliance results of `Model V1` vs. `Model V2` side-by-side to track iterative healing.
*   📈 **Compliance Dashboards & Live Monitors:** Track compliance health dynamically over time with interactive Recharts and D3 geometries.
*   🔒 **Zero-Trust Secure Workspaces:** End-to-end encrypted console with role-based access and project segregation using Firebase Auth and Cloud Firestore.
*   🛠️ **Actionable Developer Hub:** Provides direct remediation strategies and actionable feedback loops to actively *fix* the identified bias.

---

## 🏗️ Architecture

FairScan is built on a highly-scalable serverless architecture tailored for enterprise environments.

1. **Client Interface:** A premium, dynamic UI built with React 19, TailwindCSS, and Framer Motion.
2. **Platform Layer:** Secure Firebase Identity provisioning and NoSQL document storage (Firestore).
3. **Cognitive Core:** The Google Gemini API handling prompt orchestration and bias evaluation.

*(You can find the comprehensive architecture diagram in the root folder: `FairScan_Architecture.drawio`)*

---

## 💻 Tech Stack

### Frontend UI & Visualization
- **React 19**
- **Vite**
- **Tailwind CSS V4**
- **Motion (Framer Motion)** for dynamic micro-animations
- **Recharts & D3.js** for visual audit statistics
- **Lucide React** for iconography
- **Papaparse** for CSV Data Intake

### Backend & Database
- **Firebase Authentication**
- **Firebase Cloud Firestore** (Real-time NoSQL state sync)
- **Node.js / Express** (Local routing & server components)

### AI Intelligence
- **Google Gemini API** (via `@google/genai` Node SDK)

---

## ⚙️ Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/fairscan.git
cd fairscan
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the root directory and add your Firebase Config and Google Gemini API key:
```env
# Google Gemini
GEMINI_API_KEY="your_google_gemini_api_key_here"

# Firebase Config (if using local emulation or custom project)
# FIREBASE_PROJECT_ID="your_project_id"
```
*(Note: If you have an existing AI Studio app deployment, refer to the Firebase Applet Config.)*

### 4. Run the Development Server
```bash
npm run dev
```

The application will launch on your local host (typically `http://localhost:5173`). Verify your identity through the Secure Console to access the compliance monitors!

---

## 🤝 Contributing
Contributions, issues, and feature requests are always welcome! Feel free to check the [issues page](../../issues).

## 📄 License
This project is part of the **Google Solution Challenge 2026** Open Innovation track. Please refer to standard open-source conventions or contest guidelines regarding repository forks and usage.
