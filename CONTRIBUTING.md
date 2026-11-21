# Contributing to AEGISOS

Thank you for your interest in contributing to **AEGISOS**! We welcome community contributions, bug fixes, threat intelligence rules, and feature enhancements.

Please read this document carefully to ensure a smooth onboarding and review process.

---

## 1. Code of Conduct

AEGISOS is an open-source cybersecurity project dedicated to personal and endpoint security. We expect all contributors, maintainers, and reviewers to adhere to standards of professional, constructive, and respectful collaboration.

---

## 2. Getting Started & Development Setup

### 2.1 Repository Setup

1. Fork the repository on GitHub.
2. Clone your fork locally:
   ```bash
   git clone https://github.com/<your-username>/AEGISOS.git
   cd AEGISOS
   ```
3. Create a feature branch with a descriptive name:
   ```bash
   git checkout -b feat/message-guard-enhancement
   ```

---

### 2.2 Backend Environment Setup (FastAPI & Python)

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install development dependencies
pip install -r requirements.txt
pip install pytest pytest-asyncio ruff black mypy

# Run test suite
pytest tests/
```

---

### 2.3 Frontend Environment Setup (Next.js & TypeScript)

```bash
cd frontend

# Install Node dependencies
npm install

# Run linter
npm run lint

# Start local development server
npm run dev
```

---

### 2.4 Android Environment Setup (Kotlin & Gradle)

1. Download and install **Android Studio** (Hedgehog 2023.1.1 or newer).
2. Ensure **JDK 17** is installed and configured as your Gradle JDK (`Settings -> Build, Execution, Deployment -> Build Tools -> Gradle`).
3. Open the `android` folder in Android Studio and trigger a Gradle Sync.
4. Execute unit tests:
   ```bash
   ./gradlew testDebugUnitTest
   ```

---

## 3. Coding Standards & Style Guidelines

### Python (Backend):
* Follow **PEP 8** styling guidelines.
* Run code formatters before committing:
  ```bash
  black app/ tests/
  ruff check app/ tests/
  ```
* Use explicit type annotations for all function arguments and return types.
* Prefer Pydantic models for data validation and dataclasses for internal service payloads.

### TypeScript / React (Frontend):
* Write clean, modular TypeScript with strict type checking enabled (`strict: true` in `tsconfig.json`).
* Adhere to Next.js 16 App Router best practices (differentiate between Client and Server Components).
* Use Tailwind CSS for utility-first styling consistent with our dark cybersecurity theme.

### Kotlin (Android):
* Follow official [Android Kotlin Style Guidelines](https://developer.android.com/kotlin/style-guide).
* Use Jetpack Compose declarative UI paradigms. Avoid legacy XML views in new features.
* Manage state reactively using `ViewModel` and Kotlin `StateFlow`.

---

## 4. Git Commit Conventions

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

* `feat`: A new feature or capability (e.g., `feat(scanner): add QR code steganography filter`)
* `fix`: A bug fix (e.g., `fix(url-analyzer): prevent SSRF bypass on IPv6 loopback`)
* `docs`: Documentation changes only (e.g., `docs(api): document rate limit headers`)
* `style`: Formatting, missing semicolons, no code changes (e.g., `style: format with ruff`)
* `refactor`: Code change that neither fixes a bug nor adds a feature (e.g., `refactor(agents): modularize agent prompts`)
* `perf`: Performance optimizations (e.g., `perf(ml): cache TF-IDF vectorizer in memory`)
* `test`: Adding missing tests or correcting existing tests (e.g., `test(api): add tests for image upload size cap`)

---

## 5. Pull Request (PR) Process

1. **Keep PRs Focused**: A pull request should address a single feature or bug fix. Avoid combining unrelated changes.
2. **Update Documentation**: If your pull request introduces new endpoints, environment variables, or database tables, update `docs/api.md`, `docs/architecture.md`, or `docs/database.md` accordingly.
3. **Verify Tests**: Ensure all unit and integration tests pass locally before submitting.
4. **PR Description**: Include a clear description of:
   * The problem being solved or feature introduced.
   * Testing steps taken to verify the change.
   * Screenshots or terminal output (for UI or CLI changes).
5. **Code Review**: At least one maintainer approval is required prior to merging into `main`. Address review comments promptly.

---

## 6. Security Vulnerability Disclosure

If you discover a security vulnerability within AEGISOS:
* **Do NOT open a public GitHub issue.**
* Please send a responsible disclosure email to `security@aegisos.cyber` detailing the attack vector, reproduction steps, and potential impact.
* Our security response team will review and address the report within 48 hours.
