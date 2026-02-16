export async function POST(req: Request) {
  try {
    const body = await req.json();

    const response = await fetch(process.env.GOOGLE_SCRIPT_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error("Google Script request failed");
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
    });
  } catch (error) {
    console.error("API ERROR:", error);
    return new Response(JSON.stringify({ success: false }), {
      status: 500,
    });
  }
}
