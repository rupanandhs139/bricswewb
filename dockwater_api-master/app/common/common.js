var nodemailer = require('nodemailer');
var jwt = require('jsonwebtoken');
var config = require('../config/constant');
var constantKey = require('../config/constant')
var request = require("request");
var FCM = require('fcm-node')
var modals = require('../models/mainModal');
var serverKey = "AAAAnExK2Xo:APA91bH_VcqQlIhI1_ohCi_TyDalZb77ejCoG76BTGLfAIHLr2qoDnvyfQUyCJJP0dz1RoHuF4UnY3vtySVT-TpAc1FyDok_ZFgmiQb6wnyIEuJb6sAzxy-2NKTkDYeJjbx1447BjkU8"
var img_src='https://www.huber.co.in/admin/uploads';
var dateFormat = require('dateformat');
//var serverKey = "AAAAxNtjkzg:APA91bFTRed0oQ_TVOElrZ33t02pvUxsF4YLzyVU00gW5IRxockTHw7RAE-SnhWX4UI7_yPARBqLUVgh_-3qD4HIZcoRImLRKbs-qbZq-1MovjrtkaBn7GlWFrXXGyDh9Dt8dWJme-EN"
var fcm = new FCM(serverKey)

var _this = this;
const multer = require('multer');
exports.calculatePercentage = (cpnData,reqBody) => {
    var  calculatedDiscount=(reqBody.orderTotal/100)*cpnData.discount_value;
    if(cpnData.max_discount <calculatedDiscount ){
        calculatedDiscount=cpnData.max_discount;
    }
      return {
          discount:calculatedDiscount
      };
}
exports.convertTime12to24 = (time12h) => {
    const [fullMatch, time, modifier] = time12h.match(/(\d?\d:\d\d)\s*(\w{2})/i);

    let [hours, minutes] = time.split(':');
    if (hours === '12') {
      hours = '00';
    }
    if (modifier === 'PM') {
      hours = parseInt(hours, 10) + 12;
    }

    return `${hours}`;
  }
exports.time=(date)=> {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
        }
exports.time1=(start, end, interval)=> {
    var s = start.split(':').map(e => +e);
    var e = end.split(':').map(e => +e);
    var res = [];
    var t = [];
    while (!(s[0] == e[0] && s[1] > e[1])) {
        t.push(s[0] + ':' + (s[1] < 10 ? '0' +s[1] : s[1]));
        s[1] += interval;
        if (s[1] > 59) {
            s[0] += 1;
            s[1] %= 60;
        }
    }
    for (var i = 0; i < t.length - 1; i++) {
        res.push(t[i] + " - " + t[i + 1]);
    }
    return res;
}
exports.checkCouponDate = (cpnData) => {
    var todayDate = new Date().toISOString().slice(0, 10);
    var resultData=todayDate >= cpnData.started_date && todayDate <= cpnData.end_date;
      return {
          error:resultData
      };
}

exports.checkCartValue = (cpnData,ordervalue) => {
      var resultData=ordervalue >= cpnData.below_cart_amt && ordervalue <= cpnData.above_cart_amt;
      return {
          error:resultData
      };
}

exports.usesperUser = async (coupon_code,userId) => {
       let usesCount = await modals.orders.count({ where: { customer_id: userId, coupon_code:coupon_code} });
      return {
          count:usesCount
      };
}
exports.checkCustomertype = async (userId) => {
    let usesCount = await modals.orders.count({ where: { customer_id: userId} });
   return {
       count:usesCount
   };
}


exports.sendContactusMail = (data) => {
 
    let html ='Name'+ data.name;
     html+= 'Email'+ data.email;
     html+= 'Phone'+ data.phone;
     html+= 'Company Name'+ data.company_name;
     html+= 'Comment'+ data.message;
     html+ `<tr>
     <td style="padding: 0px 0px;">
         <table style="width: 100%; text-align: left; font-size: 16px; padding: 20px; " cellspacing="0" cellpadding="0">

             <tr bgcolor="#fdfdfd">
                 <td style="padding: 10px 20px;"> Name </td>
                 <td style="padding: 10px 20px;">${data.name}</td>
             </tr>

             <tr bgcolor="#faf9f9">
                 <td style="padding: 10px 20px;">Email Address </td>
                 <td style="padding: 10px 20px;">vinodb2c@gamil.com</td>
             </tr>

             <tr bgcolor="#fdfdfd">
                 <td style="padding: 10px 20px;">Telephone </td>
                 <td style="padding: 10px 20px;">97 6960 0645</td>
             </tr>

             <tr bgcolor="#faf9f9">
                 <td style="padding: 10px 20px;">Comment </td>
                 <td style="padding: 10px 20px;">Lorem Ipsum is simply dummy text of the printing and typesetting</td>
             </tr>
         
         </table>


     </td>
 </tr>`;

    var mailOptions = {
        to: data.email,temptype:1,name:'',
        subject: 'Contact Us',
        html: html
    };
  //  this.sendMail(mailOptions);
}





