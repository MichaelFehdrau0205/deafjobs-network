import { NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

// Real text extraction, not a mock: pdf-parse and mammoth both read the
// actual file. No field-guessing (name, job titles, dates) — the candidate
// reviews the raw text themselves, same honesty as the caption editor.
export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(req: Request) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "That upload didn't come through. Try again." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file received." }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "That file is empty." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "That file is bigger than 10 MB. Try a smaller file." }, { status: 400 });
  }

  const name = file.name.toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    let text = "";

    if (name.endsWith(".pdf") || file.type === "application/pdf") {
      const parser = new PDFParse({ data: buffer });
      try {
        const result = await parser.getText();
        text = result.text;
      } finally {
        await parser.destroy();
      }
    } else if (
      name.endsWith(".docx") ||
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else if (name.endsWith(".txt") || file.type === "text/plain") {
      text = buffer.toString("utf-8");
    } else if (name.endsWith(".doc")) {
      return NextResponse.json(
        {
          error:
            "Old .doc files aren't supported. Save it as a .docx or PDF in Word (“Save As”), then upload that.",
        },
        { status: 400 },
      );
    } else {
      return NextResponse.json(
        { error: "That file type isn't supported. Upload a PDF, a Word (.docx) file, or plain text." },
        { status: 400 },
      );
    }

    text = text
      .replace(/\r\n/g, "\n")
      .replace(/[ \t]+\n/g, "\n")
      // pdf-parse inserts a "-- N of M --" marker between pages; it's
      // pagination bookkeeping, not part of the resume.
      .replace(/^--\s*\d+\s+of\s+\d+\s*--$/gm, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (!text) {
      return NextResponse.json(
        {
          error:
            "We couldn't find any text in that file. It may be a scanned image rather than real text — try a different file, or paste your resume text in by hand.",
        },
        { status: 422 },
      );
    }

    return NextResponse.json({ text, fileName: file.name });
  } catch (err) {
    console.error("resume parse error:", err);
    return NextResponse.json(
      { error: "That file couldn't be read. It may be corrupted or password-protected." },
      { status: 422 },
    );
  }
}
