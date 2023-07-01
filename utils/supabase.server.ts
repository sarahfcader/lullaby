import {createServerClient } from "@supabase/auth-helpers-remix";
import type { Database} from "utils/db_types";

export default ({
    request, 
    response,
}: {
    request: Request;
    response: Response;
}) =>
    createServerClient<Database>(
    // Only exist when running in server context
    // Eg. Loader or action
    // Don't exist in client context
    // .server ending is a remix convention, no code from file should be in user's browser
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { request, response }
);