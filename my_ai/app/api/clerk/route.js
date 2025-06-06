import { Webhook } from "svix";
import mongoose from "mongoose";
import User from "@/models/User";
import { headers } from "next/headers";
import connectDB from "@/config/db";
import { NextRequest, NextResponse } from "next/server"; // ✅ use NextResponse, not NextRequest

export async function POST(req) {
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

    // Prepare user data
    const userData = {
      _id: data.id,
      email:data.email_addresses[0].email_address,
      name: `${data.first_name} ${data.last_name}`,
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

    return NextRequest.json({ message: "Event received and processed successfully" });
}
