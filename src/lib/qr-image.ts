import QRCode from 'qrcode';

export interface QRBadgeOptions {
  agentName: string;
  agentNumber?: string;
  agentId: string;
  qrPayload: string;
}

/**
 * Generates an image in the exact requested format:
 * [QR]
 * [Agent Name]
 * 
 * Works in both browser (Canvas) and server (SVG/Data URL).
 */
export async function generateAgentQRBadgeDataUrl(options: QRBadgeOptions): Promise<string> {
  const { agentName, agentNumber, agentId, qrPayload } = options;
  const displayName = (agentNumber || agentName || agentId).toUpperCase();
  const subText = agentName && agentNumber && agentName !== agentNumber ? agentName : agentId;

  // If in browser environment with Canvas available
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const width = 640;
      const height = 760;
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        // Fallback to pure QR
        QRCode.toDataURL(qrPayload, { width: 500, margin: 2 }).then(resolve).catch(reject);
        return;
      }

      // Background card: Clean, high-contrast dark cyberpunk frame with white QR zone for 100% optical readability
      ctx.fillStyle = '#0a0f0d';
      ctx.fillRect(0, 0, width, height);

      // Card border
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 4;
      ctx.strokeRect(12, 12, width - 24, height - 24);

      // Inner subtle glow border
      ctx.strokeStyle = '#1e382b';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(20, 20, width - 40, height - 40);

      // Header Tag
      ctx.fillStyle = '#8ea897';
      ctx.font = 'bold 16px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('NIT WARANGAL • IEEE THE PROTOCOL', width / 2, 54);

      // Generate base QR image
      QRCode.toDataURL(qrPayload, {
        width: 460,
        margin: 1,
        color: {
          dark: '#0a0f0d',
          light: '#ffffff'
        }
      }).then((qrDataUrl) => {
        const qrImage = new Image();
        qrImage.onload = () => {
          // White background backing box for the QR code to ensure optical contrast
          const qrBoxSize = 480;
          const qrBoxX = (width - qrBoxSize) / 2;
          const qrBoxY = 75;

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 20);
          ctx.fill();

          // Draw the [QR] code centered inside the white box
          const qrDrawSize = 440;
          const qrDrawX = (width - qrDrawSize) / 2;
          const qrDrawY = qrBoxY + 20;
          ctx.drawImage(qrImage, qrDrawX, qrDrawY, qrDrawSize, qrDrawSize);

          // Divider line
          ctx.strokeStyle = '#22382c';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(40, 585);
          ctx.lineTo(width - 40, 585);
          ctx.stroke();

          // Section 2: [Agent Name]
          ctx.fillStyle = '#00ff88';
          ctx.font = '900 36px "Courier New", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(displayName, width / 2, 635);

          // Subtitle details (Real name or ID)
          ctx.fillStyle = '#eaf2ec';
          ctx.font = 'bold 20px "Courier New", monospace';
          ctx.fillText(subText, width / 2, 675);

          // Security verification badge
          ctx.fillStyle = '#ffcf66';
          ctx.font = 'bold 14px "Courier New", monospace';
          ctx.fillText(`VERIFIED OPERATIVE PASS // ${agentId}`, width / 2, 715);

          resolve(canvas.toDataURL('image/png'));
        };
        qrImage.onerror = (err) => reject(err);
        qrImage.src = qrDataUrl;
      }).catch(reject);
    });
  }

  // Server-side SVG Vector Card Fallback (works in Node.js without native canvas)
  try {
    const rawQrSvg = await QRCode.toString(qrPayload, {
      type: 'svg',
      width: 440,
      margin: 1,
      color: {
        dark: '#0a0f0d',
        light: '#ffffff'
      }
    });

    // Remove XML declaration if present
    const cleanedSvg = rawQrSvg.replace(/<\?xml.*?\?>/i, '');

    const compositeSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="760" viewBox="0 0 640 760" style="background:#0a0f0d; font-family:'Courier New', monospace;">
  <rect x="12" y="12" width="616" height="736" fill="#0a0f0d" stroke="#00ff88" stroke-width="4" rx="16" />
  <rect x="20" y="20" width="600" height="720" fill="none" stroke="#1e382b" stroke-width="1.5" rx="12" />
  <text x="320" y="52" fill="#8ea897" font-size="16" font-weight="bold" text-anchor="middle" letter-spacing="2">NIT WARANGAL • IEEE THE PROTOCOL</text>
  
  <!-- [QR] Container -->
  <g transform="translate(80, 75)">
    <rect width="480" height="480" fill="#ffffff" rx="20" />
    <g transform="translate(20, 20)">
      ${cleanedSvg}
    </g>
  </g>

  <!-- Divider -->
  <line x1="40" y1="585" x2="600" y2="585" stroke="#22382c" stroke-width="2" />

  <!-- [Agent Name] -->
  <text x="320" y="635" fill="#00ff88" font-size="34" font-weight="900" text-anchor="middle" letter-spacing="2">${displayName}</text>
  <text x="320" y="675" fill="#eaf2ec" font-size="20" font-weight="bold" text-anchor="middle">${subText}</text>
  <text x="320" y="715" fill="#ffcf66" font-size="14" font-weight="bold" text-anchor="middle" letter-spacing="1">VERIFIED OPERATIVE PASS // ${agentId}</text>
</svg>`.trim();

    const base64Svg = Buffer.from(compositeSvg).toString('base64');
    return `data:image/svg+xml;base64,${base64Svg}`;
  } catch (error) {
    console.error('Error generating SVG QR badge:', error);
    return QRCode.toDataURL(qrPayload, { width: 500, margin: 2 });
  }
}
