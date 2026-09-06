import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const brevoApiKey = Deno.env.get("BREVO_API_KEY")

serve(async (req) => {
  try {
    const payload = await req.json()
    console.log("Webhook payload received:", payload)

    // Only process INSERT events
    if (payload.type !== 'INSERT' || !payload.record) {
      return new Response(JSON.stringify({ error: 'Not an insert event' }), { status: 400 })
    }

    const invite = payload.record
    const toEmail = invite.to_email
    const fromRole = invite.from_role === 'coach' ? 'Koç' : 'Öğrenci'

    if (!brevoApiKey) {
      throw new Error("BREVO_API_KEY is missing from environment variables")
    }

    // Send the email via Brevo API
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": brevoApiKey,
      },
      body: JSON.stringify({
        sender: { email: "iletisim@hedefe.net", name: "Hedefe.net" },
        to: [{ email: toEmail }],
        subject: "Hedefe.net'e Davet Edildiniz!",
        htmlContent: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Merhaba!</h2>
            <p>Bir <strong>${fromRole}</strong> sizi Hedefe.net platformunda eşleşmeye davet etti.</p>
            <p>Daveti kabul etmek için aşağıdaki bağlantıya tıklayarak giriş yapabilir veya ücretsiz hesap oluşturabilirsiniz:</p>
            <div style="margin: 30px 0;">
              <a href="https://hedefe.net" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Hedefe.net'e Git
              </a>
            </div>
            <p style="color: #6b7280; font-size: 14px;">Eğer bu daveti beklemiyorsanız, bu e-postayı görmezden gelebilirsiniz.</p>
          </div>
        `,
      }),
    })

    const data = await res.json()
    console.log("Brevo response:", data)

    if (res.ok) {
      return new Response(JSON.stringify({ success: true, messageId: data.messageId }), { status: 200 })
    } else {
      return new Response(JSON.stringify({ error: data }), { status: 400 })
    }
  } catch (error) {
    console.error("Error sending email:", error.message)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
