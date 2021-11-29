'use strict';
var respHelper = require('../common/response');
var modals = require('../models/mainModal');
const Constant = require('../config/constant');
var commonHelper = require('../common/common');
const { Sequelize } = require('sequelize');
const Op = Sequelize.Op;
var  { 
    mapAsync, 
    flowAsync, 
    filterAsync, 
    flatMapAsync, 
    uniqByAsync, 
    getAsync, 
  } =require("lodasync");

  var nodemailer = require('nodemailer');
  exports.pincode = async function(req, res) {
    //try {
        var obj = req.body;
        var offset = 0;
        var limit = 8;
        if (obj.hasOwnProperty("page")) {
            offset = (req.body.page - 1) * limit;
        }
        var wherecondition = {
            status:1,
            isdeleted:0,
        }
        if (req.body.search) {
            var obj2 = {
                pincode: {
                    [Op.like]: '' + req.body.search + '%'
                }
            }
            Object.assign(wherecondition, {}, obj2);
        }

        var user_order = await modals.pincodes.findAndCountAll({
            attributes: [
                 ['pincode','zip']
                ],
                where: wherecondition,
                offset: offset,
                limit: limit
        });
        var data = {};
        data.status = 200;
        data.success = (user_order.count > 0) ? true : false;
        data.msg = (user_order.count > 0) ? "Delivery available in your location" : "Delivery not available for your location";
        data.data = {
            "total_page": Math.ceil(user_order.count / limit),
            "pincodes": user_order.rows,
        };
        respHelper.msg(res, data);
//    } catch (ex) {
//         var data = {};
//         data.status = 500;
//         respHelper.msg(res, data);
//    }
};
exports.searchProduct=async function(req, res) {
    try{
     
       var products= await modals.products.findAll({
           attributes: [
               'id',
               'name',
               [modals.sequelize.literal('(SELECT 0)'), 'lisingType']
               ],
               where: {
              
                status:1,
                isdeleted:0,
                   [Op.or]: [
                        {  
                       name: {
                           [Op.like]: `%${req.body.search}%`
                            } 
                        },
                       {  
                           meta_title: {
                       [Op.like]: `%${req.body.search}%`
                       } 
                       }
                   ]
                   },
           offset: 0,
           limit: 4,
       
           
       });
 
       var categories= await modals.categories.findAll({
           attributes: [
                   'id',
                   'name',
                 //  ['cat_url','url'],
                   [modals.sequelize.literal('(SELECT 1)'), 'lisingType']
               ],
               where: {
                id: {
                    [Sequelize.Op.not]:[1,317],
                  },
                status:1,
                isdeleted:0,
                   [Op.or]: [
                        {  
                           name: {
                           [Op.like]: `%${req.body.search}%`
                            } 
                        }
                   ]
                   },
           
       });
    
     if(categories!=''){
         var children =  categories;
     }else{
         var children =  products;
     }
   
           var data = {};
           data.status = 200;
           data.msg = "Data Loaded";
           data.data =children
           respHelper.msg(res, data);
 
      } catch (ex) {
       var data = {};
       data.status = 500;
       respHelper.msg(res, data);
  }
 }
 exports.homePage = async function (req, res) {
   try{
    let popularOffer = await modals.popularOffer.findAll({ attributes: ['id','name',
    [modals.sequelize.literal("concat('" + Constant.imageURL + "/blog/banner/',banner_image)"), 'image']], where: {status:1,
        isdeleted:0}});
        let categoryData = await modals.categories.findAll({ attributes: ['id','name',
        [modals.sequelize.literal("concat('" + Constant.imageURL + "/category/logo/',logo)"), 'image']], where: { id: {
            [Sequelize.Op.not]:[1],
          },status:1,
            isdeleted:0}});

        var FirstSlider = await modals.home_sliders.findAll({
            attributes: ['product_id'],
            where: { slider_type: 0},
          
        });
        const getProd = async(obj) => { 
            return obj.product_id
        }
        var result = await mapAsync(getProd, FirstSlider);
        let FirstSliderHome = await modals.products.findAll({  attributes: [
            'id', 'name', 'price','spcl_price','delivery_days','no_of_pcs','qty',
            'short_description',
            [modals.sequelize.literal("concat('" + Constant.imageURL + "/products/',default_image)"), 'image']
        ],
        where: {
            id: {
                [Sequelize.Op.in]:result,
              },
            status:1,
            isdeleted:0
        },
        limit: 10,
        order: [
            ['id','desc']
            ],
    });

        var FirstSlider1 = await modals.home_sliders.findAll({
            attributes: ['product_id'],
            where: { slider_type: 1},
          
        });
        const getProd1 = async(obj2) => { 
            return obj2.product_id
        }
        var result1 = await mapAsync(getProd1, FirstSlider1);
        let FirstSliderHome1 = await modals.products.findAll({  attributes: [
            'id', 'name', 'price','spcl_price','delivery_days','no_of_pcs','qty',
            'short_description',
            [modals.sequelize.literal("concat('" + Constant.imageURL + "/products/',default_image)"), 'image']
        ],
        where: {
            id: {
                [Sequelize.Op.in]:result1,
              },
            status:1,
            isdeleted:0,
           
        },
        limit: 10,
        order: [
            ['id','desc']
            ],
         //   logging: console.log,
    });

  
   var data = {};
   data.status = 200;
   data.msg = 'Get Result Successfully.';
   data.data = {categoryData,popularOffer,FirstSliderHome,FirstSliderHome1};
   data.length = '';
   respHelper.msg(res, data);

} catch (ex) {
    console.log(ex)
    var data = {};
    data.status = 500;
    respHelper.msg(res, data);
}
  };
  exports.subscribe=async function(req,res){
    // try {
        var subs = await modals.subscription.findOne({
             attributes: ['id'],
             where: { email: req.body.email }
         })
         if (subs) {
              var data = {};
             data.status = 204;
             data.success =false;
             data.msg =  "Already subscribed.";
             respHelper.msg(res, data); 
         }
         else {
             await modals.subscription.create({ email: req.body.email });
             var mailOptions = {
                 temptype: 1,
                 to:"jyotisw10@gmail.com",
                 subject: 'Subscription',
                 html: req.body.email
             };
             commonHelper.sendMail(mailOptions);

             var mailOptions = {
                 temptype: 1,
                 subject: 'Subscription',
                 to:req.body.email,
                 html: '<p>Hello</p><p>Thank you for subscribing to HUBER. We will be sending you relevant content and updates from Huber.If you have any questions or comments about the content you’re receiving please email back and we will respond to your inquiry promptly.</p>',
                 
             };
             commonHelper.sendMail(mailOptions);

             var data = {};
             data.status = 200;
             data.msg = "You have subscribed successfully."
             data.data ={};
             respHelper.msg(res, data);
         }

 //     }
 // catch (ex) {
 //         var data = {};
 //         data.status = 500;
 //         respHelper.msg(res, data);
 // }
}

