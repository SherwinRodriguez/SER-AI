export async function POST(req) {
  try {
    console.log("Upload route called");

    const formData = await req.formData();
    console.log("Form data received");

    const file = formData.get("file");
    if (!file) {
      console.log("No file uploaded");
      return new Response(JSON.stringify({ error: "No file uploaded" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(`File name: ${file.name}, type: ${file.type}`);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log("File buffer created, size:", buffer.length);

    let summary = "";

    if (file.type === "application/pdf") {
      console.log("Parsing PDF...");
      const { default: pdfParse } = await import('@/lib/pdfParser.js');
      const data = await pdfParse(buffer);
      summary = data.text;
      console.log("PDF parsed");
    } else if (
      file.type === "text/plain" ||
      file.name.endsWith(".txt")
    ) {
      summary = buffer.toString("utf-8");
      console.log("Processed plain text");
    } else {
      summary = "Unsupported file type.";
      console.log("Unsupported file type");
    }

    return new Response(JSON.stringify({ summary }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Upload Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
