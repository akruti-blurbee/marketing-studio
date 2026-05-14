"""Async OTP email sender using aiosmtplib."""
from __future__ import annotations

import os
from datetime import datetime
from email.message import EmailMessage

import aiosmtplib


async def send_otp_email(to: str, otp: str) -> None:
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_secure = os.getenv("SMTP_SECURE", "false").lower() == "true"
    smtp_user = os.getenv("SMTP_USER", "")
    smtp_pass = os.getenv("SMTP_PASS", "")
    from_addr = os.getenv("SMTP_FROM", smtp_user)
    year = datetime.now().year

    html = f"""<!DOCTYPE html>
<html><head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
</head>
<body style="margin:0;padding:0;background:#f5f0eb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0eb;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#fff;border-radius:20px;border:1px solid #e8e0d8;overflow:hidden;">
        <tr><td style="background:#1a1009;padding:28px 36px;">
          <p style="margin:0;color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">ADly AI</p>
          <p style="margin:4px 0 0;color:#a89880;font-size:13px;">AI Ad Studio for Modern Brands</p>
        </td></tr>
        <tr><td style="padding:36px;">
          <h1 style="margin:0 0 8px;color:#1a1009;font-size:22px;font-weight:700;">Verify your email</h1>
          <p style="margin:0 0 28px;color:#6b5f54;font-size:14px;line-height:1.6;">
            Use the code below to complete your registration. It expires in <strong>10 minutes</strong>.
          </p>
          <div style="background:#f5f0eb;border:1px solid #e8e0d8;border-radius:14px;padding:24px;text-align:center;margin-bottom:28px;">
            <p style="margin:0 0 6px;color:#9b8f85;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-family:monospace;">One-Time Password</p>
            <p style="margin:0;color:#1a1009;font-size:40px;font-weight:800;letter-spacing:10px;font-family:monospace;">{otp}</p>
          </div>
          <p style="margin:0;color:#9b8f85;font-size:12px;line-height:1.6;">
            If you didn't request this, you can safely ignore this email.<br/>Never share this code with anyone.
          </p>
        </td></tr>
        <tr><td style="background:#faf7f4;border-top:1px solid #e8e0d8;padding:20px 36px;">
          <p style="margin:0;color:#b8a898;font-size:11px;text-align:center;font-family:monospace;letter-spacing:1px;text-transform:uppercase;">
            &copy; {year} ADly AI &middot; Made with &#10022; for creators
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>"""

    msg = EmailMessage()
    msg["From"] = from_addr
    msg["To"] = to
    msg["Subject"] = f"{otp} is your ADly AI verification code"
    msg.set_content(
        f"Your ADly AI verification code is: {otp}\n\n"
        "This code expires in 10 minutes. Never share it with anyone."
    )
    msg.add_alternative(html, subtype="html")

    # STARTTLS (port 587) when smtp_secure=false; SSL (port 465) when smtp_secure=true
    await aiosmtplib.send(
        msg,
        hostname=smtp_host,
        port=smtp_port,
        username=smtp_user,
        password=smtp_pass,
        use_tls=smtp_secure,
        start_tls=(not smtp_secure),
    )
