export async function POST(req) {
  try {
    console.log("POST upload started");

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
    console.log(`File received: ${file.name}, type: ${file.type}`);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log(`Buffer size: ${buffer.length}`);

    let summary = "";

    if (file.type === "application/pdf") {
      console.log("Importing pdfParse...");
      const { default: pdfParse } = await import('@/lib/pdfParser.js');
      console.log("pdfParse imported, parsing PDF...");
      const data = await pdfParse(buffer);
      console.log("PDF parsed");
      summary = data.text;
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
