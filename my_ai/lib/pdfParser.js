import pdf from 'pdf-parse';

export default async function parsePDF(buffer) {
  try {
    const data = await pdf(buffer);
    return data; // data.text will contain extracted text
  } catch (error) {
    console.error("PDF parsing failed:", error);
    throw error;
  }
}
