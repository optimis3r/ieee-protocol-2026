// Legacy client-authoritative writes are retired. All gameplay uses /api/event.
export async function GET() {
  return Response.json(
    { error: "Use the authenticated event API." },
    { status: 410 },
  );
}
export async function POST() {
  return Response.json(
    {
      error:
        "Legacy client scoring and participant synchronization are disabled.",
    },
    { status: 410 },
  );
}
