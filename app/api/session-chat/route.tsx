import { db } from "@/src/db";
import { SessionChatTable } from "@/src/schema";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { desc, eq } from "drizzle-orm";
import { AIDoctorAgents } from "@/shared/list";

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

    // Extract doctor name from object if it's an object, otherwise use as string
    const doctorName = typeof selectedDoctor === 'object' && selectedDoctor !== null
      ? selectedDoctor.specialist || selectedDoctor.id?.toString() || ''
      : selectedDoctor || '';

    console.log('Attempting to insert session:', { sessionId, userEmail, doctorName, notesLength: notes?.length || 0 });

    const result = await db
      .insert(SessionChatTable)
      .values({
        sessionId: sessionId,
        createdBy: userEmail,
        notes: notes || "",
        selectedDoctor: doctorName,
      })
      .returning();

    console.log('Session created successfully:', result[0]);
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error creating session - Full error:', error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
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

  if(sessionId=='all'){
    const result = await db
      .select()
      .from(SessionChatTable)
      //@ts-ignore
      .where(eq(SessionChatTable.createdBy, user?.primaryEmailAddress?.emailAddress))
      .orderBy(desc(SessionChatTable.id));

      return NextResponse.json(result);

  }else{
     const result = await db
      .select()
      .from(SessionChatTable)
      //@ts-ignore
      .where(eq(SessionChatTable.sessionId, sessionId));

    if (result.length === 0) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Verify the user owns this session
    if (result[0].createdBy !== user?.primaryEmailAddress?.emailAddress) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Find the full doctor object from the stored specialist name
    const sessionData = result[0];
    const doctor = AIDoctorAgents.find(
      (doc) => doc.specialist === sessionData.selectedDoctor
    );

    // Return session data with full doctor object
    return NextResponse.json({
      ...sessionData,
      selectedDoctor: doctor || null,
    });
    
  }

  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
  }

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // const result = await db
    //   .select()
    //   .from(SessionChatTable)
    //   .where(eq(SessionChatTable.sessionId, sessionId));

    // if (result.length === 0) {
    //   return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    // }

    // // Verify the user owns this session
    // if (result[0].createdBy !== user.primaryEmailAddress?.emailAddress) {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }

    // // Find the full doctor object from the stored specialist name
    // const sessionData = result[0];
    // const doctor = AIDoctorAgents.find(
    //   (doc) => doc.specialist === sessionData.selectedDoctor
    // );

    // // Return session data with full doctor object
    // return NextResponse.json({
    //   ...sessionData,
    //   selectedDoctor: doctor || null,
    // });
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}