import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  try {
    const { userId } = getAuth(req);

    const { chatId, promt } = await req.json();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "User not authenticated",
        },
        { status: 401 }
      );
    }

    if (!promt || !promt.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Prompt cannot be empty",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const data = await Chat.findOne({ userId, _id: chatId });
    if (!data) {
      return NextResponse.json(
        {
          success: false,
          message: "Chat not found",
        },
        { status: 404 }
      );
    }

    // Add user prompt to chat history
    const userPrompt = {
      role: "user",
      content: promt,
      timestampss: Date.now(),
    };
    data.messages.push(userPrompt);

    // Prepare messages for Groq API: only role and content
    const formattedMessages = data.messages.map(({ role, content }) => ({
      role,
      content,
    }));

    // Optional: limit messages to last 10 to avoid request size issues
    const limitedMessages = formattedMessages.slice(-10);

    // Send to Groq chat completion
    const completion = await groq.chat.completions.create({
      messages: limitedMessages,
      model: "llama-3.3-70b-versatile",
    });

    const message = completion.choices[0].message;
    message.timestampss = Date.now();

    data.messages.push(message);

    await data.save();

    return NextResponse.json({ success: true, data: message });
  } catch (error) {
    console.error("API error:", error);

    if (error?.response?.status === 429) {
      return NextResponse.json(
        {
          success: false,
          message: "API rate limit exceeded. Please try again later.",
        },
        { status: 429 }
      );
    }
    if (error?.response?.status === 401) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired API key.",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
