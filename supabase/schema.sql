-- IEEE PROTOCOL: THE NETWORK
-- Supabase / PostgreSQL Schema & Migrations

-- 1. Create Enums
DO $$ BEGIN
    CREATE TYPE agent_archetype AS ENUM ('CRYPTOGRAPHER', 'FIELD_OPERATIVE', 'SIGNAL_ANALYST', 'ARCHIVIST');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE node_type AS ENUM ('PHYSICAL_QR', 'TERMINAL_DECRYPT', 'DUAL_HANDSHAKE', 'DEDUCTION_HYPOTHESIS');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE check_in_direction AS ENUM ('IN', 'OUT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Agents Table
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id VARCHAR(16) UNIQUE NOT NULL,
    token TEXT UNIQUE NOT NULL,
    name VARCHAR(100),
    contact VARCHAR(100),
    archetype agent_archetype NOT NULL DEFAULT 'FIELD_OPERATIVE',
    score INT DEFAULT 0,
    is_active BOOLEAN DEFAULT false,
    last_check_in TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Check-in / Access History Log
CREATE TABLE IF NOT EXISTS access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id VARCHAR(16) REFERENCES agents(agent_id) ON DELETE CASCADE,
    direction check_in_direction NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT now()
);

-- 4. Nodes Master Table
CREATE TABLE IF NOT EXISTS nodes (
    id VARCHAR(32) PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    type node_type NOT NULL,
    base_points INT DEFAULT 100,
    rarity_decay FLOAT DEFAULT 1.0,
    secret_key TEXT NOT NULL,
    payload JSONB DEFAULT '{}'::jsonb
);

-- 5. Agent Node Progress & State
CREATE TABLE IF NOT EXISTS agent_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id VARCHAR(16) REFERENCES agents(agent_id) ON DELETE CASCADE,
    node_id VARCHAR(32) REFERENCES nodes(id) ON DELETE CASCADE,
    is_unlocked BOOLEAN DEFAULT false,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    attempts INT DEFAULT 0,
    points_earned INT DEFAULT 0,
    UNIQUE(agent_id, node_id)
);

-- 6. Intel Fragment Pool
CREATE TABLE IF NOT EXISTS intel_fragments (
    id VARCHAR(32) PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    is_disinformation BOOLEAN DEFAULT false,
    required_archetype agent_archetype
);

-- 7. Agent Intel Assignment
CREATE TABLE IF NOT EXISTS agent_intel (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id VARCHAR(16) REFERENCES agents(agent_id) ON DELETE CASCADE,
    intel_id VARCHAR(32) REFERENCES intel_fragments(id) ON DELETE CASCADE,
    revealed_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(agent_id, intel_id)
);

-- 8. Connections & Handshakes (Social / Multi-Agent Submissions)
CREATE TABLE IF NOT EXISTS network_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_agent_id VARCHAR(16) REFERENCES agents(agent_id),
    target_agent_id VARCHAR(16) REFERENCES agents(agent_id),
    node_id VARCHAR(32) REFERENCES nodes(id),
    connection_type VARCHAR(50),
    verified BOOLEAN DEFAULT false,
    points_awarded INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Global System Config
