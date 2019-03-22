const db = require('../models');
const tours = db.tours;
var Sequelize = require("sequelize");
const Op = Sequelize.Op;
const helper_add_link = require('../helper/add_full_link');
const helper_validate = require('../helper/validate');
const fs = require('fs');

const asyncForEach = async (arr, cb) => {
    arr.forEach(cb);
}

const asyncFor = async (arr, cb) => {
    for (let i = 0; i < arr.length; i++) {
        if (await cb(arr[i], i) === true) { break }
    }
}

const sort_route = async (routes) => {
    //true nếu arrive nhỏ hơn leave
    const sync_check_time = (arrive, leave) => {
        return Date.parse('01/01/2011 ' + arrive) < Date.parse('01/01/2011 ' + leave)
    }
    const compare2Route = (route1, route2) => {
        if (parseInt(route1.day) === parseInt(route2.day)) {
            if (sync_check_time(route1.arrive_time, route2.arrive_time)) {
                //route1 nhỏ hơn route2
                return -1;
            }
            else
                return 1
        }
        return (parseInt(route1.day) > parseInt(route2.day) ? 1 : -1)
    }
    routes.sort(compare2Route);
}

const delete_list_image = async (deleted_images, idTour) => {
    await asyncForEach(deleted_images, async (image) => {
        const _tour_image = await db.tour_images.findOne({
            where: {
                id: image.id,
                fk_tour: idTour
            }
        });
        if (_tour_image) {
            //ảnh này khớp điều kiện, xóa đi
            fs.unlink('public/assets/images/tourImage/' + _tour_image.name, (err) => {
                if (err) {
                    console.error(err)
                }
            });
            console.log('delete tour image: ', _tour_image.name)
            _tour_image.destroy();
        }
    })
}

const add_new_images_tour = async (new_images, idTour, timestamp) => {
    await asyncForEach(new_images, (image, index) => {
        if (image.fieldname === 'new_images') {
            const name_image = idTour + '_' + timestamp + '_' + index + '.jpg';
            fs.writeFile('public/assets/images/tourImage/' + name_image, image.buffer, async (err) => {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log('add new tour image: ', name_image)
                    await db.tour_images.create({
                        name: name_image,
                        fk_tour: idTour
                    })
                }
            })
        }
    })
}

const asyncWriteFile = async (path, buffer, cb) => {
    fs.writeFile(path, buffer, cb)
}

exports.createWithRoutesAndListImage = async (req, res) => {
    try {
        if (typeof req.body.name !== 'undefined' && typeof req.body.policy !== 'undefined'
            && typeof req.body.description !== 'undefined' && typeof req.body.detail !== 'undefined'
            && typeof req.body.routes !== 'undefined') {
            if (Array.isArray(JSON.parse(req.body.routes))) {
                if (typeof req.files !== 'undefined') {
                    var date = new Date();
                    var timestamp = date.getTime();
                    let featured_image = null;
                    let list_image = req.files;
                    await asyncFor(list_image, async (element, i) => {
                        if (element.fieldname === 'feature_image') {
                            featured_image = element;
                            list_image.splice(i, 1);
                            return true;
                        }
                        return false;
                    })
                    if (featured_image) {
                        fs.writeFile('public/assets/images/tourFeatured/' + timestamp + '.jpg', featured_image.buffer, async (err) => {
                            if (err) {
                                return res.status(400).json({ msg: err.toString() })
                            }
                            const new_tour = {
                                name: req.body.name,
                                policy: req.body.policy,
                                description: req.body.description,
                                detail: req.body.detail,
                                featured_img: timestamp + '.jpg'
                            }
                            const list_routes = JSON.parse(req.body.routes);
                            await sort_route(list_routes);
                            if (!(await helper_validate.check_list_routes(list_routes))) {
                                return res.status(400).json({ msg: 'List routes is invalid' })
                            }
                            tours.create(new_tour).then(async _tour => {
                                //change routes
                                await asyncForEach(list_routes, async (route) => {
                                    var _route = await db.routes.findByPk(route.id);
                                    _route.fk_tour = _tour.id;
                                    await _route.save();
                                })

                                //write file list image
                                await asyncFor(list_image, async (file, i) => {
                                    if (file.fieldname === 'list_image') {
                                        const name_image = _tour.id + '_' + timestamp + '_' + i + '.jpg';
                                        fs.writeFile('public/assets/images/tourImage/' + name_image, file.buffer, async (err) => {
                                            if (err) {
                                                console.log(err);
                                            }
                                            else {
                                                await db.tour_images.create({
                                                    name: name_image,
                                                    fk_tour: _tour.id
                                                })
                                            }
                                            return false;
                                        })
                                    }
                                })

                                if (process.env.NODE_ENV === 'development')
                                    _tour.featured_img = 'http://' + req.headers.host + '/assets/images/tourFeatured/' + _tour.featured_img;
                                else
                                    _tour.featured_img = 'https://' + req.headers.host + '/assets/images/tourFeatured/' + _tour.featured_img;
                                return res.status(200).json(_tour)
                            }).catch(err => {
                                return res.status(400).json({ msg: err.toString() })
                            })
                        })
                    }
                    else {
                        return res.status(400).json({ msg: 'Missing featured image of tour' })
                    }
                }
                else {
                    return res.status(400).json({ msg: 'Missing image of tour' })
                }
            }
            else {
                return res.status(400).json({ msg: 'Param is invalid' })
            }
        }
        else {
            return res.status(400).json({ msg: 'Param is invalid' })
        }
    }
    catch (err) {
        return res.status(400).json({ msg: err.toString() })
    }
}

