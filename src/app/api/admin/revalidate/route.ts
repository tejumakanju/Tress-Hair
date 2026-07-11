import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { CacheTag } from "@/lib/cache-tags";

export const runtime = "nodejs";

/**
 * On-demand cache bust for catalog / FX.
 * POST { "tags": ["products"] } with header Authorization: Bearer <REVALIDATE_SECRET>
 */
export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  const auth = req.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;

  if (!secret || token !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let tags: string[] = [CacheTag.PRODUCTS];
  try {
    const body = (await req.json()) as { tags?: string[] };
    if (Array.isArray(body.tags) && body.tags.length > 0) {
      tags = body.tags;
    }
  } catch {
    // default tags
  }

  const allowed = new Set<string>([CacheTag.PRODUCTS, CacheTag.RATES]);
  const applied: string[] = [];

  for (const tag of tags) {
    if (!allowed.has(tag) && !tag.startsWith("product:")) continue;
    revalidateTag(tag, "max");
    applied.push(tag);
  }

  return NextResponse.json({ revalidated: true, tags: applied });
}
