const router = require('express').Router();
var home = require('../controllers/homeController');
var List = require('../controllers/ListingController');
const UserValidation = require('../config/uservalidation');
var cartCheckout = require('../controllers/checkoutController');
/*************Home Page***************/
router.post('/search', home.searchProduct);
router.post('/home',home.homePage);
router.post('/subscribe', home.subscribe);
router.post('/pincode', home.pincode);
/***************Products*********************/
router.post('/listing',List.listing);
router.post('/details',List.Details);
/***************Carts*********************/
router.post('/cartList',UserValidation.userAuthorized,cartCheckout.List);
router.post('/cartActions',UserValidation.userAuthorized,cartCheckout.cartActions);

/***************addressCheckout*********************/
router.post('/address',UserValidation.userAuthorized,cartCheckout.address);
router.post('/addressAddUpdate',UserValidation.userAuthorized,cartCheckout.addressAddUpdate);
router.post('/applyCoupon',UserValidation.userAuthorized,cartCheckout.applyCoupon);
router.post('/checkoutReview',UserValidation.userAuthorized,cartCheckout.checkoutReview);
router.post('/slots',UserValidation.userAuthorized,cartCheckout.slots);
router.post('/selectSlots',UserValidation.userAuthorized,cartCheckout.selectSlots);
router.post('/selectFreeproduct',UserValidation.userAuthorized,cartCheckout.selectFreeproduct);
router.post('/checkout',UserValidation.userAuthorized,cartCheckout.checkout);
/****app******/

router.post('/pages', home.page_details);
router.post('/feedback', UserValidation.userAuthorized,home.feedback);
router.post('/contactus',home.contactus);
router.post('/faqs',home.faqs);
router.post('/cities',home.cities);

router.post('/rating_submit',UserValidation.userAuthorized,List.rating_submit);

router.post('/cancelBooking',UserValidation.userAuthorized,List.cancelBooking);

/*web Home Page*/

router.get('/pageslist', home.pageslist);
router.get('/settings', home.settings);

router.get('/webhomePageData', home.webhomePageData);
router.get('/team', home.ourTeam);
router.get('/advertisment', home.advertisment);
router.post('/blogs', home.blogs);



module.exports = router;