const { setGlobalOptions } = require("firebase-functions");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

setGlobalOptions({ 
  maxInstances: 10,
  region: "us-central1" 
});

// Using your provided credentials
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'rkvk.sgi@gmail.com', 
    pass: 'dtfiykvmtwldbbvl'    
  }
});

exports.onNewOpportunity = onDocumentCreated("opportunities/{docId}", async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const data = snapshot.data();
    const title = data.title || "New Opening";
    const company = data.company || "Campus Saarthi";

    try {
        // 1. Fetch all registered users
        const usersSnapshot = await admin.firestore().collection("users").get();
        const emailList = usersSnapshot.docs
            .map(doc => doc.data().email)
            .filter(email => !!email);

        // 2. Send the Emails
        if (emailList.length > 0) {
            const mailOptions = {
                from: '"Campus Saarthi" <rkvk.sgi@gmail.com>',
                bcc: emailList.join(","), 
                subject: `🚀 New Opportunity: ${title}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">
                        <h2 style="color: #2563eb;">New Opportunity Alert!</h2>
                        <p>Hi Scholar,</p>
                        <p>A new <b>${title}</b> position at <b>${company}</b> has just been posted.</p>
                        <a href="https://campus-saarthi.web.app" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">View on App</a>
                        <br/><br/>
                        <p style="color: #64748b; font-size: 12px;">Don't miss out! Apply before the deadline.</p>
                    </div>
                `
            };
            await transporter.sendMail(mailOptions);
        }

        // 3. Update the Bell Icon Badge in Firestore
        await admin.firestore().collection("notifications").add({
            title: "New Opportunity",
            desc: `${title} at ${company}`,
            time: admin.firestore.FieldValue.serverTimestamp(),
            unread: true,
            type: "opportunity"
        });

    } catch (error) {
        console.error("Critical Error:", error);
    }
});