import { type NextRequest, NextResponse } from "next/server";
import {
  FileScanService,
  PangeaConfig,
  PangeaResponse,
  FileScan,
} from "pangea-node-sdk";
import formidable from "formidable";

export const dynamic = "force-dynamic";

export const config = {
  api: {
    bodyParser: false,
  },
};

const pangeaConfig = new PangeaConfig({
  domain: String(process.env.PANGEA_FILE_SCAN_DOMAIN),
});
const client = new FileScanService(
  String(process.env.PANGEA_FILE_SCAN_TOKEN),
  pangeaConfig
);

const parseForm = async (
  req: Request
): Promise<{ files: formidable.Files }> => {
  const form = formidable({ multiples: true });

  return new Promise((resolve, reject) => {
    form.parse(req as any, (err, fields, files) => {
      if (err) reject(err);
      resolve({ files });
    });
  });
};

export async function POST(req: NextRequest) {
  const { files } = await parseForm(req);

  console.log({ files });

  if (!files || !Array.isArray(files.file)) {
    return NextResponse.json({
      note: "No files provided or invalid format",
      success: false,
      data: null,
    });
  }

  try {
    const scanResults: InstanceType<
      typeof PangeaResponse<FileScan.ScanResult>
    >[] = [];
    for (const file of files.file) {
      const request = { verbose: true, raw: true, provider: "crowdstrike" }; // Modify request parameters as needed
      const response = await client.fileScan(request, file.filepath);

      scanResults.push(response);
    }

    return NextResponse.json({ success: true, data: scanResults });
  } catch (error) {
    return NextResponse.json({
      success: false,
      data: null,
      note: "Error scanning files",
    });
  }
}
