import { deleteDocumentById } from "@/lib/db";
import { getSessionId } from "@/lib/session";
import { NextResponse } from "next/server";

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionId();
  if (!userId) {
    return NextResponse.json({ docs: [] });
  }

  const { id } = await context.params;

  const { ok } = await deleteDocumentById(id, userId);

  if (!ok) {
    return NextResponse.json({ success: false }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}