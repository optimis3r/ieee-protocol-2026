import { NextResponse } from 'next/server';
import { ServerStore } from '@/lib/server-store';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');

    if (agentId) {
      const agent = ServerStore.getAgentById(agentId);
      if (!agent) {
        return NextResponse.json({ error: 'Operative not found' }, { status: 404 });
      }
      const nodes = ServerStore.getAgentNodes(agentId);
      const questionData = ServerStore.getAgentCurrentQuestion(agentId);

      return NextResponse.json({
        success: true,
        agent,
        nodes,
        currentQuestion: questionData.currentNode,
        questionStatus: questionData.status,
        solvedCount: questionData.totalSolved,
        totalNodes: questionData.totalAssigned
      });
    }

    const enrichedAgents = ServerStore.getEnrichedAgents();
    return NextResponse.json({
      success: true,
      agents: enrichedAgents,
      totalCount: enrichedAgents.length,
      timestamp: new Date().toISOString()
    });
  } catch (error: unknown) {
    console.error('[Participants API] GET error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to retrieve participants';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'register': {
        const { agent } = body;
        if (!agent) {
          return NextResponse.json({ error: 'Agent payload required' }, { status: 400 });
        }
        const savedAgent = ServerStore.registerAgent(agent);
        return NextResponse.json({ success: true, agent: savedAgent });
      }

      case 'update_status': {
        const { agentId, status } = body;
        if (!agentId || !status) {
          return NextResponse.json({ error: 'agentId and status are required' }, { status: 400 });
        }
        const updated = ServerStore.updateAgentStatus(agentId, status);
        return NextResponse.json({ success: Boolean(updated), agent: updated });
      }

      case 'record_node_access': {
        const { agentId, nodeId } = body;
        if (!agentId || !nodeId) {
          return NextResponse.json({ error: 'agentId and nodeId are required' }, { status: 400 });
        }
        const record = ServerStore.recordNodeAccess(agentId, nodeId);
        return NextResponse.json({ success: true, record });
      }

      case 'complete_node': {
        const { agentId, nodeId, pointsEarned } = body;
        if (!agentId || !nodeId) {
          return NextResponse.json({ error: 'agentId and nodeId are required' }, { status: 400 });
        }
        const result = ServerStore.completeNode(agentId, nodeId, pointsEarned || 100);
        return NextResponse.json({ success: true, ...result });
      }

      case 'adjust_score': {
        const { agentId, delta } = body;
        if (!agentId || typeof delta !== 'number') {
          return NextResponse.json({ error: 'agentId and numeric delta are required' }, { status: 400 });
        }
        const updated = ServerStore.adjustScore(agentId, delta);
        return NextResponse.json({ success: Boolean(updated), agent: updated });
      }

      case 'reset_agent': {
        const { agentId } = body;
        if (!agentId) {
          return NextResponse.json({ error: 'agentId required' }, { status: 400 });
        }
        const reset = ServerStore.resetAgent(agentId);
        return NextResponse.json({ success: Boolean(reset), agent: reset });
      }

      case 'delete_agent': {
        const { agentId } = body;
        if (!agentId) {
          return NextResponse.json({ error: 'agentId required' }, { status: 400 });
        }
        const deleted = ServerStore.deleteAgent(agentId);
        return NextResponse.json({ success: deleted });
      }

      case 'sync_client_agents': {
        const { agents } = body;
        if (Array.isArray(agents)) {
          ServerStore.syncFromClient(agents);
        }
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error: unknown) {
    console.error('[Participants API] POST error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to process request';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
