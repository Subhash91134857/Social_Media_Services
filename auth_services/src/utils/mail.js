const Mailgen = require('mailgen');
const nodemailer = require('nodemailer');
const { config } = require('../utils/Env-Utils')
const logger = require('../logger/winston_logger')

const sendMail = async (options) => {
    const mailGenerator = new Mailgen({
        theme: 'salted',
        product: {
            name: "SocialService",
            link: "https://subhash.com"
        }
    });

    const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);

    // Generate an HTML email with provided contents
    const emailHtml = mailGenerator.generate(options.mailgenContent);

    // create a nodemailer transpoter which is responsible to send a mail
    const transpoter = nodemailer.createTransport({
        host: config.brevo.host,
        port: config.brevo.port,
        auth: {
            user: config.brevo.user,
            pass: config.brevo.pass
        }
    })

    const mail = {
        from: "subhashpanday58@gmail.com",
        to: options.email,
        subject: options.subject,
        text: emailTextual,
        html: emailHtml,
    }

    try {
        await transpoter.sendMail(mail);
    } catch (error) {
        logger.error(
            "Email service failed silently. Make sure you have provided your MAILTRAP credentials in the .env file"
        );
        logger.error("Error: ", error);
    }
}


// function for email verification
const emailVerificationMailgenContent = (username, verificationUrl) => {
    return {
        body: {
            name: username,
            intro: "Welcome to our app! We're very excited to have you on board.",
            action: {
                instructions:
                    "To verify your email please click on the following button:",
                button: {
                    color: "#22BC66", // Optional action button color
                    text: "Verify your email",
                    link: verificationUrl,
                },
            },
            outro:
                "Need help, or have questions? Just reply to this email, we'd love to help.",
        },
    };
}

module.exports = {
    sendMail,
    emailVerificationMailgenContent
}