exports.createWithRoutes = async (req, res) => {
    try {
        if (typeof req.body.name !== 'undefined' && typeof req.body.policy !== 'undefined'
            && typeof req.body.description !== 'undefined' && typeof req.body.detail !== 'undefined'
            && typeof req.body.routes !== 'undefined') {
            if (Array.isArray(JSON.parse(req.body.routes))) {
                if (typeof req.file !== 'undefined') {
                    var date = new Date();
                    var timestamp = date.getTime();
                    fs.writeFile('public/assets/images/tourFeatured/' + timestamp + '.jpg', req.file.buffer, async (err) => {
                        if (err) {
                            return res.status(400).json({ msg: err.toString() })
                        }
                        const new_tour = {
                            name: req.body.name,
                            policy: req.body.policy,
                            description: req.body.description,
                            detail: req.body.detail,
                            featured_img: timestamp + '.jpg'
                        }
                        const list_routes = JSON.parse(req.body.routes);
                        await sort_route(list_routes);
                        if (!(await helper_validate.check_list_routes(list_routes))) {
                            return res.status(400).json({ msg: 'List routes is invalid' })
                        }
                        tours.create(new_tour).then(async _tour => {
                            await asyncForEach(list_routes, async (route) => {
                                // await db.routes.create({
                                //     arrive_time: route.arriveTime,
                                //     leave_time: route.leaveTime,
                                //     day: route.day,
                                //     fk_location: route.id,
                                //     fk_tour: _tour.id,
                                //     fk_transport: route.idTransport
                                // })
                                var _route = await db.routes.findByPk(route.id);
                                _route.fk_tour = _tour.id;
                                await _route.save();
                            })
                            if (process.env.NODE_ENV === 'development')
                                _tour.featured_img = 'http://' + req.headers.host + '/assets/images/tourFeatured/' + _tour.featured_img;
                            else
                                _tour.featured_img = 'https://' + req.headers.host + '/assets/images/tourFeatured/' + _tour.featured_img;
                            return res.status(200).json(_tour)
                        }).catch(err => {
                            return res.status(400).json({ msg: err.toString() })
                        })
                    })
                }
                else {
                    return res.status(400).json({ msg: 'Missing featured image of tour' })
                }
            }
            else {
                return res.status(400).json({ msg: 'Param is invalid' })
            }
        }
        else {
            return res.status(400).json({ msg: 'Param is invalid' })
        }
    }
    catch (err) {
        return res.status(400).json({ msg: err.toString() })
    }
}

