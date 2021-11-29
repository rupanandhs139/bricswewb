'use strict';

var respHelper = require('../common/response');
var modals = require('../models/mainModal');
const Constant = require('../config/constant');
var commonHelper = require('../common/common');
const { Sequelize,QueryTypes } = require('sequelize');
var dateFormat = require('dateformat');
var request = require("request");
const Op = Sequelize.Op;
var slug = require('slug');
var common = require('../requestValitor/commonValidation');
var moment = require('moment-timezone');
var  { 
    mapAsync, 
    flowAsync, 
    filterAsync, 
    flatMapAsync, 
    uniqByAsync, 
    getAsync, 
  } =require("lodasync");

  exports.applyCoupon = async function (req, res) {
   // try {
     const { error, value } = common.applyCoupon.validate(req.body);
        if (error) {
                var data = {};
                data.status = 400;
                respHelper.msg(res, data);
        } else {
            let cpnEixts = await modals.coupons.findOne( {
                        where: { 
                            status:1
                            },
                     include: {
                        model: modals.coupon_details,
                        attributes: [
                            'id'
                        ],
                        required: true,
                        where: { 
                            status:1,
                            coupon_used:0,
                            coupon_code:req.body.couponCode
                         }
                    }
                 }
                 );
            if(!cpnEixts){
                var data = {};
                data.status = 204;
                data.msg = "Invalid coupon 1";
                data.data ={};
                respHelper.msg(res, data);
                return ;
            }
            if(cpnEixts.coupon_type==3 || cpnEixts.coupon_type==7 || cpnEixts.coupon_type==2 || cpnEixts.coupon_type==6){
                if(cpnEixts.started_date !=null && cpnEixts.end_date!=null){
                    let dateResp= commonHelper.checkCouponDate(cpnEixts);
                       if(!dateResp.error){
                             var data = {};
                             data.status = 204;
                             data.msg = "Invalid coupon 2";
                             data.data ={};
                             respHelper.msg(res, data);
                             return ;
                    }
                 }
            }


            if(cpnEixts.coupon_type==1 || cpnEixts.coupon_type==3 || cpnEixts.coupon_type==5 || cpnEixts.coupon_type==7){
                let dateResp= commonHelper.checkCartValue(cpnEixts,req.body.orderTotal);
                       if(!dateResp.error){
                             var data = {};
                             data.status = 204;
                             data.msg = "Invalid coupon 3";
                             data.data ={};
                             respHelper.msg(res, data);
                             return ;
                    }

            }
          
               if(cpnEixts.coupon_for==2){
                let usesperUser= await commonHelper.checkCustomertype(req.body.userId);

                if(usesperUser.count > 0){
                    var data = {};
                    data.status = 204;
                    data.msg = "This coupon invalid for you";
                    data.data ={};
                    respHelper.msg(res, data);
                    return ;
                }
               }
            
                let usesperUser= await commonHelper.usesperUser(req.body.couponCode,req.body.userId);

                if(cpnEixts.uses_per_user<=usesperUser.count){
                    var data = {};
                    data.status = 204;
                    data.msg = "This coupon invalid for you 2";
                    data.data ={};
                    respHelper.msg(res, data);
                    return ;
                }
    
              let calculatePercentage= commonHelper.calculatePercentage(cpnEixts,value);

                  var data = {};
                data.status = 200;
                data.msg = "coupon applied";
                data.data =calculatePercentage.discount;
                respHelper.msg(res, data); 
               
        }  
            
    // }
    // catch (ex) {
    //     var data = {};
    //     data.status = 500;
    //     respHelper.msg(res, data);
    // }
}
exports.addressAddUpdate = async function(req, res) {
   // try {
        if(req.body.id == 0){
            let datalist = await modals.customer_shipping_address.findOne({ where: req.body },{logging: console.log});
            //console.log(datalist)
            if(datalist){
                var data = {};
                data.status = 204;
                data.msg = 'Already Added this address';
                data.data = {};
                respHelper.msg(res, data);
                return ;
            }else{
            let user_update_data = await modals.customer_shipping_address.create(req.body) 
            var data = {};
            data.status = 200;
            data.msg = 'Address added successfully';
            data.data = {};
            respHelper.msg(res, data);
            return ;
            }
            
        }else{
            let user_update_data = await modals.customer_shipping_address.update(req.body, {
                where: {
                    id: req.body.id
                }
            }) 

            var data = {};
            data.status = 200;
            data.msg = 'Updated successfully';
            data.data = {};
            respHelper.msg(res, data);
            return ;
        }
 
         
 
    //  } catch (ex) {
    //      var data = {};
    //      data.status = 500;
    //      respHelper.msg(res, data);
 
    //  }
 };
