import { cssBundleHref } from "@remix-run/css-bundle";
import { json, type LinksFunction } from "@remix-run/node";
import type { LoaderArgs } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { useState } from "react";
import type { Database} from "utils/db_types";

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

// Global wrapper for all pages
// Outlet is replaced by whatever route is currently active

type TypedSupabaseClient = SupabaseClient<Database>;
export type SupabaseOutletContext = {
  supabase : TypedSupabaseClient;
};

export const loader = async({}: LoaderArgs) => {
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!
  }

  return json({env});
}

export default function App() {
  const {env} = useLoaderData<typeof loader>();

  // Since no set function is defined for this useState hook, it is a constant singleton instance
  const [supabase] = useState(() => createClient<Database>(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY
  ))

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet context={{supabase}}/> 
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