exports.create = async (req, res) => {
    try {
        if (typeof req.body.name !== 'undefined' && typeof req.body.policy !== 'undefined'
            && typeof req.body.description !== 'undefined' && typeof req.body.detail !== 'undefined') {
            const new_tour = {
                name: req.body.name,
                policy: req.body.policy,
                description: req.body.description,
                detail: req.body.detail,
            }
            tours.create(new_tour).then(async _tour => {
                return res.status(200).json(_tour)
            }).catch(err => {
                return res.status(400).json({ msg: err.toString() })
            })
        }
        else {
            return res.status(400).json({ msg: 'Param is invalid' })
        }
    }
    catch (err) {
        return res.status(400).json({ msg: err.toString() })
    }
}

exports.updateWithRoutes = async (req, res) => {
    try {
        if (typeof req.body.id === 'undefined' || isNaN(req.body.id)) {
            return res.status(400).json({ msg: 'Param is invalid' })
        }
        else {
            const _tour = await tours.findByPk(req.body.id);
            if (!_tour) {
                //k tồn tại tour này
                return res.status(400).json({ msg: 'Wrong id' })
            }
            else {
                if (typeof req.body.name !== 'undefined')
                    _tour.name = req.body.name;
                if (typeof req.body.policy !== 'undefined')
                    _tour.policy = req.body.policy;
                if (typeof req.body.description !== 'undefined')
                    _tour.description = req.body.description;
                if (typeof req.body.detail !== 'undefined')
                    _tour.detail = req.body.detail;
                if (typeof req.body.routes !== 'undefined') {
                    const list_routes = JSON.parse(req.body.routes);
                    await sort_route(list_routes);
                    if (!(await helper_validate.check_list_routes(list_routes))) {
                        return res.status(400).json({ msg: 'List routes is invalid' })
                    }
                    else {
                        //thay đổi routes
                        await db.routes.update(
                            { fk_tour: null },
                            { where: { fk_tour: _tour.id } }
                        )
                        await asyncForEach(list_routes, async (route) => {
                            var _route = await db.routes.findByPk(route.id);
                            _route.fk_tour = _tour.id;
                            await _route.save();
                        })
                    }
                }
                if (typeof req.file !== 'undefined') {
                    var date = new Date();
                    var timestamp = date.getTime();
                    fs.writeFile('public/assets/images/tourFeatured/' + timestamp + '.jpg', req.file.buffer, async (err) => {
                        if (err) {
                            return res.status(400).json({ msg: err.toString() })
                        }
                        if (_tour.featured_img !== null) {
                            //xóa file cũ đi
                            fs.unlink('public/assets/images/tourFeatured/' + _tour.featured_img, (err) => {
                                if (err) {
                                    console.error(err)
                                }
                            });
                        }
                        _tour.featured_img = timestamp + '.jpg';
                        await _tour.save();
                        if (process.env.NODE_ENV === 'development')
                            _tour.featured_img = 'http://' + req.headers.host + '/assets/images/tourFeatured/' + _tour.featured_img;
                        else
                            _tour.featured_img = 'https://' + req.headers.host + '/assets/images/tourFeatured/' + _tour.featured_img;
                        return res.status(200).json({
                            msg: 'Update successful',
                            data: _tour
                        });
                    })
                }
                else {
                    await _tour.save();
                    if (process.env.NODE_ENV === 'development')
                        _tour.featured_img = 'http://' + req.headers.host + '/assets/images/tourFeatured/' + _tour.featured_img;
                    else
                        _tour.featured_img = 'https://' + req.headers.host + '/assets/images/tourFeatured/' + _tour.featured_img;
                    return res.status(200).json({
                        msg: 'Update successful',
                        data: _tour
                    });
                }
            }
        }
    }
    catch (err) {
        return res.status(400).json({ msg: err.toString() })
    }
}