exports.blogs = async function (req, res) {
    try {
      
        let dataQuery = await modals.blog.findAll({
            attributes: ['name','id', 'image', 'description',[modals.sequelize.literal("concat('" + Constant.imageURL + "/blog/',image)"), 'image']],
            where:{
                status:1,
                type:req.body.type
            }
        });
       
        var data = {};
        data.status = 200;
        data.msg = 'Get Result Successfully.';
        data.data = {dataQuery};
        data.length = '';
        respHelper.msg(res, data);

    } catch (ex) {
        console.log(ex)
        var data = {};
        data.status = 500;
        respHelper.msg(res, data);
    }
};
exports.advertisment = async function(req, res){
   // try{
        var user_order = await modals.advertisment.findAndCountAll({
            attributes: [
                'id','image','url'
            ],
            order: [
                ['id', 'desc']
            ],
            where: {
                status:'active'
            }
        });
        var result = [];
        result = user_order.rows.map(function(obj) {
            let r = {
                "id": obj.id,
                "advertise_position": obj.advertise_position,
                "image": Constant.imageURL+"/advertise/"+obj.image,
                "url": obj.url,
                "short_text": obj.short_text,
                "description": obj.description,
            };
            return r;
        });
        var data = {};
        data.status = 200;
        data.success = (user_order.count > 0) ? true : false;
        data.msg = (user_order.count > 0) ? "Data  found" : "no Data found";
        data.data = result;
        respHelper.msg(res, data);
        
    // }catch(ex){
    //     var data = {};
    //     data.status=500;
    //     respHelper.msg(res, data);
    // }
}

