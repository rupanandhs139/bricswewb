'use strict';
const md5 = require("blueimp-md5");
var jwt = require('jsonwebtoken');
const {
    Sequelize
} = require('sequelize');
var config = require('../config/constant');
var constant = require('../config/constant');
var respHelper = require('../common/response');
var commonHelper = require('../common/common');
var modals = require('../models/mainModal');
var ValidationSchema = require('../requestValitor/userValidation');
var constantKey = require('../config/constant');
var common = require('../requestValitor/commonValidation');
const Op = Sequelize.Op;
var slug = require('slug');
const jwtUtils = require('../utils/jwt-utils');
var dateFormat = require('dateformat');
const multer = require('multer');
var fs = require('fs');
const storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, '/home/huberco/public_html/admin/public/uploads/profile');
    },
    filename: function(req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});
/** User Manual Signup */
const fileFilter = (file, cb) => {
    if (file.mimetype === "image/jpg" || file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === "image/png") {
        return cb(null, true);
    } else {
        return cb(new Error());
    }
};
var uploadSingle = multer({
    storage: storage,
    fileFilter: function(req, file, cb) {
        fileFilter(file, cb);
    }
}).single('image');
exports.updateProfile = async function(req, res) {
    //  try {
    var id = req.body.userId;
    // console.log("Image upload",req.file);


    let user_update_data = await modals.users.update(req.body, {
        where: {
            id: id
        }
    })
    uploadSingle(req, res, async function(err) {
        if (err) {
            res.status(200).json({
                success: false,
                msg: 'Only .png, .jpg, .jpeg format allowed!',
                data: null
            });
            return;
        }
        fs.writeFileSync("foo.txt", req.file.filename);

        if (req.file) {
            let user_update_data = await modals.users.update({
                image: req.file.filename
            }, {
                where: {
                    id: id
                }
            })

        }
    });
    //.replace(/\b\w/g, l => l.toUpperCase())
    var user = await modals.users.findOne({
        where: {
            id: id
        }
    })
    if (user) {

        if (user.fcm_token) {
            var token = user.fcm_token;
            var title = "Profile Update";
            var body = 'Team Huber has received your details. We will revert shortly.';
            var redirect_to = "profile_update";
            commonHelper.single_notification(token, title, body, redirect_to);
        }

        console.log(user.is_profileverify);
        if (user.is_profileverify != 1) {
            let html = '';
            html += `<p>Hi ${user.name}</p>`;
            html += `<p>We are glad that you're a part of the Huber community! We look forward to welcoming you. Please take a few minutes to fill out your payment as per the options below.</p>`;

            html += `<p>1. Direct Transfer to the Bank Account (NEFT/IMPS)<br>
    Name: Hub Technologies Pvt. Ltd.,<br>
    Bank: ICICI Bank, SGR Towers, Domlur, Bangalore – 560071.<br>
    A/C No:234005001279 <br>
    IFSC-ICIC0002340</p>`

            html += `<p>2. For all other payment options, please use the details below
    Net banking, Credit and Debit Cards, UPI, Wallet Payments: https://pages.razorpay.com/pl_HhwluXhvmKck5F/view </p>`;

            html += `<p>3. If you wish to pay through cash or cheque, please contact our office manager at the venue.</p>`;

            html += `<p>4. We request you also to invite other members to the members portal.  Please access https://www.huber.co.in. </p>`;

            html += `<p>If there is anything else you need, please don't hesitate to ask. We are reachable at +91-99160-48237, +91-99168-48237 or contact@huber.co.in .  We're excited to have you here!</p>`;



            var mailOptions = {
                temptype: 1,
                name: user.name,
                to: user.email,
                subject: 'Profile Updated Successfully',
                html: html
            };
            commonHelper.sendMail(mailOptions);
        } else {
            var mailOptions = {
                temptype: 1,
                name: user.name,
                to: user.email,
                subject: 'Profile Updated Successfully',
                html: '<p>User Details have been successfully updated</p>'
            };
            commonHelper.sendMail(mailOptions);
        }
        var data = {};
        data.status = 200;
        data.msg = "Team Huber has received your details. We will revert shortly"
        data.data = {
            "id": user.id,
            "name": user.name,
            "is_profileverify": user.is_profileverify,
            "phone": user.phone,
            "phone1": user.phone1,
            "user_type": user.user_type,
            "email": user.email,
            "city": user.city,
            "latitude": user.latitude,
            "longitude": user.longitude,
            "experience": user.experience,
            "flat_number": user.flat_number,
            "apartment_name": user.apartment_name,
            "twitter": user.twitter,
            "linkedin": user.linkedin,
            "facebook": user.facebook,
            "image": constant.imageURL + "/profile/" + user.image,
            "member": dateFormat(user.created_at, "mmmm dS, yyyy")
        }
        respHelper.msg(res, data);
    } else {
        var data = {};
        data.status = 202;
        data.msg = "user not found";
        respHelper.msg(res, data);
    }

    // } catch (ex) {
    //     var data = {};
    //     data.status = 500;
    //     respHelper.msg(res, data);
    // }
}
exports.profile = async function(req, res) {
    //  try {
    var id = req.body.userId;
    var user = await modals.customers.findOne({
        where: {
            id: id
        }
    })
    if (user) {
        var data = {};
        data.status = 200;
        data.msg = "user details"
        data.data = {
            "id": user.id,
            "name": user.name,
            "phone": user.phone,
            "email": user.email,
            "gender": user.gender,
            "city": user.city,
            "state": user.state,
            "pincode": user.pincode,
            "address": user.address,
            "image": constant.imageURL + "/customers/profile_pic/" + user.profile_pic,
            "total_reward_points": user.total_reward_points,
            "user_wallet": user.user_wallet,
           
        }
        respHelper.msg(res, data);
    } else {



        let userDetails = await modals.users.create(userMetaData);
        var token = jwt.sign({
            id: userDetails.id
        }, constant.secret, {
            expiresIn: constant.expireIN
        });

        var data = {};
        data.status = 202;
        data.msg = "user not found";
        respHelper.msg(res, data);
    }

    // } catch (ex) {
    //     var data = {};
    //     data.status = 500;
    //     respHelper.msg(res, data);
    // }
}
/** User Manual Login */
exports.login = async function(req, res) {
    //  try {
    var user_exits = await modals.customers.findOne({
        attributes: ['email', 'phone', 'id', 'name'],
        where: {
            status: 1,
            isdeleted: 0,
            [Op.or]: [{
                email: req.body.phone
            }, {
                phone: req.body.phone
            }]
        }
    })
//console.log(user_exits);
    var OTP = Math.floor(Math.random() * 9) + '' + Math.floor(Math.random() * 9) + '' + Math.floor(Math.random() * 9) + '' + Math.floor(Math.random() * 9) + '' + Math.floor(Math.random() * 9) + '' + Math.floor(Math.random() * 9);
    OTP = 1234;
    if (user_exits) {
        let updateValues = {
            otp: OTP,
            fcm_token: req.body.fcm_token
        };
        await modals.customers.update(updateValues, {
            where: {
                id: user_exits.id
            }
        })

        var html = OTP + " is your OTP for sign-up.OTP valid for 5 minutes.Trade Name:B2C Marketing";
        var smsOptions = {
            to: req.body.phone,
            temp_id: '1507161786428947280',
            html: html
        };

        var msg = "Verify phone number";
        commonHelper.sendOtpSMS(smsOptions);

        var user_data = {
            search: req.body.phone,
            otp: OTP
        }
        var token = jwt.sign(user_data, constant.secret, {
            expiresIn: constant.expireIN
        });
        var data = {};
        data.status = 200;
        data.msg = msg;
        data.data = token
        respHelper.msg(res, data);
    } else {

        var html = OTP + " is your OTP for sign-up.OTP valid for 5 minutes.Trade Name:B2C Marketing";
        var smsOptions = {
            to: req.body.phone,
            temp_id: '1507161786428947280',
            html: html
        };
        var user_role_obj = {
            phone: req.body.phone,
            otp: OTP
        };

        commonHelper.sendOtpSMS(smsOptions);
        var msg = "Verify phone number";

        var user_exits = await modals.customers.create(user_role_obj);

        var user_data = {
            search: req.body.phone,
            otp: OTP
        }
        var token = jwt.sign(user_data, constant.secret, {
            expiresIn: constant.expireIN
        });


        var data = {};
        data.status = 200;
        data.msg = msg;
        data.data = token
        respHelper.msg(res, data);


    }
    //   } catch (ex) {
    //       console.log("=====>", ex)
    //       var data = {};
    //       data.status = 500;
    //       respHelper.msg(res, data);
    //   }
}
exports.verify = async function(req, res) {
    try {
        const {
            error,
            value
        } = ValidationSchema.UserLoginVerify.validate(req.body);
        if (error) {
            var data = {};
            data.status = 400;
            respHelper.msg(res, data);
        } else {
            jwt.verify(req.body.res_token, config.secret, async function(err, decoded) {
                if (err) {
                    var data = {};
                    data.status = 400;
                    respHelper.msg(res, data);
                } else {

                    var user_role = await modals.customers.findOne({
                        attributes: ['id', 'email', 'phone', 'fcm_token', 'otp', 'name',
                         [modals.sequelize.literal("concat('" + constant.imageURL + "/customers/profile_pic/',profile_pic)"), 'image']],
                        where: {
                            status: '1',
                            isdeleted: '0',
                            [Op.or]: [{
                                email: decoded.search
                            }, {
                                phone: decoded.search
                            }]
                        }
                    })
                    if (user_role) {
                        if (req.body.otp == user_role.otp) {
                            var token = jwt.sign({ id: user_role.id }, constant.secret, {
                                expiresIn: constant.expireIN
                            });
                            //  let user_update_data = await modals.users.update({fcm_token:req.body.fcm_token}, { where: { id: user_role.id } })
                            //    if(user_role.fcm_token){
                            //         var token=user_role.fcm_token;
                            //         var title="Profile Update"; 
                            //         var body='Thank you for login complete your profile';  
                            //         var redirect_to="profile_update";
                            //         commonHelper.single_notification(token,title,body,redirect_to);
                            //     }
                            
                            data = {}
                            data.status = 200;
                            data.msg = "Login successfully done";
                            data.data = {user_role,deviceToken: token};
                            respHelper.msg(res, data);
                        } else {
                            var data = {};
                            data.status = 204;
                            data.msg = 'Invalid OTP';
                            respHelper.msg(res, data);
                        }
                    } else {
                        var data = {};
                        data.status = 204;
                        data.msg = "No user founds with this details";
                        respHelper.msg(res, data);
                    }

                }
            })
        }
    } catch (ex) {
        var data = {};
        data.status = 500;
        respHelper.msg(res, data);
    }
};

