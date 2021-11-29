const { custom } = require('joi');
const { Sequelize, QueryTypes } = require('sequelize');
var dbConnection = require('../models/dbconnection');
var sequelize = dbConnection.sequelize;
var popularOffer = sequelize.define('tbl_whatsmore',{
    name:Sequelize.STRING,
    banner_image:Sequelize.STRING,
    status:Sequelize.INTEGER
});
var product_extra_description = sequelize.define('product_extra_description',{
    product_id:Sequelize.INTEGER,
    product_descrip_title:Sequelize.STRING,
    product_descrip_content:Sequelize.STRING,
});
var home_sliders = sequelize.define('product_home_slider',{
    product_id:Sequelize.INTEGER,
    slider_type:Sequelize.INTEGER,
});
var slotShipping = sequelize.define('tbl_slotShipping',{
    shipping_name:Sequelize.STRING,
    price:Sequelize.STRING,
   // date:Sequelize.STRING,
    status:Sequelize.INTEGER
});
var delivery_method = sequelize.define('tbl_delivery_method',{
    shipping_id:Sequelize.INTEGER,
    date:Sequelize.STRING,
   // date:Sequelize.STRING,
    status:Sequelize.INTEGER
});
var timeslot = sequelize.define('tbl_timeslot',{
    name:Sequelize.STRING,
    price:Sequelize.STRING,
    date:Sequelize.STRING,
    status:Sequelize.INTEGER
});
var pages = sequelize.define('pages',{
    title:Sequelize.STRING,
    url_name:Sequelize.STRING,
    banner:Sequelize.STRING,
    description:Sequelize.STRING,
    description1:Sequelize.STRING,
    description2:Sequelize.STRING,
    description2:Sequelize.STRING
});
var faqs = sequelize.define('tbl_faq',{
    fld_faq_question:Sequelize.STRING,
    fld_faq_answer:Sequelize.STRING,
    fld_faq_status:Sequelize.INTEGER
    //id:Sequelize.INTEGER
});
var Specifications = sequelize.define('product_extra_general',{
    product_general_descrip_title:Sequelize.STRING,
    product_general_descrip_content:Sequelize.STRING,
    product_id:Sequelize.INTEGER
    //id:Sequelize.INTEGER
});
var teams = sequelize.define('tbl_teams',{
    name:Sequelize.STRING,
    position:Sequelize.STRING,
    image:Sequelize.STRING,
    description:Sequelize.STRING
});
var users = sequelize.define('users', {
    name: Sequelize.STRING,
    password: Sequelize.STRING,
    user_type: Sequelize.INTEGER,
    email: Sequelize.STRING,
    email_otp: Sequelize.STRING,
    latitude: Sequelize.FLOAT(),
    longitude: Sequelize.FLOAT(),
    device_type: Sequelize.INTEGER,
    device_token: Sequelize.STRING,
    role_id: Sequelize.ENUM(1, 2, 3, 4),
    // profile: {
    //     type: Sequelize.STRING,  
    //     defaultValue: "noimage.png"
    // },
    otp:Sequelize.INTEGER,
    mobileNumber: Sequelize.STRING,
    phone_verified: Sequelize.INTEGER,
    gender: Sequelize.INTEGER,
    registerd_by: Sequelize.INTEGER,
    state: Sequelize.STRING,
    city: Sequelize.STRING,
    formated_address: Sequelize.STRING,
    is_deleted: Sequelize.ENUM('0', '1'),  
    is_blocked:Sequelize.ENUM('0', '1'),
    temp_mobileNumber:Sequelize.INTEGER,
    dateOfBirth: Date
});

var customers = sequelize.define('customers', {
        name: Sequelize.STRING,address: Sequelize.STRING,
        last_name: Sequelize.STRING,
        email: Sequelize.STRING,
        password: Sequelize.STRING,
        phone: Sequelize.STRING,
       
        gender: Sequelize.STRING,
        otp: Sequelize.INTEGER,
        profile_pic: Sequelize.STRING,
        dob: Sequelize.STRING,
        fcm_token:Sequelize.STRING,
        user_wallet: Sequelize.INTEGER,
        total_reward_points:Sequelize.INTEGER
});

var vendors = sequelize.define('vendors', {
    username: Sequelize.STRING,
    email: Sequelize.STRING,
    isdeleted: Sequelize.INTEGER,
    status: Sequelize.INTEGER
});

var vendor_company_info = sequelize.define('vendor_company_info', {
    vendor_id: Sequelize.INTEGER,
    city: Sequelize.STRING,
    state: Sequelize.STRING,
    pincode: Sequelize.STRING
});

