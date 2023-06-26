import {createClient } from "@supabase/supabase-js";
import type { Database} from "utils/db_types";

export default createClient<Database>(
    // Only exist when running in server context
    // Eg. Loader or action
    // Don't exist in client context
    // .server ending is a remix convention, no code from file should be in user's browser
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
);