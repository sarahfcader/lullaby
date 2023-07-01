import { cssBundleHref } from "@remix-run/css-bundle";
import { 
  json,
  type LinksFunction,
  type LoaderArgs } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRevalidator,
} from "@remix-run/react";
import { useState, useEffect } from "react";
import createServerSupabase from "utils/supabase.server";
import { createBrowserClient } from "@supabase/auth-helpers-remix";

import type { Database} from "utils/db_types";
import type { SupabaseClient } from "@supabase/supabase-js";

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

type TypedSupabaseClient = SupabaseClient<Database>;
export type SupabaseOutletContext = {
  supabase : TypedSupabaseClient;
};


// Global wrapper for all pages
// Outlet is replaced by whatever route is currently active

// Load env variables from server side and pipe them to client through OutletContext
export const loader = async({request}: LoaderArgs) => {
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!
  };

  const response = new Response();
  const supabase = createServerSupabase({ request, response});

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return json({env, session}, {headers: response.headers});
}; 

export default function App() {
  const {env, session} = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();

  // Since no set function is defined for this useState hook, it is a constant singleton instance
  // Key and url are exposed to browser, but the public key is safe to share as long as RLS is in place because it cannot bypass existing security rules.
  const [supabase] = useState(() => 
    createBrowserClient<Database>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)
  );

  const serverAccessToken = session?.access_token;

  useEffect(() => {
    const {data: {subscription}} =
    supabase.auth.onAuthStateChange((event, session) => {
      if (session?.access_token !== serverAccessToken) {
        // call loaders
        revalidator.revalidate();
      }
    })

    return () => {
      subscription.unsubscribe()
    };
  }, [supabase, serverAccessToken, revalidator]);

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
