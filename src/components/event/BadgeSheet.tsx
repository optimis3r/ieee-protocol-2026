"use client";

import React, { useState, useEffect } from "react";
import type { Participant } from "@/lib/event/types";
import { QR } from "./shared";
import { Printer, X, Shield, QrCode } from "lucide-react";

interface BadgeSheetProps {
  agents: Participant[];
  origin: string;
  onClose: () => void;
}

export function BadgeSheet({ agents, origin, onClose }: BadgeSheetProps) {
  const [filterText, setFilterText] = useState("");

  const filtered = agents.filter(
    (a) =>
      a.id.toLowerCase().includes(filterText.toLowerCase()) ||
      a.name.toLowerCase().includes(filterText.toLowerCase()) ||
      a.roll.toLowerCase().includes(filterText.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#141514] text-[#f4f1ea] overflow-y-auto">
      {/* Top Floating Control Bar - Hidden on print */}
      <div className="no-print sticky top-0 z-10 border-b border-[#3f453f] bg-[#1b1d1b] p-4 flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-[#c28b28]" />
          <div>
            <div className="text-sm font-bold uppercase font-display-grotesk tracking-wider">
              Desk Print Station // Operative Badge Sheet
            </div>
            <div className="text-xs text-[#949e93] font-mono-tabular">
              Showing {filtered.length} of {agents.length} agent credentials · Cut lines calibrated for A4
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Filter by name, ID or roll…"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="text-xs bg-[#141514] border border-[#3f453f] px-3 py-1.5 w-48 text-[#f4f1ea]"
          />

          <button
            type="button"
            onClick={() => window.print()}
            className="primary text-xs font-bold uppercase flex items-center gap-1.5 px-4 py-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print Badges (Ctrl+P)</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="text-xs uppercase flex items-center gap-1.5 px-3 py-2 border border-[#3f453f] hover:border-[#f4f1ea]"
          >
            <X className="w-4 h-4" />
            <span>Close</span>
          </button>
        </div>
      </div>

      {/* Badges Grid for Paper Printing */}
      <div className="p-4 sm:p-8 max-w-[1100px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-2 print:gap-4">
          {filtered.map((agent) => {
            const peerUrl = `${origin}/play#peer=${agent.socialToken}`;
            return (
              <div
                key={agent.id}
                className="border-2 border-dashed border-[#4e564e] print:border-black p-4 bg-[#181a18] print:bg-white print:text-black rounded-xs flex flex-col justify-between break-inside-avoid relative"
                style={{ minHeight: "260px" }}
              >
                {/* Badge Header Banner */}
                <div>
                  <div className="flex items-center justify-between border-b border-[#3f453f] print:border-black pb-2 mb-3">
                    <span className="text-[10px] font-mono-tabular font-bold uppercase tracking-widest text-[#949e93] print:text-black">
                      IEEE PROTOCOL // NITW
                    </span>
                    <span className="editorial-stamp border-[#c28b28] text-[#c28b28] print:border-black print:text-black text-[9px]">
                      OPERATIVE PASS
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono-tabular text-[#949e93] print:text-gray-700 uppercase block">
                        AGENT IDENTIFIER
                      </span>
                      <div className="text-2xl font-mono-tabular font-bold tracking-tight text-[#f4f1ea] print:text-black">
                        {agent.id}
                      </div>

                      <div className="mt-2 text-sm font-bold text-[#f4f1ea] print:text-black leading-tight">
                        {agent.name}
                      </div>
                      <div className="text-xs font-mono-tabular text-[#949e93] print:text-gray-700">
                        Roll: {agent.roll}
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-center">
                      <QR value={peerUrl} label="Interaction Pass" />
                    </div>
                  </div>
                </div>

                {/* Badge Footer */}
                <div className="border-t border-[#3f453f] print:border-black pt-2 mt-4 text-[9px] font-mono-tabular text-[#949e93] print:text-gray-700 flex justify-between items-center">
                  <span>FIELD VERIFICATION CARD</span>
                  <span>DO NOT SURRENDER</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
