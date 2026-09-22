import { remoteDb } from "./remoteDb";

// TODO: renombrar a "db" en todo el proyecto (queda "supabase" por ahora
// para no tocar cada página; ya no usa Supabase, habla con /api -> Neon).
export const supabase = remoteDb;
