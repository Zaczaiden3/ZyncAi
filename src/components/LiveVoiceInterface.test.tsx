import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LiveVoiceInterface from './LiveVoiceInterface';
import { liveClient } from '../services/live/liveClient';

// Mock the liveClient
jest.mock('../services/live/liveClient', () => ({
  liveClient: {
    connect: jest.fn(),
    disconnect: jest.fn(),
    onConnect: null,
    onDisconnect: null,
    onError: null,
  }
}));

describe('LiveVoiceInterface', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders connecting state initially', () => {
    render(<LiveVoiceInterface onClose={() => {}} />);
    expect(screen.getByText(/INITIALIZING UPLINK/i)).toBeInTheDocument();
    expect(liveClient.connect).toHaveBeenCalled();
  });

  it('calls onClose when disconnect button is clicked', () => {
    const handleClose = jest.fn();
    render(<LiveVoiceInterface onClose={handleClose} />);
    
    const disconnectButton = screen.getByLabelText(/End Live Session/i);
    fireEvent.click(disconnectButton);
    
    expect(handleClose).toHaveBeenCalled();
  });

  it('toggles microphone state', () => {
    render(<LiveVoiceInterface onClose={() => {}} />);
    
    const micButton = screen.getByTitle(/Mute Microphone/i);
    fireEvent.click(micButton);
    
    expect(screen.getByTitle(/Unmute Microphone/i)).toBeInTheDocument();
  });
});