exports.ourTeam = async function (req, res){
   // try{
    var obj = req.body;
    var user_order = await modals.teams.findAll({
        attributes: [
            'position','name','description',
            
            'id','twitter','insta','linkedin',
           [modals.sequelize.literal("concat('" + Constant.imageURL + "/',image)"), 'image'],
        ],
        where: {
            
        },
        order: [
            ['id', 'ASC'],
           // ['name', 'ASC'],
        ],
    });
    // var result = [];
    // result = user_order.rows.map(function(obj) {
    //     let r = {
    //         "name":obj.name,
    //         "position":obj.position, "description":obj.description, 
    //         "image": constant.imageURL+"/"+obj.image,
    //         "id":obj.id
    //     };
    //     return r;
    // });
    var data = {};
    data.status = 200;
    data.success = (user_order.count > 0) ? true : false;
    data.msg = (user_order.count > 0) ? "Data found" : "no Data found";
    data.data = user_order;
    respHelper.msg(res, data);
    //    }catch(ex){
    //     var data = {};
    //     data.status = 500;
    //     respHelper.msg(res, data);
    //    }
}

exports.pageslist = async function (req,res) {
  //  try {
        
        var get_url = await modals.pages.findAll({
            attributes: ['id','title','url_name','description'],
           order: [
            ['id', 'ASC'],
           // ['name', 'ASC'],
        ],
        where: {
            delated_at: {
                [Op.is]: null, // Like: sellDate IS NOT NULL
            }
        }
        })
        if (get_url) {

            var data = {};
            data.status = 200;
            data.success =true;
            data.msg = "Data found";
            data.data = get_url;
            respHelper.msg(res, data); 
        }
        else {
            var data = {};
            data.status = 400;
            data.success =true;
            data.msg =  "no page found";
            data.data = '';
            respHelper.msg(res, data); 
        }
    // } catch (ex) {
    //     var data = {};
    //     data.status = 500;
    //     data.success =true;
    //     respHelper.msg(res, data); 
    // }
}
exports.settings = async function (req,res) {
 //   try {
      
        var settings = await modals.settings.findOne({
             attributes: [
            'name',
            'email',
            'phone',
            
            'address',
         
            'facebook_url',
            'twiter_url',
            'linkedin_url',
            'video_link',
           
            'home_meta_title',
            'home_meta_keyword',
            'home_meta_description',
            'contact_meta_title',
            'contact_meta_keyword',
            'contact_meta_description'
            
        ],
            where: { id: 1 }
        })
        if (settings) {

            var data = {};
            data.status = 200;
            data.success =true;
            data.msg =  "site data  found";
            data.data = settings;
            respHelper.msg(res, data); 
        }
        else {
            var data = {};
            data.status = 200;
            data.success =true;
            data.msg =  "";
            data.data = '';
            respHelper.msg(res, data); 
        }
    // } catch (ex) {
    //     var data = {};
    //     data.status = 500;
    //     data.success =true;
    //     respHelper.msg(res, data); 
    // }
}

exports.haveQuery=async function(req, res){
try{
    await modals.haveQuery.create({ user_id:req.body.user_id,customer_query: req.body.customer_query});
   
    var data = {};
    data.status = 200;
    data.msg = "Your query successfully submitted."
    data.data ={};
    respHelper.msg(res, data);
}
catch (ex) {
    var data = {};
    data.status = 500;
    respHelper.msg(res, data);
}
}
  
