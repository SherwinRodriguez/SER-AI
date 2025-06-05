import { Webhook } from "svix";
import mongoose from "mongoose";
import User from "@/models/User";
import { headers } from "next/headers";
import connectDB from "@/config/db";
import { NextResponse } from "next/server"; // ✅ use NextResponse, not NextRequest

export async function POST(req) {
  try {
    // Initialize Svix webhook verification
    const wh = new Webhook(process.env.SIGNING_SECRET);

    // Read necessary Svix headers
    const headerPayload = headers();
    const svixHeaders = {
      "svix-id": headerPayload.get("svix-id"),
      "svix-timestamp": headerPayload.get("svix-timestamp"),
      "svix-signature": headerPayload.get("svix-signature"),
    };

    // Get raw body and verify webhook signature
    const payload = await req.json();
    const body = JSON.stringify(payload);
    const { data, type } = wh.verify(body, svixHeaders);

    // Optional: log the incoming webhook for debugging
    // console.log("Webhook type:", type, "Data:", data);

    // Safely extract email
    const email =
      Array.isArray(data.email_addresses) && data.email_addresses.length > 0
        ? data.email_addresses[0].email_address
        : "";

    // Prepare user data
    const userData = {
      _id: data.id,
      email,
      name: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
      image: data.image_url,
    };

    // Connect to DB
    await connectDB();

    // Handle different webhook events
    switch (type) {
      case "user.created":
        await User.create(userData);
        break;
      case "user.updated":
        await User.findByIdAndUpdate(data.id, userData);
        break;
      case "user.deleted":
        await User.findByIdAndDelete(data.id);
        break;
      default:
        break;
    }

    return NextResponse.json({ message: "Event received and processed successfully" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed", details: error.message },
      { status: 500 }
    );
  }
}