exports.updateWithRoutesAndListImage = async (req, res) => {
    try {
        if (typeof req.body.id === 'undefined' || isNaN(req.body.id)) {
            return res.status(400).json({ msg: 'Param is invalid' })
        }
        else {
            const _tour = await tours.findByPk(req.body.id);
            if (!_tour) {
                //k tồn tại tour này
                return res.status(400).json({ msg: 'Wrong id' })
            }
            else {
                if (typeof req.body.name !== 'undefined')
                    _tour.name = req.body.name;
                if (typeof req.body.policy !== 'undefined')
                    _tour.policy = req.body.policy;
                if (typeof req.body.description !== 'undefined')
                    _tour.description = req.body.description;
                if (typeof req.body.detail !== 'undefined')
                    _tour.detail = req.body.detail;
                if (typeof req.body.routes !== 'undefined') {
                    const list_routes = JSON.parse(req.body.routes);
                    await sort_route(list_routes);
                    if (!(await helper_validate.check_list_routes(list_routes))) {
                        return res.status(400).json({ msg: 'List routes is invalid' })
                    }
                    else {
                        //thay đổi routes
                        await db.routes.update(
                            { fk_tour: null },
                            { where: { fk_tour: _tour.id } }
                        )
                        await asyncForEach(list_routes, async (route) => {
                            var _route = await db.routes.findByPk(route.id);
                            _route.fk_tour = _tour.id;
                            await _route.save();
                        })
                    }
                }
                if (typeof req.body.deleted_images !== 'undefined') {
                    //xóa file image cũ in here
                    // [
                    //     {
                    //         id: 64
                    //     }
                    // ]
                    const list_delete_images = JSON.parse(req.body.deleted_images)
                    if (Array.isArray(list_delete_images)) {
                        //thỏa là array
                        // await delete_list_image(list_delete_images, _tour.id) //deleted_images là arr id, mỗi id check có phải của tour này k (query trong db ra rồi check), nếu phải thì xóa file đó đi
                        await delete_list_image(list_delete_images, _tour.id)
                    }
                    else {
                        return res.status(400).json({ msg: 'Wrong list deleted image' })
                    }
                }
                if (typeof req.files !== 'undefined') { //nếu có gởi file lên
                    var date = new Date();
                    var timestamp = date.getTime();

                    let featured_image = null;
                    let list_image = req.files;

                    await asyncFor(list_image, async (element, i) => {
                        if (element.fieldname === 'featured_image') {
                            featured_image = element;
                            list_image.splice(i, 1); //tách file có fieldname là feature_image ra
                            return true;
                        }
                        return false;
                    }) //list_image chỉ còn lại file có fieldname khác feature_image (new_images)
                    if (featured_image) { //nếu có featured_image
                        await asyncWriteFile('public/assets/images/tourFeatured/' + timestamp + '.jpg', featured_image.buffer, async (err) => {
                            if (err) {
                                console.log(err)
                                throw err;
                            }
                            if (_tour.featured_img !== null) {
                                //xóa file cũ đi
                                if (fs.existsSync('public/assets/images/tourFeatured/' + _tour.featured_img)) {
                                    //file exists
                                    fs.unlink('public/assets/images/tourFeatured/' + _tour.featured_img, (err) => {
                                        if (err) {
                                            console.error(err)
                                        }
                                    });
                                }
                                else {
                                    console.log('update tour: featured image file ' + _tour.featured_img + ' not exists')
                                }
                            }
                        })
                    }
                    //thêm new image in here
                    _tour.featured_img = timestamp + '.jpg';
                    await add_new_images_tour(list_image, _tour.id, timestamp);
                    await _tour.save();
                    const result_tour = await tours.findByPk(req.body.id);
                    if (process.env.NODE_ENV === 'development')
                        result_tour.featured_img = 'http://' + req.headers.host + '/assets/images/tourFeatured/' + result_tour.featured_img;
                    else
                        result_tour.featured_img = 'https://' + req.headers.host + '/assets/images/tourFeatured/' + _toresult_tourur.featured_img;
                    return res.status(200).json({
                        msg: 'Update successful',
                        data: result_tour
                    });
                }
                else {
                    await _tour.save();
                    if (process.env.NODE_ENV === 'development')
                        _tour.featured_img = 'http://' + req.headers.host + '/assets/images/tourFeatured/' + _tour.featured_img;
                    else
                        _tour.featured_img = 'https://' + req.headers.host + '/assets/images/tourFeatured/' + _tour.featured_img;
                    return res.status(200).json({
                        msg: 'Update successful',
                        data: _tour
                    });
                }
            }
        }
    }
    catch (err) {
        console.log('end err', err)
        return res.status(400).json({ msg: err.toString() })
    }
}

