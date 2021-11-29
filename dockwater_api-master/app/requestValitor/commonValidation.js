const { string } = require('joi');
const Joi = require('joi');


const sociallogin = Joi.object().keys({
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
    user_type: Joi.number().integer().min(0).max(2).required(),
    name: Joi.string().allow("").required(),
    registred_by: Joi.number().integer().min(1).max(2).required(),
    password: Joi.string().allow("").optional()
})
const applyCoupon = Joi.object().keys({
    couponCode: Joi.string().required(),
    userId: Joi.required(),
    orderTotal: Joi.required()
})
module.exports = {
    applyCoupon,
}