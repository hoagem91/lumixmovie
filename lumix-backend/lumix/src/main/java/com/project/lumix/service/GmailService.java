package com.project.lumix.service;

import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class GmailService {
    private final JavaMailSender gmailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.base-url}")
    private String baseUrl;


    public void sendVerificationEmail(String toEmail, String token) {
        String verificationUrl = baseUrl + "/lumix/auth/verify?token=" + token;
        String subject = "Xác thực tài khoản Lumix của bạn";
        String body = """
                <html>
                  <body>
                    <h3>Cảm ơn bạn đã đăng ký tài khoản tại Lumix.</h3>
                    <p>Vui lòng nhấp vào đường link dưới đây để kích hoạt tài khoản của bạn:</p>
                    <p><a href="%s">Kích hoạt tài khoản của bạn</a></p>
                    <p>Đường link sẽ hết hạn sau 30 phút.</p>
                    <p>Trân trọng,<br>Đội ngũ Lumix</p>
                  </body>
                </html>
                """.formatted(verificationUrl);

        try {
            MimeMessage message = gmailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(new InternetAddress(fromEmail, "Lumix", "UTF-8"));
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(body, true);

            gmailSender.send(message);
            log.info("Đã gửi email xác thực thành công tới: {}", toEmail);
        } catch (Exception e) {
            log.error("Lỗi khi gửi email xác thực tới {}: {}", toEmail, e.getMessage(), e);
        }
    }
}

