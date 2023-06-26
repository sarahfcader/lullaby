import type { LoaderArgs } from "@remix-run/node";
import type { V2_MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import supabase from "utils/supabase.server";
import Login from "components/login";

export const loader = async ({}: LoaderArgs) => {
  const { data } = await supabase.from("messages").select();
  return { messages: data || [] };
}

export const meta: V2_MetaFunction = () => {
  return [
    { title: "Lullaby" },
    { name: "A simple messaging app made with Remix."},
  ];
};

export default function Index() {
  // Hook, type inferred from return type of loader()
  const { messages } = useLoaderData<typeof loader>();
  return (
    <>
      <Login />
      <pre>{JSON.stringify(messages, null, 2)}</pre>
    </>
  );
}
