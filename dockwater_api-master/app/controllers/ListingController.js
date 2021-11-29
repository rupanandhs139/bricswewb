'use strict';
var respHelper = require('../common/response');
var modals = require('../models/mainModal');
const Constant = require('../config/constant');
var commonHelper = require('../common/common');
const { Sequelize,QueryTypes } = require('sequelize');
var dateFormat = require('dateformat');
//const moment= require('moment') ;
var moment = require('moment-timezone');
const Op = Sequelize.Op;
var  { 
    mapAsync, 
    flowAsync, 
    filterAsync, 
    flatMapAsync, 
    uniqByAsync, 
    getAsync, 
  } =require("lodasync");

  exports.listing = async function(req, res) {
    //try {
        var obj = req.body;
        var offset = 0;
        var limit = 8;
        var IdOrder='DESC';
        var price='ASC';
        var userId=req.body.user_id;
      
        if (obj.hasOwnProperty("page")) {
            offset = (req.body.page - 1) * limit;
        }
        
        if (obj.hasOwnProperty("sort_by")) {
            if(req.body.sort_by=='popular'){
                price='DESC'
            }
        }
        var wherecondition = {
            status:1,isdeleted:0
        }
        if(req.body.priceMin!='' && req.body.priceMax!=''){
        Object.assign(wherecondition, {}, { 
            spcl_price: {
                 [Op.between]: [req.body.priceMin,req.body.priceMax]
            },
         });
        }
       
      var  cat=req.body.category_id;
   
      
        var user_order = await modals.product_categories.findAndCountAll({
            where: {
                cat_id: {
                    [Sequelize.Op.in]:cat,
                  },
            },
            include:{
                model:modals.products,
                attributes: [
                    'id', 'name', 'price','spcl_price','delivery_days','no_of_pcs','qty',
                    'short_description'
                ],
                where: wherecondition,
            },
          
         	 order: [
              [modals.products, 'spcl_price',price],
              [modals.products, 'id',IdOrder]
             ],
            //logging: console.log,
            offset: offset,
            limit: limit
        });
    

        const getProd = async(obj) => { 
            // const wishlist =await modals.sequelize.query(
            //     `SELECT count(id) as count FROM tbl_wishlist WHERE fld_user_id=:fld_user_id AND fld_product_id=:fld_product_id `,
            //     {
            //       replacements: { fld_product_id: obj.product.id ,fld_user_id:user_id},
            //       type: QueryTypes.SELECT
            //     }
            //   );

            //   const ratingReview =await modals.sequelize.query(
            //     `SELECT count(id) as count FROM product_rating WHERE product_id=:fld_product_id `,
            //     {
            //       replacements: { fld_product_id: obj.product.id},
            //       type: QueryTypes.SELECT
            //     }
            //   );
            //   var wishlist1=false;
            //     if(wishlist[0].count>0){
            //         wishlist1=true;
            //     }
              
                if(obj.product.default_image){
                    var image= obj.product.default_image;
                }else{
                     var image="dummyprd.jpg";
                }
                let fav = await modals.wishlist.findOne({attributes: ['fld_wishlist_id'],
                where: {'fld_product_id': obj.product.id,'fld_user_id':userId}
                });
               var inMyWishlist=(fav)?true:false;
            let r = {
                "id": obj.product.id,
                "name": obj.product.name,
                "price": obj.product.price,
                "spcl_price": obj.product.spcl_price,
               // "rating": ratingReview[0].count,
               // "review": ratingReview[0].count,
               "inMyWishlist":inMyWishlist,
                "image": Constant.imageURL+"/products/"+image,
                
                "qty":obj.product.qty,
                'delivery_days':obj.product.delivery_days,
                'no_of_pcs':obj.product.no_of_pcs,
                "short_description":obj.product.short_description,
            };
            return r; 
        }

        // Write async code like you write synchronous code
        const result = await mapAsync(getProd, user_order.rows)
        var data = {};
        data.status = (user_order.count > 0) ? 200 : 404;
        data.success = (user_order.count > 0) ? true : false;
        data.msg = (user_order.count > 0) ? "Data Loaded" : "No data found";
        data.data = {
            "total_page": Math.ceil(user_order.count / limit),
            "products": result
        };
        respHelper.msg(res, data);
//    } catch (ex) {
//         var data = {};
//         data.status = 500;
//         respHelper.msg(res, data);
//    }
};
exports.Details = async function (req, res) {
  // try {
        
        var userId = req.body.user_id; 
        let id=req.body.id;
        let Detail = await modals.products.findOne({  attributes: [
            'id', 'name', 'price','spcl_price','delivery_days','no_of_pcs','qty',
            'short_description','long_description',
            [modals.sequelize.literal("concat('" + Constant.imageURL + "/products/',default_image)"), 'image']
        ],
        where: {
            id:id,
            status:1,
            isdeleted:0,
        },
    });
    var Specifications = await modals.Specifications.findAll({
        attributes: [
            'product_general_descrip_title','product_general_descrip_content'
        ],
        where: {
            product_id:req.body.id
        }
    });
    var description = await modals.product_extra_description.findAll({
        attributes: [
            'product_descrip_title','product_descrip_content'
        ],
        where: {
            product_id:req.body.id
        }
    });
         let fav = await modals.wishlist.findOne({attributes: ['fld_wishlist_id'],
         where: {'fld_product_id': id,'fld_user_id':userId}
         });
        var inMyWishlist=(fav)?true:false;
        var data = {};
        data.status = 200;
        data.msg = 'Get Result Successfully.';
        data.data = {Detail,inMyWishlist,Specifications,description};
        data.length = '';
        respHelper.msg(res, data);

    // } catch (ex) {
    //     var data = {};
    //     data.status = 500;
    //     respHelper.msg(res, data);
    // }
};


