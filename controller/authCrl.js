const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const saltRounds = 10;
const sendmail = require("../util/sendsms");
const Confirm = require("../models/Confirm");

const generateAccessToken = (payload) =>
  jwt.sign(payload, process.env.TOKEN_SECRET_KEY, { expiresIn: "1d" });
const generateRefreshToken = (payload) =>
  jwt.sign(payload, process.env.TOKEN_REFRESH_SECRET_KEY, { expiresIn: "30d" });

const authCtrl = {
  // signup done
  register: async (req, res) => {
    try {
      const { username, phoneNumber, password, email } = req.body;

      const user_phoneNumber = await User.findOne({ phoneNumber });
      if (user_phoneNumber)
        return res
          .status(400)
          .json({ msg: "Số điện thoại này đã được đăng ký.", status: 400 });

      if (password.length < 6)
        return res.status(400).json({ msg: "Mật khẩu phải lớn hơn 6 ký tự.", status: 400 });

      const passwordHash = await bcrypt.hash(password, saltRounds);
      const newUser = new User({
        username: username,
        phoneNumber,
        password: passwordHash,
        email: email
      });

      const accessToken = generateAccessToken({ id: newUser._id });
      const refreshToken = generateRefreshToken({ id: newUser._id });

      res.cookie("refreshtoken", refreshToken, {
        httpOnly: true,
        path: "/api/auth/refresh_token",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30days
      });

      await newUser.save();

      res.json({
        msg: "Đăng ký thành công!",
        accessToken,
        user: {
          ...newUser._doc,
          password: "",
        },
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  // done
  login: async (req, res) => {
    try {
      const user = await User.findOne({ phoneNumber: req.body.phoneNumber })
        .select("-createdAt -updatedAt")
        .populate(
          "friends friendsQueue",
          "username profilePicture phoneNumber status"
        );

      if (!user)
        return res.status(200).json({ msg: "Không tìm thấy người dùng.", status: 400 });
      if(user.status ===false)
        return res.status(200).json({ msg: "Tài khoản đã bị khóa do vi phạm chính sách của chúng tôi.", status: 400 });
          
      const validPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!validPassword) return res.status(200).json({ msg: "Mật khẩu sai.", status: 400 });

      const { password, ...other } = user._doc;

      //generate token
      const id = user._id;
      const accessToken = generateAccessToken({ id });
      const refreshToken = generateRefreshToken({ id });
      if (!user.isAdmin) {
        res.cookie("refreshtoken", refreshToken, {
          httpOnly: true,
          path: "/api/auth/refresh_token",
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30days
        });
      }
      res.status(200).json({
        login: true,
        msg: "Đăng nhập thành công!",
        accessToken,
        refreshToken,
        user: other,
        status: 200
      });
    } catch (err) {
      res.status(500).json({ msg: err.message, status: 500 });
    }
  },
  // done
  logout: async (req, res) => {
    try {
      res.clearCookie("refreshtoken", { path: "/api/auth/refresh_token" });
      return res.json({ msg: "Đã đăng xuất!" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  // done
  refreshToken: async (req, res) => {
    try {
      const rf_token = req.cookies.refreshtoken;
      if (!rf_token)
        return res.status(400).json({ msg: "Vui lòng đăng nhập ngay." });

      jwt.verify(
        rf_token,
        process.env.TOKEN_REFRESH_SECRET_KEY,
        async (err, result) => {
          if (err)
            return res.status(400).json({ msg: "Vui lòng đăng nhập ngay." });

          const user = await User.findById(result.id)
            .select("-createdAt -updatedAt")
            .populate(
              "friends friendsQueue",
              "username profilePicture phoneNumber"
            );
          const { password, updatedAt, ...other } = user._doc;

          if (!user)
            return res.status(400).json({ msg: "This does not exist." });

          const accessToken = generateAccessToken({ id: result.id });

          res.status(200).json({
            msg: "Chào mừng bạn quay trở lại!",
            accessToken,
            user: other,
          });
        }
      );
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  // done
  resetPassword: async (req, res) => {
    try {
      const { email, password } = req.body;
      // them kiem tra dieu kien OPT
      // console.log("Thiếu Dk OTP", otp);

      const passwordHash = await bcrypt.hash(password, saltRounds)
      await User.findOneAndUpdate(
        { email: email },
        { password: passwordHash }
      )
      res.status(200).json({ msg: "Cập nhật thành công mật khẩu!" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  // done
  sendMail: async (req, res) => {
    try {
      const email =req.body.email
      const emailUser= await User.findOne({email: email})
      await Confirm.deleteMany({email: email})
      const code_verify= Math.floor(Math.random() * 900000 + 100000)
      const newConfirm = await Confirm({id_user: emailUser?._id || "", code_verify, email: email})
      await newConfirm.save();
      // const oneTimePassword = Math.floor(Math.random() * 900000 + 100000)
      sendmail.sendMail(email, code_verify)
      res.status(200).json({ message: "Chúng tôi vừa gửi một mã xác thực gồm 6 chữ số đến email "+email+ ". Vui lòng nhâp mã xác thực từ email để lấy lại mật khẩu của bạn" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  // done
  checkPhone: async (req, res) => {
    try {
      const { email, phoneNumber } = req.body;

      const user_email = await User.findOne({ email, phoneNumber });
      if (user_email)
        return res
          .status(200)
          .json({ msg: false});

      res.status(200).json({
        msg: true
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  confirm_code: async (req, res)=> {
    const code_verify= req.body.code_verify
    const email= req.body.email
    try {
      const newConfirm= await Confirm.findOneAndRemove({code_verify, email})
      if(newConfirm ){ 
        return res.status(200).json({...newConfirm, verify: true})
      }
      else {
        return res.status(200).json({verify: false})
      }
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
    
  }
};

module.exports = authCtrl;
