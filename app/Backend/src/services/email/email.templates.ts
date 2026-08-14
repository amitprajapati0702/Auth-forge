export function buildOtpEmail(otp: string): string {
    return `
    <div style="font-family:'Inter',Arial, sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;background-color:#0a0a0a">
    <h2 style="color:#e5e7eb;text-align:center">OTP Verification</h2>
    <p style="font-size:16px;line-height:1.5;color:#9ca3af;margin:20px 0">
    Your one-time password (OTP) is:</p>
    <p style="font-size:24px;font-weight:bold;color:#fff;text-align:center">${otp}</p>
    <p style="font-size:16px;line-height:1.5;color:#9ca3af;margin:20px 0">
    If you did not request this OTP, please ignore this email.</p>
    <p style="font-size:16px;line-height:1.5;color:#9ca3af;margin:20px 0">
    Thanks,<br>Auth-forge Team</p>
    <div style="text-align:center;margin-top:30px;border-top:1px solid #374151;padding-top:20px">
    <p style="font-size:12px;color:#6b7280;">This email was sent automatically. Please do not reply to this email.</p>
    </div>
    </div>
    `;
}

export function buildPasswordResetEmail(resetUrl: string): string {
    return `
    <div style="font-family:'Inter',Arial, sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;background-color:#0a0a0a">
    <h2 style="color:#e5e7eb;text-align:center">Password Reset</h2>
    <p style="font-size:16px;line-height:1.5;color:#9ca3af;margin:20px 0">
    You requested to reset your password. Click the link below to reset it:</p>
    <div style="text-align:center;margin:30px 0">
      <a href="${resetUrl}" style="background-color:#6366f1;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block">Reset Password</a>
    </div>
    <p style="font-size:16px;line-height:1.5;color:#9ca3af;margin:20px 0">
    If you did not request a password reset, please ignore this email.</p>
    <p style="font-size:16px;line-height:1.5;color:#9ca3af;margin:20px 0">
    Thanks,<br>Auth-forge Team</p>
    <div style="text-align:center;margin-top:30px;border-top:1px solid #374151;padding-top:20px">
    <p style="font-size:12px;color:#6b7280;">This link will expire in 15 minutes. Please do not reply to this email.</p>
    </div>
    </div>
    `;
}