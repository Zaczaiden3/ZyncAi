# ZyncOS Application Development Tasks

## Phase 1: Foundation & Stability (Current Focus)

- [x] **Persistence Layer**

  - [x] Implement `localStorage` or `IndexedDB` to persist chat history across reloads.
  - [x] Create a `SessionManager` to handle multiple chat sessions.
  - [x] Add "Export to JSON" functionality for backup.

- [x] **Authentication System**

  - [x] Persist authentication state locally (keep user logged in).
  - [x] Replace mock `LoginPage` with real authentication (e.g., Firebase Auth, Supabase, or Clerk).
  - [x] Secure API keys (ensure they are not exposed in client-side bundles if possible, or use a proxy).
  - [x] Add user profiles and settings (e.g., preferred voice, theme overrides).

- [x] **Testing & Quality Assurance**
  - [x] Set up Vitest or Jest for unit testing utility functions.
  - [x] Create component tests for `MessageItem`.
  - [x] Create component tests for `SystemVisualizer`.

## Phase 2: Zync AI Cores (New Architecture)

- [x] **Neuro-Symbolic Fusion**

  - [x] Implement `Lattice` for knowledge graph mapping.
  - [x] Implement `NeuroSymbolicCore` for hybrid reasoning.
  - [x] Integrate reasoning trace into `App.tsx` and UI.

- [x] **Persistent Topological Memory**

  - [x] Implement `TopologicalMemory` with `GhostBranch` support.
  - [x] Persist interactions to topological memory.

- [x] **Counterfactual Persona Simulation**

  - [x] Implement `PersonaSimulator` with multiple personas.
  - [x] Connect Simulator to UI via Command Palette (`/simulate`).

- [x] **Visualization & Transparency**
  - [x] Add "Confidence Shaders" to `MessageItem`.
  - [x] Add Neuro Confidence metric to `SystemVisualizer`.
  - [x] Create `NEURO` role for distinct visual feedback.
  - [x] Implement 3D `LatticeVisualizer` for Neuro-Symbolic graph.
  - [x] **Refine AI Core Prompts**: Enhanced Reflex (Cybernetic), Memory (Ghost Branching), and Consensus (Debate) personas.

## Phase 3: Optimization & Deployment

- [x] **Performance Optimization**

  - [x] Optimize React re-renders in `SystemVisualizer` (use `requestAnimationFrame` or WebGL if needed).
  - [x] Implement code splitting for heavy components.
  - [x] Optimize asset loading (images, fonts).

- [x] **Deployment Pipeline**
  - [x] Set up CI/CD (GitHub Actions) for automated testing and building.
  - [x] Configure environment variables for production.
  - [x] Deploy to Vercel, Netlify, or similar platform.

## Backlog / Ideas

- [x] **"Consensus" Mode Expansion**: Allow 3+ models to debate a complex topic.
- [x] **Plugin System**: Allow users to add custom "Tools" (e.g., Calculator, Weather) that the Reflex core can use.
- [x] **Offline Mode**: Basic functionality using a smaller, local LLM (e.g., WebLLM) when offline.
- [x] **Voice Input Enhancement**: Real-time audio visualization and improved UI.

## Phase 4: Cognitive Expansion & Multi-Modal Synthesis

- [ ] **Text-to-Speech (TTS) Synthesis**

  - [ ] Implement `VoiceSynthesisService` using Web Speech API or external API (e.g., ElevenLabs).
  - [ ] Add "Speak" button to `MessageItem` for reading responses.
  - [ ] Create a "Mute/Unmute" global toggle in the UI.

- [ ] **Generative UI Components**

  - [ ] Allow the AI to render React components (e.g., charts, tables, code blocks) dynamically based on context.
  - [ ] Create a `ComponentRenderer` to safely parse and display these elements.

- [ ] **"Dream State" Memory Optimization**

  - [ ] Implement a background process that clusters and refines topological memory when the system is idle.
  - [ ] Visualize this "dreaming" process in the `SystemVisualizer`.

- [ ] **External Knowledge Integration**
  - [ ] Connect `Reflex` core to a real web search API (e.g., Tavily, Serper) for up-to-date information.
  - [ ] Display citations and sources in the UI.
