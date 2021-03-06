var router = require('express').Router();
const locations = require('../controller/location');
const { middlewareAuthUser, middlewareAuthAdmin } = require('../middleware/auth')
let multer = require('multer');
let upload = multer(); //setting the default folder for multer

// example call api: http://localhost:5000/location/getAll?per_page=10&page=2&tour=false
router.get('/getAll', locations.getAllLocation);

//example call api: http://localhost:5000/book_tour/getAllWithoutPagination?status=inactive
router.get('/getAllWithoutPagination', locations.getAllWithoutPagination); //middlewareAuthAdmin

router.post('/create', upload.single('image'), locations.create); //middlewareAuthAdmin

router.post('/update', upload.single('image'), locations.update); //middlewareAuthAdmin

router.get('/getById/:id', locations.getById);

// example call api: http://localhost:5000/location/getByTypeNearMe?&tour=false
router.post('/getNearMe', locations.getLocationNearMe) //req.body.lat .lng .distance

router.get('/getByType/:typeId', locations.getLocationByType)

// example call api: http://localhost:5000/location/getByTypeNearMe?&tour=false
router.post('/getByTypeNearMe', locations.getByTypeNearMe) //req.body.lat .lng .distance .type

router.post('/updateWithoutFeaturedImg', locations.updateWithoutFeaturedImg) //middlewareAuthAdmin

module.exports = router