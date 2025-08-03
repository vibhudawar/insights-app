import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, email, username, country } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Check if email is already taken by another user
    if (email !== session.user.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });

      if (emailExists && emailExists.id !== session.user.id) {
        return NextResponse.json(
          { success: false, error: "Email already taken" },
          { status: 400 }
        );
      }
    }

    // Check if username is already taken (if provided)
    if (username) {
      const usernameExists = await prisma.user.findUnique({
        where: { username },
      });

      if (usernameExists && usernameExists.id !== session.user.id) {
        return NextResponse.json(
          { success: false, error: "Username already taken" },
          { status: 400 }
        );
      }
    }

    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        email,
        username: username || null,
        country: country || null,
        updated_at: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        country: true,
        image: true,
        account_tier: true,
        created_at: true,
        updated_at: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}