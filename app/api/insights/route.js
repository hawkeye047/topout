import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { project } = await request.json();
    if (!project) return NextResponse.json({ error: 'No project data' }, { status: 400 });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });

    const allActivities = project.schedule.phases.flatMap((p) =>
      p.activities.map((a) => `${a.name} [${a.status}] ${a.percentComplete || 0}% - ${a.owner} (${a.start} to ${a.end}, delay: ${a.delayDays || 0}d)`)
    );
    const delays = (project.delays || []).filter((d) => !d.resolved);
    const recentLogs = (project.dailyLogs || []).slice(0, 5);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `You are an AI construction project analyst. Given this schedule data, provide 2-3 brief, actionable insights. Be specific — reference trade names, activity names, and numbers.

PROJECT: ${project.name} ($${project.schedule.totalBudget?.toLocaleString() || 'N/A'})
SCHEDULE: ${project.schedule.projectStart} to ${project.schedule.projectEnd}

ACTIVITIES:
${allActivities.join('\n')}

DELAYS: ${delays.map((d) => `${d.activityName}: +${d.delayDays}d (${d.cause})`).join(', ') || 'None'}

RECENT LOGS: ${recentLogs.map((l) => l.rawInput).join(' | ') || 'None'}

Return ONLY a JSON array of 2-3 insight strings. Each insight should be 1-2 sentences, actionable, and reference specific activities or trades. No markdown:
["insight 1", "insight 2", "insight 3"]`,
        }],
      }),
    });

    if (!response.ok) {
      console.error('Insights API error:', await response.text());
      return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 });
    }

    const result = await response.json();
    const text = result.content?.map((c) => c.text || '').join('') || '';
    const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
    return NextResponse.json({ insights: Array.isArray(parsed) ? parsed : [] });
  } catch (err) {
    console.error('Insights error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
