import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tvedouflueusgxzdqiwf.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2ZWRvdWZsdWV1c2d4emRxaXdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxODM3MzQsImV4cCI6MjEwNTc1OTczNH0.Jpnlzv8AvOxaXhj6ThAMweH-eq443covUHb_7QQQohg";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    let response = NextResponse.json({ success: true, message: "Logged in successfully!" });

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          const cookieHeader = request.headers.get("cookie") || "";
          return cookieHeader
            .split(";")
            .map((c) => c.trim())
            .filter(Boolean)
            .map((c) => {
              const [name, ...val] = c.split("=");
              return { name, value: val.join("=") };
            });
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    // 1. Attempt standard password sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      // 2. If first time login, attempt signup for Super Admin
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: "Super Admin",
            role: "super_admin",
          },
        },
      });

      if (!signUpError && signUpData.user) {
        return response;
      }

      return NextResponse.json(
        { error: signInError.message || "Invalid credentials" },
        { status: 401 }
      );
    }

    return response;
  } catch (error: any) {
    console.error("Login route exception caught:", error);
    return NextResponse.json(
      { error: error?.message || "Authentication failed" },
      { status: 500 }
    );
  }
}
