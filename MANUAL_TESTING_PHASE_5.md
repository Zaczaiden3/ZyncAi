# Manual Testing Guide: Phase 5 (Agentic Evolution)

This guide outlines the steps to verify the advanced agentic features of ZyncAI, including Workflows, Memory Governance, and the Experiment Lab.

## 1. Agentic Workflows

**Feature**: The system can chain multiple tools together to solve complex tasks.

**Test Steps**:

1. **Open Command Palette**: Press `Ctrl+K`.
2. **Select "Test Workflow Engine"**:
   - Search for "Workflow".
   - Select "Test Workflow Engine".
3. **Verify Execution**:
   - **Expected**: A system message should appear: "**Initiating Workflow: System Diagnostics**".
   - **Expected**: The system should execute 3 steps (Time Check -> Calculator -> Status).
   - **Expected**: A final report should be displayed with the results of each step.

## 2. Memory Inspector & Governance

**Feature**: Visualize and manage the Topological Memory graph.

**Test Steps**:

1. **Generate Memory**:
   - Chat with the AI for a few turns to generate some memory nodes.
   - Ensure "Memory Core" (Fuchsia) is active or has responded at least once.
2. **Open Inspector**:
   - Click the **Layers Icon** (Stack) in the header (top right).
   - OR use Command Palette: "Memory Inspector".
3. **Verify UI**:
   - **Expected**: A modal should open showing a list or graph of memory nodes.
   - **Expected**: You should see nodes with content from your recent chat.
4. **Test Pruning (Governance)**:
   - Find a "Prune" or "Delete" button on a node.
   - Click it and verify the node is removed from the list.

## 3. Experiment Lab (Persona Research)

**Feature**: Test different personas and prompts in a controlled environment.

**Test Steps**:

1. **Open Lab**:
   - Click the **Flask Icon** in the header.
   - OR use Command Palette: "Experiment Lab".
2. **Configure Experiment**:
   - Select "Persona Simulation" mode.
   - Enter a test prompt (e.g., "Explain Quantum Computing").
3. **Run Simulation**:
   - Click "Run Experiment".
4. **Verify Output**:
   - **Expected**: The system should generate responses from multiple personas (e.g., Optimist, Skeptic, Realist) side-by-side.
   - **Expected**: You should see a "Synthesis" section combining the insights.

## 4. Role-Based Dashboards

**Feature**: Different UI layouts for different user roles (Executive vs. Standard).

**Test Steps**:

1. **Open Settings**:
   - Click the **Settings Icon** (Gear) in the header.
2. **Change Role**:
   - Locate the "User Role" dropdown.
   - Switch from "Researcher" (Default) to "**Executive**".
3. **Verify Dashboard**:
   - **Expected**: The UI should drastically change.
   - **Expected**: The chat interface should be replaced (or augmented) by high-level charts, system health metrics, and a "Command Center" view.
4. **Revert**:
   - Switch back to "Researcher" to return to the standard chat interface.

## 5. Evaluation Hooks

**Feature**: Rate AI responses to improve system quality.

**Test Steps**:

1. **Hover over a Message**: Move your mouse over any AI response.
2. **Verify Buttons**:
   - **Expected**: "Thumbs Up" and "Thumbs Down" icons should appear in the top right of the message bubble.
3. **Rate**:
   - Click "Thumbs Up".
   - **Expected**: The icon should turn green and stay selected.