var subscription = sequelize.define('subscription', {
    email: Sequelize.STRING
});
var haveQuery = sequelize.define('tbl_customer_query', {
    user_id: Sequelize.INTEGER,
    customer_query: Sequelize.STRING
});
var advertisment = sequelize.define('tbl_advertise',{
    image:Sequelize.STRING,
    short_text:Sequelize.STRING,
    description:Sequelize.STRING,
    url:Sequelize.STRING,
    advertise_position:Sequelize.INTEGER,
    status:Sequelize.STRING
});
var homeProductsection =sequelize.define('tbl_home_section',{
    name:Sequelize.STRING
});
var categories = sequelize.define('categories',{
    parent_id:Sequelize.INTEGER,
    name:Sequelize.STRING,
    cat_url:Sequelize.STRING,
    cat_compare:Sequelize.INTEGER,
    logo:Sequelize.STRING,
    app_icon:Sequelize.STRING,
    banner_image:Sequelize.STRING,
    size_chart:Sequelize.STRING,
    tax_rate:Sequelize.STRING,
    commission_rate:Sequelize.STRING,
    description:Sequelize.STRING,
    return_description:Sequelize.STRING,
    cancel_description:Sequelize.STRING,
    featured:Sequelize.INTEGER,
    status:Sequelize.INTEGER,
    isdeleted:Sequelize.INTEGER,
    mobile_app_order:Sequelize.INTEGER,
    web_order:Sequelize.INTEGER,
    cat_shows_in_nav:Sequelize.INTEGER,
    cat_shows_in_mobile:Sequelize.INTEGER,
    cat_shows_in_mobile_cat:Sequelize.INTEGER,
    cat_shows_in_mobile_side_nav:Sequelize.INTEGER,
    isdeleted:Sequelize.INTEGER
})
var products = sequelize.define('products', {
   
    name: Sequelize.STRING,
    feature_type:Sequelize.INTEGER,
    url:Sequelize.STRING,
    price: Sequelize.INTEGER,
    spcl_price: Sequelize.INTEGER,
    status: Sequelize.INTEGER,
    isdeleted: Sequelize.INTEGER,
    qty:Sequelize.INTEGER,
    review:Sequelize.INTEGER,
    no_of_pcs:Sequelize.STRING,
    weight:Sequelize.STRING,
    product_type:Sequelize.INTEGER,
   
    meta_title:Sequelize.STRING,
    meta_keyword:Sequelize.STRING,
    meta_description:Sequelize.STRING,
    short_description: Sequelize.STRING,
    long_description: Sequelize.STRING,
    delivery_days:Sequelize.STRING,
    cart_amount_for_free:Sequelize.INTEGER,
    default_image: {
        type: Sequelize.STRING,
        defaultValue: "noimage.png"
    },
});

var colors = sequelize.define('colors', {
    name: Sequelize.STRING,
    status: Sequelize.INTEGER,
    isdeleted: Sequelize.INTEGER
});
var sizes = sequelize.define('sizes', {
    name: Sequelize.STRING,
    status: Sequelize.INTEGER,
    isdeleted: Sequelize.INTEGER
});

var product_attributes = sequelize.define('product_attributes', {
    product_id: Sequelize.INTEGER,
    size_id: Sequelize.INTEGER,
    color_id: Sequelize.INTEGER,
    qty: Sequelize.INTEGER,
    price: Sequelize.INTEGER
});

var product_configuration_images = sequelize.define('product_configuration_images', {
    product_id: Sequelize.STRING,
    product_config_image: Sequelize.STRING
});

var products_relation = sequelize.define('products_relation', {
    relative_product_id: Sequelize.INTEGER,
    product_id:Sequelize.INTEGER,
    relation_type:Sequelize.INTEGER,
    price:Sequelize.INTEGER
});
var orderDetails = sequelize.define('order_details', {
    order_id: Sequelize.INTEGER,
    suborder_no: Sequelize.STRING,
    product_id: Sequelize.INTEGER,
    product_name: Sequelize.STRING,
    product_qty: Sequelize.INTEGER,
    product_price: Sequelize.INTEGER,
    product_price_old: Sequelize.INTEGER,
    order_shipping_charges: Sequelize.INTEGER,
    order_cod_charges: Sequelize.INTEGER,
    order_coupon_amount: Sequelize.INTEGER,
    order_status: Sequelize.INTEGER,
    order_wallet_amount: Sequelize.INTEGER,
    order_date: Sequelize.STRING,
    size_id: Sequelize.INTEGER,
    color_id: Sequelize.INTEGER,
    size:Sequelize.STRING,
    color:Sequelize.STRING,
    shipping_details:Sequelize.STRING
});

var wishlist = sequelize.define('tbl_wishlist', {
    fld_user_id: Sequelize.INTEGER,
    fld_product_id: Sequelize.INTEGER
});

