import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Helper function to verify admin authentication
async function verifyAuth(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring(7);
    const session = JSON.parse(atob(token));

    // Verify the user exists and is active
    const supabase = createAdminClient();
    const { data: adminUser, error } = await supabase
      .from("admin_users")
      .select("id, email, name, is_active, role:roles(*)")
      .eq("id", session.id)
      .eq("email", session.email)
      .single();

    if (error || !adminUser || !adminUser.is_active) {
      return null;
    }

    return adminUser;
  } catch (error) {
    console.error("Auth verification error:", error);
    return null;
  }
}

// GET - Fetch all menu items
export async function GET(request: NextRequest) {
  try {
    const adminUser = await verifyAuth(request);
    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("menu_items")
      .select(
        `
        *,
        category:categories(id, name)
      `,
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching menu items:", error);
      return NextResponse.json(
        { error: "Failed to fetch menu items" },
        { status: 500 },
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("GET menu items error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST - Create a new menu item
export async function POST(request: NextRequest) {
  try {
    const adminUser = await verifyAuth(request);
    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, price, category_id, is_available, image_url } =
      body;

    if (!name || !price || !category_id) {
      return NextResponse.json(
        { error: "Name, price, and category are required" },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("menu_items")
      .insert({
        name,
        description: description || null,
        price: parseFloat(price),
        category_id,
        is_available: is_available !== undefined ? is_available : true,
        image_url: image_url || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating menu item:", error);
      return NextResponse.json(
        { error: "Failed to create menu item" },
        { status: 500 },
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("POST menu item error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT - Update a menu item
export async function PUT(request: NextRequest) {
  try {
    const adminUser = await verifyAuth(request);
    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      name,
      description,
      price,
      category_id,
      is_available,
      image_url,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Menu item ID is required" },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (category_id !== undefined) updateData.category_id = category_id;
    if (is_available !== undefined) updateData.is_available = is_available;
    if (image_url !== undefined) updateData.image_url = image_url;

    const { data, error } = await supabase
      .from("menu_items")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating menu item:", error);
      return NextResponse.json(
        { error: "Failed to update menu item" },
        { status: 500 },
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("PUT menu item error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE - Delete a menu item
export async function DELETE(request: NextRequest) {
  try {
    const adminUser = await verifyAuth(request);
    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Menu item ID is required" },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from("menu_items").delete().eq("id", id);

    if (error) {
      console.error("Error deleting menu item:", error);
      return NextResponse.json(
        { error: "Failed to delete menu item" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE menu item error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
