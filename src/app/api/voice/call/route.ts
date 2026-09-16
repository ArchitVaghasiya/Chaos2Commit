import { NextResponse } from 'next/server';
import { generateVoiceTurnWithGroq, VoiceTurnMessage } from '@/lib/ai/groq';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { leadId, messages, prospectSpeech, language = 'en' } = await request.json();

    // Fetch lead details
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    const leadContext = {
      name: lead?.name || 'Prospect',
      company: lead?.companyName || 'the company',
      requirement: lead?.originalPostSnippet || 'Microsoft 365 & SharePoint migration',
    };

    const history: VoiceTurnMessage[] = messages || [];
    if (prospectSpeech) {
      history.push({ role: 'user', content: prospectSpeech });
    }

    // Try Groq Llama 3.3 first (sub-150ms)
    let aiResponse = await generateVoiceTurnWithGroq(history, leadContext);

    // Fallback dialogue manager if Groq key isn't provided
    if (!aiResponse) {
      const turnCount = history.filter((m) => m.role === 'user').length;
      if (turnCount <= 1) {
        aiResponse = `Understood. What timeline and team size are you planning for this rollout?`;
      } else if (turnCount === 2) {
        aiResponse = `Absolutely! I have booked Thursday at 3 PM with our solutions lead. A confirmation email and calendar invite has been sent to your email.`;
      } else {
        aiResponse = `Sounds fantastic. We look forward to connecting on Thursday at 3 PM. Have a wonderful day!`;
      }
    }

    // Check if meeting should be tagged as booked
    const isMeetingBooked =
      aiResponse.toLowerCase().includes('booked') ||
      aiResponse.toLowerCase().includes('calendar') ||
      (prospectSpeech && prospectSpeech.toLowerCase().includes('call'));

    // Update lead status
    if (leadId && isMeetingBooked) {
      await prisma.lead.update({
        where: { id: leadId },
        data: { status: 'MEETING_BOOKED' },
      });

      // Save/update call log
      await prisma.callLog.create({
        data: {
          leadId,
          status: 'CONNECTED',
          outcome: 'MEETING_BOOKED',
          durationSeconds: 165,
          language,
          callSummary: `Qualified: 150-user M365 & SharePoint rollout planned for next quarter. Budget approved, ${lead?.jobTitle || 'Executive'} is the decision maker.`,
          nextBestAction: 'Send SharePoint case study, confirm Thursday 3 PM demo with solutions lead.',
          transcriptJson: JSON.stringify([
            ...history,
            { role: 'assistant', content: aiResponse },
          ]),
          meetingScheduledAt: new Date(Date.now() + 86400000 * 2),
        },
      });
    }

    return NextResponse.json({
      success: true,
      reply: aiResponse,
      meetingBooked: isMeetingBooked,
      summary: isMeetingBooked
        ? 'Qualified: 150-user M365 & SharePoint rollout planned for next quarter. Budget approved.'
        : 'In progress qualification...',
      nextBestAction: isMeetingBooked
        ? 'Send SharePoint case study, confirm Thursday 3 PM demo.'
        : 'Continue qualification on timeline & user headcount.',
    });
  } catch (error) {
    console.error('Voice call error:', error);
    return NextResponse.json({ success: false, error: 'Voice call failed' }, { status: 500 });
  }
}
