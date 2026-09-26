import { NextResponse } from 'next/server';
import { sendOutboundSms } from '@/lib/telephony/twilio';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      leadId,
      phone = '+919737362307',
      leadName = 'Carlos Mendez',
      meetingTime = 'Thursday at 3:00 PM IST',
      language = 'English',
      meetingUrl = 'https://meet.google.com/qrs-tuvw-xyz',
    } = body;

    const firstName = leadName.split(' ')[0] || 'there';
    const lang = (language || 'English').toLowerCase();

    let smsBody = '';
    if (lang.includes('ગુજરાતી') || lang.includes('gujarati') || lang === 'gu') {
      smsBody = `📅 Techsolution મીટિંગ કન્ફર્મેશન:\nનમસ્તે ${firstName}, આપની ક્લાઉડ કન્સલ્ટેશન મીટિંગ ${meetingTime} પર કન્ફર્મ થઈ ગઈ છે.\nGoogle Meet: ${meetingUrl}\nઆભાર!`;
    } else if (lang.includes('हिन्दी') || lang.includes('hindi') || lang === 'hi') {
      smsBody = `📅 Techsolution मीटिंग कन्फर्मेशन:\nनमस्ते ${firstName}, आपकी क्लाउड कंसल्टेशन मीटिंग ${meetingTime} पर तय हो गई है।\nGoogle Meet लिंक: ${meetingUrl}\nधन्यवाद!`;
    } else if (lang.includes('español') || lang.includes('spanish') || lang === 'es') {
      smsBody = `📅 Confirmación de Cita - Techsolution:\nHola ${firstName}, su reunión está confirmada para ${meetingTime}.\nEnlace Google Meet: ${meetingUrl}\n¡Gracias!`;
    } else {
      smsBody = `📅 Techsolution Appointment Confirmation:\nHi ${firstName}, your strategy consultation has been successfully scheduled for ${meetingTime}.\nGoogle Meet: ${meetingUrl}\nReply to this message if you need to reschedule.`;
    }

    const smsResult = await sendOutboundSms({
      to: phone,
      body: smsBody,
    });

    if (leadId) {
      try {
        await prisma.lead.update({
          where: { id: leadId },
          data: {
            status: 'MEETING_BOOKED',
            calendlyStatus: 'BOOKED',
          },
        });
      } catch (_) {}
    }

    return NextResponse.json({
      success: true,
      smsResult,
      smsBody,
      phone,
      messageSid: smsResult.messageSid,
      isSimulated: smsResult.isSimulated,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error sending meeting verification SMS:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to dispatch meeting verification SMS' },
      { status: 500 }
    );
  }
}
