'use client';

import React, { useState, useEffect } from 'react';
import { NodeItem } from '@/types/database';
import { Store, initStore, SEED_NODES } from '@/lib/store';
import { StationEditorModal } from './StationEditorModal';
import { soundEffects } from '@/lib/audio';
import { 
  Radio, 
  MapPin, 
  Eye, 
  Grid, 
  FileText, 
  User, 
  Scale, 
  Edit3, 
  ExternalLink, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  Laptop,
  KeyRound
} from 'lucide-react';

export const StationManager: React.FC = () => {
  const [stations, setStations] = useState<NodeItem[]>([]);
  const [editingNode, setEditingNode] = useState<NodeItem | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const loadStations = () => {
    const list = Store.getStationNodes();
    // Filter to tournament stations first, plus any custom
    const primary = list.filter((n) => n.id.startsWith('NODE-0'));
    setStations(primary.length > 0 ? primary : list.slice(0, 7));
  };

  useEffect(() => {
    initStore();
    loadStations();

    const handleUpdate = () => {
      loadStations();
    };

    window.addEventListener('ieee_store_update', handleUpdate);
    return () => window.removeEventListener('ieee_store_update', handleUpdate);
  }, []);

  const handleEditClick = (node: NodeItem) => {
    soundEffects.playScanChirp();
    setEditingNode(node);
    setIsEditorOpen(true);
  };

  const handleResetToDefaults = () => {
    if (!window.confirm('Reset all 7 tournament challenge circuits to official protocol defaults? Any custom modifications will be restored.')) {
      return;
    }
    soundEffects.playSuccessChime();
    const defaults = Store.resetStationNodes();
    const primary = defaults.filter((n) => n.id.startsWith('NODE-0'));
    setStations(primary.length > 0 ? primary : defaults.slice(0, 7));
    setActionNotice('ALL 7 CHALLENGE STATIONS RESET TO TOURNAMENT DEFAULTS');
    setTimeout(() => setActionNotice(null), 3500);
  };

  const getDomainBadge = (domain?: string) => {
    switch (domain) {
      case 'SIGNAL':
        return 'bg-proto-signal/20 text-proto-signal border-proto-signal/40';
      case 'OBSERVATION':
        return 'bg-proto-observation/20 text-proto-observation border-proto-observation/40';
      case 'LOGIC':
        return 'bg-proto-logic/20 text-proto-logic border-proto-logic/40';
      case 'SYSTEM':
        return 'bg-proto-system/20 text-proto-system border-proto-system/40';
      case 'SOCIAL':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40';
      default:
        return 'bg-proto-gold/20 text-proto-gold border-proto-gold/40';
    }
  };

  const getStationIcon = (id: string) => {
    const nid = id.toUpperCase();
    if (nid.includes('AUDIO')) return <Radio className="w-5 h-5 text-proto-signal" />;
    if (nid.includes('MAP')) return <MapPin className="w-5 h-5 text-proto-observation" />;
    if (nid.includes('UV')) return <Eye className="w-5 h-5 text-purple-400" />;
    if (nid.includes('FILTER')) return <Grid className="w-5 h-5 text-proto-logic" />;
    if (nid.includes('ARCHIVE')) return <FileText className="w-5 h-5 text-proto-system" />;
    if (nid.includes('DEAD-DROP')) return <User className="w-5 h-5 text-cyan-400" />;
    return <Scale className="w-5 h-5 text-proto-gold" />;
  };

  return (
    <div className="space-y-6 font-mono-cyber">
      {/* Top Header Deck */}
      <div className="bg-[#0b130e] border border-proto-signal/40 rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-proto-signal/20 text-proto-signal border border-proto-signal/40">
              OPERATIONS DESK
            </span>
            <span className="text-xs text-[#8ea897] font-mono">
              ACTIVE TOURNAMENT CIRCUITS (7 NODES)
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-[#f3f7f4] tracking-wide">
            CHALLENGE STATION CONTROL &amp; LIVE FIELD EDITOR
          </h2>
          <p className="text-xs text-[#8ea897]">
            Directly customize challenge questions, bypass answers, hints, audio streams, coordinates, and handler passphrases from the browser in real time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetToDefaults}
            className="px-3.5 py-2 rounded-xl bg-[#131d16] hover:bg-[#1a291f] border border-[#223328] text-xs font-bold text-[#8ea897] hover:text-[#eaf2ec] transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Restore all default tournament stations"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET TO DEFAULTS</span>
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-proto-signal/15 border border-proto-signal text-proto-signal text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="font-bold">{actionNotice}</span>
        </div>
      )}

      {/* Grid of 7 Challenge Stations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stations.map((node) => (
          <div
            key={node.id}
            className="bg-[#0b130e] border-2 border-[#1c2c21] hover:border-proto-signal/50 rounded-2xl p-5 shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              {/* Card Header & Domain Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#142017] border border-[#243528] flex items-center justify-center">
                    {getStationIcon(node.id)}
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-proto-signal block">
                      {node.station_number || 'STATION'}
                    </span>
                    <span className="text-[9px] text-[#7d9787] font-mono">
                      {node.id}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${getDomainBadge(node.domain)}`}>
                    {node.domain || 'SYSTEM'}
                  </span>
                  <div className="text-xs font-black text-proto-gold mt-1 font-mono">
                    {node.base_points} PTS
                  </div>
                </div>
              </div>

              {/* Title & Terminal Location */}
              <div>
                <h3 className="text-sm font-bold text-[#f3f7f4] group-hover:text-proto-signal transition-colors">
                  {node.title}
                </h3>
                {node.laptop_label && (
                  <p className="text-[10px] text-[#8ea897] flex items-center gap-1 mt-1 truncate">
                    <Laptop className="w-3 h-3 text-proto-gold shrink-0" />
                    <span className="truncate">{node.laptop_label}</span>
                  </p>
                )}
              </div>

              {/* Answer Key Stamp */}
              <div className="p-2.5 rounded-xl bg-[#060c08] border border-[#1a281e] text-xs space-y-1">
                <div className="flex items-center justify-between text-[10px] text-[#7d9787]">
                  <span className="flex items-center gap-1 font-bold">
                    <KeyRound className="w-3 h-3 text-proto-signal" />
                    <span>SECRET BYPASS ANSWER:</span>
                  </span>
                  <span className="text-proto-signal font-mono font-bold uppercase truncate max-w-[140px]">
                    {node.secret_key || 'NOT SET'}
                  </span>
                </div>
              </div>

              {/* Reconnaissance Hint Preview */}
              {typeof node.payload.hint === 'string' && (
                <p className="text-[11px] text-[#cad3f5] line-clamp-2 leading-relaxed">
                  {node.payload.hint}
                </p>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-[#18261e] flex items-center justify-between gap-2">
              <a
                href={`/node/${node.id}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-[#142017] hover:bg-[#1a291f] border border-[#233327] text-xs font-bold text-[#8ea897] hover:text-[#eaf2ec] transition-colors flex items-center gap-1"
                title="Preview live operative screen in new tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>LIVE PREVIEW</span>
              </a>

              <button
                onClick={() => handleEditClick(node)}
                className="px-3.5 py-1.5 rounded-lg bg-proto-signal hover:bg-[#00e676] text-[#0a0f0d] text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow transition-all cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>EDIT STATION</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Live Station Editor Modal */}
      {editingNode && (
        <StationEditorModal
          node={editingNode}
          isOpen={isEditorOpen}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingNode(null);
          }}
          onSaved={(updated) => {
            loadStations();
            setActionNotice(`STATION [${updated.station_number || updated.id}] SUCCESSFULLY UPDATED`);
            setTimeout(() => setActionNotice(null), 3500);
          }}
        />
      )}
    </div>
  );
};
