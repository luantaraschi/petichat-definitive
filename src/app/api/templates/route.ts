import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api/error";

// GET /api/templates - List all active templates
export async function GET() {
  try {
    const templates = await prisma.template.findMany({
      where: { isActive: true },
      orderBy: [{ isPopular: "desc" }, { category: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        area: true,
        rito: true,
        isPopular: true,
        structure: true,
      },
    });

    return NextResponse.json({ templates });
  } catch (error) {
    return handleApiError(error);
  }
}
