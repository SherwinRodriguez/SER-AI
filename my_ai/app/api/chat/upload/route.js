export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return new Response(JSON.stringify({ error: "No file uploaded" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let summary = "";

    if (file.type === "application/pdf") {
      const { default: pdfParse } = await import('@/lib/pdfParser.js'); // use wrapper
      const data = await pdfParse(buffer);
      summary = data.text;
    } else if (
      file.type === "text/plain" ||
      file.name.endsWith(".txt")
    ) {
      summary = buffer.toString("utf-8");
    } else {
      summary = "Unsupported file type.";
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
