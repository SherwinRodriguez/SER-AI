import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import os from "os";
import AdmZip from "adm-zip";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function getGroqFixedCode(content) {
  const prompt = `You are a senior developer. Fix any bugs or bad practices in the following code. Return ONLY the corrected code, no explanations:\n\n${content}`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
  });

  return completion.choices[0].message.content;
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "upload-"));

    // ✅ Handle .zip
    if (file.name.endsWith(".zip")) {
      const zip = new AdmZip(buffer);
      zip.extractAllTo(tempDir, true);

      const entries = await fs.readdir(tempDir, { withFileTypes: true });
      const codeFiles = entries.filter((entry) =>
        entry.isFile() && /\.(js|ts|py|html|css)$/.test(entry.name)
      );

      if (codeFiles.length === 0) {
        return NextResponse.json({ error: "No code files found in the ZIP." }, { status: 400 });
      }

      const modifiedDir = path.join(tempDir, "modified");
      await fs.mkdir(modifiedDir);

      for (const file of codeFiles) {
        const filePath = path.join(tempDir, file.name);
        const content = await fs.readFile(filePath, "utf-8");
        const fixedContent = await getGroqFixedCode(content);

        const modifiedPath = path.join(modifiedDir, file.name);
        await fs.writeFile(modifiedPath, fixedContent, "utf-8");
      }

      const outputZip = new AdmZip();
      const fixedFiles = await fs.readdir(modifiedDir);

      for (const fileName of fixedFiles) {
        const filePath = path.join(modifiedDir, fileName);
        const fileData = await fs.readFile(filePath);
        outputZip.addFile(fileName, fileData);
      }

      const zipBuffer = outputZip.toBuffer();

      return new Response(zipBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": 'attachment; filename="fixed_code.zip"',
        },
      });
    }

    // ✅ Handle .pdf
    if (file.type === "application/pdf") {
      const { default: pdfParse } = await import("@/lib/pdfParser.js");
      const data = await pdfParse(buffer);
      return NextResponse.json({ summary: data.text }, { status: 200 });
    }

    // ✅ Handle .txt
    if (file.type === "text/plain" || file.name.endsWith(".txt")) {
      const text = buffer.toString("utf-8");
      return NextResponse.json({ summary: text }, { status: 200 });
    }

    return NextResponse.json({ error: "Unsupported file type." }, { status: 415 });

  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
