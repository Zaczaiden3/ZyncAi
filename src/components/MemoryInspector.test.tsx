import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MemoryInspector from './MemoryInspector';

// Mock the memory core
vi.mock('../cores/memory/TopologicalMemory', () => ({
  topologicalMemory: {
    getAllNodes: vi.fn().mockReturnValue([
      { id: 'mem-1', content: 'Test Memory 1', timestamp: Date.now(), confidence: 0.9, childrenIds: [], ghostBranchIds: [] },
      { id: 'mem-2', content: 'Test Memory 2', timestamp: Date.now(), confidence: 0.5, childrenIds: [], ghostBranchIds: [] }
    ]),
    getAllGhostBranches: vi.fn().mockReturnValue([
      { id: 'ghost-1', content: 'Rejected Memory', reasonForRejection: 'Low Confidence', timestamp: Date.now(), originNodeId: 'mem-1' }
    ]),
    pruneMemory: vi.fn().mockReturnValue(1),
    deleteNode: vi.fn()
  }
}));

describe('MemoryInspector Component', () => {
  it('renders nothing when closed', () => {
    render(<MemoryInspector isOpen={false} onClose={() => {}} />);
    expect(screen.queryByText('MEMORY_INSPECTOR_V1')).toBeNull();
  });

  it('renders when open', () => {
    render(<MemoryInspector isOpen={true} onClose={() => {}} />);
    expect(screen.getByText('MEMORY_INSPECTOR_V1')).toBeDefined();
    expect(screen.getByText('ACTIVE_NODES (2)')).toBeDefined();
  });

  it('displays memory nodes', () => {
    render(<MemoryInspector isOpen={true} onClose={() => {}} />);
    expect(screen.getByText('Test Memory 1')).toBeDefined();
    expect(screen.getByText('Test Memory 2')).toBeDefined();
  });

  it('switches to ghost branches tab', () => {
    render(<MemoryInspector isOpen={true} onClose={() => {}} />);
    const ghostTab = screen.getByText('GHOST_BRANCHES (1)');
    fireEvent.click(ghostTab);
    expect(screen.getByText('Rejected Memory')).toBeDefined();
  });

  it('filters nodes', () => {
    render(<MemoryInspector isOpen={true} onClose={() => {}} />);
    const searchInput = screen.getByPlaceholderText('SEARCH_MEMORY_LATTICE...');
    fireEvent.change(searchInput, { target: { value: 'Memory 1' } });
    expect(screen.getByText('Test Memory 1')).toBeDefined();
    expect(screen.queryByText('Test Memory 2')).toBeNull();
  });
});