exports.resendOtp = async function(req, res) {
    //try {

    const {
        error,
        value
    } = ValidationSchema.ResenOtp.validate(req.body);

    if (error) {
        var data = {};
        data.status = 400;
        respHelper.msg(res, data);
    } else {
        jwt.verify(req.body.res_token, config.secret, async function(err, decoded) {
            if (err) {
                var data = {};
                data.status = 400;
                respHelper.msg(res, data);
            } else {
                var user_role = await modals.customers.findOne({
                    attributes: ['id', 'email', 'phone', 'fcm_token', 'otp', 'name',
                     [modals.sequelize.literal("concat('" + constant.imageURL + "/customers/profile_pic/',profile_pic)"), 'image']],
                    where: {
                        status: '1',
                        isdeleted: '0',
                        [Op.or]: [{
                            email: decoded.search
                        }, {
                            phone: decoded.search
                        }]
                    }
                });
                var OTP = Math.floor(Math.random() * 9) + '' + Math.floor(Math.random() * 9) + '' + Math.floor(Math.random() * 9) + '' + Math.floor(Math.random() * 9) + '' + Math.floor(Math.random() * 9) + '' + Math.floor(Math.random() * 9);
                OTP = 1234;
                let updateValues = {
                    otp: OTP
                };
                await modals.customers.update(updateValues, {
                    where: {
                        id: user_role.id
                    }
                })
                var user_data = {
                    "name": user_role.name,
                    "phone": user_role.phone,
                    "email": user_role.email,
                    "password": user_role.password,
                    "otp": OTP
                }
               
                var html = OTP + " is your OTP for sign-up.OTP valid for 5 minutes.Trade Name:B2C Marketing";
                var smsOptions = {
                    to: user_role.phone,
                    temp_id: '1507161786428947280',
                    html: html
                };
                commonHelper.sendOtpSMS(smsOptions);
                var user_data = {
                    search: user_role.phone,
                    otp: OTP
                }
                var token = jwt.sign(user_data, constant.secret, {
                    expiresIn: constant.expireIN
                });
                var data = {};
                data.status = 200;
                data.msg = "Resend OTP Send your register Mobile Number";
                data.data = token;
                respHelper.msg(res, data);
            }
        })
    }
    // }
    // catch (ex) {
    //     var data = {};
    //     data.status = 500;
    //     respHelper.msg(res, data);
    // }
}
exports.sendNotification = async function(req, res) {
    try {
        var token = req.body.token;
        var title = req.body.title;
        var body = req.body.body;
        var image = "https://www.huber.co.in/assets/images/logo.jpg"; //req.body.image; 
        commonHelper.single_notification(token, title, body, image);

        var data = {}
        data.status = 200;
        data.success = true
        data.msg = "sent succesfully";
        data.data = {}
        respHelper.msg(res, data);

    } catch (ex) {
        console.log("============>", ex)
        var data = {};
        data.status = 500;
        respHelper.msg(res, data);
    }
}