import { NextResponse } from 'next/server';
import { ServerStore } from '@/lib/server-store';
import { verifyAdminRequest, checkRateLimit, getClientIp } from '@/lib/admin-auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const format = searchParams.get('format');

    // Allow direct CSV download
    if (format === 'csv') {
      const csv = ServerStore.getRegistrationBackupCSV();
      return new Response(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="protocol_operatives_backup_${new Date().toISOString().slice(0, 10)}.csv"`
        }
      });
    }

    const view = searchParams.get('view');
    if (view === 'nodes') {
      const nodes = ServerStore.getNodes();
      return NextResponse.json({ success: true, nodes });
    }

    const gameState = ServerStore.getGameState();

    if (agentId) {
      const sanitizedId = agentId.slice(0, 40);
      const agent = ServerStore.getAgentById(sanitizedId);
      if (!agent) {
        return NextResponse.json({ error: 'Operative not found', gameState }, { status: 404 });
      }
      const nodes = ServerStore.getAgentNodes(sanitizedId);
      const intel = ServerStore.getAgentIntel(sanitizedId);
      const questionData = ServerStore.getAgentCurrentQuestion(sanitizedId);

      return NextResponse.json({
        success: true,
        agent,
        gameState,
        nodes,
        intel,
        currentQuestion: questionData.currentNode,
        questionStatus: questionData.status,
        solvedCount: questionData.totalSolved,
        totalNodes: questionData.totalAssigned
      });
    }

    const enrichedAgents = ServerStore.getEnrichedAgents();
    const registrationBackup = ServerStore.getRegistrationBackup();
    return NextResponse.json({
      success: true,
      agents: enrichedAgents,
      registrationBackup,
      registrationBackupCount: registrationBackup.length,
      gameState,
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
    const body = await request.json().catch(() => ({}));
    const { action } = body;

    switch (action) {
      case 'register': {
        const ip = getClientIp(request);
        const rateLimit = checkRateLimit(`register:${ip}`, 15, 60 * 1000);
        if (!rateLimit.allowed) {
          return NextResponse.json(
            { success: false, error: 'Registration rate limit reached. Please wait 60 seconds.' },
            { status: 429 }
          );
        }

        const { agent } = body;
        if (!agent || typeof agent !== 'object') {
          return NextResponse.json({ error: 'Valid agent payload required' }, { status: 400 });
        }

        // Sanitize registration payload
        const sanitizedAgent = {
          ...agent,
          name: typeof agent.name === 'string' ? agent.name.trim().slice(0, 80) : '',
          agent_id: typeof agent.agent_id === 'string' && agent.agent_id.trim() ? agent.agent_id.trim().toUpperCase().slice(0, 30) : undefined,
          agent_number: typeof agent.agent_number === 'string' && agent.agent_number.trim() ? agent.agent_number.trim().slice(0, 30) : undefined,
          contact: typeof agent.contact === 'string' ? agent.contact.replace(/\D/g, '').slice(0, 15) : '',
          auth_identifier: typeof agent.auth_identifier === 'string' ? agent.auth_identifier.trim().slice(0, 30) : undefined
        };

        const savedAgent = ServerStore.registerAgent(sanitizedAgent);
        const gameState = ServerStore.getGameState();
        return NextResponse.json({ success: true, agent: savedAgent, gameState });
      }

      case 'update_game_state': {
        const { status, global_broadcast, leaderboard_visible, submission_cutoff_time } = body;
        const updated = ServerStore.updateGameState({
          status,
          global_broadcast,
          leaderboard_visible,
          submission_cutoff_time
        });
        return NextResponse.json({ success: true, gameState: updated });
      }

      case 'update_status': {
        const { agentId, status, agentData } = body;
        if (!agentId || !status) {
          return NextResponse.json({ error: 'agentId and status are required' }, { status: 400 });
        }
        const updated = ServerStore.updateAgentStatus(String(agentId).slice(0, 40), status, agentData);
        return NextResponse.json({ success: Boolean(updated), agent: updated });
      }

      case 'record_node_access': {
        const { agentId, nodeId } = body;
        if (!agentId || !nodeId) {
          return NextResponse.json({ error: 'agentId and nodeId are required' }, { status: 400 });
        }
        const record = ServerStore.recordNodeAccess(String(agentId).slice(0, 40), String(nodeId).slice(0, 50));
        return NextResponse.json({ success: true, record });
      }

      case 'complete_node': {
        const { agentId, nodeId, pointsEarned } = body;
        if (!agentId || !nodeId) {
          return NextResponse.json({ error: 'agentId and nodeId are required' }, { status: 400 });
        }
        const safePoints = typeof pointsEarned === 'number' && pointsEarned > 0 ? Math.min(pointsEarned, 500) : 100;
        const result = ServerStore.completeNode(String(agentId).slice(0, 40), String(nodeId).slice(0, 50), safePoints);
        return NextResponse.json({ success: true, ...result });
      }

      case 'defer_node': {
        const { agentId, deferredNodeId, nextNodeId } = body;
        if (!agentId || !deferredNodeId) {
          return NextResponse.json({ error: 'agentId and deferredNodeId are required' }, { status: 400 });
        }
        const result = ServerStore.deferCurrentNode(
          String(agentId).slice(0, 40),
          String(deferredNodeId).slice(0, 50),
          nextNodeId ? String(nextNodeId).slice(0, 50) : undefined
        );
        return NextResponse.json(result);
      }

      case 'set_active_node': {
        const { agentId, nodeId } = body;
        if (!agentId || !nodeId) {
          return NextResponse.json({ error: 'agentId and nodeId are required' }, { status: 400 });
        }
        const success = ServerStore.setActiveNode(
          String(agentId).slice(0, 40),
          String(nodeId).slice(0, 50)
        );
        return NextResponse.json({ success });
      }

      case 'assign_next_node': {
        const { agentId } = body;
        if (!agentId) {
          return NextResponse.json({ error: 'agentId is required' }, { status: 400 });
        }
        const result = ServerStore.assignNextNode(String(agentId).slice(0, 40));
        return NextResponse.json({ success: true, ...result });
      }

      case 'assign_initial_node': {
        const { agentId, nodeId } = body;
        if (!agentId) {
          return NextResponse.json({ error: 'agentId is required' }, { status: 400 });
        }
        const result = ServerStore.assignInitialNode(
          String(agentId).slice(0, 40),
          nodeId ? String(nodeId).slice(0, 50) : undefined
        );
        return NextResponse.json({ success: true, node: result });
      }

      case 'adjust_score': {
        if (!verifyAdminRequest(request)) {
          return NextResponse.json({ error: 'Unauthorized: Administrator privileges required' }, { status: 401 });
        }
        const { agentId, delta } = body;
        if (!agentId || typeof delta !== 'number') {
          return NextResponse.json({ error: 'agentId and numeric delta are required' }, { status: 400 });
        }
        const updated = ServerStore.adjustScore(String(agentId).slice(0, 40), delta);
        return NextResponse.json({ success: Boolean(updated), agent: updated });
      }

      case 'reset_agent': {
        if (!verifyAdminRequest(request)) {
          return NextResponse.json({ error: 'Unauthorized: Administrator privileges required' }, { status: 401 });
        }
        const { agentId } = body;
        if (!agentId) {
          return NextResponse.json({ error: 'agentId required' }, { status: 400 });
        }
        const reset = ServerStore.resetAgent(String(agentId).slice(0, 40));
        return NextResponse.json({ success: Boolean(reset), agent: reset });
      }

      case 'delete_agent': {
        if (!verifyAdminRequest(request)) {
          return NextResponse.json({ error: 'Unauthorized: Administrator privileges required' }, { status: 401 });
        }
        const { agentId } = body;
        if (!agentId) {
          return NextResponse.json({ error: 'agentId required' }, { status: 400 });
        }
        const deleted = ServerStore.deleteAgent(String(agentId).slice(0, 40));
        return NextResponse.json({ success: deleted });
      }

      case 'sync_client_agents': {
        const { agents } = body;
        if (Array.isArray(agents)) {
          ServerStore.syncFromClient(agents);
        }
        return NextResponse.json({ success: true });
      }

      case 'great_reset': {
        if (!verifyAdminRequest(request)) {
          return NextResponse.json({ error: 'Unauthorized: Administrator privileges required for THE GREAT RESET' }, { status: 401 });
        }
        ServerStore.greatReset();
        return NextResponse.json({
          success: true,
          message: 'THE GREAT RESET executed. All participant records and logs purged successfully.'
        });
      }

      case 'bulk_register': {
        const { operatives } = body;
        if (!Array.isArray(operatives) || operatives.length === 0) {
          return NextResponse.json({ error: 'Array of operative records required' }, { status: 400 });
        }
        const result = ServerStore.bulkRegister(operatives);
        const gameState = ServerStore.getGameState();
        return NextResponse.json({
          success: true,
          registeredCount: result.registeredCount,
          updatedCount: result.updatedCount,
          agents: result.agents,
          processedAgents: result.processedAgents,
          registrationBackup: result.registrationBackup,
          registrationBackupCount: result.registrationBackup.length,
          gameState
        });
      }

      case 'get_backup_csv': {
        const csv = ServerStore.getRegistrationBackupCSV();
        return NextResponse.json({ success: true, csv });
      }

      case 'get_nodes': {
        const nodes = ServerStore.getNodes();
        return NextResponse.json({ success: true, nodes });
      }

      case 'update_node': {
        const { nodeId, updates } = body;
        if (!nodeId || !updates) {
          return NextResponse.json({ error: 'nodeId and updates required' }, { status: 400 });
        }
        const updated = ServerStore.updateNode(String(nodeId), updates);
        return NextResponse.json({ success: Boolean(updated), node: updated });
      }

      case 'reset_nodes': {
        const nodes = ServerStore.resetNodesToDefault();
        return NextResponse.json({ success: true, nodes });
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
