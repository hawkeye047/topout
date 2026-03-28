import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { rawInput, activities } = await request.json();

    if (!rawInput) {
      return NextResponse.json({ error: 'No input provided' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 500 }
      );
    }

    // Build activity context for Claude
    const activityList = activities.map((a) =>
      `- ID: ${a.id}, Name: "${a.name}", Owner: "${a.owner}", Status: ${a.status}, %Complete: ${a.percentComplete || 0}`
    ).join('\n');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: `You are a construction daily log parser for a project management tool called TopOut. Parse the following daily field report into structured activity updates.

CURRENT SCHEDULE ACTIVITIES:
${activityList}

DAILY LOG INPUT:
"${rawInput}"

Return ONLY valid JSON with no markdown backticks or explanation. Match each mentioned item to the closest activity from the schedule. The JSON must follow this structure:

{
  "parsedUpdates": [
    {
      "activityId": "string (from the activity list above, or empty if no match)",
      "activityName": "string (the matched activity name)",
      "previousStatus": "string (current status from the list)",
      "newStatus": "not-started | in-progress | complete | delayed",
      "percentComplete": number (0-100, estimate based on context),
      "note": "string (relevant detail from the input)",
      "delayFlag": boolean,
      "delayCause": "string or null (if delayed, the reason)",
      "delayDays": number (estimated days of delay, 0 if none)
    }
  ],
  "weather": "string (if mentioned, otherwise empty)",
  "crewCount": number (if mentioned, otherwise 0),
  "summary": "string (one-line summary of the day's progress)"
}

Rules:
- Match activities by name similarity — the user may use abbreviations or informal names
- If the user says something is "done", "finished", "completed" → status: "complete", percentComplete: 100
- If the user says "started", "working on", "in progress" → status: "in-progress"
- If the user mentions delays, problems, or issues → set delayFlag: true and estimate delayDays
- If you can't match an update to a specific activity, still include it with activityId: "" and your best guess for activityName
- Be conservative with status changes — only change what's clearly stated
- Extract weather and crew count if mentioned anywhere in the input`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic API error:', err);
      return NextResponse.json({ error: 'Failed to parse daily log' }, { status: 500 });
    }

    const result = await response.json();
    const text = result.content?.map((c) => c.text || '').join('') || '';
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    return NextResponse.json(parsed);
  } catch (err) {
    console.error('Daily log parse error:', err);
    return NextResponse.json({ error: err.message || 'Parse failed' }, { status: 500 });
  }
}
