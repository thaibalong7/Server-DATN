var router = require('express').Router();
const book_tour = require('../controller/book_tour');
const { middlewareAuthUser, middlewareAuthAdmin } = require('../middleware/auth')

router.post('/book_new_tour', book_tour.book_tour);

router.get('/getHistoryBookTourByUser', middlewareAuthUser, book_tour.getHistoryBookTourByUser);

//example call api: http://localhost:5000/book_tour/getHistoryBookTourById/7?tour=true
router.get('/getHistoryBookTourById/:id', book_tour.getHistoryBookTourById);

//example call api: http://localhost:5000/book_tour/getHistoryBookTourByCode/8fae3160-5059-11e9-98a6-11c33d1f98b4?tour=true
router.get('/getHistoryBookTourByCode/:code', book_tour.getHistoryBookTourByCode);

router.get('/getPassengerInBookTourHistory/:id', book_tour.getPassengerInBookTourHistory)

//example call api: http://localhost:5000/book_tour/getAllBookTourHistoryWithoutPagination?status=has_departed
//có 03 loại status: not_yet_started (chưa đi), has_departed (đang đi), finished (đã đi)
//sai hoặc k có status thì trả về all
router.get('/getAllBookTourHistoryWithoutPagination', book_tour.getAllBookTourHistoryWithoutPagination) //middlewareAuthAdmin

//example call api: http://localhost:5000/book_tour/getAllBookTourHistoryGroupByTourTurn?status=has_departed
//có 03 loại status: not_yet_started (chưa đi), has_departed (đang đi), finished (đã đi)
//sai hoặc k có status thì trả về all // tour turn mà k có book tour vẫn được xuất hiện
router.get('/getAllBookTourHistoryGroupByTourTurn', book_tour.getAllBookTourHistoryGroupByTourTurn) //middlewareAuthAdmin //k phân trang

router.get('/getBookTourHistoryByTourTurn/:id', book_tour.getBookTourHistoryByTourTurn) //middlewareAuthAdmin

router.post('/payBookTour', middlewareAuthAdmin, book_tour.payBookTour) //middlewareAuthAdmin

router.post('/unpayBookTour', book_tour.unpayBookTour) //middlewareAuthAdmin

router.post('/cancelBookTourStatusBooked', book_tour.cancelBookTourStatusBooked) //middlewareAuthAdmin

router.post('/cancelBookTourWithNoMoneyRefund', middlewareAuthAdmin, book_tour.cancelBookTourWithNoMoneyRefund) //middlewareAuthAdmin

router.post('/confirmCancelBookTourOffline', book_tour.confirmCancelBookTourOffline) //middlewareAuthAdmin

router.post('/CancelBookTourOffline', middlewareAuthAdmin, book_tour.CancelBookTourOffline) //middlewareAuthAdmin

// router.get('/requestCancelBookTour/:code', book_tour.requestCancelBookTour)

router.post('/updatePassenger', book_tour.updatePassenger) //middlewareAuthAdmin

router.post('/deletePassenger', book_tour.deletePassenger) //middlewareAuthAdmin

router.post('/updateContactInfo', book_tour.updateContactInfo) //middlewareAuthAdmin

router.get('/getListNeedCall', book_tour.getListNeedCall) //middlewareAuthAdmin

module.exports = router;