exports.getAllTour = (req, res) => {
    const page_default = 1;
    const per_page_default = 10;
    var page, per_page;
    if (typeof req.query.page === 'undefined') page = page_default;
    else page = req.query.page
    if (typeof req.query.per_page === 'undefined') per_page = per_page_default;
    else per_page = req.query.per_page
    if (isNaN(page) || isNaN(per_page) || parseInt(per_page) <= 0 || parseInt(page) <= 0) {
        return res.status(400).json({ msg: 'Params is invalid' })
    }
    else {
        page = parseInt(page);
        per_page = parseInt(per_page);
        const query = {
            include: [{
                attributes: { exclude: ['fk_tour'] },
                model: db.tour_turns,
                where: {
                    status: 'public',
                }
            }],
            limit: per_page,
            offset: (page - 1) * per_page
        };
        tours.findAndCountAll(query).then(async _tours => {
            var next_page = page + 1;
            //Kiểm tra còn dữ liệu không
            if ((parseInt(_tours.rows.length) + (next_page - 2) * per_page) === parseInt(_tours.count))
                next_page = -1;
            //Nếu số lượng record nhỏ hơn per_page  ==> không còn dữ liệu nữa => trả về -1 
            if ((parseInt(_tours.rows.length) < per_page))
                next_page = -1;
            if (parseInt(_tours.rows.length) === 0)
                next_page = -1;
            await helper_add_link.addLinkToursFeaturedImgOfListTours(_tours.rows, req.headers.host)
            res.status(200).json({
                itemCount: _tours.rows.length, //số lượng record được trả về
                data: _tours.rows,
                next_page: next_page //trang kế tiếp, nếu là -1 thì hết data rồi
            })
        }).catch(err => {
            res.status(400).json({ msg: err })
        })
    }
}

exports.getAllWithoutPagination = (req, res) => {
    try {
        const query = {
            attributes: ['id', 'name'],
            include: [{
                model: db.tour_turns,
                //admin dùng nên k cần fillter status
            }],
            // order: [[db.tour_turns, 'start_date', 'DESC']]
        }
        tours.findAll(query).then(async _tours => {
            await helper_add_link.addLinkToursFeaturedImgOfListTours(_tours, req.headers.host)
            res.status(200).json({
                itemCount: _tours.length, //số lượng record được trả về
                data: _tours,
            })
        })
    }
    catch (err) {
        res.status(400).json({ msg: err })
    }
}

exports.getById = (req, res) => {
    const idTour = req.params.id;
    const query = {
        where: { id: idTour },
        include: [{
            attributes: { exclude: ['fk_tour'] },
            model: db.tour_turns,
        },
        {
            model: db.routes,
            attributes: { exclude: ['fk_tour', 'fk_location', 'fk_transport'] },
            include: [{
                model: db.locations,
                attributes: { exclude: ['fk_type'] },
                include: [{
                    model: db.types
                }]
            },
            {
                model: db.transports
            }]
        },
        {
            attributes: { exclude: ['fk_tour'] },
            model: db.tour_images
        }],
        order: [[db.tour_turns, 'start_date', 'DESC'], [db.routes, 'day', 'ASC'], [db.routes, 'arrive_time', 'ASC']]
    }
    tours.findOne(query).then(async _tour => {
        if (_tour !== null) {
            if (_tour.featured_img !== null) {
                if (process.env.NODE_ENV === 'development')
                    _tour.featured_img = 'http://' + req.headers.host + '/assets/images/tourFeatured/' + _tour.featured_img
                else
                    _tour.featured_img = 'https://' + req.headers.host + '/assets/images/tourFeatured/' + _tour.featured_img
            }
            await helper_add_link.addLinkLocationFeaturedImgOfListRoutes(_tour.routes, req.headers.host);
            await helper_add_link.addLinkTourImgOfListToursImg(_tour.tour_images, req.headers.host)
        }
        res.status(200).json({ data: _tour })
    })
        .catch(err => {
            res.status(400).json({ msg: err })
        })
}

