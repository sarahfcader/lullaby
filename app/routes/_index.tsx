import type { ActionArgs, V2_MetaFunction } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import createServerSupabase from "utils/supabase.server";

import { json, type LoaderArgs } from "@remix-run/node";
import Login from "components/login";

export const action = async({request}: ActionArgs) => {
  const response = new Response();
  const supabase = createServerSupabase({request, response});

  const { message } = Object.fromEntries(await request.formData());
  const { data } = (await supabase.auth.getSession());
  const user_id = data.session?.user.id;
  if (!user_id) {
    return;
  }

  const { error } = await supabase
    .from('messages')
    .insert({user_id: user_id, content: String(message)});

  if (error) {
    console.log(error);
  }

  return json(null, {headers: response.headers});
};

export const loader = async ({request}: LoaderArgs) => {
  const response = new Response();
  const supabase = createServerSupabase({ request, response });
  const { data } = await supabase.from("messages").select();
  return json({ messages: data ?? [] }, { headers: response.headers})
};

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
      <Form method="post">
        <input type="text" name="message" />
        <button type="submit">Send</button>
      </Form>
    </>
  );
}