exports.address = async function(req, res) {
  //  try {
        if(req.body.id == 0){
            let datalist = await modals.customer_shipping_address.findAll({ where: { customer_id: req.body.userId } });
            
            if(datalist.length > 0){
                var data = {};
                data.status = 200;
                data.msg = 'Data Loaded';
                data.data = datalist;
                respHelper.msg(res, data);
                return ;
            }else{
                var data = {};
            data.status = 404;
            data.msg = 'No record found';
            data.data = {};
            respHelper.msg(res, data);
            return ;
            }
            
        }
       else{
                 await modals.customer_shipping_address.destroy({ where: { id:req.body.id} });
                 var data = {};
                 data.status = 200;
                 data.msg = 'Deleted successfully!';
                 data.data = {};
                 respHelper.msg(res, data);
 
            
 
         }
 
    //  } catch (ex) {
    //      var data = {};
    //      data.status = 500;
    //      respHelper.msg(res, data);
 
    //  }
 };
 
  exports.cartActions = async function(req, res) {
   try {
        const { error, value } = common.cart.validate(req.body);

        if (1==0) {
            var data = {};
            data.status = 400;
            respHelper.msg(res, data);
        } else {

            if (req.body.type == 0 || req.body.type == 1) {
                let serviceExist = await modals.products.findOne({ attributes: ['id','qty'], where: { id: req.body.prd_id } });
                if (serviceExist) {

                    if(serviceExist.qty < req.body.qty){
                        var data = {};
                        data.status = 204;
                        data.msg = 'No More Quantity In Stock';
                        data.data = {};
                        respHelper.msg(res, data);
                        return ;
                    }
                    switch (req.body.type) {
                        case 0:
                            let user_role = await modals.carts.findOne({ attributes: ['id'], where: { 
                                user_id: req.body.userId, prd_id: req.body.prd_id } });
                            if (user_role) {
                                var data = {};
                                data.status = 204;
                                data.msg = 'Product already in your cart';
                                data.data = {};
                                respHelper.msg(res, data);
                            } else {
                                await modals.carts.create({ 
                                     user_id: req.body.userId,
                                     prd_id: req.body.prd_id, qty: req.body.qty
                                     });
                                var data = {};
                                data.status = 200;
                                data.msg = 'Product added to cart';
                                data.data = {};
                                respHelper.msg(res, data);
                            }


                            break;

                        case 1:
                            await modals.carts.update({ qty: req.body.qty }, { where: { user_id:req.body.userId, 
                                prd_id: req.body.prd_id
                             
                            } });
                            var data = {};
                            data.status = 200;
                            data.msg = 'Product updated to cart';
                            data.data = {};
                            respHelper.msg(res, data);
                            break;
                    }

                } else {
                    var data = {};
                    data.status = 204;
                    data.msg = 'Product not exist';
                    data.data = {};
                    respHelper.msg(res, data);
                }
            } else {
                await modals.carts.destroy({ where: { user_id:req.body.userId, prd_id: req.body.prd_id } });
                var data = {};
                data.status = 200;
                data.msg = 'Product removed from your cart';
                data.data = {};
                respHelper.msg(res, data);

            }

        }

    } catch (ex) {
        var data = {};
        data.status = 500;
        respHelper.msg(res, data);

    }
};



