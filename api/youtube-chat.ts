// Inspired from https://github.com/bigmonmulgrew/YouTube-Live-Chat-URL-finder

import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'https://deno.land/x/lambda/mod.ts';

const YOUTUBE_BASE_URL = "https://youtube.com";

export async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
    const channelUrl = event.queryStringParameters?.channel;

    try {
        validYouTubeChannel(channelUrl);
        const liveId = await findLiveId(channelUrl);
        const liveUrl = `${YOUTUBE_BASE_URL}/live_chat?v=${liveId}&is_popout=1`

        return {
            body: `Redirecting to ${liveUrl}`,
            headers: {
                'content-type': 'text/html; charset=utf-8',
                'location': liveUrl
            },
            statusCode: 301,
        };
    } catch (e) {
        return {
            body: e.message,
            headers: {
                'content-type': 'text/html; charset=utf-8',
            },
            statusCode: 400,
        }
    }
}

function validYouTubeChannel(channelUrl?: string): asserts channelUrl {
    if (!channelUrl || channelUrl.startsWith(YOUTUBE_BASE_URL)) {
        throw new Error('Invalid YouTube channel URL.');
    }

    if (!/\/live$/.test(channelUrl)) {
        throw new Error('YouTube channel URL should end with "/live". e.g "https://www.youtube.com/channel/ParisDeno/live"')
    }
}


async function findLiveId(channelUrl: string): Promise<string> {
    const page = await (await fetch(channelUrl)).text();

    const [, liveId] = /i\.ytimg\.com\/vi\/(.*)\//ig.exec(page) ?? [, ''];

    if (!liveId || new RegExp(`watch\\?v=${liveId}`, "gi").test(page)) {
        throw new Error("Live ID not found. Is your live set to public?");
    }

    return liveId;
}
