import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { project } = await request.json();
    if (!project) return NextResponse.json({ error: 'No project data' }, { status: 400 });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });

    // Build context
    const phases = project.schedule.phases.map((p) => ({
      name: p.name,
      activities: p.activities.map((a) => ({
        name: a.name, status: a.status, owner: a.owner,
        percentComplete: a.percentComplete || 0,
        start: a.start, end: a.end, projectedEnd: a.projectedEnd,
        delayDays: a.delayDays || 0,
      })),
    }));

    const recentLogs = (project.dailyLogs || []).slice(0, 7);
    const changeOrders = project.changeOrders || [];
    const delays = (project.delays || []).filter((d) => !d.resolved);

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
        messages: [{
          role: 'user',
          content: `You are a construction project manager writing a weekly status report. Given the project schedule data, daily logs from this week, change orders, and delay log, produce a professional weekly report.

PROJECT: ${project.name}
BUDGET: $${project.schedule.totalBudget?.toLocaleString() || 'N/A'}
SCHEDULE: ${project.schedule.projectStart} to ${project.schedule.projectEnd}
PROJECTED END: ${project.schedule.projectedEnd || project.schedule.projectEnd}

PHASES & ACTIVITIES:
${JSON.stringify(phases, null, 1)}

DAILY LOGS (last 7 days):
${recentLogs.map((l) => `${l.date}: ${l.rawInput}`).join('\n') || 'None'}

CHANGE ORDERS:
${changeOrders.map((c) => `${c.number} - ${c.description} ($${c.costImpact}) [${c.status}]`).join('\n') || 'None'}

ACTIVE DELAYS:
${delays.map((d) => `${d.activityName}: +${d.delayDays}d (${d.cause})`).join('\n') || 'None'}

Return ONLY valid JSON with no markdown backticks:
{
  "weekEnding": "YYYY-MM-DD (this coming Friday)",
  "executiveSummary": "2-3 sentence overview",
  "progressThisWeek": ["activity updates as bullet points"],
  "upcomingNextWeek": ["activities planned for next week"],
  "delaysAndRisks": ["current delays and risk items"],
  "changeOrders": ["any COs issued this week"],
  "budgetStatus": { "original": number, "projected": number, "variance": number, "variancePct": number },
  "scheduleStatus": { "originalEnd": "date", "projectedEnd": "date", "varianceDays": number },
  "keyDecisionsNeeded": ["items requiring owner/team decisions"],
  "lookahead2Week": ["high-level 2-week forecast"]
}`,
        }],
      }),
    });

    if (!response.ok) {
      console.error('Anthropic API error:', await response.text());
      return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
    }

    const result = await response.json();
    const text = result.content?.map((c) => c.text || '').join('') || '';
    const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
    return NextResponse.json(parsed);
  } catch (err) {
    console.error('Weekly report error:', err);
    return NextResponse.json({ error: err.message || 'Generation failed' }, { status: 500 });
  }
}