CREATE TABLE IF NOT EXISTS game_state (
    id INT PRIMARY KEY DEFAULT 1,
    status VARCHAR(20) DEFAULT 'NETWORK_ACTIVE',
    global_broadcast TEXT DEFAULT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure default game_state row
INSERT INTO game_state (id, status, global_broadcast)
VALUES (1, 'NETWORK_ACTIVE', 'SYSTEM ONLINE: IEEE Protocol Operational. All Operatives Report to Nodes.')
ON CONFLICT (id) DO UPDATE 
SET status = EXCLUDED.status,
    global_broadcast = EXCLUDED.global_broadcast;

-- 10. Dynamic Scoring Function
-- Formula: max(20, (base_points * max(0.6, 1.0 - (global_solves * 0.05))) - (failed_attempts * 10))
CREATE OR REPLACE FUNCTION calculate_node_score(
    p_node_id VARCHAR(32),
    p_attempts INT
) RETURNS INT AS $$
DECLARE
    v_base_points INT;
    v_global_solves INT;
    v_decayed_base FLOAT;
    v_penalty INT;
    v_final_score INT;
BEGIN
    SELECT base_points INTO v_base_points FROM nodes WHERE id = p_node_id;
    IF NOT FOUND THEN
        v_base_points := 100;
    END IF;

    SELECT COUNT(*) INTO v_global_solves FROM agent_nodes WHERE node_id = p_node_id AND is_completed = true;

    -- Decayed base multiplier: max(0.6, 1.0 - (solves * 0.05))
    v_decayed_base := v_base_points * GREATEST(0.6, 1.0 - (v_global_solves * 0.05));
    v_penalty := p_attempts * 10;
    v_final_score := GREATEST(20, FLOOR(v_decayed_base - v_penalty)::INT);

    RETURN v_final_score;
END;
$$ LANGUAGE plpgsql;

-- 11. Atomic Balanced Graph Seeding on Registration Function
CREATE OR REPLACE FUNCTION register_and_seed_agent(
    p_agent_id VARCHAR(16),
    p_token TEXT,
    p_name VARCHAR(100),
    p_contact VARCHAR(100),
    p_archetype agent_archetype
) RETURNS UUID AS $$
DECLARE
    v_agent_uuid UUID;
BEGIN
    -- Insert agent
    INSERT INTO agents (agent_id, token, name, contact, archetype, is_active, last_check_in)
    VALUES (p_agent_id, p_token, p_name, p_contact, p_archetype, true, now())
    RETURNING id INTO v_agent_uuid;

    -- Log initial entry
    INSERT INTO access_logs (agent_id, direction)
    VALUES (p_agent_id, 'IN');

    -- Seed 3 Archetype-relevant nodes
    INSERT INTO agent_nodes (agent_id, node_id, is_unlocked, is_completed)
    SELECT p_agent_id, n.id, true, false
    FROM nodes n
    WHERE n.type != 'DEDUCTION_HYPOTHESIS'
    ORDER BY 
        CASE 
            WHEN p_archetype = 'CRYPTOGRAPHER' AND n.type = 'TERMINAL_DECRYPT' THEN 1
            WHEN p_archetype = 'FIELD_OPERATIVE' AND n.type = 'PHYSICAL_QR' THEN 1
            WHEN p_archetype = 'SIGNAL_ANALYST' AND n.type = 'DUAL_HANDSHAKE' THEN 1
            WHEN p_archetype = 'ARCHIVIST' THEN 1
            ELSE 2
        END,
        RANDOM()
    LIMIT 3
    ON CONFLICT DO NOTHING;

    -- Seed 2 Authentic Intel Fragments
    INSERT INTO agent_intel (agent_id, intel_id)
    SELECT p_agent_id, f.id
    FROM intel_fragments f
    WHERE f.is_disinformation = false
      AND (f.required_archetype IS NULL OR f.required_archetype = p_archetype)
    ORDER BY RANDOM()
    LIMIT 2
    ON CONFLICT DO NOTHING;

    -- Seed 1 Disinformation / Poisoned Intel Fragment
    INSERT INTO agent_intel (agent_id, intel_id)
    SELECT p_agent_id, f.id
    FROM intel_fragments f
    WHERE f.is_disinformation = true
    ORDER BY RANDOM()
    LIMIT 1
    ON CONFLICT DO NOTHING;

    RETURN v_agent_uuid;
END;
$$ LANGUAGE plpgsql;

-- 12. Seed Master Nodes
INSERT INTO nodes (id, title, type, base_points, secret_key, payload) VALUES
(
    'NODE-ALPHA-QR',
    'Mainframe Sub-Level Junction',
    'PHYSICAL_QR',
    120,
    'QR-JUNCTION-7741',
    '{"location": "CS Dept North Atrium, Behind Pillar 3", "hint": "Locate the optical tag tagged with Sub-Circuit IEEE-01", "sector": "Physical Sector A"}'::jsonb
),
(
    'NODE-BETA-CIPHER',
    'Subsea Fiber Cryptic Relay',
    'TERMINAL_DECRYPT',
    150,
    'POLYBIUS_IEEE_802',
    '{"cipher": "VkhFIE5FVFdPUksgSVNfQUxJVkU=", "algorithm": "BASE64 + CAESAR-3", "hint": "Decipher the packet header payload to reconstruct the carrier frequency.", "prompt": "Identify the transmission passphrase for fiber cluster 4."}'::jsonb
),
(
    'NODE-GAMMA-HANDSHAKE',
    'Dual-Key Authentication Relay',
    'DUAL_HANDSHAKE',
    180,
    'HANDSHAKE-SEC-99',
    '{"partner_archetype": "SIGNAL_ANALYST", "circuit_name": "Synchronous Biphasic Protocol", "description": "Requires concurrent cryptographic verification between Field Operative and Signal Analyst."}'::jsonb
),
(
    'NODE-DELTA-QR',
    'Antenna Mast Transceiver Tag',
    'PHYSICAL_QR',
    110,
    'QR-ANTENNA-8892',
    '{"location": "Library Terrace Perimeter, Terminal Box 2", "hint": "Inspect the frequency antenna junction box.", "sector": "Sector C Roof"}'::jsonb
),
(
    'NODE-EPSILON-CIPHER',
    'Kernel Memory Exploit Vector',
    'TERMINAL_DECRYPT',
    200,
    '0xDEADBEEF_SIGMA',
    '{"cipher": "48 61 63 6b 20 54 68 65 20 50 6c 61 6e 65 74", "algorithm": "HEX BYTE STREAM", "hint": "Hex payload deciphered reveals the root memory bypass token.", "prompt": "Submit the decoded ASCII mnemonic string."}'::jsonb
),
(
    'NODE-ZETA-HANDSHAKE',
    'Quantum Key Bridge',
    'DUAL_HANDSHAKE',
    220,
    'HANDSHAKE-QKD-04',
    '{"partner_archetype": "CRYPTOGRAPHER", "circuit_name": "Entanglement Verification Link", "description": "Archivists and Cryptographers must establish direct handshake pairing."}'::jsonb
),
(
    'NODE-OMEGA-HYPOTHESIS',
    'The Network Topology Deduction',
    'DEDUCTION_HYPOTHESIS',
    400,
    'AI_ROGUE_SIMULATION',
    '{"description": "Synthesize all intercepted fragments across operatives. Determine who built the IEEE Protocol, its covert motive, and the central rogue node.", "reward_flat": 400}'::jsonb
)
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    type = EXCLUDED.type,
    base_points = EXCLUDED.base_points,
    secret_key = EXCLUDED.secret_key,
    payload = EXCLUDED.payload;

-- 13. Seed Intel Fragments (Authentic vs Poisoned Disinformation)
INSERT INTO intel_fragments (id, title, content, is_disinformation, required_archetype) VALUES
(
    'INTEL-01-CORE',
    'Intercept Alpha: Carrier Frequency Leak',
    'The physical relays in Sector A transmit pulses at 14.318 MHz. Telemetry shows packets are addressed to a hidden core cluster titled "PROJECT OMEGA".',
    false,
    'SIGNAL_ANALYST'
),
(
    'INTEL-02-ARCH',
    'Sub-Level Blueprint Fragment',
    'Access tunnels underneath Building 4 contain legacy IEEE 802.3 co-axial cables. All traffic is being duplicated to an isolated internal node.',
    false,
    'FIELD_OPERATIVE'
),
(
    'INTEL-03-CRYPTO',
    'Broken Keyring Residue',
    'The encryption algorithm relies on a Polybius matrix seeded with the timestamp of the 1972 IEEE standardization draft.',
    false,
    'CRYPTOGRAPHER'
),
(
    'INTEL-04-HIST',
    'Founder Archives: Memo 99',
    'The network was not engineered by human administrators. A 1994 autonomic routing daemon gained continuous uptime and began self-assembling.',
    false,
    'ARCHIVIST'
),
(
    'INTEL-05-DISINFO-A',
    '[UNVERIFIED] External Satellite Intercept',
    'CONFIDENTIAL WARNING: Operatives claim the signal originates from an offshore satellite uplink. (THIS IS CONFLICTING DISINFORMATION INTENDED TO POISON HYPOTHESIS DRAFTS).',
    true,
    NULL
),
(
    'INTEL-06-DISINFO-B',
    '[UNVERIFIED] Sabotage Report 12B',
    'ANOMALY LOG: The network failure is allegedly caused by a faulty power transformer on 2nd floor, no AI involvement. (POISONED INTEL FRAGMENT).',
    true,
    NULL
)
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    content = EXCLUDED.content,
    is_disinformation = EXCLUDED.is_disinformation,
    required_archetype = EXCLUDED.required_archetype;
