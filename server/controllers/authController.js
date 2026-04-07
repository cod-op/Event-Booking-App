const User=require("../models/User")
const bcrypt = require('bcrypt');
const JWT=require('jsonwebtoken');
const { sendOTPEmail } = require('../utils/email');
const OTP = require("../models/Otp");

   // generate OTP
  const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
  const generateToken = (id, role) => {
    return JWT.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};


 const register=async (req,res)=>{
     
      try{
           const {name,email,password}=req.body;
           if(!name || !email || !password){
            return res.status(400).json({
                success:false,
                message:"All field required"
            })
           }
            
           const existUser= await User.findOne({email});
             if (existUser){
                 return res.status(409).json({ 
              success:false,
              message: 'User Already Exists' 
          })
        }

        //hash password
           const salt= await bcrypt.genSalt(10);
           const hashPassword=await bcrypt.hash(password,salt);

            const user = await User.create({
            name,
            email,
            password: hashPassword,
            role: 'user', // Hardcoded to prevent frontend passing role
            isVerified: false
        });

          
          const otp = generateOTP();
          await OTP.create({ email, otp, action: 'account_verification' });
          try {
           await sendOTPEmail(email, otp, 'account_verification');
         } catch (err) {
           console.log("Email error:", err);
            }

        res.status(201).json({
        success: true,
       message: 'User registered successfully, OTP sent',
        email: user.email
       });
       } catch(err){
             console.log(err);
              res.status(500).json(
               {
               success:false,
               message:"Server Error"
              }
      )}
}



 const login=async (req,res)=>{
       try{
        const {email,password}=req.body;
        const user=await User.findOne({email});
       if(!user){
        return res.status(400).json({
          success:false,
          message:"invalid credientials",
        })
       }

       const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch){
           return res.status(400).json({
            success:false,
            message: 'Invalid credentials'
           })
        }
        if (!user.isVerified && user.role !== 'admin') {
            const otp = generateOTP();
            await OTP.findOneAndDelete({ email: user.email, action: 'account_verification' });
            await OTP.create({ email: user.email, otp, action: 'account_verification' });
            await sendOTPEmail(user.email, otp, 'account_verification');
            return res.status(403).json({ 
                 message: 'Account not verified',
                 needsVerification: true, 
                 email: user.email 
                });
        }

         res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user.id, user.role)
        });
       }
         catch(err){
             console.log(err);
              res.status(500).send(
               {
               success:false,
               message:"Server Error"
              }
      )}

}

const verifyOTP=async (req,res)=>{
              try {
        const { email, otp } = req.body;
        const validOTP = await OTP.findOne({ email, otp, action: 'account_verification' });

        if (!validOTP) {
            return res.status(400).json({ 
                message: 'Invalid or expired OTP'
             });
        }

        const user = await User.findOneAndUpdate({ email }, { isVerified: true }, { new: true });
       
        if (!user) {
            return res.status(404).json({
                 success: false,
                 message: "User not found" 
                });
        }
        await OTP.deleteOne({ _id: validOTP._id }); // Delete OTP after usage

        res.status(200).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user.id, user.role)
        });
    }
     catch(err){
             console.log(err);
              res.status(500).json(
               {
               success:false,
               message:"Server Error"
              }
      )}
}

module.exports = {register,login,verifyOTP};

