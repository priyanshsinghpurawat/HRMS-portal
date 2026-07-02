import nodemailer from "nodemailer";

let transporter;
const getTransporter = () => {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: 'smtp-relay.brevo.com',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }
    return transporter;
};

/**
 * Send a generic email
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.body - Email body text
 * @param {string} [options.html] - Optional HTML body content
 * @returns {Promise<boolean>}
 */
export const sendEmail = async ({ to, subject, body, html }) => {
    try {
        const mailOptions = {
            from: process.env.SENDER_EMAIL || process.env.SMTP_USER,
            to,
            subject,
            text: body,
            html
        };

        await getTransporter().sendMail(mailOptions);
        return true;
    } catch {
    }
};

/**
 * Generate the beautiful HTML verification email template
 * @param {string} name - Recipient name
 * @param {string} otp - Verification OTP code
 * @returns {string} HTML content
 */
export const getOTPEmailTemplate = (name, otp) => {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your sign-in</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F9F9F9; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F9F9F9; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border: 1px solid #EAEAEA; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          
          <!-- Logo & Header Section -->
          <tr>
            <td align="center" style="padding: 40px 40px 20px 40px;">
              <table border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding-bottom: 8px;">
                    <!-- Logo Image -->
                    <img src="https://res.cloudinary.com/harsh21/image/upload/v1782141956/pngLogo_1_wmn3el.png" alt="Jobdekho Logo" style="width: 200px; height: auto; display: block; margin: 0 auto;">
                  </td>
                </tr>
                <tr>
                  <!-- HRMS Services Subtitle -->
                  <td align="center" style="font-size: 12px; font-weight: bold; color: #FF5500; text-transform: uppercase; letter-spacing: 2px; padding-top: 2px; padding-bottom: 8px;">
                    — HRMS Services —
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <div style="height: 1px; background-color: #EAEAEA; width: 100%;"></div>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td align="center" style="padding: 30px 40px;">
              <h1 style="font-size: 24px; font-weight: 700; color: #1A1A1A; margin: 0 0 16px 0; font-family: Arial, sans-serif;">
                Verify your sign-in
              </h1>
              <p style="font-size: 15px; color: #555555; line-height: 24px; margin: 0 0 28px 0; font-family: Arial, sans-serif;">
                We received a sign-in attempt. Please use the OTP code below to verify your sign-in to <strong style="color: #FF5500; font-weight: bold;">Jobdekho + HRMS Services</strong>.
              </p>

              <!-- OTP Code Display Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <div style="background-color: #FFF2E8; border: 1px solid #FF5500; border-radius: 8px; padding: 20px 40px; display: inline-block;">
                      <span style="font-size: 44px; font-weight: 800; color: #FF5500; letter-spacing: 6px; font-family: monospace, sans-serif; line-height: 1;">
                        ${otp}
                      </span>
                    </div>
                  </td>
                </tr>
              </table>

              <p style="font-size: 14px; color: #777777; line-height: 20px; margin: 0 0 8px 0; font-family: Arial, sans-serif;">
                If you did not attempt to sign in, please ignore this email.
              </p>
              <p style="font-size: 14px; color: #777777; line-height: 20px; margin: 0; font-family: Arial, sans-serif;">
                This OTP will expire in <strong style="color: #FF5500; font-weight: bold;">5 minutes</strong>.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <div style="height: 1px; background-color: #F0F0F0; width: 100%;"></div>
            </td>
          </tr>

          <!-- Security Tip Footer Segment -->
          <tr>
            <td style="padding: 24px 40px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="38" valign="top" style="padding-top: 2px;">
                    <!-- Shield Icon -->
                    <div style="background-color: #FFF2E8; width: 26px; height: 26px; border-radius: 50%; text-align: center; line-height: 26px; font-size: 14px;">
                      🛡️
                    </div>
                  </td>
                  <td valign="top" style="font-size: 13px; color: #666666; line-height: 18px; font-family: Arial, sans-serif;">
                    <strong style="color: #FF5500; font-weight: bold;">For your security:</strong><br>
                    Jobdekho + HRMS Services will never ask for your password or any personal information.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Social Media Icons Row -->
          <tr>
            <td align="center" style="padding: 10px 40px 30px 40px;">
              <table border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding: 0 6px;">
                    <a href="https://www.jobdekho.com" style="text-decoration: none;">
                      <div style="background-color: #FF5500; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; color: #FFFFFF; font-size: 14px; font-weight: bold;">🌐</div>
                    </a>
                  </td>
                  <td style="padding: 0 6px;">
                    <a href="https://linkedin.com" style="text-decoration: none;">
                      <div style="background-color: #FF5500; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; color: #FFFFFF; font-size: 11px; font-weight: bold; font-family: sans-serif;">in</div>
                    </a>
                  </td>
                  <td style="padding: 0 6px;">
                    <a href="https://facebook.com" style="text-decoration: none;">
                      <div style="background-color: #FF5500; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; color: #FFFFFF; font-size: 12px; font-weight: bold; font-family: sans-serif;">f</div>
                    </a>
                  </td>
                  <td style="padding: 0 6px;">
                    <a href="https://twitter.com" style="text-decoration: none;">
                      <div style="background-color: #FF5500; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; color: #FFFFFF; font-size: 11px; font-weight: bold; font-family: sans-serif;">X</div>
                    </a>
                  </td>
                  <td style="padding: 0 6px;">
                    <a href="https://instagram.com" style="text-decoration: none;">
                      <div style="background-color: #FF5500; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; color: #FFFFFF; font-size: 13px; font-weight: bold; font-family: sans-serif;">📷</div>
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Full Width Orange Contact Footer Bar -->
          <tr>
            <td style="background-color: #FF5500; padding: 18px 24px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="left" style="font-size: 12px; color: #FFFFFF; font-family: Arial, sans-serif; width: 33%;">
                    ✉️ info@jobdekho.com
                  </td>
                  <td align="center" style="font-size: 12px; color: #FFFFFF; font-family: Arial, sans-serif; border-left: 1px solid rgba(255,255,255,0.3); border-right: 1px solid rgba(255,255,255,0.3); padding: 0 8px; width: 34%;">
                    📞 +91 00000 00000
                  </td>
                  <td align="right" style="font-size: 12px; color: #FFFFFF; font-family: Arial, sans-serif; width: 33%;">
                    🌐 www.jobdekho.com
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

        <!-- Outside copyright notice -->
        <p style="font-size: 11px; color: #999999; text-align: center; margin: 20px 0 0 0; font-family: Arial, sans-serif;">
          © 2026 Jobdekho + HRMS Services. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

/**
 * Send the premium HTML verification OTP email
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.name - Recipient name
 * @param {string} options.otp - OTP Code
 * @returns {Promise<boolean>}
 */
export const sendCompanyVerificationOTPEmail = async ({ to, name, otp }) => {
    const subject = "Verify your sign-in";
    const body = `Hello ${name},\n\nYour verification OTP is: ${otp}\n\nThis OTP is valid for 5 minutes.`;
    const html = getOTPEmailTemplate(name, otp);
    return await sendEmail({ to, subject, body, html });
};

/**
 * Send credentials email specifically to HR
 * @param {Object} options
 * @param {string} options.personalEmail - Recipient personal email
 * @param {string} options.name - HR Name
 * @param {string} options.companyName - Company Name
 * @param {string} options.category - HR category
 * @param {string} options.loginEmail - Generated login email
 * @param {string} options.tempPassword - Generated temporary password
 * @returns {Promise<boolean>}
 */
/**
 * Generate premium HTML HR Credentials email template
 */
export const getHRCredentialsEmailTemplate = ({
    name,
    companyName,
    category,
    loginEmail,
    tempPassword
}) => {
    const capitalizedCategory = category.charAt(0).toUpperCase() + category.slice(1);
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your HR Account Has Been Created</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F9F9F9; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F9F9F9; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border: 1px solid #EAEAEA; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          
          <!-- Logo & Header Section -->
          <tr>
            <td align="center" style="padding: 40px 40px 20px 40px;">
              <table border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding-bottom: 8px;">
                    <!-- Logo Image -->
                    <img src="https://res.cloudinary.com/harsh21/image/upload/v1782141956/pngLogo_1_wmn3el.png" alt="Jobdekho Logo" style="width: 200px; height: auto; display: block; margin: 0 auto;">
                  </td>
                </tr>
                <tr>
                  <!-- HRMS Services Subtitle -->
                  <td align="center" style="font-size: 12px; font-weight: bold; color: #FF5500; text-transform: uppercase; letter-spacing: 2px; padding-top: 2px; padding-bottom: 8px;">
                    — HRMS Services —
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <div style="height: 1px; background-color: #EAEAEA; width: 100%;"></div>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td align="center" style="padding: 30px 40px;">
              <h1 style="font-size: 22px; font-weight: 700; color: #1A1A1A; margin: 0 0 16px 0; font-family: Arial, sans-serif;">
                Your HR Account Has Been Created
              </h1>
              <p style="font-size: 15px; color: #555555; line-height: 24px; margin: 0 0 24px 0; font-family: Arial, sans-serif; text-align: left;">
                Hello ${name},<br><br>
                Welcome aboard! Your HR account for <strong>${companyName}</strong> has been created successfully. You can now log in using the credentials below:
              </p>

              <!-- Credentials Details Grid -->
              <table width="100%" border="0" cellspacing="0" cellpadding="12" style="background-color: #F9F9F9; border: 1px solid #EAEAEA; border-radius: 8px; margin-bottom: 24px; font-family: Arial, sans-serif; font-size: 14px; text-align: left;">
                <tr>
                  <td style="color: #666666; font-weight: bold; width: 40%; border-bottom: 1px solid #EAEAEA;">Company</td>
                  <td style="color: #1A1A1A; border-bottom: 1px solid #EAEAEA;">${companyName}</td>
                </tr>
                <tr>
                  <td style="color: #666666; font-weight: bold; border-bottom: 1px solid #EAEAEA;">Role Category</td>
                  <td style="color: #1A1A1A; border-bottom: 1px solid #EAEAEA;">${capitalizedCategory} HR</td>
                </tr>
                <tr>
                  <td style="color: #666666; font-weight: bold; border-bottom: 1px solid #EAEAEA;">Login Email</td>
                  <td style="color: #FF5500; font-weight: bold; font-family: monospace; border-bottom: 1px solid #EAEAEA;">${loginEmail}</td>
                </tr>
                <tr>
                  <td style="color: #666666; font-weight: bold; border-bottom: 1px solid #EAEAEA;">Temporary Password</td>
                  <td style="color: #1A1A1A; font-weight: bold; font-family: monospace; border-bottom: 1px solid #EAEAEA;">${tempPassword}</td>
                </tr>
                <tr>
                  <td style="color: #666666; font-weight: bold;">Login URL</td>
                  <td style="color: #1A1A1A;"><a href="https://yourdomain.com/hr/login" style="color: #FF5500; text-decoration: underline; font-weight: bold;">Go to Login Portal</a></td>
                </tr>
              </table>

              <!-- Action Call Out -->
              <div style="background-color: #FFF2E8; border-left: 4px solid #FF5500; padding: 15px; border-radius: 4px; margin-bottom: 24px; text-align: left;">
                <p style="font-size: 14px; color: #E65100; font-weight: bold; margin: 0 0 4px 0; font-family: Arial, sans-serif;">
                  🔒 Security Notice
                </p>
                <p style="font-size: 13.5px; color: #555555; line-height: 18px; margin: 0; font-family: Arial, sans-serif;">
                  For security reasons, you will be required to change your password immediately after your first login.
                </p>
              </div>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <div style="height: 1px; background-color: #F0F0F0; width: 100%;"></div>
            </td>
          </tr>

          <!-- Security Tip Footer Segment -->
          <tr>
            <td style="padding: 24px 40px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="38" valign="top" style="padding-top: 2px;">
                    <div style="background-color: #FFF2E8; width: 26px; height: 26px; border-radius: 50%; text-align: center; line-height: 26px; font-size: 14px;">
                      🛡️
                    </div>
                  </td>
                  <td valign="top" style="font-size: 13px; color: #666666; line-height: 18px; font-family: Arial, sans-serif;">
                    <strong style="color: #FF5500; font-weight: bold;">For your security:</strong><br>
                    Jobdekho + HRMS Services will never ask for your password or any personal information.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Social Media Icons Row -->
          <tr>
            <td align="center" style="padding: 10px 40px 30px 40px;">
              <table border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding: 0 6px;">
                    <a href="https://www.jobdekho.com" style="text-decoration: none;">
                      <div style="background-color: #FF5500; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; color: #FFFFFF; font-size: 14px; font-weight: bold;">🌐</div>
                    </a>
                  </td>
                  <td style="padding: 0 6px;">
                    <a href="https://linkedin.com" style="text-decoration: none;">
                      <div style="background-color: #FF5500; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; color: #FFFFFF; font-size: 11px; font-weight: bold; font-family: sans-serif;">in</div>
                    </a>
                  </td>
                  <td style="padding: 0 6px;">
                    <a href="https://facebook.com" style="text-decoration: none;">
                      <div style="background-color: #FF5500; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; color: #FFFFFF; font-size: 12px; font-weight: bold; font-family: sans-serif;">f</div>
                    </a>
                  </td>
                  <td style="padding: 0 6px;">
                    <a href="https://twitter.com" style="text-decoration: none;">
                      <div style="background-color: #FF5500; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; color: #FFFFFF; font-size: 11px; font-weight: bold; font-family: sans-serif;">X</div>
                    </a>
                  </td>
                  <td style="padding: 0 6px;">
                    <a href="https://instagram.com" style="text-decoration: none;">
                      <div style="background-color: #FF5500; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; color: #FFFFFF; font-size: 13px; font-weight: bold; font-family: sans-serif;">📷</div>
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Full Width Orange Contact Footer Bar -->
          <tr>
            <td style="background-color: #FF5500; padding: 18px 24px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="left" style="font-size: 12px; color: #FFFFFF; font-family: Arial, sans-serif; width: 33%;">
                    ✉️ info@jobdekho.com
                  </td>
                  <td align="center" style="font-size: 12px; color: #FFFFFF; font-family: Arial, sans-serif; border-left: 1px solid rgba(255,255,255,0.3); border-right: 1px solid rgba(255,255,255,0.3); padding: 0 8px; width: 34%;">
                    📞 +91 00000 00000
                  </td>
                  <td align="right" style="font-size: 12px; color: #FFFFFF; font-family: Arial, sans-serif; width: 33%;">
                    🌐 www.jobdekho.com
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

        <!-- Outside copyright notice -->
        <p style="font-size: 11px; color: #999999; text-align: center; margin: 20px 0 0 0; font-family: Arial, sans-serif;">
          © 2026 Jobdekho + HRMS Services. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

/**
 * Send credentials email specifically to HR
 */
export const sendHRCredentialsEmail = async ({
    personalEmail,
    name,
    companyName,
    category,
    loginEmail,
    tempPassword
}) => {
    const capitalizedCategory = category.charAt(0).toUpperCase() + category.slice(1);
    const subject = "Your HR Account Has Been Created";
    const body = `Hello ${name},\n\nYour HR account has been created successfully.\n\nCompany: ${companyName}\nCategory: ${capitalizedCategory} HR\nLogin Email: ${loginEmail}\nTemporary Password: ${tempPassword}\n\nLogin URL: https://yourdomain.com/hr/login`;
    const html = getHRCredentialsEmailTemplate({
        name,
        companyName,
        category,
        loginEmail,
        tempPassword
    });

    return await sendEmail({ to: personalEmail, subject, body, html });
};

/**
 * Generate premium HTML Employee Credentials email template
 */
export const getEmployeeCredentialsEmailTemplate = ({
    name,
    companyName,
    department,
    designation,
    loginEmail,
    tempPassword
}) => {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Employee Account Has Been Created</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F9F9F9; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F9F9F9; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border: 1px solid #EAEAEA; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          
          <!-- Logo & Header Section -->
          <tr>
            <td align="center" style="padding: 40px 40px 20px 40px;">
              <table border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding-bottom: 8px;">
                    <!-- Logo Image -->
                    <img src="https://res.cloudinary.com/harsh21/image/upload/v1782141956/pngLogo_1_wmn3el.png" alt="Jobdekho Logo" style="width: 200px; height: auto; display: block; margin: 0 auto;">
                  </td>
                </tr>
                <tr>
                  <!-- HRMS Services Subtitle -->
                  <td align="center" style="font-size: 12px; font-weight: bold; color: #FF5500; text-transform: uppercase; letter-spacing: 2px; padding-top: 2px; padding-bottom: 8px;">
                    — HRMS Services —
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <div style="height: 1px; background-color: #EAEAEA; width: 100%;"></div>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td align="center" style="padding: 30px 40px;">
              <h1 style="font-size: 22px; font-weight: 700; color: #1A1A1A; margin: 0 0 16px 0; font-family: Arial, sans-serif;">
                Your Employee Account Has Been Created
              </h1>
              <p style="font-size: 15px; color: #555555; line-height: 24px; margin: 0 0 24px 0; font-family: Arial, sans-serif; text-align: left;">
                Hello ${name},<br><br>
                Welcome aboard! Your employee account for <strong>${companyName}</strong> has been created successfully. You can now log in using the credentials below:
              </p>

              <!-- Credentials Details Grid -->
              <table width="100%" border="0" cellspacing="0" cellpadding="12" style="background-color: #F9F9F9; border: 1px solid #EAEAEA; border-radius: 8px; margin-bottom: 24px; font-family: Arial, sans-serif; font-size: 14px; text-align: left;">
                <tr>
                  <td style="color: #666666; font-weight: bold; width: 40%; border-bottom: 1px solid #EAEAEA;">Company</td>
                  <td style="color: #1A1A1A; border-bottom: 1px solid #EAEAEA;">${companyName}</td>
                </tr>
                <tr>
                  <td style="color: #666666; font-weight: bold; border-bottom: 1px solid #EAEAEA;">Department</td>
                  <td style="color: #1A1A1A; border-bottom: 1px solid #EAEAEA;">${department}</td>
                </tr>
                <tr>
                  <td style="color: #666666; font-weight: bold; border-bottom: 1px solid #EAEAEA;">Designation</td>
                  <td style="color: #1A1A1A; border-bottom: 1px solid #EAEAEA;">${designation}</td>
                </tr>
                <tr>
                  <td style="color: #666666; font-weight: bold; border-bottom: 1px solid #EAEAEA;">Login Email</td>
                  <td style="color: #FF5500; font-weight: bold; font-family: monospace; border-bottom: 1px solid #EAEAEA;">${loginEmail}</td>
                </tr>
                <tr>
                  <td style="color: #666666; font-weight: bold; border-bottom: 1px solid #EAEAEA;">Temporary Password</td>
                  <td style="color: #1A1A1A; font-weight: bold; font-family: monospace; border-bottom: 1px solid #EAEAEA;">${tempPassword}</td>
                </tr>
                <tr>
                  <td style="color: #666666; font-weight: bold;">Login URL</td>
                  <td style="color: #1A1A1A;"><a href="https://yourdomain.com/employee/login" style="color: #FF5500; text-decoration: underline; font-weight: bold;">Go to Login Portal</a></td>
                </tr>
              </table>

              <!-- Action Call Out -->
              <div style="background-color: #FFF2E8; border-left: 4px solid #FF5500; padding: 15px; border-radius: 4px; margin-bottom: 24px; text-align: left;">
                <p style="font-size: 14px; color: #E65100; font-weight: bold; margin: 0 0 4px 0; font-family: Arial, sans-serif;">
                  🔒 Security Notice
                </p>
                <p style="font-size: 13.5px; color: #555555; line-height: 18px; margin: 0; font-family: Arial, sans-serif;">
                  For security reasons, you will be required to change your password immediately after your first login.
                </p>
              </div>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <div style="height: 1px; background-color: #F0F0F0; width: 100%;"></div>
            </td>
          </tr>

          <!-- Security Tip Footer Segment -->
          <tr>
            <td style="padding: 24px 40px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="38" valign="top" style="padding-top: 2px;">
                    <div style="background-color: #FFF2E8; width: 26px; height: 26px; border-radius: 50%; text-align: center; line-height: 26px; font-size: 14px;">
                      🛡️
                    </div>
                  </td>
                  <td valign="top" style="font-size: 13px; color: #666666; line-height: 18px; font-family: Arial, sans-serif;">
                    <strong style="color: #FF5500; font-weight: bold;">For your security:</strong><br>
                    Jobdekho + HRMS Services will never ask for your password or any personal information.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Social Media Icons Row -->
          <tr>
            <td align="center" style="padding: 10px 40px 30px 40px;">
              <table border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding: 0 6px;">
                    <a href="https://www.jobdekho.com" style="text-decoration: none;">
                      <div style="background-color: #FF5500; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; color: #FFFFFF; font-size: 14px; font-weight: bold;">🌐</div>
                    </a>
                  </td>
                  <td style="padding: 0 6px;">
                    <a href="https://linkedin.com" style="text-decoration: none;">
                      <div style="background-color: #FF5500; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; color: #FFFFFF; font-size: 11px; font-weight: bold; font-family: sans-serif;">in</div>
                    </a>
                  </td>
                  <td style="padding: 0 6px;">
                    <a href="https://facebook.com" style="text-decoration: none;">
                      <div style="background-color: #FF5500; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; color: #FFFFFF; font-size: 12px; font-weight: bold; font-family: sans-serif;">f</div>
                    </a>
                  </td>
                  <td style="padding: 0 6px;">
                    <a href="https://twitter.com" style="text-decoration: none;">
                      <div style="background-color: #FF5500; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; color: #FFFFFF; font-size: 11px; font-weight: bold; font-family: sans-serif;">X</div>
                    </a>
                  </td>
                  <td style="padding: 0 6px;">
                    <a href="https://instagram.com" style="text-decoration: none;">
                      <div style="background-color: #FF5500; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; color: #FFFFFF; font-size: 13px; font-weight: bold; font-family: sans-serif;">📷</div>
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Full Width Orange Contact Footer Bar -->
          <tr>
            <td style="background-color: #FF5500; padding: 18px 24px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="left" style="font-size: 12px; color: #FFFFFF; font-family: Arial, sans-serif; width: 33%;">
                    ✉️ info@jobdekho.com
                  </td>
                  <td align="center" style="font-size: 12px; color: #FFFFFF; font-family: Arial, sans-serif; border-left: 1px solid rgba(255,255,255,0.3); border-right: 1px solid rgba(255,255,255,0.3); padding: 0 8px; width: 34%;">
                    📞 +91 00000 00000
                  </td>
                  <td align="right" style="font-size: 12px; color: #FFFFFF; font-family: Arial, sans-serif; width: 33%;">
                    🌐 www.jobdekho.com
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

        <!-- Outside copyright notice -->
        <p style="font-size: 11px; color: #999999; text-align: center; margin: 20px 0 0 0; font-family: Arial, sans-serif;">
          © 2026 Jobdekho + HRMS Services. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

export const sendEmployeeCredentialsEmail = async ({
    personalEmail,
    name,
    companyName,
    department,
    designation,
    loginEmail,
    tempPassword
}) => {
    const subject = "Your Employee Account Has Been Created";
    const body = `Hello ${name},\n\nYour employee account has been created successfully.\n\nCompany: ${companyName}\nDepartment: ${department}\nDesignation: ${designation}\nLogin Email: ${loginEmail}\nTemporary Password: ${tempPassword}\n\nLogin URL: https://yourdomain.com/employee/login`;
    const html = getEmployeeCredentialsEmailTemplate({
        name,
        companyName,
        department,
        designation,
        loginEmail,
        tempPassword
    });

    return await sendEmail({ to: personalEmail, subject, body, html });
};

/**
 * Generate the premium HTML subscription purchase confirmation template
 */
export const getSubscriptionConfirmationEmailTemplate = ({
    name,
    companyName,
    planName,
    amount,
    paymentId,
    purchaseDate,
    expiryDate
}) => {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Subscription Activated Successfully</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F9F9F9; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F9F9F9; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border: 1px solid #EAEAEA; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          
          <!-- Logo & Header Section -->
          <tr>
            <td align="center" style="padding: 40px 40px 20px 40px;">
              <table border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding-bottom: 8px;">
                    <!-- Logo Image -->
                    <img src="https://res.cloudinary.com/harsh21/image/upload/v1782141956/pngLogo_1_wmn3el.png" alt="Jobdekho Logo" style="width: 200px; height: auto; display: block; margin: 0 auto;">
                  </td>
                </tr>
                <tr>
                  <!-- HRMS Services Subtitle -->
                  <td align="center" style="font-size: 12px; font-weight: bold; color: #FF5500; text-transform: uppercase; letter-spacing: 2px; padding-top: 2px; padding-bottom: 8px;">
                    — HRMS Services —
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <div style="height: 1px; background-color: #EAEAEA; width: 100%;"></div>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td align="center" style="padding: 30px 40px;">
              <h1 style="font-size: 22px; font-weight: 700; color: #2E7D32; margin: 0 0 16px 0; font-family: Arial, sans-serif;">
                Subscription Activated Successfully
              </h1>
              <p style="font-size: 15px; color: #555555; line-height: 24px; margin: 0 0 24px 0; font-family: Arial, sans-serif; text-align: left;">
                Hello ${name},<br><br>
                Thank you for choosing Jobdekho+! Your subscription for **${companyName}** has been successfully activated. All premium HRMS modules and candidate database tools are now fully unlocked.
              </p>

              <!-- Subscription Invoice Grid -->
              <table width="100%" border="0" cellspacing="0" cellpadding="12" style="background-color: #F9F9F9; border: 1px solid #EAEAEA; border-radius: 8px; margin-bottom: 24px; font-family: Arial, sans-serif; font-size: 14px; text-align: left;">
                <tr>
                  <td style="color: #666666; font-weight: bold; width: 40%; border-bottom: 1px solid #EAEAEA;">Company Name</td>
                  <td style="color: #1A1A1A; border-bottom: 1px solid #EAEAEA;">${companyName}</td>
                </tr>
                <tr>
                  <td style="color: #666666; font-weight: bold; border-bottom: 1px solid #EAEAEA;">Plan Selected</td>
                  <td style="color: #FF5500; font-weight: bold; border-bottom: 1px solid #EAEAEA;">${planName}</td>
                </tr>
                <tr>
                  <td style="color: #666666; font-weight: bold; border-bottom: 1px solid #EAEAEA;">Amount Paid</td>
                  <td style="color: #1A1A1A; font-weight: bold; border-bottom: 1px solid #EAEAEA;">₹${amount}</td>
                </tr>
                <tr>
                  <td style="color: #666666; font-weight: bold; border-bottom: 1px solid #EAEAEA;">Payment ID</td>
                  <td style="color: #1A1A1A; font-family: monospace; border-bottom: 1px solid #EAEAEA;">${paymentId}</td>
                </tr>
                <tr>
                  <td style="color: #666666; font-weight: bold; border-bottom: 1px solid #EAEAEA;">Purchase Date</td>
                  <td style="color: #1A1A1A; border-bottom: 1px solid #EAEAEA;">${purchaseDate}</td>
                </tr>
                <tr>
                  <td style="color: #666666; font-weight: bold;">Expiry Date</td>
                  <td style="color: #D32F2F; font-weight: bold;">${expiryDate}</td>
                </tr>
              </table>

              <p style="font-size: 14px; color: #555555; line-height: 20px; margin: 0; font-family: Arial, sans-serif; text-align: left;">
                If you have any questions or require support, please contact our helpline or reply directly to this email.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <div style="height: 1px; background-color: #F0F0F0; width: 100%;"></div>
            </td>
          </tr>

          <!-- Security Tip Footer Segment -->
          <tr>
            <td style="padding: 24px 40px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="38" valign="top" style="padding-top: 2px;">
                    <div style="background-color: #FFF2E8; width: 26px; height: 26px; border-radius: 50%; text-align: center; line-height: 26px; font-size: 14px;">
                      🛡️
                    </div>
                  </td>
                  <td valign="top" style="font-size: 13px; color: #666666; line-height: 18px; font-family: Arial, sans-serif;">
                    <strong style="color: #FF5500; font-weight: bold;">For your security:</strong><br>
                    Jobdekho + HRMS Services will never ask for your password or any personal information.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Social Media Icons Row -->
          <tr>
            <td align="center" style="padding: 10px 40px 30px 40px;">
              <table border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding: 0 6px;">
                    <a href="https://www.jobdekho.com" style="text-decoration: none;">
                      <div style="background-color: #FF5500; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; color: #FFFFFF; font-size: 14px; font-weight: bold;">🌐</div>
                    </a>
                  </td>
                  <td style="padding: 0 6px;">
                    <a href="https://linkedin.com" style="text-decoration: none;">
                      <div style="background-color: #FF5500; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; color: #FFFFFF; font-size: 11px; font-weight: bold; font-family: sans-serif;">in</div>
                    </a>
                  </td>
                  <td style="padding: 0 6px;">
                    <a href="https://facebook.com" style="text-decoration: none;">
                      <div style="background-color: #FF5500; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; color: #FFFFFF; font-size: 12px; font-weight: bold; font-family: sans-serif;">f</div>
                    </a>
                  </td>
                  <td style="padding: 0 6px;">
                    <a href="https://twitter.com" style="text-decoration: none;">
                      <div style="background-color: #FF5500; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; color: #FFFFFF; font-size: 11px; font-weight: bold; font-family: sans-serif;">X</div>
                    </a>
                  </td>
                  <td style="padding: 0 6px;">
                    <a href="https://instagram.com" style="text-decoration: none;">
                      <div style="background-color: #FF5500; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; color: #FFFFFF; font-size: 13px; font-weight: bold; font-family: sans-serif;">📷</div>
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Full Width Orange Contact Footer Bar -->
          <tr>
            <td style="background-color: #FF5500; padding: 18px 24px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="left" style="font-size: 12px; color: #FFFFFF; font-family: Arial, sans-serif; width: 33%;">
                    ✉️ info@jobdekho.com
                  </td>
                  <td align="center" style="font-size: 12px; color: #FFFFFF; font-family: Arial, sans-serif; border-left: 1px solid rgba(255,255,255,0.3); border-right: 1px solid rgba(255,255,255,0.3); padding: 0 8px; width: 34%;">
                    📞 +91 00000 00000
                  </td>
                  <td align="right" style="font-size: 12px; color: #FFFFFF; font-family: Arial, sans-serif; width: 33%;">
                    🌐 www.jobdekho.com
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

        <!-- Outside copyright notice -->
        <p style="font-size: 11px; color: #999999; text-align: center; margin: 20px 0 0 0; font-family: Arial, sans-serif;">
          © 2026 Jobdekho + HRMS Services. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

/**
 * Send Subscription purchase confirmation email
 */
export const sendSubscriptionConfirmationEmail = async ({
    to,
    name,
    companyName,
    planName,
    amount,
    paymentId,
    expiresAt
}) => {
    const subject = "Subscription Activated Successfully";
    const purchaseDateStr = new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
    const expiryDateStr = new Date(expiresAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    const body = `Hello ${name},\n\nYour subscription for ${companyName} has been successfully activated.\n\nPlan: ${planName}\nAmount: ₹${amount}\nPayment ID: ${paymentId}\nExpiry Date: ${expiryDateStr}`;

    const html = getSubscriptionConfirmationEmailTemplate({
        name,
        companyName,
        planName,
        amount,
        paymentId,
        purchaseDate: purchaseDateStr,
        expiryDate: expiryDateStr
    });

    return await sendEmail({ to, subject, body, html });
};

export const getJobMatchEmailTemplate = ({
    candidateName,
    jobTitle,
    companyName,
    matchScore,
    matchedSkills
}) => {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Job Match Found</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F9F9F9; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F9F9F9; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border: 1px solid #EAEAEA; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          
          <!-- Logo & Header Section -->
          <tr>
            <td align="center" style="padding: 40px 40px 20px 40px;">
              <table border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding-bottom: 8px;">
                    <!-- Logo Image -->
                    <img src="https://res.cloudinary.com/harsh21/image/upload/v1782141956/pngLogo_1_wmn3el.png" alt="Jobdekho Logo" style="width: 200px; height: auto; display: block; margin: 0 auto;">
                  </td>
                </tr>
                <tr>
                  <td align="center" style="font-size: 12px; font-weight: bold; color: #FF5500; text-transform: uppercase; letter-spacing: 2px; padding-top: 2px; padding-bottom: 8px;">
                    — Job Alerts —
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <div style="height: 1px; background-color: #EAEAEA; width: 100%;"></div>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td align="center" style="padding: 30px 40px;">
              <h1 style="font-size: 22px; font-weight: 700; color: #1A1A1A; margin: 0 0 16px 0; font-family: Arial, sans-serif;">
                New Job Match Found
              </h1>
              <p style="font-size: 15px; color: #555555; line-height: 24px; margin: 0 0 24px 0; font-family: Arial, sans-serif; text-align: left;">
                Hello ${candidateName},<br><br>
                Great news! A new job listing has been published that matches your skills. Check out the details below:
              </p>

              <!-- Job Details Grid -->
              <table width="100%" border="0" cellspacing="0" cellpadding="12" style="background-color: #F9F9F9; border: 1px solid #EAEAEA; border-radius: 8px; margin-bottom: 24px; font-family: Arial, sans-serif; font-size: 14px; text-align: left;">
                <tr>
                  <td style="color: #666666; font-weight: bold; width: 40%; border-bottom: 1px solid #EAEAEA;">Job Title</td>
                  <td style="color: #1A1A1A; font-weight: bold; border-bottom: 1px solid #EAEAEA;">${jobTitle}</td>
                </tr>
                <tr>
                  <td style="color: #666666; font-weight: bold; border-bottom: 1px solid #EAEAEA;">Company</td>
                  <td style="color: #1A1A1A; border-bottom: 1px solid #EAEAEA;">${companyName}</td>
                </tr>
                <tr>
                  <td style="color: #666666; font-weight: bold; border-bottom: 1px solid #EAEAEA;">Match Score</td>
                  <td style="color: #FF5500; font-weight: bold; border-bottom: 1px solid #EAEAEA;">${matchScore}%</td>
                </tr>
                <tr>
                  <td style="color: #666666; font-weight: bold;">Matched Skills</td>
                  <td style="color: #1A1A1A; font-family: monospace;">${matchedSkills.join(", ")}</td>
                </tr>
              </table>

              <!-- Action Call Out -->
              <div style="background-color: #FFF2E8; border-left: 4px solid #FF5500; padding: 15px; border-radius: 4px; margin-bottom: 24px; text-align: left;">
                <p style="font-size: 14px; color: #E65100; font-weight: bold; margin: 0 0 4px 0; font-family: Arial, sans-serif;">
                  🚀 Ready to Apply?
                </p>
                <p style="font-size: 13.5px; color: #555555; line-height: 18px; margin: 0; font-family: Arial, sans-serif;">
                  Log in to your candidate dashboard to view the full job description and submit your application.
                </p>
              </div>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <div style="height: 1px; background-color: #F0F0F0; width: 100%;"></div>
            </td>
          </tr>

          <!-- Security Tip Footer Segment -->
          <tr>
            <td style="padding: 24px 40px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="38" valign="top" style="padding-top: 2px;">
                    <div style="background-color: #FFF2E8; width: 26px; height: 26px; border-radius: 50%; text-align: center; line-height: 26px; font-size: 14px;">
                      🛡️
                    </div>
                  </td>
                  <td valign="top" style="font-size: 13px; color: #666666; line-height: 18px; font-family: Arial, sans-serif;">
                    <strong style="color: #FF5500; font-weight: bold;">For your security:</strong><br>
                    Jobdekho + HRMS Services will never ask for your password or any personal information.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Social Media Icons Row -->
          <tr>
            <td align="center" style="padding: 10px 40px 30px 40px;">
              <table border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding: 0 6px;">
                    <a href="https://www.jobdekho.com" style="text-decoration: none;">
                      <div style="background-color: #FF5500; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; color: #FFFFFF; font-size: 14px; font-weight: bold;">🌐</div>
                    </a>
                  </td>
                  <td style="padding: 0 6px;">
                    <a href="https://linkedin.com" style="text-decoration: none;">
                      <div style="background-color: #FF5500; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; color: #FFFFFF; font-size: 11px; font-weight: bold; font-family: sans-serif;">in</div>
                    </a>
                  </td>
                  <td style="padding: 0 6px;">
                    <a href="https://facebook.com" style="text-decoration: none;">
                      <div style="background-color: #FF5500; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; color: #FFFFFF; font-size: 12px; font-weight: bold; font-family: sans-serif;">f</div>
                    </a>
                  </td>
                  <td style="padding: 0 6px;">
                    <a href="https://twitter.com" style="text-decoration: none;">
                      <div style="background-color: #FF5500; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; color: #FFFFFF; font-size: 11px; font-weight: bold; font-family: sans-serif;">X</div>
                    </a>
                  </td>
                  <td style="padding: 0 6px;">
                    <a href="https://instagram.com" style="text-decoration: none;">
                      <div style="background-color: #FF5500; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; color: #FFFFFF; font-size: 13px; font-weight: bold; font-family: sans-serif;">📷</div>
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Full Width Orange Contact Footer Bar -->
          <tr>
            <td style="background-color: #FF5500; padding: 18px 24px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="left" style="font-size: 12px; color: #FFFFFF; font-family: Arial, sans-serif; width: 33%;">
                    ✉️ info@jobdekho.com
                  </td>
                  <td align="center" style="font-size: 12px; color: #FFFFFF; font-family: Arial, sans-serif; border-left: 1px solid rgba(255,255,255,0.3); border-right: 1px solid rgba(255,255,255,0.3); padding: 0 8px; width: 34%;">
                    📞 +91 00000 00000
                  </td>
                  <td align="right" style="font-size: 12px; color: #FFFFFF; font-family: Arial, sans-serif; width: 33%;">
                    🌐 www.jobdekho.com
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

        <!-- Outside copyright notice -->
        <p style="font-size: 11px; color: #999999; text-align: center; margin: 20px 0 0 0; font-family: Arial, sans-serif;">
          © 2026 Jobdekho + HRMS Services. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

export const sendJobMatchEmail = async ({
    to,
    candidateName,
    jobTitle,
    companyName,
    matchScore,
    matchedSkills
}) => {
    const subject = "New Job Match Found";
    const body = `Hello ${candidateName},\n\nA new job matches your skills!\n\nJob Title: ${jobTitle}\nCompany: ${companyName}\nMatch Score: ${matchScore}%\nMatched Skills: ${matchedSkills.join(", ")}`;
    const html = getJobMatchEmailTemplate({
        candidateName,
        jobTitle,
        companyName,
        matchScore,
        matchedSkills
    });

    return await sendEmail({ to, subject, body, html });
};

/**
 * Generate premium HTML template for application submission
 */
export const getApplicationSubmittedEmailTemplate = (name, jobTitle, companyName) => {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Received Successfully</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F9F9F9; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F9F9F9; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border: 1px solid #EAEAEA; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <tr>
            <td align="center" style="padding: 40px 40px 20px 40px;">
              <table border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding-bottom: 8px;">
                    <!-- Logo Image -->
                    <img src="https://res.cloudinary.com/harsh21/image/upload/v1782141956/pngLogo_1_wmn3el.png" alt="Jobdekho Logo" style="width: 200px; height: auto; display: block; margin: 0 auto;">
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px;"><div style="height: 1px; background-color: #EAEAEA; width: 100%;"></div></td>
          </tr>
          <tr>
            <td align="center" style="padding: 30px 40px;">
              <h1 style="font-size: 22px; font-weight: 700; color: #1A1A1A; margin: 0 0 16px 0; font-family: Arial, sans-serif;">Application Received</h1>
              <p style="font-size: 15px; color: #555555; line-height: 24px; margin: 0 0 24px 0; font-family: Arial, sans-serif; text-align: left;">
                Hello ${name},<br><br>
                Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been received successfully.
              </p>
              <div style="background-color: #FFF2E8; border-left: 4px solid #FF5500; padding: 15px; border-radius: 4px; margin-bottom: 24px; text-align: left;">
                <p style="font-size: 13.5px; color: #555555; line-height: 18px; margin: 0; font-family: Arial, sans-serif;">
                  Your application has been logged on our platform. The hiring team at ${companyName} will review it shortly. You can track your status anytime from your Candidate Dashboard.
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px;"><div style="height: 1px; background-color: #F0F0F0; width: 100%;"></div></td>
          </tr>
          <tr>
            <td style="background-color: #FF5500; padding: 18px 24px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="left" style="font-size: 12px; color: #FFFFFF; font-family: Arial, sans-serif; width: 50%;">✉️ info@jobdekho.com</td>
                  <td align="right" style="font-size: 12px; color: #FFFFFF; font-family: Arial, sans-serif; width: 50%;">🌐 www.jobdekho.com</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

/**
 * Generate premium HTML template for application status update
 */
export const getApplicationStatusUpdateEmailTemplate = (name, jobTitle, companyName, statusText) => {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Status Updated</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F9F9F9; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F9F9F9; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border: 1px solid #EAEAEA; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <tr>
            <td align="center" style="padding: 40px 40px 20px 40px;">
              <table border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding-bottom: 8px;">
                    <!-- Logo Image -->
                    <img src="https://res.cloudinary.com/harsh21/image/upload/v1782141956/pngLogo_1_wmn3el.png" alt="Jobdekho Logo" style="width: 200px; height: auto; display: block; margin: 0 auto;">
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px;"><div style="height: 1px; background-color: #EAEAEA; width: 100%;"></div></td>
          </tr>
          <tr>
            <td align="center" style="padding: 30px 40px;">
              <h1 style="font-size: 22px; font-weight: 700; color: #1A1A1A; margin: 0 0 16px 0; font-family: Arial, sans-serif;">Application Status Updated</h1>
              <p style="font-size: 15px; color: #555555; line-height: 24px; margin: 0 0 24px 0; font-family: Arial, sans-serif; text-align: left;">
                Hello ${name},<br><br>
                The hiring team at <strong>${companyName}</strong> has updated the status of your application for <strong>${jobTitle}</strong>.
              </p>
              <table width="100%" border="0" cellspacing="0" cellpadding="12" style="background-color: #F9F9F9; border: 1px solid #EAEAEA; border-radius: 8px; margin-bottom: 24px; font-family: Arial, sans-serif; font-size: 14px; text-align: left;">
                <tr>
                  <td style="color: #666666; font-weight: bold; width: 40%;">New Status</td>
                  <td style="color: #FF5500; font-weight: bold;">${statusText}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px;"><div style="height: 1px; background-color: #F0F0F0; width: 100%;"></div></td>
          </tr>
          <tr>
            <td style="background-color: #FF5500; padding: 18px 24px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="left" style="font-size: 12px; color: #FFFFFF; font-family: Arial, sans-serif; width: 50%;">✉️ info@jobdekho.com</td>
                  <td align="right" style="font-size: 12px; color: #FFFFFF; font-family: Arial, sans-serif; width: 50%;">🌐 www.jobdekho.com</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

/**
 * Generate premium HTML template for polite rejection with recommended jobs
 */
export const getRejectionWithRecommendationsEmailTemplate = (name, jobTitle, companyName, recommendations = []) => {
    let recListHtml = "";
    if (recommendations && recommendations.length > 0) {
        recListHtml = recommendations.map(rec => `
          <tr style="border-bottom: 1px solid #EAEAEA;">
            <td style="padding: 12px; font-size: 14px; color: #1A1A1A; font-weight: bold;">${rec.title}</td>
            <td style="padding: 12px; font-size: 14px; color: #555555;">${rec.company}</td>
            <td style="padding: 12px; font-size: 14px; color: #FF5500; font-weight: bold; text-align: right;">${rec.matchScore}% Match</td>
          </tr>
        `).join("");
    } else {
        recListHtml = `
          <tr>
            <td colspan="3" style="padding: 12px; font-size: 14px; color: #777777; text-align: center;">No new matching openings at this moment. Check back soon!</td>
          </tr>
        `;
    }

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Update on your Application</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F9F9F9; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F9F9F9; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border: 1px solid #EAEAEA; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <tr>
            <td align="center" style="padding: 40px 40px 20px 40px;">
              <table border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding-bottom: 8px;">
                    <!-- Logo Image -->
                    <img src="https://res.cloudinary.com/harsh21/image/upload/v1782141956/pngLogo_1_wmn3el.png" alt="Jobdekho Logo" style="width: 200px; height: auto; display: block; margin: 0 auto;">
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px;"><div style="height: 1px; background-color: #EAEAEA; width: 100%;"></div></td>
          </tr>
          <tr>
            <td align="center" style="padding: 30px 40px;">
              <h1 style="font-size: 22px; font-weight: 700; color: #1A1A1A; margin: 0 0 16px 0; font-family: Arial, sans-serif;">Application Update</h1>
              <p style="font-size: 15px; color: #555555; line-height: 24px; margin: 0 0 24px 0; font-family: Arial, sans-serif; text-align: left;">
                Hello ${name},<br><br>
                Thank you for applying to the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>. After careful review, we regret to inform you that we will not be moving forward with your application for this specific role.
              </p>
              
              <div style="background-color: #FFF2E8; border-left: 4px solid #FF5500; padding: 15px; border-radius: 4px; margin-bottom: 24px; text-align: left;">
                <p style="font-size: 13.5px; color: #555555; line-height: 18px; margin: 0; font-family: Arial, sans-serif;">
                  However, we are very impressed by your qualifications and want to help you find your next opportunity! Based on your skill set, we have found some matching open positions on our platform that might be a great fit.
                </p>
              </div>

              <!-- Recommendation Opportunities Header -->
              <h3 style="font-size: 16px; color: #1A1A1A; margin: 0 0 12px 0; font-family: Arial, sans-serif; text-align: left; border-bottom: 2px solid #FF5500; padding-bottom: 4px;">Recommended Opportunities</h3>

              <!-- Recommendation List Table -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F9F9F9; border: 1px solid #EAEAEA; border-radius: 8px; font-family: Arial, sans-serif; text-align: left; margin-bottom: 16px;">
                <thead>
                  <tr style="background-color: #FFF2E8; border-bottom: 1px solid #EAEAEA;">
                    <th style="padding: 12px; font-size: 12px; color: #E65100; text-transform: uppercase; letter-spacing: 1px;">Job Title</th>
                    <th style="padding: 12px; font-size: 12px; color: #E65100; text-transform: uppercase; letter-spacing: 1px;">Company</th>
                    <th style="padding: 12px; font-size: 12px; color: #E65100; text-transform: uppercase; letter-spacing: 1px; text-align: right;">Match Score</th>
                  </tr>
                </thead>
                <tbody>
                  ${recListHtml}
                </tbody>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px;"><div style="height: 1px; background-color: #F0F0F0; width: 100%;"></div></td>
          </tr>
          <tr>
            <td style="background-color: #FF5500; padding: 18px 24px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="left" style="font-size: 12px; color: #FFFFFF; font-family: Arial, sans-serif; width: 50%;">✉️ info@jobdekho.com</td>
                  <td align="right" style="font-size: 12px; color: #FFFFFF; font-family: Arial, sans-serif; width: 50%;">🌐 www.jobdekho.com</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

export const sendApplicationSubmittedEmail = async ({ to, name, jobTitle, companyName }) => {
    const subject = `Application Received: ${jobTitle} at ${companyName}`;
    const body = `Hello ${name},\n\nYour application for ${jobTitle} at ${companyName} has been received successfully.\n\nYou can track the progress of your application on your dashboard.`;
    const html = getApplicationSubmittedEmailTemplate(name, jobTitle, companyName);
    return await sendEmail({ to, subject, body, html });
};

export const sendApplicationStatusUpdateEmail = async ({ to, name, jobTitle, companyName, statusText }) => {
    const subject = `Application Status Update: ${jobTitle}`;
    const body = `Hello ${name},\n\nYour application for ${jobTitle} at ${companyName} has been updated to: ${statusText}`;
    const html = getApplicationStatusUpdateEmailTemplate(name, jobTitle, companyName, statusText);
    return await sendEmail({ to, subject, body, html });
};

export const sendRejectionWithRecommendationsEmail = async ({ to, name, jobTitle, companyName, recommendations = [] }) => {
    const subject = `Update regarding your application for ${jobTitle}`;
    const body = `Hello ${name},\n\nThank you for your interest in the ${jobTitle} role at ${companyName}. We regret to inform you that we will not be moving forward with your application for this specific role.\n\nHowever, we have found some other open positions matching your skills. Check them out on your dashboard!`;
    const html = getRejectionWithRecommendationsEmailTemplate(name, jobTitle, companyName, recommendations);
    return await sendEmail({ to, subject, body, html });
};

/**
 * Generate premium HTML template for offer letter delivery
 */
export const getOfferLetterEmailTemplate = ({
    name,
    designation,
    companyName,
    annualCTC,
    joiningDate,
    offerLetterUrl
}) => {
    const joiningDateStr = new Date(joiningDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Job Offer Letter: ${designation}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F9F9F9; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F9F9F9; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border: 1px solid #EAEAEA; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <tr>
            <td align="center" style="padding: 40px 40px 20px 40px;">
              <table border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding-bottom: 8px;">
                    <!-- Logo Image -->
                    <img src="https://res.cloudinary.com/harsh21/image/upload/v1782141956/pngLogo_1_wmn3el.png" alt="Jobdekho Logo" style="width: 200px; height: auto; display: block; margin: 0 auto;">
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px;"><div style="height: 1px; background-color: #EAEAEA; width: 100%;"></div></td>
          </tr>
          <tr>
            <td align="center" style="padding: 30px 40px;">
              <h1 style="font-size: 22px; font-weight: 700; color: #2E7D32; margin: 0 0 16px 0; font-family: Arial, sans-serif;">Congratulations! You have a job offer</h1>
              <p style="font-size: 15px; color: #555555; line-height: 24px; margin: 0 0 24px 0; font-family: Arial, sans-serif; text-align: left;">
                Hello ${name},<br><br>
                We are thrilled to offer you the position of <strong>${designation}</strong> at <strong>${companyName}</strong>. The hiring team was highly impressed by your experience and credentials.
              </p>
              <table width="100%" border="0" cellspacing="0" cellpadding="12" style="background-color: #F9F9F9; border: 1px solid #EAEAEA; border-radius: 8px; margin-bottom: 24px; font-family: Arial, sans-serif; font-size: 14px; text-align: left;">
                <tr>
                  <td style="color: #666666; font-weight: bold; width: 40%; border-bottom: 1px solid #EAEAEA;">Designation</td>
                  <td style="color: #1A1A1A; font-weight: bold; border-bottom: 1px solid #EAEAEA;">${designation}</td>
                </tr>
                <tr>
                  <td style="color: #666666; font-weight: bold; border-bottom: 1px solid #EAEAEA;">Annual CTC</td>
                  <td style="color: #1A1A1A; font-weight: bold; border-bottom: 1px solid #EAEAEA;">₹${annualCTC.toLocaleString("en-IN")}</td>
                </tr>
                <tr>
                  <td style="color: #666666; font-weight: bold;">Expected Joining Date</td>
                  <td style="color: #FF5500; font-weight: bold;">${joiningDateStr}</td>
                </tr>
              </table>
              <div style="margin-bottom: 24px;">
                <a href="${offerLetterUrl}" style="background-color: #FF5500; color: #FFFFFF; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: bold; font-family: Arial, sans-serif; display: inline-block;">View & Sign Offer Letter</a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px;"><div style="height: 1px; background-color: #F0F0F0; width: 100%;"></div></td>
          </tr>
          <tr>
            <td style="background-color: #FF5500; padding: 18px 24px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="left" style="font-size: 12px; color: #FFFFFF; font-family: Arial, sans-serif; width: 50%;">✉️ info@jobdekho.com</td>
                  <td align="right" style="font-size: 12px; color: #FFFFFF; font-family: Arial, sans-serif; width: 50%;">🌐 www.jobdekho.com</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

/**
 * Generate premium HTML template for welcome email
 */
export const getEmployeeWelcomeEmailTemplate = ({
    name,
    employeeId,
    designation,
    department,
    companyEmail,
    joiningDate,
    companyName
}) => {
    const joiningDateStr = new Date(joiningDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ${companyName}!</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F9F9F9; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F9F9F9; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border: 1px solid #EAEAEA; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <tr>
            <td align="center" style="padding: 40px 40px 20px 40px;">
              <table border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding-bottom: 8px;">
                    <!-- Logo Image -->
                    <img src="https://res.cloudinary.com/harsh21/image/upload/v1782141956/pngLogo_1_wmn3el.png" alt="Jobdekho Logo" style="width: 200px; height: auto; display: block; margin: 0 auto;">
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px;"><div style="height: 1px; background-color: #EAEAEA; width: 100%;"></div></td>
          </tr>
          <tr>
            <td align="center" style="padding: 30px 40px;">
              <h1 style="font-size: 22px; font-weight: 700; color: #1A1A1A; margin: 0 0 16px 0; font-family: Arial, sans-serif;">Welcome to the Team!</h1>
              <p style="font-size: 15px; color: #555555; line-height: 24px; margin: 0 0 24px 0; font-family: Arial, sans-serif; text-align: left;">
                Hello ${name},<br><br>
                Welcome to <strong>${companyName}</strong>! We are absolutely thrilled to have you join us. Your onboarding is complete, and your official employee profile has been generated.
              </p>
              <table width="100%" border="0" cellspacing="0" cellpadding="12" style="background-color: #F9F9F9; border: 1px solid #EAEAEA; border-radius: 8px; margin-bottom: 24px; font-family: Arial, sans-serif; font-size: 14px; text-align: left;">
                <tr>
                  <td style="color: #666666; font-weight: bold; width: 40%; border-bottom: 1px solid #EAEAEA;">Employee ID</td>
                  <td style="color: #1A1A1A; font-family: monospace; font-weight: bold; border-bottom: 1px solid #EAEAEA;">${employeeId}</td>
                </tr>
                <tr>
                  <td style="color: #666666; font-weight: bold; border-bottom: 1px solid #EAEAEA;">Designation</td>
                  <td style="color: #1A1A1A; border-bottom: 1px solid #EAEAEA;">${designation}</td>
                </tr>
                <tr>
                  <td style="color: #666666; font-weight: bold; border-bottom: 1px solid #EAEAEA;">Department</td>
                  <td style="color: #1A1A1A; border-bottom: 1px solid #EAEAEA;">${department}</td>
                </tr>
                <tr>
                  <td style="color: #666666; font-weight: bold; border-bottom: 1px solid #EAEAEA;">Company Email</td>
                  <td style="color: #FF5500; font-weight: bold; border-bottom: 1px solid #EAEAEA;">${companyEmail}</td>
                </tr>
                <tr>
                  <td style="color: #666666; font-weight: bold;">Joining Date</td>
                  <td style="color: #1A1A1A;">${joiningDateStr}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px;"><div style="height: 1px; background-color: #F0F0F0; width: 100%;"></div></td>
          </tr>
          <tr>
            <td style="background-color: #FF5500; padding: 18px 24px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="left" style="font-size: 12px; color: #FFFFFF; font-family: Arial, sans-serif; width: 50%;">✉️ info@jobdekho.com</td>
                  <td align="right" style="font-size: 12px; color: #FFFFFF; font-family: Arial, sans-serif; width: 50%;">🌐 www.jobdekho.com</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

export const sendOfferLetterEmail = async ({
    to,
    name,
    designation,
    companyName,
    annualCTC,
    joiningDate,
    offerLetterUrl
}) => {
    const subject = `Job Offer: ${designation} at ${companyName}`;
    const body = `Hello ${name},\n\nCongratulations! You have received a job offer for the position of ${designation} at ${companyName}.\n\nAnnual CTC: ₹${annualCTC.toLocaleString("en-IN")}\nJoining Date: ${new Date(joiningDate).toLocaleDateString()}\n\nView and accept the offer here: ${offerLetterUrl}`;
    const html = getOfferLetterEmailTemplate({
        name,
        designation,
        companyName,
        annualCTC,
        joiningDate,
        offerLetterUrl
    });
    return await sendEmail({ to, subject, body, html });
};

export const sendEmployeeWelcomeEmail = async ({
    to,
    name,
    employeeId,
    designation,
    department,
    companyEmail,
    joiningDate,
    companyName
}) => {
    const subject = `Welcome to the team at ${companyName}!`;
    const body = `Hello ${name},\n\nWelcome to ${companyName}!\n\nYour Employee ID is: ${employeeId}\nDesignation: ${designation}\nDepartment: ${department}\nCompany Email: ${companyEmail}\nJoining Date: ${new Date(joiningDate).toLocaleDateString()}`;
    const html = getEmployeeWelcomeEmailTemplate({
        name,
        employeeId,
        designation,
        department,
        companyEmail,
        joiningDate,
        companyName
    });
    return await sendEmail({ to, subject, body, html });
};

