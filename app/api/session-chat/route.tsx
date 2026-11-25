import { db } from "@/src/db";
import { SessionChatTable } from "@/src/schema";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { count, desc, eq } from "drizzle-orm";
import { resolveDoctorAgent } from "@/services/doctor-config.service";
import {
  parseConversation,
  serializeConversation,
} from "@/services/consultation/consultation.history";

export async function POST(req: NextRequest) {
  try {
    const { notes, selectedDoctor } = await req.json();
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionId = uuidv4();
    const userEmail = user.primaryEmailAddress?.emailAddress;

    if (!userEmail) {
      return NextResponse.json({ error: 'User email is required' }, { status: 400 });
    }

    // Keep specialist name for existing history UI; also store doctor id for consultation.
    const doctorName = typeof selectedDoctor === 'object' && selectedDoctor !== null
      ? selectedDoctor.specialist || selectedDoctor.id?.toString() || ''
      : selectedDoctor || '';

    const selectedDoctorId =
      typeof selectedDoctor === 'object' && selectedDoctor !== null && selectedDoctor.id != null
        ? Number(selectedDoctor.id)
        : null;

    const result = await db
      .insert(SessionChatTable)
      .values({
        sessionId: sessionId,
        createdBy: userEmail,
        notes: notes || "",
        selectedDoctor: doctorName,
        selectedDoctorId: Number.isNaN(selectedDoctorId as number) ? null : selectedDoctorId,
      })
      .returning();


    return NextResponse.json(result[0]);
  } catch (error) {

    // Check for specific database errors
    let errorDetails = 'Unknown error';
    if (error instanceof Error) {
      errorDetails = error.message;

      // Check for common database errors
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        errorDetails = 'Database table does not exist. Please run migrations.';
      } else if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
        errorDetails = 'Session ID already exists. Please try again.';
      } else if (error.message.includes('connection') || error.message.includes('timeout')) {
        errorDetails = 'Database connection failed. Please check your database configuration.';
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to create session',
        details: errorDetails,
        // Include full error in development only
        ...(process.env.NODE_ENV === 'development' && error instanceof Error && {
          fullError: error.message,
          stack: error.stack
        })
      },
      { status: 500 }
    );
  }
}


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('sessionId');
  const user = await currentUser();

  if (sessionId == 'all') {
    const userEmail = user?.primaryEmailAddress?.emailAddress;

    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const page = Math.max(Number(searchParams.get("page") || 1), 1);
    const limit = Math.min(Math.max(Number(searchParams.get("limit") || 5), 1), 50);
    const offset = (page - 1) * limit;
    const ownedByUser = eq(SessionChatTable.createdBy, userEmail);

    const [totalRow] = await db
      .select({ total: count() })
      .from(SessionChatTable)
      .where(ownedByUser);

    const items = await db
      .select()
      .from(SessionChatTable)
      .where(ownedByUser)
      .orderBy(desc(SessionChatTable.id))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      items,
      total: totalRow?.total ?? 0,
      page,
      limit,
    });

  } else {
    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    const result = await db
      .select()
      .from(SessionChatTable)
      .where(eq(SessionChatTable.sessionId, sessionId));

    if (result.length === 0) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Verify the user owns this session
    if (result[0].createdBy !== user?.primaryEmailAddress?.emailAddress) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const sessionData = result[0];
    const doctor = resolveDoctorAgent(
      sessionData.selectedDoctorId,
      sessionData.selectedDoctor
    );

    return NextResponse.json({
      ...sessionData,
      selectedDoctor: doctor || null,
      conversation: parseConversation(sessionData.conversation),
    });

  }
}

export async function PUT(req: NextRequest) {
  try {
    const { sessionId, messages } = await req.json();
    const user = await currentUser();
    const userEmail = user?.primaryEmailAddress?.emailAddress;

    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    const result = await db
      .select()
      .from(SessionChatTable)
      .where(eq(SessionChatTable.sessionId, sessionId));

    if (result.length === 0) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (result[0].createdBy !== userEmail) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const conversation = parseConversation(messages);
    await db
      .update(SessionChatTable)
      .set({ conversation: serializeConversation(conversation) })
      .where(eq(SessionChatTable.sessionId, sessionId));

    return NextResponse.json({
      sessionId,
      conversation,
    });
  } catch (error) {
    console.error("Failed to update conversation:", error);
    return NextResponse.json(
      { error: "Failed to update conversation" },
      { status: 500 }
    );
  }
}