var sliders = sequelize.define('sliders', {
    image: Sequelize.INTEGER,
    short_text: Sequelize.INTEGER,
    url: Sequelize.INTEGER,
    status: Sequelize.INTEGER
});
var Rating = sequelize.define('product_rating', {
    user_name: Sequelize.STRING,
    rating: Sequelize.INTEGER,
    review_date: Sequelize.STRING,
    isActive: Sequelize.INTEGER,
    product_id:Sequelize.INTEGER,
    user_id:Sequelize.INTEGER,
    review:Sequelize.STRING
});
var orders = sequelize.define('orders', {
        order_no: Sequelize.STRING,
        txn_id: Sequelize.STRING,
        txn_status: Sequelize.STRING,
        customer_id: Sequelize.INTEGER,
        shipping_id: Sequelize.INTEGER,
        payment_mode: Sequelize.INTEGER,
        grand_total: Sequelize.INTEGER,
        coupon_code: Sequelize.INTEGER,
        coupon_percent: Sequelize.INTEGER,
        coupon_amount: Sequelize.INTEGER,
        total_shipping_charges: Sequelize.INTEGER,
        cod_charges: Sequelize.INTEGER,
        order_status: Sequelize.INTEGER,
        //subTotal:Sequelize.FLOAT()
});


var orders_shipping = sequelize.define('orders_shipping', {
        order_id: Sequelize.INTEGER,
        order_shipping_name: Sequelize.STRING,
        order_shipping_address: Sequelize.STRING,
        order_shipping_address1: Sequelize.STRING,
        order_shipping_address2: Sequelize.STRING,
        order_shipping_city: Sequelize.STRING,
        order_shipping_state: Sequelize.STRING,
        order_shipping_country: Sequelize.STRING,
        order_shipping_zip: Sequelize.STRING,
        order_shipping_phone: Sequelize.STRING,
        order_shipping_email: Sequelize.STRING,
        remarks: Sequelize.STRING
});

var order_cancel_reason = sequelize.define('order_cancel_reason',{
    reason: Sequelize.STRING,
    reason_type:Sequelize.INTEGER,
    status:Sequelize.INTEGER,
    isdeleted:Sequelize.INTEGER
})

var cancel_return_refund_order = sequelize.define('cancel_return_refund_order',{
    sub_order_id:Sequelize.INTEGER,
    reason:Sequelize.INTEGER,
    type:Sequelize.INTEGER,
    return_type:Sequelize.INTEGER,
    comments:Sequelize.STRING
})

var customer_shipping_address = sequelize.define('customer_shipping_address', {
    customer_id: Sequelize.INTEGER,
    shipping_name: Sequelize.STRING,
    shipping_mobile: Sequelize.STRING,
    shipping_email: Sequelize.STRING,
    shipping_address: Sequelize.STRING,
    shipping_address1: Sequelize.STRING,
    shipping_address2: Sequelize.STRING,
    shipping_city: Sequelize.STRING,
    shipping_state: Sequelize.STRING,
    shipping_pincode: Sequelize.STRING,
    shipping_country: Sequelize.STRING,
    shipping_address_type: Sequelize.INTEGER,
    shipping_address_default: Sequelize.INTEGER
});
var freeProduct = sequelize.define('tbl_free_product', {
    prd_id: Sequelize.INTEGER,
    user_id: Sequelize.INTEGER,
                      
});

var carts = sequelize.define('cart', {
    prd_id: Sequelize.INTEGER,
    user_id: Sequelize.INTEGER,
    qty: Sequelize.INTEGER, 
    delivery_date: Sequelize.STRING,
    time_value: Sequelize.STRING,  
    slot_id: Sequelize.INTEGER,   // TODO                    
});

var product_categories = sequelize.define('product_categories',{
    product_id: Sequelize.INTEGER,
    cat_id:Sequelize.INTEGER,
})

var cities = sequelize.define('cities', {
        name: Sequelize.STRING,
        state_id: Sequelize.INTEGER,
        isdeleted:Sequelize.INTEGER,
        zip:Sequelize.STRING,
        status:Sequelize.INTEGER
});
var pincodes = sequelize.define('logistic_vendor_pincode', {
    pincode: Sequelize.STRING,
    isdeleted: Sequelize.INTEGER,
    status: Sequelize.INTEGER,
    price: Sequelize.STRING
});