exports.cities = async function (req,res) {
    try {
        
        var get_url = await modals.cities.findAll({
            attributes: ['id','name'],
            where: { status: 'active'}
        })
        if (get_url) {

            var data = {};
            data.status = 200;
            data.success =true;
            data.msg = "Data found";
            data.data = get_url;
            respHelper.msg(res, data); 
        }
        else {
            var data = {};
            data.status = 400;
            data.success =true;
            data.msg =  "no page found";
            data.data = '';
            respHelper.msg(res, data); 
        }
    } catch (ex) {
        var data = {};
        data.status = 500;
        data.success =true;
        respHelper.msg(res, data); 
    }
}
exports.faqs = async function (req,res) {
    try {
        
        var get_url = await modals.faqs.findAll({
            attributes: ['id', 'question','answer'],
            where: { status:1}
        })
        if (get_url) {

            var data = {};
            data.status = 200;
            data.success =true;
            data.msg = "Page found";
            data.data = get_url;
            respHelper.msg(res, data); 
        }
        else {
            var data = {};
            data.status = 400;
            data.success =true;
            data.msg =  "no page found";
            data.data = '';
            respHelper.msg(res, data); 
        }
    } catch (ex) {
        var data = {};
        data.status = 500;
        data.success =true;
        respHelper.msg(res, data); 
    }
}
exports.contactus=async function(req,res){
   // try {
    await modals.contact.create({ company_name: req.body.company_name,name: req.body.name,email: req.body.email,
        phone: req.body.phone,message: req.body.message });
    let html='';
      
            html+=`<tr>
            <td style="padding: 0px 0px;">
                <table style="width: 100%; text-align: left; font-size: 16px; padding: 20px; " cellspacing="0" cellpadding="0">
       
                    <tr bgcolor="#fdfdfd">
                        <td style="padding: 10px 20px;"> Name </td>
                        <td style="padding: 10px 20px;">${req.body.name}</td>
                    </tr>
       
                    <tr bgcolor="#faf9f9">
                        <td style="padding: 10px 20px;">Email Address </td>
                        <td style="padding: 10px 20px;">${req.body.email}</td>
                    </tr>
       
                    <tr bgcolor="#fdfdfd">
                        <td style="padding: 10px 20px;">Telephone </td>
                        <td style="padding: 10px 20px;">${req.body.phone}</td>
                    </tr>
                    <tr bgcolor="#fdfdfd">
                        <td style="padding: 10px 20px;">Company Name </td>
                        <td style="padding: 10px 20px;">${req.body.company_name}</td>
                    </tr>
                    `;
       if(req.body.message){
        html+=`<tr bgcolor="#faf9f9">
                        <td style="padding: 10px 20px;">Comment </td>
                        <td style="padding: 10px 20px;">${req.body.message}</td>
                    </tr>`;
        }
        else{
            html+=`<tr bgcolor="#faf9f9">
                <td style="padding: 10px 20px;">Blog </td>
                <td style="padding: 10px 20px;">${req.body.subject}</td>
            </tr>`;
}
html+=`</table>
       
       
            </td>
        </tr>`;
          // commonHelper.sendContactusMail({ name: req.body.name,email: req.body.email,phone: req.body.phone,message: req.body.message });
                var mailOptions = {
                    temptype: 1,
                    to: req.body.email,
                    subject: req.body.subject,
                    html: html
                };
                commonHelper.sendMail(mailOptions);



            var data = {};
            data.status = 200;
            data.msg = "Thank you for contact us. we will get back to you soon."
            data.data ={};
            respHelper.msg(res, data);
        

//     }
// catch (ex) {
//         var data = {};
//         data.status = 500;
//         respHelper.msg(res, data);
// }
}

exports.feedback=async function(req, res){
   try{
        var id = req.body.userId;
        await modals.feedback.create({ user_id:id,description: req.body.description});

        var user = await modals.users.findOne({
            where: { id: id }
        })
        let html='';
      
            html+=`<tr>
            <td style="padding: 0px 0px;">
                <table style="width: 100%; text-align: left; font-size: 16px; padding: 20px; " cellspacing="0" cellpadding="0">
       
                    
                <tr bgcolor="#fdfdfd">
                <td style="padding: 10px 20px;">User Name</td>
                <td style="padding: 10px 20px;">${user.name}</td>
            </tr>
                    <tr bgcolor="#fdfdfd">
                        <td style="padding: 10px 20px;">Feedback</td>
                        <td style="padding: 10px 20px;">${req.body.description}</td>
                    </tr>
                    `;
      
html+=`</table>
       
       
            </td>
        </tr>`;
          // commonHelper.sendContactusMail({ name: req.body.name,email: req.body.email,phone: req.body.phone,message: req.body.message });
                var mailOptions = {
                    temptype: 1,
                    to: "jyotisw10@gmail.com",
                    subject: "Feedback & Referrals",
                    html: html
                };
                commonHelper.sendMail(mailOptions);
        var data = {};
        data.status = 200;
        data.msg = "Thank you for feedback."
        data.data ={};
        respHelper.msg(res, data);
    }
    catch (ex) {
        var data = {};
        data.status = 500;
        respHelper.msg(res, data);
    }
    }
