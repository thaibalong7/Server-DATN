'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        /*
          Add altering commands here.
          Return a promise to correctly handle asynchronicity.
    
          Example:
          return queryInterface.bulkInsert('People', [{
            name: 'John Doe',
            isBetaMember: false
          }], {});
        */
        return Promise.all([
            queryInterface.bulkInsert('type_tour', [
                {
                    name: 'Trong nước'
                },
                {
                    name: 'Quốc tế'
                }
            ]).then((index) => {
                return Promise.all([
                    queryInterface.bulkUpdate('tours', { fk_type_tour: index }, {})
                ])
            }),
            queryInterface.bulkInsert('countries', [
                {
                    id: 1,
                    name: 'Việt Nam'
                }
            ]).then(() => {
                return queryInterface.sequelize.query("INSERT INTO `provinces` (`id`, `name`, `fk_country`) VALUES" +
                    "('1', 'Thành phố Hà Nội', 1)," +
                    "('2', 'Tỉnh Hà Giang', 1)," +
                    "('4', 'Tỉnh Cao Bằng', 1)," +
                    "('6', 'Tỉnh Bắc Kạn', 1)," +
                    "('8', 'Tỉnh Tuyên Quang', 1)," +
                    "('10', 'Tỉnh Lào Cai', 1)," +
                    "('11', 'Tỉnh Điện Biên', 1)," +
                    "('12', 'Tỉnh Lai Châu', 1)," +
                    "('14', 'Tỉnh Sơn La', 1)," +
                    "('15', 'Tỉnh Yên Bái', 1)," +
                    "('17', 'Tỉnh Hòa Bình', 1)," +
                    "('19', 'Tỉnh Thái Nguyên', 1)," +
                    "('20', 'Tỉnh Lạng Sơn', 1)," +
                    "('22', 'Tỉnh Quảng Ninh', 1)," +
                    "('24', 'Tỉnh Bắc Giang', 1)," +
                    "('25', 'Tỉnh Phú Thọ', 1)," +
                    "('26', 'Tỉnh Vĩnh Phúc', 1)," +
                    "('27', 'Tỉnh Bắc Ninh', 1)," +
                    "('30', 'Tỉnh Hải Dương', 1)," +
                    "('31', 'Thành phố Hải Phòng', 1)," +
                    "('33', 'Tỉnh Hưng Yên', 1)," +
                    "('34', 'Tỉnh Thái Bình', 1)," +
                    "('35', 'Tỉnh Hà Nam', 1)," +
                    "('36', 'Tỉnh Nam Định', 1)," +
                    "('37', 'Tỉnh Ninh Bình', 1)," +
                    "('38', 'Tỉnh Thanh Hóa', 1)," +
                    "('40', 'Tỉnh Nghệ An', 1)," +
                    "('42', 'Tỉnh Hà Tĩnh', 1)," +
                    "('44', 'Tỉnh Quảng Bình', 1)," +
                    "('45', 'Tỉnh Quảng Trị', 1)," +
                    "('46', 'Tỉnh Thừa Thiên Huế', 1)," +
                    "('48', 'Thành phố Đà Nẵng', 1)," +
                    "('49', 'Tỉnh Quảng Nam', 1)," +
                    "('51', 'Tỉnh Quảng Ngãi', 1)," +
                    "('52', 'Tỉnh Bình Định', 1)," +
                    "('54', 'Tỉnh Phú Yên', 1)," +
                    "('56', 'Tỉnh Khánh Hòa', 1)," +
                    "('58', 'Tỉnh Ninh Thuận', 1)," +
                    "('60', 'Tỉnh Bình Thuận', 1)," +
                    "('62', 'Tỉnh Kon Tum', 1)," +
                    "('64', 'Tỉnh Gia Lai', 1)," +
                    "('66', 'Tỉnh Đắk Lắk', 1)," +
                    "('67', 'Tỉnh Đắk Nông', 1)," +
                    "('68', 'Tỉnh Lâm Đồng', 1)," +
                    "('70', 'Tỉnh Bình Phước', 1)," +
                    "('72', 'Tỉnh Tây Ninh', 1)," +
                    "('74', 'Tỉnh Bình Dương', 1)," +
                    "('75', 'Tỉnh Đồng Nai', 1)," +
                    "('77', 'Tỉnh Bà Rịa - Vũng Tàu', 1)," +
                    "('79', 'Thành phố Hồ Chí Minh', 1)," +
                    "('80', 'Tỉnh Long An', 1)," +
                    "('82', 'Tỉnh Tiền Giang', 1)," +
                    "('83', 'Tỉnh Bến Tre', 1)," +
                    "('84', 'Tỉnh Trà Vinh', 1)," +
                    "('86', 'Tỉnh Vĩnh Long', 1)," +
                    "('87', 'Tỉnh Đồng Tháp', 1)," +
                    "('89', 'Tỉnh An Giang', 1)," +
                    "('91', 'Tỉnh Kiên Giang', 1)," +
                    "('92', 'Thành phố Cần Thơ', 1)," +
                    "('93', 'Tỉnh Hậu Giang', 1)," +
                    "('94', 'Tỉnh Sóc Trăng', 1)," +
                    "('95', 'Tỉnh Bạc Liêu', 1)," +
                    "('96', 'Tỉnh Cà Mau', 1);")
                    .then(() => {

                        return Promise.all([
                            queryInterface.bulkInsert('tour_provinces', [
                                {
                                    fk_tour: 1,
                                    fk_province: 79, //HCM
                                },
                                {
                                    fk_tour: 2,
                                    fk_province: 79, //HCM
                                },
                                {
                                    fk_tour: 3,
                                    fk_province: 77, //Vung Tau
                                },
                                {
                                    fk_tour: 3,
                                    fk_province: 68, //Lam Dong
                                },
                                {
                                    fk_tour: 4,
                                    fk_province: 79,
                                },
                                {
                                    fk_tour: 5,
                                    fk_province: 79,
                                },
                                {
                                    fk_tour: 5,
                                    fk_province: 68,
                                },
                                {
                                    fk_tour: 5,
                                    fk_province: 48, //Da Nang
                                },
                                {
                                    fk_tour: 6,
                                    fk_province: 56, //Khanh Hoa
                                },
                                {
                                    fk_tour: 6,
                                    fk_province: 58, //Ninh Thuan
                                },
                                {
                                    fk_tour: 6,
                                    fk_province: 56, //Da Nang
                                },
                                {
                                    fk_tour: 6,
                                    fk_province: 49, //Quang Nam
                                },
                                {
                                    fk_tour: 6,
                                    fk_province: 46, //Thua Thien - Hue
                                },
                                {
                                    fk_tour: 6,
                                    fk_province: 37, //Ninh Binh
                                },
                                {
                                    fk_tour: 6,
                                    fk_province: 22, //Quang Ninh
                                },
                                {
                                    fk_tour: 6,
                                    fk_province: 10, //Lao Cai
                                }
                            ]),
                            queryInterface.bulkInsert('tour_countries', [
                                {
                                    fk_tour: 1,
                                    fk_country: 1,
                                },
                                {
                                    fk_tour: 2,
                                    fk_country: 1,
                                },
                                {
                                    fk_tour: 3,
                                    fk_country: 1,
                                },
                                {
                                    fk_tour: 4,
                                    fk_country: 1,
                                },
                                {
                                    fk_tour: 5,
                                    fk_country: 1,
                                },
                                {
                                    fk_tour: 6,
                                    fk_country: 1,
                                }
                            ])
                        ])
                    })
            })
        ])
    },

    down: (queryInterface, Sequelize) => {
        /*
          Add reverting commands here.
          Return a promise to correctly handle asynchronicity.
    
          Example:
          return queryInterface.bulkDelete('People', null, {});
        */
        return Promise.all([
            queryInterface.bulkDelete('type_tour',
                null, {}
            ).then(() => {
                return queryInterface.bulkUpdate('tours', { fk_type_tour: null }, {})
            }),
            queryInterface.bulkDelete('provinces', null, {}).then(() => {
                return queryInterface.bulkDelete('countries', { id: 1 }, {}).then(() => {
                    return Promise.all([
                        queryInterface.bulkDelete('tour_provinces', null, {}),
                        queryInterface.bulkDelete('tour_countries', null, {})
                    ])
                })
            })
        ])
    }
};