async function paginate(array, page_size, page_number) {
    --page_number; // because pages logically start with 1, but technically with 0
    return array.slice(page_number * page_size, (page_number + 1) * page_size);
}



exports.getByLocation = (req, res) => {
    try {
        const idLocation = req.query.idLocation;
        const page_default = 1;
        const per_page_default = 10;
        var page, per_page;
        if (typeof req.query.page === 'undefined') page = page_default;
        else page = req.query.page
        if (typeof req.query.per_page === 'undefined') per_page = per_page_default;
        else per_page = req.query.per_page
        if (isNaN(page) || isNaN(per_page) || parseInt(per_page) <= 0 || parseInt(page) <= 0) {
            return res.status(400).json({ msg: 'Params is invalid' })
        }
        else {
            page = parseInt(page);
            per_page = parseInt(per_page);
            const query = {
                include: [{
                    attributes: { exclude: ['fk_tour'] },
                    model: db.tour_turns,
                    where: {
                        status: 'public',
                        start_date: {
                            [Op.gt]: new Date()
                        }
                    }
                },
                {
                    attributes: [],
                    model: db.routes,
                    where: {
                        fk_location: idLocation
                    }
                }],
                order: [[db.tour_turns, 'start_date', 'DESC']],
                limit: per_page,
                offset: (page - 1) * per_page
            }
            tours.findAndCountAll(query).then(async _tours => {
                console.log(_tours)
                var next_page = page + 1;
                //Kiểm tra còn dữ liệu không
                if ((parseInt(_tours.rows.length) + (next_page - 2) * per_page) === parseInt(_tours.count))
                    next_page = -1;
                //Nếu số lượng record nhỏ hơn per_page  ==> không còn dữ liệu nữa => trả về -1 
                if ((parseInt(_tours.rows.length) < per_page))
                    next_page = -1;
                if (parseInt(_tours.rows.length) === 0)
                    next_page = -1;
                await helper_add_link.addLinkToursFeaturedImgOfListTours(_tours.rows, req.headers.host)
                return res.status(200).json({
                    itemCount: _tours.rows.length, //số lượng record được trả về
                    data: _tours.rows,
                    next_page: next_page //trang kế tiếp, nếu là -1 thì hết data rồi
                })
            })

            // const query = {
            //     attributes: [],
            //     include: [{
            //         model: db.tours,
            //         attributes: ['id']
            //     }],
            //     where: {
            //         fk_location: idLocation
            //     }
            // };
            // db.routes.findAll(query).then(async _routes => {
            //     var next_page = page + 1;
            //     const _tours = _routes.map(value => {
            //         return value.tour
            //     })
            //     let _uniqueTours = [...new Set(_tours.map(item => item.id))]
            //     let _resultTours = await paginate(_uniqueTours, per_page, page)
            //     if (_resultTours.length < per_page) next_page = -1;
            //     tours.findAll({
            //         where: {
            //             id: {
            //                 [Op.in]: [1, 2]
            //             }
            //         },
            //         include: [{
            //             model: db.tour_turns,
            //             where: {
            //                 start_date: {
            //                     [Op.gt]: new Date()
            //                 }
            //             }
            //         }]
            //     }).then(_resultTourWithData => {
            //         return res.status(200).json({
            //             itemCount: _resultTourWithData.length, //số lượng record được trả về
            //             data: _resultTourWithData,
            //             next_page: next_page //trang kế tiếp, nếu là -1 thì hết data rồi
            //         })
            //     })
            // })
        }
    }
    catch (err) {
        return res.status(400).json({ msg: err.toString() })
    }
}