exports.single_notification = function (device_token, title, body,redirect_to) {
    var image="https://www.huber.co.in/assets/images/logo200.png";//req.body.image; 
    var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
        to: device_token,
        notification: {
            redirect: redirect_to,
            title: title,//'Title of your push notification',
            body: body,//'This is for multiple notification check',
            image:image,
            sound: "default"
        },
        data: {  //you can send only notification or only data(or include both)
            my_key: 'my value',
            my_another_key: 'my another value'
        },
      
    };
    fcm.send(message, function (err, response) {
        if (err) {
            console.log("Something has gone wrong!", err);
        } else {
            console.log("Successfully sent with response: ", response);
        }
      
    });
}

exports.multiple_notification = function (device_token, title, body, image) {
    var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
        registration_ids: device_token,
        notification: {
            title: title,//'Title of your push notification',
            body: body,//'This is for multiple notification check',
            image:image,
            sound: "default"
        },
        data: {  //you can send only notification or only data(or include both)
            my_key: 'my value',
            my_another_key: 'my another value'
        },
        // content_available: true
    };
    fcm.send(message, function (err, response) {
        if (err) {
            console.log("Something has gone wrong!", err);
        } else {
            console.log("Successfully sent with response: ", response);
        }
        // callback(err, 'Success');
    });
}



exports.sendOtpSMS = (data) => {  
   // console.log(data.html); console.log(data.temp_id);  console.log(data.to);
     var options = {
        method: 'POST',
        url:`http://sms.b2chosting.in/app/smsapi/index.php?key=260AF430D55EA9&entity=1501421690000011947&tempid=1507161786428947280&routeid=468&type=text&contacts=${data.to}&senderid=BCMAKT&msg=${data.html}`,
       //url: `http://sms.b2chosting.in/app/smsapi/index.php?key=260AF430D55EA9&entity=1501421690000011947&tempid=${data.tempid}&routeid=468&type=text&contacts=${data.to}&senderid=BCMAKT&msg=${data.html}`
       // url: `http://sms.b2chosting.in/app/smsapi/index.php?key=${constantKey.api_key}&routeid=468&type=text&contacts=${data.to}&msg=${data.html}&senderid=${constantKey.senderid}`
    };
    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        console.log(body);
    });
}

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        if (file.fieldname === "image") {
            callback(null, 'app/uploads/user_image');
        }
        else if (file.fieldname === "file")
            callback(null, 'app/uploads/business_pdf');
    },
    filename: function (req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});
const fileFilter = (file, cb) => {
    if (file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg' || file.mimetype == 'image/png' || file.mimetype == 'image/png' || 'pdf') {
        return cb(null, true);
    } else {
        return cb(null, false);
    }
};

exports.uploadSingle = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {

        fileFilter(file, cb);
    }
}).fields([{ name: 'image' }, { name: 'file' }]);


