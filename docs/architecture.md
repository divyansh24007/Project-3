# AEGISOS Architecture

## System Overview

AEGISOS is a multi-component cybersecurity ecosystem comprising an Android mobile application, a Next.js web dashboard, a FastAPI backend, an AI-powered threat intelligence engine, ML classification services, and a Supabase PostgreSQL database.

## Component Diagram

```mermaid
graph TB
    subgraph Clients
        ANDROID[Android App<br/>Kotlin + Jetpack Compose]
        WEB[Web Dashboard<br/>Next.js + TypeScript]
    end

    subgraph API["FastAPI Backend"]
        ROUTER[API Router v1]
        AUTH_MW[Auth Middleware]
        RATE[Rate Limiter]
    end

    subgraph Intelligence["AI Intelligence Engine"]
        ORCH[Agent Orchestrator]
        TD[Threat Detection]
        WI[Web Intelligence]
        MI[Message Intelligence]
        MDI[Media Intelligence]
        DI[Device Intelligence]
        RA[Risk Assessment]
        SA[Security Advisor]
        VA[Verification]
    end

    subgraph Analysis["Analysis Services"]
        URL_SVC[URL Analyzer]
        MSG_SVC[Message Analyzer]
        IMG_SVC[Image Analyzer]
        TI_SVC[Threat Intel]
    end

    subgraph ML["Machine Learning"]
        CLASSIFIER[Scam Classifier<br/>TF-IDF + NB]
    end

    subgraph Data["Data Layer"]
        SUPABASE[(Supabase PostgreSQL)]
        SUPA_AUTH[Supabase Auth]
        RLS[Row Level Security]
    end

    ANDROID --> ROUTER
    WEB --> ROUTER
    ROUTER --> AUTH_MW --> RATE
    ROUTER --> ORCH
    ORCH --> TD & WI & MI & MDI & DI & RA & SA & VA
    WI --> URL_SVC
    MI --> MSG_SVC
    MDI --> IMG_SVC
    URL_SVC --> TI_SVC
    ORCH --> CLASSIFIER
    ROUTER --> SUPABASE
    SUPABASE --> RLS
    WEB & ANDROID --> SUPA_AUTH
```

## Multi-Agent AI Engine

8 specialized agents with distinct responsibilities:

| Agent | Role | Input | Output |
|-------|------|-------|--------|
| Threat Detection | Classify input type | Raw input | Pipeline selection |
| Web Intelligence | Investigate domains/URLs | URL, domain | Reputation, SSL, phishing indicators |
| Message Intelligence | Analyze scam patterns | Message text | Scam category, suspicious phrases |
| Media Intelligence | Process images/QR | Image, OCR text | Extracted threats |
| Device Intelligence | Evaluate device security | Permissions | Risk assessment |
| Risk Assessment | Combine evidence | All findings | Risk score 0-100 |
| Security Advisor | Generate recommendations | Assessment | Prioritized actions |
| Verification | Validate findings | All findings | Verified vs. uncertain |

Each agent produces structured JSON. Fallback to rule-based analysis when AI APIs are unavailable.

## Investigation Flow

1. User submits input via Android or web
2. FastAPI validates and authenticates the request
3. Agent Orchestrator creates investigation and routes to pipeline
4. Specialized agents analyze in sequence
5. ML classifier scores scam probability
6. Risk Assessment combines all evidence
7. Results stored in Supabase
8. Client receives structured investigation report
