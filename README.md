# Nick's Portfolio

Welcome. I am a data-driven professional with a passion for turning complex, real-world problems into clear and actionable solutions. This portfolio showcases my academic background, independent research, and hands-on project work — including systems I have built in direct response to challenges encountered during my internship experience.

---

## Data Analysis

This portfolio contains a series of R Markdown files (`.rmd`) documenting end-to-end data analysis workflows, including exploratory analysis, model development, and performance evaluation using prediction and accuracy metrics.

> **Note:** Any warnings referenced in `data_analysis_breakdown.md` can be safely ignored — the final visualizations are rendered at the end of the second chunk.

---

## Projects

### Automated Helpdesk Agent with NLP & Admin Analytics
**Context:** Internship — IT Support

**Problem:** During peak hours, client response times dropped significantly, leading to recurring complaints about helpdesk downtime and slow ticket resolution. It became clear that a scalable, automated solution was needed to absorb demand without increasing headcount.

**Approach:** Designed and built an intelligent helpdesk agent using **Python** and **NLP libraries** to handle common client queries automatically via a structured knowledge base (KB). A **Node.js** backend powers the platform, while an admin-facing analytics dashboard gives support staff full visibility into client interactions, sentiment, and query trends — enabling them to review feedback and refine the KB at will.

**Key Features:**
- NLP-powered query matching with KB fallback for unrecognised queries
- Real-time admin dashboard with client review and sentiment insights
- Dynamic KB management — administrators can update entries without touching code
- Built to scale during peak-load periods with no manual intervention required

**Outcome:** Reduced dependency on human agents during high-traffic periods and equipped the support team with a data-driven tool to continuously improve response quality and client satisfaction.

---

### AcadPredict — Academic Achievement Prediction System
**Context:** Independent Research Project

**Problem:** Academic institutions often lack the tools to identify at-risk students early enough to intervene effectively. Grade outcomes and dropout risks are typically assessed reactively, long after the warning signs have emerged.

**Approach:** Built a full-stack machine learning application that predicts student academic outcomes across four dimensions — pass/fail status, at-risk/dropout likelihood, grade classification (A–F), and GPA — using an ensemble of **Random Forest** and **Gradient Boosting** models trained on a rich set of behavioural, academic, and socioeconomic features. The system is powered by a **Python** backend with a **React** frontend and is fully containerised via **Docker** for ease of deployment.

**Model Performance** *(validated on 2,000 synthetic students)*

| Prediction Target | Algorithm | Performance |
|---|---|---|
| Pass / Fail | Random Forest | 96.5% Accuracy |
| At-Risk / Dropout | Random Forest | 99.7% Accuracy |
| Grade Classification (A–F) | Gradient Boosting | 82.7% Accuracy |
| GPA Prediction | Gradient Boosting | R² 0.86 |

**Key Features:**
- Four simultaneous prediction models covering distinct academic outcome dimensions
- Single-student and batch CSV prediction modes with downloadable results
- Interactive admin dashboard with confusion matrices, feature importance charts, and grade distribution visualisations
- Dynamic model retraining pipeline — institutions can upload real student data and retrain models via a single API call
- Full REST API with interactive documentation, containerised for one-command deployment

**Outcome:** Delivered a production-ready tool that empowers academic institutions to shift from reactive intervention to proactive student support, with model accuracy exceeding 96% on key risk indicators.

---

*More projects coming soon.*

---

## Skills & Tools

| Category        | Technologies                                                  |
|----------------|---------------------------------------------------------------|
| Languages       | Python, JavaScript (Node.js, React), R                        |
| Machine Learning | Random Forest, Gradient Boosting, Scikit-learn               |
| NLP             | NLP libraries (spaCy / NLTK)                                  |
| Data Analysis   | R Markdown, Statistical Modelling, Data Visualisation         |
| Backend         | Python (FastAPI / Flask), Node.js, REST APIs                  |
| Frontend        | React, Vite                                                   |
| DevOps          | Docker, Docker Compose                                        |
| Other           | Knowledge Base Design, Admin Dashboards, Batch Processing     |

---

*Thank you for taking the time to review my portfolio. I am actively seeking opportunities to contribute to innovative, data-driven teams and to continue growing as a developer and analyst.*
