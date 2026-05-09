import type { NextConfig } from "next";

const supabaseImageHostnames = new Set(["qekajoldcyfvadhkpoob.supabase.co"]);

if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  supabaseImageHostnames.add(new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname);
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: Array.from(supabaseImageHostnames).map((hostname) => ({
      protocol: "https",
      hostname,
      pathname: "/storage/v1/object/public/product-images/**",
    })),
  },
};

export default nextConfig;
