import { getSession } from "@/lib/auth";
import { isEmptyFile, saveUpload, UploadError } from "@/lib/storage";

/** Uploads an image for use inside a blog post body. Returns { url }. */
export async function POST(request: Request) {
  if (!(await getSession())) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file");
  if (isEmptyFile(file)) return Response.json({ error: "Choose an image to upload." }, { status: 400 });

  try {
    const url = await saveUpload(file as File, "images");
    return Response.json({ url });
  } catch (error) {
    if (error instanceof UploadError) return Response.json({ error: error.message }, { status: 400 });
    throw error;
  }
}
