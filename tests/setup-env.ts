// tests/setup-env.ts
import { config } from "dotenv";
import { resolve } from "path";

// ⚠️ Isso precisa rodar ANTES de qualquer importação do app
config({ path: resolve(process.cwd(), ".env.test"), override: true });
