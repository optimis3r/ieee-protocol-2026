'use client';

import React, { useState } from 'react';
import { NodeItem, PrimaryDomain } from '@/types/database';
import { Store } from '@/lib/store';
import { soundEffects } from '@/lib/audio';
import { 
  X, 
  Save, 
  RotateCcw, 
  ExternalLink, 
  Sparkles, 
  Radio, 
  MapPin, 
  Eye, 
  Grid, 
  FileText, 
  User, 
  Scale, 
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface StationEditorModalProps {
  node: NodeItem;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (updatedNode: NodeItem) => void;
}

export const StationEditorModal: React.FC<StationEditorModalProps> = ({
  node,
  isOpen,
  onClose,
  onSaved
}) => {
  const [formData, setFormData] = useState<NodeItem>({ ...node, payload: { ...node.payload } });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFieldChange = <K extends keyof NodeItem>(field: K, value: NodeItem[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePayloadChange = (payloadKey: string, value: string | number | boolean | undefined) => {
    setFormData((prev) => ({
      ...prev,
      payload: {
        ...prev.payload,
        [payloadKey]: value
      }
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const res = Store.updateStationNode(formData.id, formData);
      if (res) {
        soundEffects.playSuccessChime();
        setSaveSuccess(true);
        onSaved(res);
        setTimeout(() => {
          setSaveSuccess(false);
          onClose();
        }, 900);
      } else {
        setSaveError('Failed to update station node. Circuit not recognized.');
      }
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Error updating station.');
    } finally {
      setIsSaving(false);
    }
  };

  const domainOptions: PrimaryDomain[] = ['SIGNAL', 'OBSERVATION', 'LOGIC', 'SYSTEM', 'SOCIAL'];

  const getStationIcon = () => {
    const nid = formData.id.toUpperCase();
    if (nid.includes('AUDIO')) return <Radio className="w-5 h-5 text-proto-signal" />;
    if (nid.includes('MAP')) return <MapPin className="w-5 h-5 text-proto-observation" />;
    if (nid.includes('UV')) return <Eye className="w-5 h-5 text-purple-400" />;
    if (nid.includes('FILTER')) return <Grid className="w-5 h-5 text-proto-logic" />;
    if (nid.includes('ARCHIVE')) return <FileText className="w-5 h-5 text-proto-system" />;
    if (nid.includes('DEAD-DROP')) return <User className="w-5 h-5 text-cyan-400" />;
    return <Scale className="w-5 h-5 text-proto-gold" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md font-mono-cyber">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-[#0b130e] border-2 border-proto-signal/50 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#1b2b20] bg-[#101a14] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#17251d] border border-proto-signal/40 flex items-center justify-center">
              {getStationIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-proto-signal/20 text-proto-signal border border-proto-signal/40">
                  {formData.station_number || 'STATION'}
                </span>
                <span className="text-xs font-black text-[#eaf2ec] uppercase">
                  CIRCUIT CONFIGURATION CONSOLE
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-proto-signal mt-0.5">
                {formData.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`/node/${formData.id}`}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-[#18261e] border border-[#2b3e32] text-proto-signal hover:bg-proto-signal hover:text-black transition-colors"
              title="Open Station Live View"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#18261e] border border-[#2b3e32] text-[#8ea897] hover:text-[#eaf2ec] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body / Scrollable Form */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs text-[#cad3f5]">
          
          {saveSuccess && (
            <div className="p-3 rounded-xl bg-proto-signal/15 border border-proto-signal text-proto-signal flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>STATION RECONFIGURED SUCCESSFULLY. Live station updated for all operatives!</span>
            </div>
          )}

          {saveError && (
            <div className="p-3 rounded-xl bg-proto-crimson/15 border border-proto-crimson text-proto-crimson flex items-center gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          {/* Section 1: Core Station Metadata */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold text-proto-signal uppercase tracking-wider border-b border-[#1b2b20] pb-1">
              Core Station Attributes
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] text-[#8ea897] uppercase mb-1">Station Title:</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  className="w-full px-3 py-2 bg-[#060c08] border border-[#233529] rounded-xl text-[#f3f7f4] font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#8ea897] uppercase mb-1">Discipline Domain:</label>
                <select
                  value={formData.domain}
                  onChange={(e) => handleFieldChange('domain', e.target.value as PrimaryDomain)}
                  className="w-full px-3 py-2 bg-[#060c08] border border-[#233529] rounded-xl text-proto-signal font-bold cursor-pointer"
                >
                  {domainOptions.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-[#8ea897] uppercase mb-1">Base Point Value:</label>
                <input
                  type="number"
                  required
                  value={formData.base_points}
                  onChange={(e) => handleFieldChange('base_points', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#060c08] border border-[#233529] rounded-xl text-proto-gold font-bold font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-[#8ea897] uppercase mb-1">Physical Terminal / Laptop Location:</label>
                <input
                  type="text"
                  value={formData.laptop_label || ''}
                  onChange={(e) => handleFieldChange('laptop_label', e.target.value)}
                  placeholder="e.g. ECE Waveguide Lab, Laptop 3"
                  className="w-full px-3 py-2 bg-[#060c08] border border-[#233529] rounded-xl text-[#eaf2ec]"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#8ea897] uppercase mb-1">Master Bypass Secret Key / Answer:</label>
                <input
                  type="text"
                  required
                  value={formData.secret_key}
                  onChange={(e) => handleFieldChange('secret_key', e.target.value)}
                  placeholder="Bypass passcode operatives must submit"
                  className="w-full px-3 py-2 bg-[#060c08] border border-proto-signal/60 rounded-xl text-proto-signal font-mono font-bold uppercase tracking-wider"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Prompts & Hints */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold text-proto-signal uppercase tracking-wider border-b border-[#1b2b20] pb-1">
              Mission Instructions & Prompts
            </div>

            <div>
              <label className="block text-[10px] text-[#8ea897] uppercase mb-1">Submission Box Prompt:</label>
              <input
                type="text"
                value={typeof formData.payload.prompt === 'string' ? formData.payload.prompt : ''}
                onChange={(e) => handlePayloadChange('prompt', e.target.value)}
                placeholder="e.g. Submit Isolated Timestamp [HH:MM]:"
                className="w-full px-3 py-2 bg-[#060c08] border border-[#233529] rounded-xl text-[#f3f7f4]"
              />
            </div>

            <div>
              <label className="block text-[10px] text-[#8ea897] uppercase mb-1">Reconnaissance Tactical Hint:</label>
              <textarea
                rows={2}
                value={typeof formData.payload.hint === 'string' ? formData.payload.hint : ''}
                onChange={(e) => handlePayloadChange('hint', e.target.value)}
                placeholder="Tactical hints displayed on the station screen..."
                className="w-full px-3 py-2 bg-[#060c08] border border-[#233529] rounded-xl text-[#cad3f5] leading-relaxed"
              />
            </div>
          </div>

          {/* Section 3: Specialized Station-Specific Custom Fields */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold text-proto-gold uppercase tracking-wider border-b border-[#1b2b20] pb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Specialized Station Mechanic Custom Fields</span>
            </div>

            {/* Station 01 Fields */}
            {formData.id.toUpperCase().includes('AUDIO') && (
              <div className="p-3.5 rounded-xl bg-[#09110d] border border-proto-signal/30 space-y-3">
                <span className="text-[10px] text-proto-signal font-bold uppercase">01 Blackout Audio Settings</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-[#8ea897] uppercase mb-1">Audio File URL (MP3/WAV):</label>
                    <input
                      type="text"
                      value={typeof formData.payload.audio_url === 'string' ? formData.payload.audio_url : ''}
                      onChange={(e) => handlePayloadChange('audio_url', e.target.value)}
                      placeholder="Leave blank to use built-in radio synthesizer"
                      className="w-full px-3 py-2 bg-[#060c08] border border-[#233529] rounded-xl text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#8ea897] uppercase mb-1">Target Timestamp Answer [HH:MM]:</label>
                    <input
                      type="text"
                      value={typeof formData.payload.timestamp_target === 'string' ? formData.payload.timestamp_target : ''}
                      onChange={(e) => handlePayloadChange('timestamp_target', e.target.value)}
                      placeholder="e.g. 17:45"
                      className="w-full px-3 py-2 bg-[#060c08] border border-[#233529] rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Station 02 Fields */}
            {formData.id.toUpperCase().includes('MAP') && (
              <div className="p-3.5 rounded-xl bg-[#09110d] border border-proto-observation/30 space-y-3">
                <span className="text-[10px] text-proto-observation font-bold uppercase">02 Pushpin Map Triangulation Settings</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-[#8ea897] uppercase mb-1">Pin 1 (Alpha):</label>
                    <input
                      type="text"
                      value={typeof formData.payload.pin_1_name === 'string' ? formData.payload.pin_1_name : ''}
                      onChange={(e) => handlePayloadChange('pin_1_name', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#060c08] border border-[#233529] rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#8ea897] uppercase mb-1">Pin 2 (Beta):</label>
                    <input
                      type="text"
                      value={typeof formData.payload.pin_2_name === 'string' ? formData.payload.pin_2_name : ''}
                      onChange={(e) => handlePayloadChange('pin_2_name', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#060c08] border border-[#233529] rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#8ea897] uppercase mb-1">Pin 3 (Gamma):</label>
                    <input
                      type="text"
                      value={typeof formData.payload.pin_3_name === 'string' ? formData.payload.pin_3_name : ''}
                      onChange={(e) => handlePayloadChange('pin_3_name', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#060c08] border border-[#233529] rounded-lg text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-[#8ea897] uppercase mb-1">Target Intersection Landmark:</label>
                  <input
                    type="text"
                    value={typeof formData.payload.target_intersection === 'string' ? formData.payload.target_intersection : ''}
                    onChange={(e) => handlePayloadChange('target_intersection', e.target.value)}
                    placeholder="e.g. B-BLOCK TERRACE AIR VENT"
                    className="w-full px-3 py-2 bg-[#060c08] border border-[#233529] rounded-xl text-xs font-mono"
                  />
                </div>
              </div>
            )}

            {/* Station 03 Fields */}
            {formData.id.toUpperCase().includes('UV') && (
              <div className="p-3.5 rounded-xl bg-[#09110d] border border-purple-500/30 space-y-3">
                <span className="text-[10px] text-purple-400 font-bold uppercase">03 UV Hidden Marker Settings</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-[#8ea897] uppercase mb-1">Physical Room Location:</label>
                    <input
                      type="text"
                      value={typeof formData.payload.uv_room_location === 'string' ? formData.payload.uv_room_location : ''}
                      onChange={(e) => handlePayloadChange('uv_room_location', e.target.value)}
                      className="w-full px-3 py-2 bg-[#060c08] border border-[#233529] rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#8ea897] uppercase mb-1">UV Revealed Cipher Text:</label>
                    <input
                      type="text"
                      value={typeof formData.payload.uv_hidden_text === 'string' ? formData.payload.uv_hidden_text : ''}
                      onChange={(e) => handlePayloadChange('uv_hidden_text', e.target.value)}
                      className="w-full px-3 py-2 bg-[#060c08] border border-[#233529] rounded-xl text-xs font-mono uppercase"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-[#8ea897] uppercase mb-1">Cipher Algorithm / Key:</label>
                  <input
                    type="text"
                    value={typeof formData.payload.cipher_algorithm === 'string' ? formData.payload.cipher_algorithm : ''}
                    onChange={(e) => handlePayloadChange('cipher_algorithm', e.target.value)}
                    className="w-full px-3 py-2 bg-[#060c08] border border-[#233529] rounded-xl text-xs"
                  />
                </div>
              </div>
            )}

            {/* Station 04 Fields */}
            {formData.id.toUpperCase().includes('FILTER') && (
              <div className="p-3.5 rounded-xl bg-[#09110d] border border-proto-logic/30 space-y-3">
                <span className="text-[10px] text-proto-logic font-bold uppercase">04 Red Filter & Cardan Grille Settings</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-[#8ea897] uppercase mb-1">Target Optical 4-Digit PIN:</label>
                    <input
                      type="text"
                      value={typeof formData.payload.optical_pin === 'string' ? formData.payload.optical_pin : ''}
                      onChange={(e) => handlePayloadChange('optical_pin', e.target.value)}
                      className="w-full px-3 py-2 bg-[#060c08] border border-[#233529] rounded-xl text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#8ea897] uppercase mb-1">Cardan Directive Sentence:</label>
                    <input
                      type="text"
                      value={typeof formData.payload.cardan_directive === 'string' ? formData.payload.cardan_directive : ''}
                      onChange={(e) => handlePayloadChange('cardan_directive', e.target.value)}
                      className="w-full px-3 py-2 bg-[#060c08] border border-[#233529] rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-[#8ea897] uppercase mb-1">Dense Grille Text Block (Separated by spaces):</label>
                  <input
                    type="text"
                    value={typeof formData.payload.grille_text === 'string' ? formData.payload.grille_text : ''}
                    onChange={(e) => handlePayloadChange('grille_text', e.target.value)}
                    className="w-full px-3 py-2 bg-[#060c08] border border-[#233529] rounded-xl text-xs font-mono"
                  />
                </div>
              </div>
            )}

            {/* Station 05 Fields */}
            {formData.id.toUpperCase().includes('ARCHIVE') && (
              <div className="p-3.5 rounded-xl bg-[#09110d] border border-proto-system/30 space-y-3">
                <span className="text-[10px] text-proto-system font-bold uppercase">05 Redacted Archive Settings</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-[#8ea897] uppercase mb-1">Redacted Operative Codename:</label>
                    <input
                      type="text"
                      value={typeof formData.payload.redacted_subject === 'string' ? formData.payload.redacted_subject : ''}
                      onChange={(e) => handlePayloadChange('redacted_subject', e.target.value)}
                      placeholder="e.g. AGENT K"
                      className="w-full px-3 py-2 bg-[#060c08] border border-[#233529] rounded-xl text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#8ea897] uppercase mb-1">Redacted Student Roll Number:</label>
                    <input
                      type="text"
                      value={typeof formData.payload.redacted_roll === 'string' ? formData.payload.redacted_roll : ''}
                      onChange={(e) => handlePayloadChange('redacted_roll', e.target.value)}
                      placeholder="e.g. 248721"
                      className="w-full px-3 py-2 bg-[#060c08] border border-[#233529] rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-[#8ea897] uppercase mb-1">Memo Title Header:</label>
                  <input
                    type="text"
                    value={typeof formData.payload.memo_title === 'string' ? formData.payload.memo_title : ''}
                    onChange={(e) => handlePayloadChange('memo_title', e.target.value)}
                    className="w-full px-3 py-2 bg-[#060c08] border border-[#233529] rounded-xl text-xs"
                  />
                </div>
              </div>
            )}

            {/* Station 06 Fields */}
            {formData.id.toUpperCase().includes('DEAD-DROP') && (
              <div className="p-3.5 rounded-xl bg-[#09110d] border border-cyan-500/30 space-y-3">
                <span className="text-[10px] text-cyan-400 font-bold uppercase">06 Dead Drop Handler Settings</span>
                <div>
                  <label className="block text-[10px] text-[#8ea897] uppercase mb-1">Volunteer Handler Physical Markers:</label>
                  <input
                    type="text"
                    value={typeof formData.payload.handler_description === 'string' ? formData.payload.handler_description : ''}
                    onChange={(e) => handlePayloadChange('handler_description', e.target.value)}
                    className="w-full px-3 py-2 bg-[#060c08] border border-[#233529] rounded-xl text-xs"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-[#8ea897] uppercase mb-1">Secret Verbal Passphrase:</label>
                    <input
                      type="text"
                      value={typeof formData.payload.verbal_passphrase === 'string' ? formData.payload.verbal_passphrase : ''}
                      onChange={(e) => handlePayloadChange('verbal_passphrase', e.target.value)}
                      className="w-full px-3 py-2 bg-[#060c08] border border-[#233529] rounded-xl text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#8ea897] uppercase mb-1">Inner Envelope Bypass Code:</label>
                    <input
                      type="text"
                      value={typeof formData.payload.envelope_code === 'string' ? formData.payload.envelope_code : ''}
                      onChange={(e) => handlePayloadChange('envelope_code', e.target.value)}
                      className="w-full px-3 py-2 bg-[#060c08] border border-[#233529] rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Station 07 Fields */}
            {formData.id.toUpperCase().includes('TWO-MAN') && (
              <div className="p-3.5 rounded-xl bg-[#09110d] border border-proto-gold/30 space-y-3">
                <span className="text-[10px] text-proto-gold font-bold uppercase">07 Rogue Intel & Game Theory Settings</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-[#8ea897] uppercase mb-1">Cooperate Reward Points:</label>
                    <input
                      type="number"
                      value={Number(formData.payload.coop_points) || 40}
                      onChange={(e) => handlePayloadChange('coop_points', Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#060c08] border border-[#233529] rounded-xl text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#8ea897] uppercase mb-1">Defect / Sabotage Steal Points:</label>
                    <input
                      type="number"
                      value={Number(formData.payload.defect_points) || 70}
                      onChange={(e) => handlePayloadChange('defect_points', Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#060c08] border border-[#233529] rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-[#8ea897] uppercase mb-1">Rogue Leak Memo Text:</label>
                  <input
                    type="text"
                    value={typeof formData.payload.rogue_leak_text === 'string' ? formData.payload.rogue_leak_text : ''}
                    onChange={(e) => handlePayloadChange('rogue_leak_text', e.target.value)}
                    className="w-full px-3 py-2 bg-[#060c08] border border-[#233529] rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#8ea897] uppercase mb-1">Forgery Flag Bypass Code:</label>
                  <input
                    type="text"
                    value={typeof formData.payload.forgery_code === 'string' ? formData.payload.forgery_code : ''}
                    onChange={(e) => handlePayloadChange('forgery_code', e.target.value)}
                    className="w-full px-3 py-2 bg-[#060c08] border border-[#233529] rounded-xl text-xs font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-[#1b2b20] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[#142219] hover:bg-[#1a2d21] border border-[#273a2e] text-[#8ea897] hover:text-[#eaf2ec] font-bold text-xs"
            >
              CANCEL
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-proto-signal hover:bg-[#00e676] disabled:opacity-50 text-[#0a0f0d] font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'PERSISTING TO PROTOCOL MATRIX...' : 'SAVE STATION CONFIG'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
