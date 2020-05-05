import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "https://deno.land/x/lambda/mod.ts";
import * as path from "https://deno.land/x/std/path/mod.ts";

const __dirname = path.dirname(new URL(import.meta.url).pathname)

export async function handler(
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> {
  const scriptPath = path.resolve(__dirname, "../../script/youtube-chat-filter-question.ts");

  let [diag, out]: [Deno.DiagnosticItem[] | undefined, string] = [undefined, ''];
    try {
      [diag, out] = await Deno.bundle(scriptPath, void 0, { lib: ['dom', 'esnext']});
    } catch (e) {
      diag = true as any; // hardcore
    }
  
  if (diag !== null) {
    return {
      body: `Error during script compilation.`,
      headers: {
        "content-type": "text/html; charset=utf-8",
      },
      statusCode: 500,
    };
  }

  return {
    body: out,
    headers: {
      "content-type": "application/javascript",
    },
    statusCode: 200,
  };
}
