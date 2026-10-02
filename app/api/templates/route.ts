import { NextRequest, NextResponse } from "next/server";
import { getAllTemplates, saveTemplate, duplicateTemplate } from "@/lib/templates/registry";

export async function GET() {
  try {
    const templates = getAllTemplates();
    return NextResponse.json({ success: true, templates });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, template, sourceId, newName } = body;

    if (action === "duplicate" && sourceId) {
      const duplicated = duplicateTemplate(sourceId, newName);
      if (!duplicated) {
        return NextResponse.json({ error: "Source template not found." }, { status: 404 });
      }
      return NextResponse.json({ success: true, template: duplicated });
    }

    if (!template || !template.id || !template.name) {
      return NextResponse.json({ error: "Invalid template payload." }, { status: 400 });
    }

    const saved = saveTemplate(template);
    return NextResponse.json({ success: true, template: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