exports.sendMail = async function(mailData) {
   
    var nodemailer = require('nodemailer');
    var store_info = await modals.settings.findOne({
        attributes: [
       'name',
       'email',
       'phone',
       'logo',
       'facebook_url',
       'twiter_url',
       'linkedin_url',
      
   ],
       where: { id: 1 }
   });

   var logoimg=store_info.logo; let htmltemp='';
  
   if(mailData.temptype==1){
     htmltemp += `<!DOCTYPE html>
     <html>    
     <head>
         <meta charset="utf-8">
         <meta http-equiv="X-UA-Compatible" content="IE=edge">
         <title>Hub Technologies Pvt. Ltd.</title>
         <meta name="description" content=" ">
     </head>
     <body style="background: #f9f9f9;">
     
         <table style="padding: 20px 20px; background: #fff; max-width: 700px; width: 100%; margin: 40px auto; font-family:Cambria, 'Hoefler Text', 'Liberation Serif', Times, 'Times New Roman', serif;border: 1px solid #ddd;">
             <tr>
                 <td colspan="2" style="text-align: left;">
                     
                     <p style="text-align: center;">
                     <a href="https://www.huber.co.in/">
                     <img style="width: 120px;margin: auto;" src="${logoimg}"></a></p>
                    
                         <h2 style="background-color: #00d7c5; text-align: center;font-size: 22px; line-height: 28px; margin: 0px 0 0px; color: #fff;    padding: 10px;">${mailData.subject}</h2>
                             ${mailData.html}
                    
                     <p style="font-size: 14px; color: #444;">We're here to help if you need it. Visit the <a style="color: #00d7c5;" href="https://www.huber.co.in">https://www.huber.co.in</a> for more info or  <a style="color: #00d7c5;" href="https://www.huber.co.in/contact-us">Contact us</a></p>
                   
                     
                 </td>
             </tr>
            
            
             
             <tr>
     
                 <td colspan="2">
                     <p style="margin: 20px 0px 0;">Thanks & Best Regards</p>
                     <h4 style="margin: 5px 0px 0;">Huber.</h4>
                     <p style="margin: 20px 0px 0;">Visit us: https://www.huber.co.in </p>
                 </td>             
             </tr>
                  
         </table>
             
     </body>
     </html>`;

}
if(mailData.temptype==2){

    htmltemp+= `<!DOCTYPE html>
    <html>    
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Hub Technologies Pvt. Ltd.</title>
        <meta name="description" content=" ">
    </head>
    <body style="background: #f9f9f9;">
        
        <table style="padding: 10px 20px; background: #fff; max-width: 700px; width: 100%; margin: 40px auto; font-family:Cambria, 'Hoefler Text', 'Liberation Serif', Times, 'Times New Roman', serif;border: 1px solid #ddd;">
            <tr>
                <td colspan="2" style="text-align: center;">
                    
                    <a href="https://www.huber.co.in/"><img style="width: 120px;margin: auto;" src="${logoimg}"></a><br><br>
                    <p style="color: #000; font-size: 18px; margin: 5px 0; font-weight: 600;">Your ${mailData.subject} from Huber</p>
                    <p style="font-size: 16px; line-height: 22px;">Thank you for your book at Huber. Once the shipment is made, an email with the tracking number will be sent to you. If you have any questions about your booking, please contact us at shop. <a style="color: #00d7c5;" href="mailto:contact@huber.co.in">contact@huber.co.in</a> or by phone at 99168-HUBER-48237.</p>
                    <p style="font-size: 14px; color: #444; margin: 18px 0px 14px;">You will find your ${mailData.subject}.</p>
                </td>
            </tr>
            <tr>
                <td colspan="2" style="text-align: center;">
                    <h3 style="font-size: 14px; border-bottom: #eeeeee solid 2px;
                     padding-bottom: 15px; margin-bottom: 5px; margin-top: 0;">
                     Your Booking Id ${mailData.bookingquery.orderid} (created on: ${dateFormat(mailData.bookingquery.created_at,  "mmmm dS, yyyy")})</h3>
                </td>
            </tr>`;  
            if(mailData.bookingquery.status=='Upcoming'){
                htmltemp+=`<tr>
                <td style="vertical-align: top; padding-top:15px;">
                    <table cellpadding="0" cellspacing="0" style="width: 100%; border: #ededed solid 1px; min-height: 150px; margin-top: 0px;">
                        <tr>
                            <th style="border-bottom: #ededed solid 1px; background: #00d7c5; color: #fff; padding: 8px 10px; text-align: left; display: block;"><strong>Booking address :</strong></th>
                        </tr>
                        <tr>
                            <td style="padding: 8px 10px; display: block; min-height: 90px; max-height: 90px;">
                                <p style="margin: 0 0 15px;">${mailData.workspaces.address}</p>
                               
                            </td>
                        </tr>                    
                    </table>
                </td>               
            </tr>
                      
            <tr>
                <td colspan="2">
                    <table cellpadding="0" cellspacing="0" style="margin-top: 30px; width: 100%; font-size: 12px; text-align: left; border: #eaeaea solid 1px; padding: 1px;">
                        <tr bgcolor="#00d7c5">
                            <th style="border-bottom: #eaeaea solid 1px; padding: 8px 10px; color:#fff;"><strong>Image</strong></th>
                            <th style="border-bottom: #eaeaea solid 1px; padding: 8px 10px; color:#fff; width: 30%;"><strong>Description</strong></th>
       
                            <th style="border-bottom: #eaeaea solid 1px; padding: 8px 10px; color:#fff;"><strong>Booking on</strong></th>
                            
                            <th style="border-bottom: #eaeaea solid 1px; padding: 8px 10px; color:#fff;"><strong>Booking for</strong></th>             
                                                 
                        </tr>
                        <tr>
                            <td style="padding: 5px 10px; vertical-align: top;"><img style="width: 60px;margin: auto;" src="${mailData.workspaces.image}"></td>
                            <td style="padding: 5px 10px; vertical-align: top;"><strong>${mailData.workspaces.name}</strong>`;
                          if(mailData.bookingquery.checkout){
                            htmltemp+=`<p>Check In Time ${mailData.bookingquery.checkin}</p>
                            <p>Check Out Time ${mailData.bookingquery.checkout}</p>`;
                          }
                            htmltemp+=`</td>

                            <td style="padding: 5px 10px; vertical-align: top;"><span>
                            ${dateFormat(mailData.bookingquery.created_at,  "mmmm dS, yyyy")}
                            </span></td>
                            <td style="padding: 5px 10px; vertical-align: top;"><span>
                            ${dateFormat(mailData.bookingquery.booking_date,  "mmmm dS, yyyy")}
                            </span></td>             
                                                 
                        </tr>           
                    </table>
                </td>           
            </tr>
            <tr><td><p style="margin-bottom: 5px;">Looks like you've made a great choice</p></td></tr>
            <tr> <td style="font-weight: 600; ">Email is delivered by <br/><a style="color: #00d7c5; text-decoration: none;">Huber</a></td>
            </tr>`;
            }
            htmltemp+=` </table>
    </body>
    </html>`;

}

// var transporter = nodemailer.createTransport({
//     host: 'smtp.gmail.com',
//     port: 465,
//     secure: true,
//     //host: 'smtp.gmail.com',
//     //port: 465,
//    // secure: true,
//     auth: {
//       type: 'OAuth2',
//       user: 'vamsi@hubworkdesk.com',
//       clientId:'671294871930-lrch8t811fo40uvg5elth1cma1bl01g4.apps.googleusercontent.com',
//       clientSecret:'GUQWBOjbeMKNuL0myrDuX-g_',
//       refreshToken: '1//044lZUACAG_LTCgYIARAAGAQSNwF-L9IrrW17sjLV4roBsiIy-TyQg5_PnQL5Y1JF9UNSGr7Bm5CQUYTwfk1VaCWERENwzEbfSjI',
//      // accessToken: 'ya29.a0ARrdaM9IWvawnuYi2dyjVJrjOnSk4K6KhD5ts_PpwKIUAdIMQMTNIh4lcXBulma0rygMjlUz0HTk5KnqKhN5MF-HBcrrR1ePMTl3hIygG6r2Dr7mAysT2dJsPsWTGp1_oKC1isRA_kQHaoCu-M-e-pcNeX9k'
//     }
//   });
  //  try {
    var transporter = await nodemailer.createTransport({sendmail: true},{
        name: 'huber.co.in', 
        host: 'mail.huber.co.in',
        port: 465,
        secure: true,secureConnection: false,
        auth: {
            user:'contact@huber.co.in', //'dipak@huber.co.in', // contact@huber.co.in -> not working
            pass: 'huber@400',//'dipaksavaliya05' // huber@400 -> not working
        },
       // tls: {rejectUnauthorized: false}
        });
        console.log("email",mailData.to);
        var mailOptions = {
          //  from: 'vamsi@hubworkdesk.com',
            from: 'contact@huber.co.in',
            to: mailData.to,

            bcc:"contact@huber.co.in,sheker@hubworkdesk.com",
            subject: mailData.subject,
            html: htmltemp
          };
        //transporter.verify();
        //console.log(mailOptions)
 transporter.sendMail(mailOptions, function(error, info){
          if (error) {
		//console.log('reached here------');
            console.log('Email not sent: ' + error);
          } else {
            console.log('Email sent: ' + info.response);
          //  console.log('info', info)
          }
        });
       
    // } catch (ex) { }
  


}

exports.authenticateRoute = async (req, res, next) => {
    var token = req.headers['x-access-token'];
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

    // var token ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMjQzMjQzMjQzNDM0IiwiaWF0IjoxNTg2NzAwMDczLCJleHAiOjE1ODY3ODY0NzN9.jp-NXyMYIIGY8qvXs2o-mABmvUbI4_cODsOp8QzeTz0';
    jwt.verify(token, config.secret, function (err, decoded) {
        if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        res.status(200).send(decoded);
    });

    res.status(200).json({
        success: true,
        msg: 'loggged in ',
        data: resp
    });
};

exports.userauthenticateToken = async (req, res, next) => {
    var token = req.body.token

    // var token ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMjQzMjQzMjQzNDM0IiwiaWF0IjoxNTg2NzAwMDczLCJleHAiOjE1ODY3ODY0NzN9.jp-NXyMYIIGY8qvXs2o-mABmvUbI4_cODsOp8QzeTz0';
    jwt.verify(token, config.secret, function (err, decoded) {
        if (err) {
            return res.status(500).send({ success: false, message: 'Failed to authenticate token.' });
        } else {
            res.status(200).json({
                success: true,
                msg: 'valid token'
            });
        }
    });


};