exports.List = async function(req, res) {
    
    var gstPercentage = 0;
    var gstValue = 0;
    var subtotal = 0;
    var total = 0;
    let mrpPrice=0;
    var grandtotal = 0;
   // try {
        var offset = 0;
        var limit = 20;
        var user_order = await modals.carts.findAll({
            attributes: [
                'id', 'qty', 'prd_id'
            ],
            where: { user_id: req.body.userId },
            include: {
                model: modals.products,
                attributes: [[modals.sequelize.literal("concat('" + Constant.imageURL + "/products/',default_image)"), 'image'],
                    'id', 'name', 'price','spcl_price','delivery_days','no_of_pcs','weight',
                ],
                where: { 
                    status:1,
                    isdeleted:0
                 },
            },
            offset: offset,
            limit: limit,
        })
        const getProd = async(obj) => { 
        let individalTotal = (obj.qty * obj.product.spcl_price);
         mrpPrice += (obj.qty * obj.product.price);
        total += individalTotal;
        }
       
        const result = await mapAsync(getProd, user_order);

        var pincodeCharge = await modals.pincodes.findOne({attributes: ['price'],where: {'pincode':req.body.pincode}});
        var  serviceCharges = (pincodeCharge.price)?pincodeCharge.price:0;
      
        var  grandtotal = parseInt(total) + parseInt(serviceCharges);
        var data = {};
        data.status = 200;
        data.success = (result.length > 0) ? true : false;
        data.msg = (result.length > 0) ? "Cart list found" : "No products in your cart";
        data.data = {
            "products": user_order,

            "priceDetails": {
                "total": parseFloat(total.toFixed(2)),
                "shippingCharges": parseFloat(serviceCharges),
                "grandTotal": parseFloat(grandtotal.toFixed(2)),
                "save": parseFloat(mrpPrice - total),
            }
        };
        respHelper.msg(res, data);
    // } catch (ex) {
    //     var data = {};
    //     data.status = 500;
    //     respHelper.msg(res, data);

    // }
};
exports.checkoutReview = async function(req, res) {
    
    var gstPercentage = 0;
    var gstValue = 0;
    var subtotal = 0;
    var total = 0;
    let mrpPrice=0;
    var grandtotal = 0; let redate;
    var  slots,sldateotslist,currentime;
        var slotslist=[];
   // try {
        var offset = 0;
        var limit = 20;
        var address = await modals.customer_shipping_address.findOne({  
            where: {
                id:req.body.address_id,
                customer_id:req.body.userId,
            }
        });
        var userDetail = await modals.customers.findOne({  
            where: {
                id:req.body.userId,
            }
        });
        if(!address){
            var data = {};
            data.status = 204;
            data.msg = "Shipping address does not exits"
            respHelper.msg(res, data);
            return ;
        }


        var user_order = await modals.carts.findAll({
            attributes: [
                'id', 'qty', 'prd_id'
            ],
            where: { user_id: req.body.userId },
            include: {
                model: modals.products,
                attributes: [[modals.sequelize.literal("concat('" + Constant.imageURL + "/products/',default_image)"), 'image'],
                    'id', 'name', 'price','spcl_price','delivery_days','no_of_pcs','weight',
                ],
                where: { 
                    status:1,
                    isdeleted:0
                 },
            },
           
        })
        const getProd = async(obj) => { 
        let individalTotal = (obj.qty * obj.product.spcl_price);
         mrpPrice += (obj.qty * obj.product.price);
         total += individalTotal;
         if (obj.product.delivery_days.indexOf("Today in")==0) {
            var mday = 0;
            var limit = 7;
         }else if(obj.product.delivery_days.indexOf("Today")==0){
            var mday = 0;
            var limit = 7;
         }
         else{
            var mday = 1;
            var limit = 8;
         }
        
         var slotslist=[];
         for (let i = mday; i < limit; i++) 
         {
         
            var date = new Date();
            date.setDate(date.getDate() + i);
            var todayDate=dateFormat(date,  "yyyy-mm-dd");
            redate= dateFormat(todayDate,  "yyyy-mm-dd'T'hh:mm:ss");
            redate = moment(redate).format('ddd');

            sldateotslist = {
                "day": redate,
                "date":dateFormat(todayDate,  "dd-mm-yyyy") ,
            };
            slotslist.push(sldateotslist);
         }

       

        var data = {
            "id": obj.product.id,
            "name": obj.product.name,
            "price":  obj.product.spcl_price,
            "spcl_price": obj.product.price,
            "image":obj.product.image,
            "qty": obj.qty,
            "delivery_days": obj.product.delivery_days,
            "no_of_pcs": obj.product.no_of_pcs,
            "weight": obj.product.weight,
            "subTotal": individalTotal,
            "slotslist":slotslist
        };
        return data;
        }
       
        const result = await mapAsync(getProd, user_order);

        var pincodeCharge = await modals.pincodes.findOne({attributes: ['price'],where: {'pincode':address.shipping_pincode}});
        var  serviceCharges = (pincodeCharge.price)?pincodeCharge.price:0;
      
       var  grandtotal = parseInt(total) + parseInt(serviceCharges);

      
    var freeproduct = await modals.product_categories.findAll({
        where: {
            cat_id: {
                [Sequelize.Op.in]:[317],
              },
        },
        include:{
            model:modals.products,
            attributes: [[modals.sequelize.literal("concat('" + Constant.imageURL + "/products/',default_image)"), 'image'],
            'id', 'name', 'price','spcl_price','delivery_days','no_of_pcs','weight','cart_amount_for_free'
           ],
           where: { 
            status:1,
            isdeleted:0
         },
            order: [
                [modals.products, 'id','desc']
               ],
           },
       
        // offset: offset,
        // limit: 3
       });
      
       const getProd1 = async(obj1) => { 
if(obj1.product.cart_amount_for_free < total){
    var SelectedFreeProduct = await modals.freeProduct.findOne({  
        where: {
            user_id:req.body.userId,  
            prd_id:obj1.product.id,  
        }
    });
        var data = {
            "id": obj1.product.id,
            "name": obj1.product.name,
            "image":obj1.product.image,
            "selected":(SelectedFreeProduct)?true:false,
        };
    }
        return data;
       }
   
       const resultfreeproduct = await mapAsync(getProd1, freeproduct);

        var data = {};
        data.status = 200;
        data.success = (result.length > 0) ? true : false;
        data.msg = (result.length > 0) ? "Cart list found" : "No products in your cart";
        data.data = {
            "shippingAddress": address,
            "products": result,
            "freeProducts": resultfreeproduct,
            "priceDetails": {
                "total": parseFloat(total.toFixed(2)),
                "shippingCharges": parseFloat(serviceCharges),
                "grandTotal": parseFloat(grandtotal.toFixed(2)),
                "save": parseFloat(mrpPrice - total),
                "yourDockcoin": parseFloat(userDetail.total_reward_points.toFixed(2)),
                "DockcoinPlusPlus": parseFloat(userDetail.user_wallet.toFixed(2)),
            }
        };
        respHelper.msg(res, data);
    // } catch (ex) {
    //     var data = {};
    //     data.status = 500;
    //     respHelper.msg(res, data);

    // }
};
function parseTime(s) {   
    var c = s.split(':');
    return parseInt(c[0]) * 60 + parseInt(c[1]);
}

