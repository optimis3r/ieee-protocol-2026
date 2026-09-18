import { NextResponse } from 'next/server';
import { 
  verifyAdminCredentials, 
  createAdminToken, 
  verifyAdminRequest, 
  checkRateLimit, 
  getClientIp 
} from '@/lib/admin-auth';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    // Rate limit: 5 login attempts per minute per IP to mitigate brute force
    const rateLimit = checkRateLimit(`login-attempt:${ip}`, 5, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many authentication attempts. Access locked for 60 seconds.' 
        }, 
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil(rateLimit.resetMs / 1000).toString()
          }
        }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { agentName, password } = body;

    if (!agentName || !password) {
      return NextResponse.json(
        { success: false, error: 'Agent-Name and Password are required' },
        { status: 400 }
      );
    }

    const isValid = verifyAdminCredentials(agentName, password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'AUTHENTICATION REJECTED: Invalid credentials.' },
        { status: 401 }
      );
    }

    const cleanAgent = String(agentName).trim();
    const token = createAdminToken(cleanAgent);

    return NextResponse.json({
      success: true,
      token,
      agentName: cleanAgent,
      message: 'Operator authorization granted.'
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Authentication processing error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const isAuth = verifyAdminRequest(request);
  return NextResponse.json({ authenticated: isAuth });
}
