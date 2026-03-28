import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { pdfBase64 } = await request.json();

    if (!pdfBase64) {
      return NextResponse.json({ error: 'No PDF data provided' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured. Set it in .env.local' },
        { status: 500 }
      );
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8000,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'document',
                source: {
                  type: 'base64',
                  media_type: 'application/pdf',
                  data: pdfBase64,
                },
              },
              {
                type: 'text',
                text: `You are a construction schedule parser. Extract the schedule from this PDF into structured JSON. Return ONLY valid JSON with no markdown backticks or explanation.

The JSON must follow this exact structure:
{
  "projectName": "string - project name or description",
  "projectStart": "YYYY-MM-DD - earliest activity start",
  "projectEnd": "YYYY-MM-DD - latest activity end",
  "totalBudget": null,
  "phases": [
    {
      "name": "Phase Name (e.g., Preconstruction, Demolition, Rough-In, Framing, Finishes, etc.)",
      "activities": [
        {
          "name": "Activity Name",
          "start": "YYYY-MM-DD",
          "end": "YYYY-MM-DD",
          "duration": number_of_calendar_days,
          "status": "not-started",
          "owner": "Responsible Party / Trade",
          "notes": "any relevant notes"
        }
      ]
    }
  ]
}

Rules:
- Group activities into logical construction phases (Preconstruction, Demolition, Rough-In, Framing & Drywall, Ceiling, Finishes, MEP Trim, Millwork & Specialties, FF&E & Closeout)
- Set all statuses to "not-started" by default
- Extract durations from the schedule data
- Infer responsible parties from activity names if not explicitly listed
- Calculate dates from Gantt bars, week columns, or date columns
- If only week numbers are shown, calculate actual dates from the project start
- Return ONLY the JSON object, no other text`,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic API error:', err);
      return NextResponse.json({ error: 'Failed to parse schedule' }, { status: 500 });
    }

    const result = await response.json();
    const text = result.content?.map((c) => c.text || '').join('') || '';
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    return NextResponse.json(parsed);
  } catch (err) {
    console.error('Parse error:', err);
    return NextResponse.json({ error: err.message || 'Parse failed' }, { status: 500 });
  }
}