exports.slots=async function(req,res){
    //try{
        var  slots,sldateotslist,currentime;let newdisbaled='';let newdisbaledttmm='';
        var slotslist=[];let matches;
        var selectedSlotval=[]; var slotsdis=[]; var slotsdistwo=[];
    var product = await modals.products.findOne({attributes: ['delivery_days'],where: {'id':req.body.prd_id}});
    var slots = await modals.timeslot.findAll({where: {date:req.body.day}});
    
    var myDate = dateFormat(Date.now(),  "dd-mm-yyyy");
    var myDate1= req.body.date;
    myDate = myDate.split("-");
    var newDate = new Date( myDate[2], myDate[1] - 1, myDate[0]);
    myDate1 = myDate1.split("-");
    var newDate1 = new Date(myDate1[2], myDate1[1] - 1, myDate1[0]);
    var date= newDate.getTime();
    var contractDateEnd = newDate1.getTime();
    if(contractDateEnd < date){
        var data = {};
        data.msg = 'Invalid Date';
        data.status = 204;
        data.length = '';
        respHelper.msg(res, data);
    }
    var cartValue = await modals.carts.findOne({where: {user_id:req.body.userId,prd_id:req.body.prd_id}});

    if(cartValue){
        matches = (0 == cartValue.slot_id)?true:false;
   }

var currentTime = moment().tz('Asia/Kolkata').add(0, 'hours').format('hh:mm A');

var currentTime = moment(currentTime, 'hh:mm A').format('HH:mm');

var currentTime = parseTime(currentTime);


    if (product.delivery_days.indexOf("Today in")==0) {
        var date = new Date();
        date.setDate(date.getDate() + 0);
        
        sldateotslist = {
            "slot_id": 0,
            "slot": product.delivery_days,
            "price": 0,
            "day": req.body.day,
            "date": date,
            "selected":(matches)?true:false,
            "disabled":false,
        };
        slotslist.push(sldateotslist);
     }else if(product.delivery_days.indexOf("Today")==0){

        var date = new Date();
        date.setDate(date.getDate() + 0);

        var pintToday=product.delivery_days.replace("Tomorrow Today",""); 
        var  pintToday = pintToday.split("-");
        
        var startT = moment(pintToday[0], 'hh:mm A').format('HH:mm');
        var startT = parseTime(startT);
        var end_timeT = moment(pintToday[1], 'hh:mm A').format('HH:mm');
        var end_timeT = parseTime(end_timeT);

        sldateotslist = {
            "slot_id": 0,
            "slot": product.delivery_days,
            "price": 0,
            "day": req.body.day,
            "date": req.body.date,
            "selected":(matches)?true:false,
            "disabled":(currentTime >= startT && currentTime >= end_timeT)?true:false,
        };
        slotslist.push(sldateotslist);
     }
     else{
        var date = new Date();
        date.setDate(date.getDate() + 1);

        var pintToday=product.delivery_days.replace("Tomorrow Today",""); 
        var  pintToday = pintToday.split("-");
        
        var startT = moment(pintToday[0], 'hh:mm A').format('HH:mm');
        var startT = parseTime(startT);
        var end_timeT = moment(pintToday[1], 'hh:mm A').format('HH:mm');
        var end_timeT = parseTime(end_timeT);
        

        sldateotslist = {
            "slot_id": 0,
            "slot": product.delivery_days,
            "price": 0,
            "day": req.body.day,
            "date": req.body.date,
            "selected":(matches)?true:false,
            "disabled":(currentTime >= startT && currentTime >= end_timeT)?true:false,
        };
        slotslist.push(sldateotslist);
     }
     for (const row of slots) {  
if(cartValue){
     matches = (row.id == cartValue.slot_id)?true:false;
}
var  slots = row.name.split("-");

var start_time = moment(slots[0], 'hh:mm A').format('HH:mm');

var start_time = parseTime(start_time);

var end_time = moment(slots[1], 'hh:mm A').format('HH:mm');

var end_time = parseTime(end_time);

if(currentTime >= start_time && currentTime >= end_time){  
    slotsdis.push(row.id);
  }
  if(contractDateEnd == date){
   
  }
  else{
    
    var pintToday=product.delivery_days.replace("Tomorrow Today",""); 
    var  pintToday = pintToday.split("-");
    
    var startT = moment(pintToday[0], 'hh:mm A').format('HH:mm');
    var startT = parseTime(startT);
    var end_timeT = moment(pintToday[1], 'hh:mm A').format('HH:mm');
    var end_timeT = parseTime(end_timeT);
    
  //  console.log("start_time",startT);console.log("startT",startT);
  ///  console.log("end_time",end_time);console.log("end_timeT",end_timeT);
  
      if(start_time <= startT && end_time <= end_timeT){  
        slotsdis.push(row.id);
       }
       
  }
  
        sldateotslist = {
            "slot_id": row.id,
            "slot": row.name,
            "price": (row.price)?row.price:0,
            "day": req.body.day,
            "date": req.body.date,
            "selected":(matches)?true:false,
            "disabled":slotsdis.includes(row.id)?true:false,
        };
        slotslist.push(sldateotslist);
    }

    var data = {};
    data.status = 200;
    data.success = (slotslist.length > 0) ? true : false;
    data.msg = (slotslist.length > 0) ? "Data Loaded" : "No Slots Available";
    data.data =slotslist;
    respHelper.msg(res, data);
      // } catch (ex) {
    //     var data = {};
    //     data.status = 500;
    //     respHelper.msg(res, data);

    // }
}
exports.selectSlots=async function(req,res){
   try{
    var myDate = dateFormat(Date.now(),  "dd-mm-yyyy");
    var myDate1= req.body.delivery_date;
    myDate = myDate.split("-");
    var newDate = new Date( myDate[2], myDate[1] - 1, myDate[0]);
    myDate1 = myDate1.split("-");
    var newDate1 = new Date(myDate1[2], myDate1[1] - 1, myDate1[0]);
    var date= newDate.getTime();
    var contractDateEnd = newDate1.getTime();
    if(contractDateEnd < date){
        var data = {};
        data.msg = 'Invalid Date';
        data.status = 204;
        data.length = '';
        respHelper.msg(res, data);
    }

    await modals.carts.update(req.body, { where: { user_id:req.body.userId, 
        prd_id: req.body.prd_id
     
    } });
    var data = {};
    data.status = 200;
    data.msg = 'Slot Selected';
    data.data = {};
    respHelper.msg(res, data);
   
} catch (ex) {
    var data = {};
    data.status = 500;
    respHelper.msg(res, data);

}
}
exports.selectFreeproduct=async function(req,res){
    try{
    await modals.freeProduct.destroy({ where: { user_id:req.body.userId} });
    var order = await modals.freeProduct.create({user_id:req.body.userId,prd_id:req.body.prd_id});

    var data = {};
    data.status = 200;
    data.msg = 'Free Product Added Successfully';
    data.data=order;
    respHelper.msg(res, data);
    return ;
      } catch (ex) {
        var data = {};
        data.status = 500;
        respHelper.msg(res, data);

    }
}
exports.checkout = async function(req, res) {

    var cust_id = 0;
    var serviceCharges = req.body.serviceCharges;
    var gstPercentage = 0;
    var gstValue = 0;
    var subtotal = 0;
    var total = 0;
    var grandtotal = 0;
    var orderId =0;
    var discount = (req.body.couponCode=='NA')?'0':req.body.discount;

    //console.log(req.body);
  //try {

        
        var address = await modals.customer_shipping_address.findOne({  
            where: {
                id:req.body.shipping_id,
                customer_id:req.body.userCokkie,
            },
            offset: offset,
            limit: limit,
        });

        if(!address){
            var data = {};
            data.status = 204;
            data.msg = "Shipping address does not exits"
            respHelper.msg(res, data);
            return ;
        }

        

        var offset = 0;
        var limit = 20;
        var allProducts = await modals.carts.findAll({
            attributes: [
                'id', 'qty', 'prd_id','size_id','color_id','attribute_id','shipping_details'
            ],
            where: { user_id: req.body.userCokkie },
            include: {
                model: modals.products,
                attributes: [
                    'id', 'name','price','qty','spcl_price','status','isdeleted','product_base_type'
                ],
                where: { 
                    status:1,
                    isdeleted:0
                 },
            },
            offset: offset,
            limit: limit,
        })


            if(allProducts.length==0){
            var data = {};
            data.status = 204;
            data.msg = "You have no products in your cart"
            respHelper.msg(res, data);
            return ;
            }

        const invalidProducts = allProducts.filter(obj => obj.product.qty<obj.qty);
            if(invalidProducts.length > 0 ){
                    var data = {};
                    data.status = 204;
                    data.msg = "Some products are out of stock"
                    respHelper.msg(res, data);
                    return ;
            }
            let individalTotal='';
        //var result = [];
        const getProd = async(obj) => { 
           // result = allProducts.map(function(obj) {
                var attr = await modals.product_attributes.findOne({  
                    where: {
                        id:obj.attribute_id,
                    },
                });
if(obj.product.product_base_type!=1){
     individalTotal = (obj.qty * obj.product.spcl_price);
}else{
    individalTotal = (obj.product.spcl_price);
}
               


                if(attr){
                    individalTotal +=attr.price;
                }

                total += individalTotal;
                var data = {
                    "product_id": obj.product.id,
                    "product_name": obj.product.name,
                    "price": obj.product.price,
                    "spcl_price": obj.product.spcl_price,
                    "qty": obj.qty,
                    "size_id": obj.size_id,
                    "color_id": obj.color_id,
                };
                return data;
            }
            //);

         //const result = await mapAsync(allProducts);
         const result = await mapAsync(getProd, allProducts)

        subtotal = parseFloat(total + serviceCharges);
        grandtotal = subtotal-discount;

       

     //   var services = [];
        var totalService = result.length;
        var perDis = (discount / totalService);
        var perSerChar = (serviceCharges / totalService);

            var order = await modals.orders.create({
                customer_id: req.body.userCokkie,
                order_no: 'MLG_ORD_11',
                shipping_id: req.body.shipping_id,
                payment_mode: req.body.paymentMode,
               
                grand_total:grandtotal,
                coupon_code:(req.body.couponCode=='NA')?'0':req.body.couponCode,
                coupon_percent:0,
                coupon_amount:discount,
                discount_amount: discount,
                total_shipping_charges: serviceCharges,
                cod_charges: 0,
                order_status:0,
                txn_id:  req.body.txn_id,
                txn_status:  req.body.txn_sts,
                //subTotal:subtotal
            });

            await modals.orders_shipping.create({
                        order_id: order.id,
                        order_shipping_name: address.shipping_name,
                        order_shipping_address: address.shipping_address,
                        order_shipping_address1: address.shipping_address1,
                        order_shipping_address2: address.shipping_address2,
                        order_shipping_city:address.shipping_city,
                        order_shipping_state: address.shipping_state,
                        order_shipping_country: address.shipping_country,
                        order_shipping_zip:address.shipping_pincode,
                        order_shipping_phone: address.shipping_mobile,
                        order_shipping_email:address.shipping_email,
                });
              
          

                const services = async(obj) => { 
           // services = result.map(function(obj) {
                var color=obj.color_id;
                var size=obj.size_id;
          
            let sizename='NA';let colorname='NA';

            if(color!=0){       
          
              var colorname1=await modals.sequelize.query(
                `SELECT 
                       colors.name,
                       colors.color_code
                        FROM colors
                        WHERE 
                        colors.id=${color} `,
                {
                  type: QueryTypes.SELECT
                }
              );
            colorname=colorname1[0].name;
            
          }
          
            if(size!=0){
             var sizename1=await modals.sequelize.query(
                `SELECT 
                            sizes.name
                       FROM sizes
                    WHERE 
                    sizes.id=${size}
                    `,
                {
                  type: QueryTypes.SELECT
                }
              );
              sizename =sizename1[0].name;
            
          }
          let price=0;

          if(color!=0 && size==0){       
          var usedetai = await modals.product_attributes.findOne({
              attributes: ['price'],
              where: { product_id: obj.product_id, color_id: color }
          })
           price +=usedetai.price;
          
        }
        
          if(color==0 && size!=0){
          var usedetai = await modals.product_attributes.findOne({
              attributes: ['price'],
              where: { product_id: obj.product_id, size_id: size }

          })
           price +=usedetai.price;
          
        }
        if(color!=0 && size!=0){
          var usedetai = await modals.product_attributes.findOne({
              attributes: ['price'],
              where: { product_id: obj.product_id, size_id: size,color_id: color }
          })
       
          //console.log("dv",usedetai);
           price +=usedetai.price;
          
        }
                var data = {
                    "order_id": order.id,
                    "suborder_no": 'MLG_ORD_11',
                    "product_id": obj.product_id,
                    "product_name": obj.product_name,
                    "product_qty": obj.qty,
                    "product_price": obj.spcl_price + price,
                    "product_price_old": obj.price + price,
                    "qty": obj.qty,
                    "order_coupon_amount": perDis,
                    "order_shipping_charges": perSerChar,
                    "order_cod_charges": 0,
                    "size_id":obj.size_id,
                    "color_id":obj.color_id,
                    "size":sizename,
                    "color":colorname,
                    "shipping_details" :obj.shipping_details,
                };

               
                return data;
            };//);
            ///await modals.orderDetails.create(data);
            const result1 = await mapAsync(services, result);
           await modals.orderDetails.bulkCreate(result1);
           await modals.carts.destroy({ where: { user_id: req.body.userCokkie } });
           var user_exits = await modals.customers.findOne({
            attributes: ['name','email','phone'],
            where: { id: req.body.userCokkie }
        });

        var order = await modals.orders.findOne({
            attributes: ['order_status','id','total_shipping_charges','coupon_amount','coupon_percent','coupon_code','subTotal','grand_total','payment_mode'],
            where: { id: order.id }
        })

            //var msg='Hi '+address.shipping_name.replace(/\b\w/g, l => l.toUpperCase())+' order '+order.id+' has been confirmed and will be delivered. Regards, Team Partyyar ';
            var msg='Thanks for shopping with partyyar.com. Your order number '+order.id+' is confirmed. You will receive your order.';
              
            // var user_orderde = await modals.orderDetails.findAll({
            //     attributes: [
            //         'id', 
            //         'order_id',
            //         'suborder_no',
            //         'product_id',
            //         'product_name','size','color',
            //         'product_qty',
            //         'product_price',
            //         'product_price_old',
            //         'order_shipping_charges',
            //         'order_cod_charges',
            //         'order_coupon_amount',
            //         'order_wallet_amount',
            //         'order_date',
            //         'order_status'
            //     ],
            //     where: {
            //         order_id:order.id
            //    },
            //     include: {
            //         model: modals.products,
            //         attributes: [
            //             [modals.sequelize.literal("concat('" + constant.imageURL + "/products/',default_image)"), 'image'],
            //             'url'
            //         ],
            //     },
               
            // });
            var user_orderde = await modals.orderDetails.findAndCountAll({
                attributes: [
                    'id', 
                    'order_id',
                    'suborder_no',
                    'product_id',
                    'product_name','size','color',
                    'product_qty',
                    'product_price',
                    'product_price_old',
                    'order_shipping_charges',
                    'order_cod_charges',
                    'order_coupon_amount',
                    'order_wallet_amount',
                    'order_date',
                    'order_status'
                ], where: {
                    order_id:order.id
               },
                include: {
                    model: modals.products,
                    attributes: [
                        'default_image','url'
                    ],
                },
               
            });
            var resultOde = [];
            resultOde = user_orderde.rows.map(function(obj) {
                let r = {
                    "main_order_id": obj.order_id,
                    "sub_order_id": obj.id,
                    "suborder_no": obj.suborder_no,
                    "product_id": obj.product_id,
                    "product_name": obj.product_name,
                    "url": obj.product.url,
                    "qty": obj.product_qty,
                    "product_price": obj.product_price,
                    "product_price_old": obj.product_price_old,
                    "order_shipping_charges": obj.order_shipping_charges,
                    "order_cod_charges": obj.order_cod_charges,
                    "order_coupon_amount": obj.order_coupon_amount,
                    "order_wallet_amount": obj.order_wallet_amount,
                    "order_date": obj.order_date,
                    "order_delivery_date": obj.order_date,
                    "order_status": obj.order_status,  "size": obj.size,  "color": obj.color,
                    "image": constant.imageURL+"/products/"+obj.product.default_image,
                  
                };
                return r;
            });
            
            var address = await modals.orders_shipping.findOne({
                attributes: ['order_id',
                'order_shipping_name',
                'order_shipping_address',
                'order_shipping_address1',
                'order_shipping_address2',
                'order_shipping_city',
                'order_shipping_state',
                'order_shipping_country',
                'order_shipping_zip',
                'order_shipping_phone'
                ],
                where: {
                    order_id:order.id
               }
        });
      
            var mailOptions = {
                temptype: 2,
                address:address,
                name: user_exits.name.replace(/\b\w/g, l => l.toUpperCase()),
                to: user_exits.email,
                subject: 'Order Confirmation',
                order:order,
                orderdetail:resultOde,
                html: msg
            };
            var smsOptions = {
                to: user_exits.phone,
                tempid: 1201162385054498799,
                html: msg
            };


            commonHelper.sendOtpSMS(smsOptions);
            commonHelper.sendMail(mailOptions); 



            var data = {};
            data.status = 200;
            data.msg = 'Order placed successfully';
            data.data=order;
            respHelper.msg(res, data);
            return ;
        

    // } catch (ex) {
    //     var data = {};
    //     data.status = 500;
    //     respHelper.msg(res, data);

    // }
};