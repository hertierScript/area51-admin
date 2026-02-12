import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import bcrypt from "bcrypt";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();

    const { data: adminUser, error } = await supabase
      .from("admin_users")
      .select("id, email, password_hash, name, is_active, role:roles(*)")
      .eq("email", email)
      .single();

    if (error || !adminUser) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    if (!adminUser.is_active) {
      return NextResponse.json(
        { error: "Account is disabled" },
        { status: 401 },
      );
    }

    const passwordMatch = await bcrypt.compare(
      password,
      adminUser.password_hash,
    );

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
