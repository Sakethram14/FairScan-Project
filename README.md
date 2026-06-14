# 🛡️ FairScan: Intercepting Bias Before It Deploys

Welcome to **FairScan**! A comprehensive algorithmic auditing and real-time interception platform designed to detect, expose, and remediate AI bias. FairScan shifts fairness "left" by integrating directly into your CI/CD pipelines, while also offering robust live monitoring for production environments.

---

## 🛠️ Tech Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Data Visualization:** Recharts, React-Simple-Maps, TopoJSON
- **Backend:** Node.js, Express.js
- **AI & ML Integration:** Google GenAI SDK (Gemini 2.5 Flash)
- **DevOps & CI/CD:** GitHub Actions 

---

## ✨ Key Features

### 🚀 1. CI/CD API Integration (Shift-Left Fairness)
Treat fairness as a unit test! Developers can push validation datasets through our API endpoints during the deployment phase.
- If a model violates the **Four-Fifths Rule** or demonstrates severe disparate impact, FairScan automatically **halts the GitHub Actions deployment pipeline** and exits with an error code. 
- Prevents biased models from ever reaching production.

### 🔴 2. Real-Time Live Monitor & Current Bias Trends
For models already in the wild, FairScan acts as a middleware proxy analyzing real-time inference streams.
- **Live Monitoring:** Calculates rolling Disparate Impact and Demographic Parity gaps.
- **Current Bias Trends:** Real-time pulse animations and alert tickers to immediately flag active anomalies (e.g., "Active Alert: Multi-lingual Penalty Spike").

### 🗺️ 3. Live India Bias Heatmap (Leaderboard)
Visualizing geographical and regional disparities using interactive maps.
- Dynamic color scaling to highlight fairness across states (emerald for fairness, red for severe disparate impact).
- Hover tooltips showing **Urban vs. Rural** approval gaps and local digital divide metrics.

### 📊 4. Deep Analytics & Audit Reports
Deep, actionable analytics for compliance and investigation teams.
- Breaks down approval gaps and Disparate Impact Ratios.
- **Proxy Variable Detection:** Uses Gemini to identify hidden proxies specific to the Indian ecosystem:
  - 🗣️ **Vernacular Proxy:** Medium of instruction, mother tongue.
  - 📍 **Geographic Proxy:** Hometown, city tier.
  - 🎓 **First-Gen Proxy:** First-generation graduates, pedigree.
  - 📶 **Digital Divide Proxy:** Internet latency, bandwidth.

### 🔬 5. Candidate Explorer & Remediation Simulator
A powerful data explorer for non-technical users to visualize algorithm behavior.
- **Target State Simulation:** Mathematically simulates the removal of sensitive proxy attributes to project a "recovered parity score".
- Powered by advanced techniques like **Curriculum Learning** and **RegMixup** data augmentation.

### 📋 6. Regulatory Readiness Checklist
Automatically maps your model's fairness metrics against global compliance frameworks.
- 🇪🇺 **EU AI Act** readiness.
- 🇮🇳 **India DPDP Act** readiness.

---

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js and npm installed. You will also need a **Gemini API Key** to enable AI proxy detection.

### Installation

1. **Clone the Repository**
   ```bash
   git clone <your-repo-url>
   cd FairScan-Project
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory and add your Gemini API Key:
   ```env
   GEMINI_API_KEY=your_google_gemini_api_key_here
   ```

4. **Run the Application Locally**
   ```bash
   npm run dev
   ```
   The backend API and the Vite frontend will start on your local development server.

---

## 🤝 Contributing
We welcome contributions! Feel free to open an issue or submit a pull request if you have ideas for new features or improvements.

## 📄 License
This project is licensed under the MIT License.
