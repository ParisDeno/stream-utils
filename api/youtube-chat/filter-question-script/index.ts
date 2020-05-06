import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "https://deno.land/x/lambda/mod.ts";

export async function handler(
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> {
  const scriptPath = "assets/youtube-chat-filter-question.ts";

  let [diag, out]: [Deno.DiagnosticItem[] | undefined, string] = [undefined, ''];
    try {
      [diag, out] = await Deno.bundle(scriptPath, void 0, { lib: ['dom', 'esnext']});
    } catch (e) {
      diag = e as any; // hardcore
    }
  
  if (diag !== null) {
    console.error('Error during script compilation.');
    console.error(diag);
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
