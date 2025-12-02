# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security seriously. If you discover a vulnerability, please report it immediately.

### How to Report

Please email <security@zync.ai> with a detailed description of the issue. We aim to acknowledge reports within 24 hours.

## Security Measures

### 1. API Key Management

- **Strict Environment Isolation**: API keys must **NEVER** be hardcoded in the source code.
- **Configuration**: Use `.env` files for local development.
  - `VITE_GEMINI_API_KEY`
  - `VITE_OPENROUTER_API_KEY`
  - `VITE_NVIDIA_KEY`
  - `VITE_R1T_CHIMERA_KEY`
- **Git Protection**: Ensure `.env` is listed in `.gitignore`.
- **Leak Protocol**: If a key is leaked, revoke it immediately via the respective provider console (Google Cloud, OpenRouter, etc.) and rotate the credentials in your deployment environment.

### 2. Data Privacy & PII Protection

- **Local-First Architecture**: Chat history and sessions are stored locally in the user's browser using **IndexedDB**.
- **PII Masking**: The application includes a PII (Personally Identifiable Information) masking utility (`src/utils/safety.ts`).
  - When "Safety Mode" is enabled in settings, sensitive data (emails, phone numbers, credit cards) is redacted _before_ being sent to external LLM providers.
- **Cloud Transmission**: When using external LLMs (Gemini, OpenRouter), data is sent to these providers according to their respective privacy policies.
- **Offline Mode**: When "Offline Mode" is enabled, the application uses **WebLLM** to run models entirely within the browser. **No data leaves the device** in this mode.

### 3. Content Safety & Prompt Injection

- **Structured Context**: The Gemini service (`src/services/gemini.ts`) uses structured message arrays (`role`, `parts`) rather than raw string concatenation for the main chat flow. This mitigates "Context Stuffing" and basic prompt injection attacks.
- **Safety Filters**: We utilize the default safety settings of the underlying models (Gemini/OpenRouter) to block harmful content (Hate Speech, Harassment, Sexually Explicit content).
- **Sandboxed Execution**: User-defined tools and plugins are executed in a controlled environment. The `ComponentRenderer` sanitizes HTML/JS to prevent XSS attacks.

### 4. Authentication

- **Provider**: Authentication is handled via **Firebase Auth**.
- **Persistence**: Session tokens are managed securely by the Firebase SDK. We do not manually handle or store passwords.

## Development Guidelines

- Run `npm run lint` before committing to catch potential security issues or secrets.
- Do not disable the `Content-Security-Policy` (CSP) headers in production builds.
