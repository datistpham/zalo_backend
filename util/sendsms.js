const nodemailer= require("nodemailer")
  
const sendMail =async (email, codeVerify)=>{
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "vansangdang2k1@gmail.com",
        pass: "kamayxykaakmqqux",
    },
    });
const mailOptions = {
from: "vansangdang2k1@gmail.com",
to: email,
subject: "Verification code",
html: `<div><div>Đây là mã xác thực thay đổi mật khẩu của bạn, Vui lòng không chia sẻ cho bất cứ ai, Mã sẽ hết hạn trong vòng 3 phút</div>
            <strong style="text-align: center">${codeVerify}</strong>
        </div>`,
};
try {
    return await transporter.sendMail(mailOptions);
    } catch (error) {
    console.log(error);
    }
}



module.exports =  {sendMail}