import { type NextRequest, NextResponse } from "next/server";
import {
  FileScanService,
  PangeaConfig,
  PangeaResponse,
  FileScan,
  FileData,
} from "pangea-node-sdk";

export const dynamic = "force-dynamic";

const pangeaConfig = new PangeaConfig({
  domain: String(process.env.PANGEA_FILE_SCAN_DOMAIN),
});
const client = new FileScanService(
  String(process.env.PANGEA_FILE_SCAN_TOKEN),
  pangeaConfig
);

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const files = formData.getAll("file");
  console.log({ files, types: files[0] instanceof File });

  if (files.length === 0) {
    return NextResponse.json({
      note: "No files provided or invalid format",
      success: false,
      data: null,
    });
  }

  //   return NextResponse.json({});

  try {
    const scanResults: InstanceType<
      typeof PangeaResponse<FileScan.ScanResult>
    >[] = [];

    let hasInvalidFormat = false;
    for (const file of files) {
      if (file instanceof File) {
        const arrayBuffer = await file.arrayBuffer();

        const fileData: FileData = {
          file: Buffer.from(arrayBuffer),
          name: file.name,
        };

        const request = { verbose: true, raw: true, provider: "crowdstrike" }; // Modify request parameters as needed
        const response = await client.fileScan(request, fileData);

        scanResults.push(response);
      } else {
        hasInvalidFormat;
        break;
      }
    }

    if (hasInvalidFormat) {
      return NextResponse.json({
        note: "One of the files was not a File",
        success: false,
        data: null,
      });
    }

    return NextResponse.json({ success: true, data: scanResults });
  } catch (error) {
    console.log(error);
    return NextResponse.json({
      success: false,
      data: null,
      note: "Error scanning files",
    });
  }
}