exports.rating_submit =async function(req, res){
   try {
        let userId = req.body.userId;
        var subs = await modals.Rating.findOne({
             attributes: ['id'],
             where: { prd_id: req.body.prd_id,user_id: userId }
         })
         if (subs) {

              var data = {};
             data.status = 204;
             data.success =false;
             data.msg =  "You have already give the rating this workspaces.";
             respHelper.msg(res, data); 
         }
         else {
           
             await modals.Rating.create({ prd_id: req.body.prd_id,user_id: userId
            ,rating: req.body.rating,comment: req.body.comment});
            var getall = await modals.Rating.findAndCountAll({
                attributes: ['id'],
                where: { prd_id: req.body.prd_id}
            });
            const salesValue = await modals.Rating.sum('rating', {
                where: { prd_id: req.body.prd_id}
            });
           
       //   console.log(getall.count); console.log(salesValue);
 let average=0;
            if(getall.count){
 
             average = ((salesValue/ getall.count));
           }     
           var getProd = await modals.products.update({ rating: average}, { where: { id: req.body.prd_id } });


             var data = {};
             data.status = 200;
             data.msg = "Thanks for give the rating."
             data.data ={};
             respHelper.msg(res, data);
         }

     }
 catch (ex) {
         var data = {};
         data.status = 500;
         respHelper.msg(res, data);
    }
  }

  exports.cancelBooking = async function (req, res) {
   //   try {
          var id = req.body.id;
          let userId = req.body.userId;
          let user_update_data = await modals.booking.update(req.body, { where: { id: id } });
          let user = await modals.users.findOne({ attributes: ['id','email','fcm_token','name',[modals.sequelize.literal("concat('" + Constant.imageURL + "/profile/',image)"), 'image']], where: {'id': userId}});
          var bookingquery = await modals.booking.findOne({
            attributes: ['id','orderid','booking_date','created_at','status','product_id'],
            where: {
                id: id, 
            },
            order: [['id', 'DESC']],
        });
        
          var workspaces = await modals.products.findOne({
            attributes: ['id', 'slots','officetype','name', 'address','latitude', 'longitude','rating','timings','amenties',
            [modals.sequelize.literal("concat('" + Constant.imageURL + "/products/',image)"), 'image']
            ],
           
            where: {
               // status: 'active',
               id:bookingquery.product_id
            },
            raw: true,
            nest: true
        });
        //console.log("email",user.email);
     //  console.log("booking",bookingquery); console.log("user",user);console.log("work",workspaces);

     let html='';
     html+=`<p>Dear ${user.name}</p>`;
     html+=`<p>We have received your decision to cancel the booking of your request with identification number ${bookingquery.orderid}. Your request is cancelled.</p>`;
     html+=`<p>If you have any queries regarding cancellation or want to reach us, please do not hesitate to contact us at 99160-HUBER or 99168-HUBER and we will endeavour to assist you as soon as possible </p>`;   
    
 
          var mailOptions = {
            temptype: 1,
            to:user.email,
            subject:'Booking Cancellation',
            html:html,
            bookingquery: bookingquery,
            workspaces:workspaces
        };
        commonHelper.sendMail(mailOptions);

        if(user.fcm_token){
            var token=user.fcm_token;
            var title="Booking Successfully Cancelled"; 
            var body='Booking has been Cancelled.';  
            var redirect_to="Cancelled Booking";
            commonHelper.single_notification(token,title,body,redirect_to);
        }
          if (user_update_data) {
              var data = {};
              data.status = 200;
              data.msg = "Booking Successfully Cancelled"
            
              respHelper.msg(res, data);
          }else{
              var data = {};
              data.status = 202;
              data.msg = "Not found";
              respHelper.msg(res, data);
          }
  
    //   } catch (ex) {
    //       var data = {};
    //       data.status = 500;
    //       respHelper.msg(res, data);
    //   }
      }