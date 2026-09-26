import { getSession } from "@/lib/auth";
import { searchIcons } from "@/lib/tech-icons";

/** Icon search for the admin icon picker. */
export async function GET(request: Request) {
  if (!(await getSession())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const q = new URL(request.url).searchParams.get("q")?.slice(0, 60) ?? "";
  return Response.json({ icons: searchIcons(q) });
}
