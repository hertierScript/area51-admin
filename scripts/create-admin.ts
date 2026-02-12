import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcrypt";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminUser() {
  try {
    // Hash the password
    const password = "admin123";
    const passwordHash = await bcrypt.hash(password, 10);

    // First, ensure the admin role exists
    const { data: roleData, error: roleError } = await supabase
      .from("roles")
      .select("id")
      .eq("name", "admin")
      .single();

    if (roleError) {
      console.error("Error fetching admin role:", roleError);

      // Try to create the role if it doesn't exist
      const { data: newRole, error: createRoleError } = await supabase
        .from("roles")
        .insert({ name: "admin", description: "Administrator role" })
        .select()
        .single();

      if (createRoleError) {
        console.error("Error creating admin role:", createRoleError);
        return;
      }

      console.log("Created admin role:", newRole);
    }

    const roleId = roleData?.id;

    // Check if admin user already exists
    const { data: existingUser } = await supabase
      .from("admin_users")
      .select("id")
      .eq("email", "admin@restaurant.com")
      .single();

    if (existingUser) {
      // Update existing user
      const { error: updateError } = await supabase
        .from("admin_users")
        .update({
          password_hash: passwordHash,
          is_active: true,
          role_id: roleId,
        })
        .eq("email", "admin@restaurant.com");

      if (updateError) {
        console.error("Error updating admin user:", updateError);
        return;
      }

      console.log("✅ Admin user updated successfully!");
    } else {
      // Create new admin user
      const { data, error } = await supabase
        .from("admin_users")
        .insert({
          email: "admin@restaurant.com",
          password_hash: passwordHash,
          name: "Admin User",
          role_id: roleId,
          is_active: true,
        })
        .select();

      if (error) {
        console.error("Error creating admin user:", error);
        return;
      }

      console.log("✅ Admin user created successfully!");
    }

    console.log("\nDemo credentials:");
    console.log("Email: admin@restaurant.com");
    console.log("Password: admin123");
  } catch (error) {
    console.error("Error:", error);
  }
}

createAdminUser();
