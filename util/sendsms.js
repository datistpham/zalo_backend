const nodemailer= require("nodemailer")
  
const sendMail =async (email, codeVerify)=>{
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "anh_2051220137@dau.edu.vn",
        pass: "pmriwwhmidhyzocp",
    },
    });
const mailOptions = {
from: "anh_2051220137@dau.edu.vn",
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
