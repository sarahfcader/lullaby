import { useOutletContext } from "@remix-run/react";
import { useEffect, useState } from "react";
import server from "server";
import type {Database} from "utils/db_types";
import { SupabaseOutletContext } from "~/root";

type Message = Database["public"]["Tables"]["messages"]["Row"];

export default function RealtimeMessages(
    {serverMessages}: {serverMessages: Message[];}) {
    
    const [messages, setMessages] = useState(serverMessages);
    const {supabase} = useOutletContext<SupabaseOutletContext>();

    // if user logs in or out, update messages from server
    useEffect(() => {
        console.log("updating server messages");
        setMessages(serverMessages);
    }, [serverMessages]);

    useEffect(() => {
        // Websocket
        const channel = supabase.channel('*').on('postgres_changes', {event: 'INSERT', schema: 'public', table: 'messages'}, (payload) => {
            const newMessage = payload.new as Message;

            if (!messages.find(message => message.id === newMessage.id)) {
                setMessages([...messages, newMessage]);
            }
            
        }).subscribe();

        return () => {
            supabase.removeChannel(channel);
        }
    }, [supabase, messages, setMessages]);
    return <pre>{JSON.stringify(messages, null, 2)}</pre>
}