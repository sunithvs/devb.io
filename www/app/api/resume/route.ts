import { NextRequest } from "next/server";
import { generateResumePDF } from "@/lib/resume";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    if (!username) {
      return Response.json({ error: "Username is required" }, { status: 400 });
    }

    const pdfInstance = await generateResumePDF(username);
    const pdfBuffer = await pdfInstance.toBuffer();

    //@ts-expect-error -- todo: fix this later
    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${username}-resume.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating resume:", error);
    return Response.json(
      { error: "Failed to generate resume" },
      { status: 500 },
    );
  }
}