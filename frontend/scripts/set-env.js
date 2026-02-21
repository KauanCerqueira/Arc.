// scripts/set-env.js
import fs from "fs";
import path from "path";
import https from "https";
import http from "http";

const mode = process.argv[2];
const envFile = path.resolve(".env.local");

async function getNgrokUrl() {
  return new Promise((resolve, reject) => {
    http
      .get("http://127.0.0.1:4040/api/tunnels", (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const json = JSON.parse(data);
            const tunnel = json.tunnels?.find((t) => t.public_url?.startsWith("https://"));
            resolve(tunnel?.public_url || null);
          } catch (err) {
            reject(err);
          }
        });
      })
      .on("error", reject);
  });
}

async function run() {
  let envContent = "";

  switch (mode) {
    case "dev":
      envContent = `
    # Ambiente local
    NEXT_PUBLIC_API_URL=http://localhost:5001
    NEXT_PUBLIC_APP_NAME=Arc.
    `;
      break;

    case "tunnel": {
      console.log("🔍 Procurando URL ativa do ngrok...");
      const ngrokUrl = await getNgrokUrl();
      if (!ngrokUrl) {
        console.error("❌ Nenhum túnel ngrok ativo encontrado. Execute 'ngrok http 5001' primeiro.");
        process.exit(1);
      }
      envContent = `
    # Ambiente com túnel ngrok
    NEXT_PUBLIC_API_URL=${ngrokUrl}
    NEXT_PUBLIC_APP_NAME=Arc.
    `;
      console.log(`✅ Túnel detectado: ${ngrokUrl}`);
      break;
    }

    case "prod":
      envContent = `
    # Ambiente de produção (AWS)
    NEXT_PUBLIC_API_URL=https://api.arc.com.br
    NEXT_PUBLIC_APP_NAME=Arc.
    `;
      break;

    default:
      console.error("❌ Modo inválido! Use: dev | tunnel | prod");
      process.exit(1);
  }

  fs.writeFileSync(envFile, envContent.trim());
  console.log(`✅ Arquivo .env.local atualizado para o modo: ${mode}`);
}

run();
