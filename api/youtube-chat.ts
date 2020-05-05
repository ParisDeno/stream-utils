// Inspired from https://github.com/bigmonmulgrew/YouTube-Live-Chat-URL-finder

import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "https://deno.land/x/lambda/mod.ts";

const YOUTUBE_BASE_URL = "https://youtube.com";
const CHANNEL_URL = (channelId: string) => `${YOUTUBE_BASE_URL}/channel/${channelId}/live`
const LIVE_URL = (liveId: string) => `${YOUTUBE_BASE_URL}/live_chat?v=${liveId}&is_popout=1`;

/**
 * http://localhost:3000/api/youtube-chat?channel=UCbwGFj1MoXSko_QgutV4_Cg
 */
export async function handler(
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> {
  const body: { path: string } = JSON.parse(event.body ?? "{}");
  const params = new URLSearchParams(body.path.split("?")[1]);
  const channelId = params.get("channel") ?? "";

  try {
    const liveId = await findLiveId(CHANNEL_URL(channelId));
    const liveUrl = LIVE_URL(liveId);

    if (params.has('debug')) {
      return {
        body: `Redirecting to ${liveUrl}`,
        headers: {
          "content-type": "text/html; charset=utf-8",
        },
        statusCode: 200,
      };
    }

    return {
      body: ``,
      headers: {
        'location': liveUrl
      },
      statusCode: 301,
    };
  } catch (e) {
    return {
      body: e.message,
      headers: {
        "content-type": "text/html; charset=utf-8",
      },
      statusCode: 400,
    };
  }
}

async function findLiveId(channelUrl: string): Promise<string> {
  // get channel page
  const page = await (await fetch(channelUrl)).text();

  // find first live id
  const [, liveId] = /i\.ytimg\.com\/vi\/(.*)\//ig.exec(page) ?? [, ""];

  // if not found
  // or if length > 15 (because of mismatch, sometimes we found videos in a playlist)
  // or if a video link with the same id is found (means that this is a past live)
  // or if, again, we have a mismatch
  if (!liveId || liveId.length > 15 || new RegExp(`watch\\?v=${liveId}`, "gi").test(page) || liveId.includes('/hqdefault.jpg')) {
    throw new Error("Live ID not found. Is your live set to public?");
  }

  return liveId;
}