var store_info = sequelize.define('store_info', {
    name: Sequelize.STRING,
    email: Sequelize.STRING,
    phone:Sequelize.STRING,
    phone_2:Sequelize.STRING,
    phone_3:Sequelize.STRING,
    address: Sequelize.STRING,
    branch: Sequelize.STRING,
    facebook_url:Sequelize.STRING,
    twiter_url:Sequelize.STRING,
    cart_total:Sequelize.INTEGER,
    shipping_charge:Sequelize.INTEGER,
    linkedin_url:Sequelize.STRING,
    snapchat_url:Sequelize.STRING,
    monday_friday_from:Sequelize.STRING,
    monday_friday_to:Sequelize.STRING,
    saturday_from:Sequelize.STRING,
    saturday_to:Sequelize.STRING,
    home_meta_title:Sequelize.STRING,
    home_meta_keyword:Sequelize.STRING,
    home_meta_title:Sequelize.STRING,
   
    contact_meta_title:Sequelize.STRING,
    contact_meta_keyword:Sequelize.STRING,
    contact_meta_title:Sequelize.STRING,
logo:Sequelize.STRING

});

var coupons = sequelize.define('coupons', {
    coupon_name: Sequelize.STRING,
    coupon_type: Sequelize.INTEGER,
    max_discount: Sequelize.INTEGER,
    below_cart_amt: Sequelize.INTEGER,
    above_cart_amt: Sequelize.INTEGER,
    started_date: Sequelize.DATE,
    end_date: Sequelize.DATE,
    discount_value: Sequelize.INTEGER,
    status: Sequelize.INTEGER,
    coupon_for: Sequelize.INTEGER,
    uses_per_user: Sequelize.INTEGER,
    total_uses: Sequelize.INTEGER
});

var coupon_details = sequelize.define('coupon_details', {
    coupon_code: Sequelize.STRING,
    coupon_id: Sequelize.INTEGER,
    coupon_used: Sequelize.INTEGER,
    started_date: Sequelize.DATE,
    end_date: Sequelize.DATE,
    status: Sequelize.INTEGER
});

var filters = sequelize.define('filters', {
    name: Sequelize.STRING,
    url: Sequelize.STRING,
    status: Sequelize.INTEGER,
    isdeleted: Sequelize.INTEGER
});

var filter_values = sequelize.define('filter_values', {
    filter_id: Sequelize.INTEGER,
    filter_value: Sequelize.STRING,
    filter_value_url: Sequelize.STRING
});

var product_city = sequelize.define('product_city', {
    product_id: Sequelize.INTEGER,
    city: Sequelize.STRING
});


products.hasOne(product_city)
product_city.belongsTo(products, { foreignKey: 'product_id' });

filters.hasMany(filter_values)
filter_values.belongsTo(filters, { foreignKey: 'filter_id'})


products.hasOne(products_relation)
products_relation.belongsTo(products, { foreignKey: 'relative_product_id' });


sizes.hasOne(product_attributes)
product_attributes.belongsTo(sizes, { foreignKey: 'size_id' });


colors.hasOne(product_attributes)
product_attributes.belongsTo(colors, { foreignKey: 'color_id' });


products.hasMany(product_attributes)
product_attributes.belongsTo(products, { foreignKey: 'product_id' });

carts.belongsTo(products, { foreignKey: 'prd_id' });

orders.hasMany(orderDetails)
orderDetails.belongsTo(orders, { foreignKey: 'order_id' });

orders.hasOne(orders_shipping)
orders_shipping.belongsTo(orders, { foreignKey: 'order_id' });

products.hasOne(orderDetails)
orderDetails.belongsTo(products, { foreignKey: 'product_id' });

products.hasMany(product_categories)
product_categories.belongsTo(products, { foreignKey: 'product_id'})


vendors.hasOne(vendor_company_info)
vendor_company_info.belongsTo(vendors, { foreignKey: 'vendor_id' });


vendors.hasOne(products)
products.belongsTo(vendors, { foreignKey: 'vendor_id' });

products.belongsTo(wishlist)
wishlist.belongsTo(products, { foreignKey: 'fld_product_id'})


coupons.hasMany(coupon_details)
coupon_details.belongsTo(coupons, { foreignKey: 'coupon_id'})

slotShipping.hasMany(delivery_method)
delivery_method.belongsTo(slotShipping, { foreignKey: 'shipping_id'})

module.exports = {
    freeProduct,home_sliders,popularOffer,product_extra_description,
    delivery_method,pincodes,timeslot,slotShipping,
    coupons,
    Specifications,
    Rating,
    product_city,
    vendor_company_info,
    vendors,
    filters,
    filter_values,
    coupon_details,
    advertisment,faqs,teams,
    homeProductsection,
    haveQuery,
    pages,
    subscription,
    store_info,
    users,
    customers,
    categories,
    products,
    products_relation,
    orderDetails,
    order_cancel_reason,
    orders,
    orders_shipping,
    cancel_return_refund_order,
    customer_shipping_address,
    product_configuration_images,
    sizes,
    colors,
    carts,
    cities,
    wishlist,
    sliders,
    product_attributes,
    product_categories,
    sequelize,
    QueryTypes
}