exports.searchByName = (req, res) => {
    try {
        const key_search = req.query.name;
        const page_default = 1;
        const per_page_default = 10;
        var page, per_page;
        if (typeof req.query.page === 'undefined') page = page_default;
        else page = req.query.page
        if (typeof req.query.per_page === 'undefined') per_page = per_page_default;
        else per_page = req.query.per_page
        if (isNaN(page) || isNaN(per_page) || parseInt(per_page) <= 0 || parseInt(page) <= 0) {
            return res.status(400).json({ msg: 'Params is invalid' })
        }
        else {
            page = parseInt(page);
            per_page = parseInt(per_page);
            const query = {
                where: {
                    name: {
                        [Op.like]: '%' + key_search + '%'
                    }
                },
                include: [{
                    attributes: { exclude: ['fk_tour'] },
                    model: db.tour_turns,
                    where: {
                        status: 'public',
                    }
                }],
            }
            tours.findAndCountAll(query).then(async _tours => {
                var next_page = page + 1;
                //Kiểm tra còn dữ liệu không
                if ((parseInt(_tours.rows.length) + (next_page - 2) * per_page) === parseInt(_tours.count))
                    next_page = -1;
                //Nếu số lượng record nhỏ hơn per_page  ==> không còn dữ liệu nữa => trả về -1 
                if ((parseInt(_tours.rows.length) < per_page))
                    next_page = -1;
                if (parseInt(_tours.rows.length) === 0)
                    next_page = -1;
                await helper_add_link.addLinkToursFeaturedImgOfListTours(_tours.rows, req.headers.host)
                res.status(200).json({
                    itemCount: _tours.rows.length, //số lượng record được trả về
                    data: _tours.rows,
                    next_page: next_page //trang kế tiếp, nếu là -1 thì hết data rồi
                })
            })

        }
    }
    catch (err) {
        return res.status(400).json({ msg: err.toString() })
    }
}

exports.searchByPrice = (req, res) => {
    try {
        const price_search = req.query.price;
        const page_default = 1;
        const per_page_default = 10;
        var page, per_page;
        if (typeof req.query.page === 'undefined') page = page_default;
        else page = req.query.page
        if (typeof req.query.per_page === 'undefined') per_page = per_page_default;
        else per_page = req.query.per_page
        if (isNaN(page) || isNaN(per_page) || parseInt(per_page) <= 0 || parseInt(page) <= 0) {
            return res.status(400).json({ msg: 'Params is invalid' })
        }
        else {
            page = parseInt(page);
            per_page = parseInt(per_page);
            const query = {
                where: {
                    price: {
                        [Op.lte]: parseInt(price_search)
                    }
                },
                include: [{
                    attributes: { exclude: ['fk_tour'] },
                    model: db.tour_turns,
                    where: {
                        status: 'public',
                    }
                }],
            }
            tours.findAndCountAll(query).then(async _tours => {
                var next_page = page + 1;
                //Kiểm tra còn dữ liệu không
                if ((parseInt(_tours.rows.length) + (next_page - 2) * per_page) === parseInt(_tours.count))
                    next_page = -1;
                //Nếu số lượng record nhỏ hơn per_page  ==> không còn dữ liệu nữa => trả về -1 
                if ((parseInt(_tours.rows.length) < per_page))
                    next_page = -1;
                if (parseInt(_tours.rows.length) === 0)
                    next_page = -1;
                await helper_add_link.addLinkToursFeaturedImgOfListTours(_tours.rows, req.headers.host)
                res.status(200).json({
                    itemCount: _tours.rows.length, //số lượng record được trả về
                    data: _tours.rows,
                    next_page: next_page //trang kế tiếp, nếu là -1 thì hết data rồi
                })
            })

        }
    }
    catch (err) {
        return res.status(400).json({ msg: err.toString() })
    }
}
