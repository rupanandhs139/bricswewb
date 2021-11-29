const Joi = require('joi');

const UserLogin = Joi.object().keys({
    phone: Joi.string().required(),
   // password: Joi.string().required(),
});
const ResenOtp = Joi.object().keys({
    res_token: Joi.string().required(),
})
const UserLoginVerify = Joi.object().keys({
    res_token:Joi.string().required(),
    otp: Joi.number().integer().required(),
});
const UserVerifyReg = Joi.object().keys({  
    res_token: Joi.string().required(),
    otp: Joi.string().required()
});
const userSignup = Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().required().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
    password: Joi.string().required(),
    confirmPassword:Joi.string().required().valid(Joi.ref('password')),
    gender: Joi.number().integer().allow('')
});

module.exports = {
    UserLogin,UserVerifyReg,UserLoginVerify,ResenOtp,
    userSignup
}