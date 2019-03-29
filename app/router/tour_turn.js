var router = require('express').Router();
const tour_turns = require('../controller/tour_turn');
const { middlewareAuthUser, middlewareAuthAdmin } = require('../middleware/auth')

router.get('/getByTour/:idTour', tour_turns.getByTour);

router.post('/create', tour_turns.create); //middlewareAuthAdmin

router.post('/createWithPricePassenger', tour_turns.createWithPricePassenger); //middlewareAuthAdmin

//example call api: http://localhost:5000/tour_turn/getById/2 
router.get('/getById/:id', tour_turns.getById)

//example call api: http://localhost:5000/getById_admin/getById/2 //middlewareAuthAdmin
router.get('/getById_admin/:id', tour_turns.getById_admin)

//example call api: http://localhost:5000/tour_turn/getAllWithoutPagination
router.get('/getAllWithoutPagination', tour_turns.getAllWithoutPagination); //middlewareAuthAdmin

//example call api: http://localhost:5000/tour_turn/getAll?page=1&per_page=4&isUniqueTour=true
router.get('/getAll', tour_turns.getAll);

router.post('/update', tour_turns.update); //middlewareAuthAdmin

router.post('/updateWithPricePassenger', tour_turns.updateWithPricePassenger); //middlewareAuthAdmin

// example call api http://localhost:5000/tour_turn/search?date=2019-04-05&lasting=30&name=saigon&price=500000&sortBy=Price&sortType=ASc
// trong đó sortBy gồm price, date, rating(chưa có) (chỉ sort được theo 1 tiêu chí) (không phân biệt hoa thường). 
// sortType gồm ASC, DESC (không phân biệt hoa thường)
// name, price nếu k có thì trả về tất cả // sortBy và sortType nếu không có sẽ trả về k sort - bắt buộc phải có cả 2 nếu muốn sort
router.get('/search', tour_turns.search);

router.get('/increaseView/:id', tour_turns.increaseView);

module.exports = router