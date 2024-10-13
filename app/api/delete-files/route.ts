import { pinata } from "@/lib/pinata";
import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { fileIds: string[] };

  try {
    const deletedFiles = await pinata.files.delete(body.fileIds);
    return NextResponse.json(
      {
        success: true,
        data: deletedFiles.length,
        note: "",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({
      success: false,
      data: null,
      note: "Error deleting files",
    });
  }
}