exports.page_details = async function (req,res) {
    try {
        
        var get_url = await modals.pages.findOne({
            attributes: ['id', 'title','url_name',
            //[modals.sequelize.literal("concat('" + constant.imageURL + "/pages/', banner)"), 'image'],
            'description'],
            where: { url_name: req.body.page_url }
        })
        if (get_url) {

            var data = {};
            data.status = 200;
            data.success =true;
            data.msg = "Page found";
            data.data = get_url;
            respHelper.msg(res, data); 
        }
        else {
            var data = {};
            data.status = 400;
            data.success =true;
            data.msg =  "no page found";
            data.data = '';
            respHelper.msg(res, data); 
        }
    } catch (ex) {
        var data = {};
        data.status = 500;
        data.success =true;
        respHelper.msg(res, data); 
    }
}


exports.webhomePageData = async function (req, res) {
    try {
        let sliders = await modals.sliders.findAll({attributes: ['id','short_text', 'image', 'url',[modals.sequelize.literal("concat('" + Constant.imageURL + "/slider/',image)"), 'image']],where: { status: '1'}} );
        let amenties = await modals.amenities.findAll({attributes:  ['id', 'name','image', [modals.sequelize.literal("concat('" + Constant.imageURL + "/',image)"), 'image']]});
        let testimonial = await modals.testimonials.findAll({attributes: ['id', 'description', 'name','designation'],where: { status: '1'}});
        var data = {};
        data.status = 200;
        data.msg = 'Get Result Successfully.';
        data.data = {sliders,amenties,testimonial };
        data.length = '';
        respHelper.msg(res, data);

    } catch (ex) {
        console.log(ex)
        var data = {};
        data.status = 500;
        respHelper.msg(res, data);
    }
};

exports.testMail = async function (req, res) {
    // try {
    // // send email using mailchimp_transactional
    // // const message = {
    // //     from_email: "dipak@huber.co.in",
    // //     subject: "Hello world",
    // //     text: "Welcome to Mailchimp Transactional!",
    // //     to: [
    // //       {
    // //         email: "contact@huber.co.in",
    // //         type: "to"
    // //       }
    // //     ]
    // //   };

    // //*   Nodemailer function with SMTP configuration
    //       var transporter = await nodemailer.createTransport({
    //         name: 'huber.co.in',
    //         host: 'mail.huber.co.in',
    //         port: 465,
    //         secure: true,
    //         auth: {
    //             user: 'dipak@huber.co.in', // contact@huber.co.in -> not working
    //             pass: 'dipaksavaliya05' // huber@400 -> not working
    //         },
    //        // tls: {rejectUnauthorized: false}
    //         });
    //         var mailOptions = {
    //             from: 'contact@huber.co.in',
    //             to: "ankit067.rejoice@gmail.com",
    //             subject: "Hello world",
    //             text: "Welcome to Normal SMTP mail"
    //           };
    //         transporter.verify();
    //         //console.log(mailOptions)
    //  transporter.sendMail(mailOptions, function(error, info){
    //           if (error) {
    // 		console.log('reached here------');
    //             console.log('Email not sent: ' + error);
    //           } else {
    //             console.log('Email sent: ' + info.response);
    //             console.log("info", info)
    //           }
    //         });  

    // //* send email mailchimp function
    // // async function run() {
    // //     const response = await mailchimpClient.messages.send({
    // //       message
    // //     });
    // //     console.log(response);
    // //   }
    // //   run();


    // //   add inbound domain
    // // const run = async () => {
    // //     const response = await mailchimpClient.inbound.addDomain({
    // //       domain: "domain",
    // //     });
    // //     console.log(response);
    // //   };
      
    // //   run();


    // //   check domain settings
    // // const run = async () => {
    // //     const response = await mailchimpClient.inbound.checkDomain({
    // //       domain: "huber.co.in",
    // //     });
    // //     console.log(response);
    // //   };
      
    // //   run();
    
    // //   inbound list
    // // const run = async () => {
    // //     const response = await mailchimpClient.inbound.domains();
    // //     console.log(response);
    // //   };
      
    // //   run();



    // // sender list
    // // const run = async () => {
    // //     const response = await mailchimpClient.senders.list();
    // //     console.log(response);
    // //   };
      
    // //   run();

    // // list webhoks
    // // const run = async () => {
    // //     const response = await mailchimpClient.webhooks.list();
    // //     console.log(response);
    // //   };
      
    // //   run();

    // // mailchimp ping
    // // async function run() {
    // //     const response = await mailchimpClient.users.ping();
    // //     console.log(response);
    // //   }
      
    // //   run();
      

    // } catch (ex) {
    //     console.log(ex)
    //     var data = {};
    //     data.status = 500;
    //     respHelper.msg(res, data);
    // }
};