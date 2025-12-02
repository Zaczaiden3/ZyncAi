# Manual Testing Guide: Offline Mode

This guide outlines the steps to verify the "Offline Mode" functionality of ZyncAI, which uses WebLLM to run a local Large Language Model (LLM) directly in your browser.

## Prerequisites

- **Browser**: Chrome, Edge, or a browser with **WebGPU** support enabled.
- **Network**: You will need an internet connection for the _initial_ download of the model weights.

## Test Case 1: Enabling Offline Mode & Model Download

1. **Open the Application**: Navigate to `http://localhost:5173` (or your local dev URL).
2. **Open Command Palette**:
   - Press `Ctrl+K` (or `Cmd+K` on Mac).
   - OR click the **Command Icon** (⌘) in the input bar.
3. **Select "Go Offline (Local)"**:
   - Type "Offline" to filter.
   - Click the "Go Offline (Local)" option.
4. **Verify Initialization**:
   - **Expected**: A progress indicator should appear at the top of the screen (e.g., "Initializing... 10%", "Loading model...").
   - **Expected**: A system message should appear in the chat: "**System Mode Switched** Now using: OFFLINE (Local LLM)".
   - **Note**: The first time you do this, it may take 1-2 minutes to download the model weights (~2GB).

## Test Case 2: Offline Inference (The "Unplugged" Test)

1. **Wait for Initialization**: Ensure the progress bar is gone and the "OFFLINE MODE ACTIVE" badge is visible at the top.
2. **Disconnect Internet**:
   - Turn off your Wi-Fi or unplug your Ethernet cable.
   - OR use Chrome DevTools: Network tab -> Select "Offline" in the throttling dropdown.
3. **Send a Message**:
   - Type a simple query: "What is the capital of France?"
   - Press Enter.
4. **Verify Response**:
   - **Expected**: The AI should respond (e.g., "The capital of France is Paris.").
   - **Expected**: The response might be slightly slower than Cloud mode but should work without any network requests.
   - **Expected**: The "Reflex" indicator (Cyan) should pulse during generation.

## Test Case 3: Feature Limitations

1. **Try Disabled Features**:
   - Open Command Palette (`Ctrl+K`).
   - Try to select "Simulate Personas" or "Consensus Debate".
2. **Verify Feedback**:
   - **Expected**: These options should be disabled/greyed out or show a description "Unavailable in Offline Mode".

## Test Case 4: Switching Back to Cloud

1. **Reconnect Internet**: Turn your Wi-Fi back on.
2. **Open Command Palette**: `Ctrl+K`.
3. **Select "Go Online (Cloud)"**.
4. **Verify State**:
   - **Expected**: The "OFFLINE MODE ACTIVE" badge disappears.
   - **Expected**: The status indicator in the top right switches to "ONLINE" (Emerald Green).
5. **Send a Message**:
   - Type: "Hello again."
   - **Expected**: The system should use the Cloud API (Gemini/OpenRouter) again.

## Troubleshooting

- **"WebGPU is not supported"**: Ensure you are using a modern browser. In Chrome, you may need to enable "Hardware Acceleration" in settings.
- **Stuck on "Initializing..."**: Check the browser console (`F12`) for errors. If the download fails, try refreshing the page and trying again with a stable connection.
