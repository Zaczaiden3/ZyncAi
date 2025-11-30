import { MemoryNode, GhostBranch } from './types';
import { memoryStore } from '../../services/vectorDb';

export class TopologicalMemory {
  private nodes: Map<string, MemoryNode>;
  private ghostBranches: Map<string, GhostBranch>;
  private readonly STORAGE_KEY_NODES = 'ZYNC_TOPO_NODES';
  private readonly STORAGE_KEY_GHOSTS = 'ZYNC_TOPO_GHOSTS';

  constructor() {
    this.nodes = new Map();
    this.ghostBranches = new Map();
    this.load();
  }

  private load() {
    try {
      const storedNodes = localStorage.getItem(this.STORAGE_KEY_NODES);
      const storedGhosts = localStorage.getItem(this.STORAGE_KEY_GHOSTS);

      if (storedNodes) {
        const parsedNodes: MemoryNode[] = JSON.parse(storedNodes);
        parsedNodes.forEach(n => this.nodes.set(n.id, n));
      }

      if (storedGhosts) {
        const parsedGhosts: GhostBranch[] = JSON.parse(storedGhosts);
        parsedGhosts.forEach(g => this.ghostBranches.set(g.id, g));
      }
    } catch (e) {
      console.error("Failed to load Topological Memory", e);
    }
  }

  private save() {
    // Debounce or immediate save? For critical topology, immediate for now.
    // In production, move to IndexedDB or debounce.
    try {
      localStorage.setItem(this.STORAGE_KEY_NODES, JSON.stringify(Array.from(this.nodes.values())));
      localStorage.setItem(this.STORAGE_KEY_GHOSTS, JSON.stringify(Array.from(this.ghostBranches.values())));
    } catch (e) {
      console.error("Failed to save Topological Memory", e);
    }
  }

  async addMemory(content: string, parentId?: string, confidence: number = 1.0): Promise<string> {
    const id = `mem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNode: MemoryNode = {
      id,
      content,
      timestamp: Date.now(),
      parentId,
      childrenIds: [],
      ghostBranchIds: [],
      confidence,
      tags: []
    };

    this.nodes.set(id, newNode);

    if (parentId) {
      const parent = this.nodes.get(parentId);
      if (parent) {
        parent.childrenIds.push(id);
      }
    }

    this.save();

    // Integrate with Vector Store for Semantic Search
    // We fire and forget this promise to not block the UI
    memoryStore.add(content, { type: 'memory_node', nodeId: id }, 'analytical').catch(err => {
        console.warn("Failed to index memory node to vector DB", err);
    });

    return id;
  }

  addGhostBranch(originNodeId: string, content: string, reason: string): void {
    const id = `ghost-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const ghost: GhostBranch = {
      id,
      originNodeId,
      content,
      reasonForRejection: reason,
      timestamp: Date.now()
    };

    this.ghostBranches.set(id, ghost);
    
    const origin = this.nodes.get(originNodeId);
    if (origin) {
      origin.ghostBranchIds.push(id);
    }

    this.save();
  }

  getTrace(nodeId: string): MemoryNode[] {
    const trace: MemoryNode[] = [];
    let current = this.nodes.get(nodeId);
    while (current) {
      trace.unshift(current);
      if (current.parentId) {
        current = this.nodes.get(current.parentId);
      } else {
        current = undefined;
      }
    }
    return trace;
  }

  getGhostBranchesForTrace(nodeId: string): GhostBranch[] {
    const trace = this.getTrace(nodeId);
    const ghosts: GhostBranch[] = [];
    trace.forEach(node => {
      node.ghostBranchIds.forEach(ghostId => {
        const ghost = this.ghostBranches.get(ghostId);
        if (ghost) ghosts.push(ghost);
      });
    });
    return ghosts;
  }
}

export const topologicalMemory = new TopologicalMemory();
