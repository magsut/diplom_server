const express = require('express');
const mysql = require('mysql');
const multer = require('./multer');
const {getJWToken} = require("./token");
const sha256 = require('crypto-js/sha256');
const path = require("path");

const server = express();

server.use(express.json());

const connection = mysql.createConnection({
    host: "127.0.0.1",
    port: "3306",
    user: "root",
    database: "diplom",
    password: "1234"
})

serverInit();

server.get('/getServices/:mark/:model/:generation', async function(req, res) {
    try{
        const mark = req.params.mark,
              model = req.params.model,
              generation = req.params.generation;

        const getServices = new Promise((resolve, reject) => {
            const sql = 'SELECT title, period FROM diplom.service where car_idcar = ' +
                `(SELECT idcar FROM diplom.car where mark = '${mark}' and model = '${model}' and generation = '${generation}');`;

            let services = [];

            connection.query(sql, (err, result) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    result.forEach((service) => services.push(service));
                    resolve(services);
                }
            })
        });

        getServices
            .then(result => {
                let services = result.map((service) => {
                    return {
                        title: service.title,
                        period: service.period
                    };
                })
                console.log(JSON.stringify(services));
                res.status(200).json(services);
            }).catch(result => {
            console.log(result.message);
            res.status(500).end(result.message);
        })

    } catch (e) {
        console.log(e.toString());
        res.status(500).end(e.toString());
    }

});

server.post('/addCar_IdToUserCar', express.json(), async (req, res) => {
    const {idCar, mark, model, generation} = req.body;

    const addCarIdToUserCar = new Promise((resolve, reject) => {

        const sql = `UPDATE diplom.usercar SET car_idcar = (SELECT idcar FROM diplom.car where mark = '${mark}' and model = '${model}' and generation = '${generation}') WHERE iduserCar = '${idCar}'`

        connection.query(sql, (err, result) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                resolve(result);
            }
        })

    });

    try {
        addCarIdToUserCar.then((result) => {
            if(result.affectedRows === 1){
                res.status(200).end('Ok');
            } else {
                console.log(result);
                res.status(500).end('Error');
            }
        }).catch((result) => {
            console.log(result.message);
            res.status(500).end(result.message);
        })
    } catch (e) {
        console.log(e.toString());
        res.status(500).end(e.toString());
    }
})

server.get('/getCarMarks', async (req, res) => {
    try {

        const carMarks = new Promise((resolve, reject) => {
            const sql = `SELECT mark FROM diplom.car GROUP BY mark HAVING count(*) > 1;`;

            let marks = [];

            connection.query(sql, (err, result) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    result.forEach((mark) => marks.push(mark));
                    resolve(marks);
                }
            })
        });

        carMarks
            .then(result => {
            console.log(result.map((mark) => mark.mark));
            res.status(200).json(result.map((mark) => mark.mark));
            }).catch(result => {
            console.log(result.message);
            res.status(500).end(result.message);
        });

    } catch (e) {
        console.log(e.toString());
        res.status(500).end(e.toString());
    }
})

server.get('/getModelsFromMark/:mark', async (req, res) => {
    try{
        const mark = req.params.mark;

        if(!mark){
            throw new Error('No mark in req');
        }

        const carModels = new Promise((resolve, reject) => {
            const sql = `SELECT model FROM diplom.car where mark = '${mark}' GROUP BY model;`;

            let models = [];

            connection.query(sql, (err, result) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    result.forEach((model) => models.push(model));
                    resolve(models);
                }
            })
        });

        carModels
            .then(result => {
                console.log(result.map((model) => model.model));
                res.status(200).json(result.map((model) => model.model));
            }).catch(result => {
            console.log(result.message);
            res.status(500).end(result.message);
        })

    } catch (e){
        console.log(e.toString());
        res.status(500).end(e.toString());
    }
})

server.get('/getGenerationsFromModel/:model', async (req, res) => {

    try {
        const model = req.params.model;

        if(!model){
            throw new Error('No model in req');
        }

        const carGenerations = new Promise((resolve, reject) => {
            const sql = "SELECT generation, `year-from`, `year-to` FROM diplom.car where model =" + `'${model}';`;

            let generations = [];

            connection.query(sql, (err, result) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    result.forEach((generation) => generations.push(generation));
                    resolve(generations);
                }
            })
        });

        carGenerations
            .then(result => {
                let generations = result.map((generation) => {
                    return {
                        generation: generation.generation,
                        startYear: generation['year-from'],
                        endYear: generation['year-to'] === 0 ? 'наст. вр.' : generation['year-to']
                    };
                })
                console.log(JSON.stringify(generations));
                res.status(200).json(generations);
            }).catch(result => {
            console.log(result.message);
            res.status(500).end(result.message);
        })
    } catch (e) {
        console.log(e.toString());
        res.status(500).end(e.toString());
    }

})

server.post('/addUser', multer.single('photo'), async (req, res) => {
    try{
        const addUser = (passHash, login, authToken, userPhoto) => {
            return  new Promise((resolve, reject) => {
                const sql = `INSERT INTO diplom.user (passHash, login, authToken, userPhoto) VALUES ('${passHash}', '${login}', '${authToken}', '${userPhoto}');`;

                connection.query(sql, (err, result) => {
                    if (err) {
                        console.log(err);
                        if(err.code === 'ER_DUP_ENTRY'){
                            res.status(400);
                        } else {
                            res.status(500);
                        }
                        reject(err);
                    } else {
                        resolve(result);
                    }
                })
            });
        };


        const {pass, login} = req.body;
        let filename = req.file && req.file.filename;
        if(req.file){
            console.log(filename);
        } else {
            filename = 'defUser.png';
        }

        if(!pass || !login){
            res.status(400).end('No pass or login in req');
        } else {
            const pas = sha256(pass).toString();
            const token = getJWToken(pas, login);
            addUser(pas, login, token, filename).then(result => {
                console.log("user inserted");
                //res.status(200).end(token);

                res.status(200).json({photo : filename, token : token})
            }).catch(result => {
                console.log(result.message);
                res.end(result.message);
            })
        }
    } catch (e) {
        console.log(e.toString());
        res.status(500).end(e.toString());
    }
})

server.post('/addUserCar', multer.single('photo'), async (req, res) => {
    const addUserCar = (name, imagePath, cost, millage, token, operating_mode) => {
        return  new Promise((resolve, reject) => {
            const sql = `INSERT INTO diplom.usercar (name, imagePath, cost, millage, user_iduser, operating_modes_idoperating_modes) VALUES ('${name}', '${imagePath}', '${cost}', '${millage}', (SELECT iduser FROM diplom.user where authToken = '${token}'), ${operating_mode});`;

            connection.query(sql, (err, result) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        });
    };

    const {name, cost, millage, token, operating_mode} = req.body;

    let filename = req.file && req.file.filename;
    if(req.file){
        console.log(filename);
    } else {
        filename = 'default-car.png';
    }

    try{
        if(!name || !cost || !millage || !token || !operating_mode){
            res.status(400).end('Missing data in req');
        } else {
            addUserCar(name,filename, cost, millage, token, operating_mode).then((result) => {
                console.log(result);
                res.status(200).json({
                    id : result.insertId,
                    path: filename
                });
            }).catch((result) => {
                console.log(result.message);
                res.end(result.message);
            });
        }
    } catch (e) {
        console.log(e.toString());
        res.status(500).end(e.toString());
    }
})

server.post('/addSpending', express.json(), async (req, res) => {
    const addUserCar = (name, description, isPlanned, date, millage, idCar, type, cost) => {
        return  new Promise((resolve, reject) => {
            const sql = `INSERT INTO diplom.spending (name, description, isPlanned, date, millage, userCar_iduserCar, spendingType_idspendingType, cost)VALUES ('${name}', '${description}', '${isPlanned}', '${date}', '${millage}', ${idCar}, (SELECT idspendingType FROM diplom.spendingtype where type = '${type}'), ${cost});`;

            connection.query(sql, (err, result) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        });
    };

    const {name, description, isPlaned, date, millage, idCar, type, cost} = req.body;

    if(!name || !description || !isPlaned || !date || !millage || !idCar || !type || !cost){
        res.status(400).end('Missing data in req');
    } else {
        try{
            addUserCar(name, description, isPlaned? 1:0, date, millage, idCar, type, cost).then((result) => {
                console.log(result);
                res.status(200).json({
                    id : result.insertId
                });
            }).catch((result) => {
                console.log(result.message);
                res.end(result.message);
            })
        } catch (e) {
            console.log(e.message);
            res.end(e.message);
        }
    }
})

server.get('/login/:pass/:login', async (req, res) => {
    try{
        const pass = req.params.pass,
              login = req.params.login;

        const isUserExist = new Promise((resolve, reject) => {
            let sql = `SELECT iduser FROM diplom.user where login = '${login}' and passHash = '${sha256(pass).toString()}';`;
            connection.query(sql, (err, result) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        })

        const updateToken = (idUser, token) => {
            return new Promise((resolve, reject) => {
                let sql = `UPDATE diplom.user SET authToken = '${token}' WHERE (iduser = '${idUser}');`;
                connection.query(sql, (err, result) => {
                    if (err) {
                        console.log(err);
                        reject(err);
                    } else {
                        resolve(result);
                    }
                })
            })
        }

        const getUserPhotoName = (idUser) => {
            return new Promise((resolve, reject) => {
                const sql = `SELECT userPhoto FROM diplom.user where iduser = ${idUser.iduser};`;

                connection.query(sql, (err, result) => {
                    if (err) {
                        console.log(err);
                        reject(err);
                    } else {
                        resolve(result);
                    }
                })
            })
        }


        isUserExist.then((result) => {
            if(result[0]){
                console.log(result);
                const token = getJWToken(pass,login);
                updateToken(result[0].iduser, token).then((Result) => {
                    console.log(Result);
                    getUserPhotoName(result[0]).then((RESULT) => {
                        res.status(200).json({token : token, photo : RESULT[0].userPhoto});
                    }).catch((RESULT) => {
                        console.log(RESULT.message);
                        res.status(500).end(RESULT.message);
                    })
                }).catch((Result) => {
                    console.log(Result.message);
                    res.status(500).end(Result.message);
                })
            } else {
                console.log(result);
                res.status(400).end("No user")
            }
        }).catch((result) => {
            console.log(result.message);
            res.status(500).end(result.message);
        })
    } catch (e) {
        console.log(e.message);
        res.status(500).end(e.message);
    }
})

server.get('/getUserCars/:token', async (req, res) => {
    try {
        const token = req.params.token;

        const getUserCars = new Promise((resolve, reject) => {
            let sql = `SELECT iduserCar, name, imagePath, cost, millage, operating_modes_idoperating_modes FROM diplom.usercar where user_iduser = (select iduser FROM diplom.user where authToken = '${token}');`

            connection.query(sql, (err, result) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        })

        const getOperatingMode = (id) => {
            return new Promise((resolve, reject) => {
                const sql = `SELECT mode FROM diplom.operating_modes where idoperating_modes = ${id};`;

                connection.query(sql, (err, result) => {
                    if (err) {
                        console.log(err);
                        reject(err);
                    } else {
                        resolve(result);
                    }
                })
            })
        }

        const getCarSpending = (idCar) => {
            return new Promise((resolve, reject) => {
                let sql = `SELECT name, description, isPlanned, date, millage, cost, spendingType_idspendingType FROM diplom.spending where userCar_iduserCar = ${idCar};`;

                connection.query(sql, (err, result) => {
                    if (err) {
                        console.log(err);
                        reject(err);
                    } else {
                        resolve(result);
                    }
                })
            })
        };

        const getSpendingType = (idType) => {
            return new Promise((resolve, reject) => {
                let sql = `SELECT type FROM diplom.spendingtype where idspendingType = '${idType}';`;
                connection.query(sql, (err, result) => {
                    if (err) {
                        console.log(err);
                        reject(err);
                    } else {
                        resolve(result);
                    }
                })
            })
        }

        getUserCars.then(async (result) => {
            let userCars = [];

            for (const car of result) {
                let Car = {
                    id: car.iduserCar,
                    name: car.name,
                    imagePath: car.imagePath,
                    cost: car.cost,
                    millage: car.millage,
                    operating_mode: '',
                    spendings: []
                };

                await getOperatingMode(car.operating_modes_idoperating_modes).then((Result) => {
                    Car.operating_mode = Result[0].mode;
                })

                await getCarSpending(car.iduserCar).then(async (Result) => {
                    for (const spending of Result) {
                        let Spending = {
                            name: spending.name,
                            description: spending.description,
                            isPlanned: spending.isPlanned !== 1,
                            date: spending.date,
                            millage: spending.millage,
                            cost: spending.cost,
                            type: ''
                        };

                        await getSpendingType(spending.spendingType_idspendingType).then((Res) => {
                            if (Res[0]) {
                                Spending.type = Res[0].type;
                            } else {
                                Spending.type = 'Другое';
                            }

                            Car.spendings.push(Spending);
                        })
                    }

                    userCars.push(Car);
                })
            }

            res.status(200).json(userCars)
        })

    } catch (e) {
        console.log(e.message);
        res.status(500).end(e.message);
    }
})

server.get('/getUserPhoto/:photo', async (req, res) => {
    try{
        let photoName = req.params.photo;

        res.sendFile(__dirname + `/photos/users/${photoName}`);
    } catch (e){
        console.log(e.message);
        res.status(500).end(e.message);
    }
})

server.get('/getCarPhoto/:photo', async (req, res) => {
    try{
        let photoName = req.params.photo;

        res.sendFile(__dirname + `/photos/cars/${photoName}`);
    } catch (e){
        console.log(e.message);
        res.status(500).end(e.message);
    }
})

server.get('/getCars', async (req, res) => {
    try{
        const getCars = new Promise((resolve, reject) => {
            const sql = "SELECT * FROM diplom.car;";

            let cars = [];

            connection.query(sql, (err, result) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    result.forEach((car) => cars.push({
                        id: car.idcar,
                        mark: car.mark,
                        model: car.model,
                        year_from: car['year-from'].toString(),
                        year_to: car['year-to'] === 0 ? "наст. вр." : car['year-to'].toString(),
                        generation: car.generation === "" ? "I" : car.generation,
                        petrol_type: car['petrol-type']
                    }));
                    resolve(cars);
                }
            })
        })

        getCars.then((result) => {
            console.log(result);
            res.status(200).json(result);
        }).catch((result) => {
            console.log(result.message);
            res.status(500).end(result.message);
        })
    } catch (e) {
        console.log(e.toString());
        res.status(500).end(e.toString());
    }
})

server.post('/authAdmin', express.json(), async (req, res) => {
    const {login, pass} = req.body;

    if(login === 'admin' && pass === 'admin'){
        res.status(200).json({auth : "Ok"});
    } else {
        res.status(401).json({auth : "No"});
    }
})

server.post('/addCar', express.json(), async (req, res) => {
    const {mark, model, year_from, year_to, generation, petrol_type, services = [] } = req.body;

    const addCar = new Promise((resolve, reject) => {
        const sql = "INSERT INTO `diplom`.`car` (`mark`, `model`, `year-from`, `year-to`, `generation`, `petrol-type`) VALUES ( '"
            + mark + "', '" + model + "', '" + year_from + "', '" + year_to + "', '" + generation + "', '" + petrol_type + "');";

        connection.query(sql, (err, result) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                resolve(result);
            }
        })
    })

    const addServices = (service, carId) => new Promise((resolve, reject) => {
        const sql = "INSERT INTO `diplom`.`service` (`title`, `period`, `car_idcar`) VALUES ('"
            + service.title + "','" + service.period + "','" + carId + "')"

        connection.query(sql, (err, result) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                resolve(result);
            }
        })
    })


    if(!!mark && !!model && !!year_from && !!year_to && !!generation && !!petrol_type){
        try{
            addCar.then(async (result) => {
                const idCar = result.insertId;

                if (services.length !== 0) {
                    for (const service in services) {
                        await addServices(services[service], idCar).then((Result) => {
                            if(!Result.insertId){
                                res.status(500).end("Error insert data");
                                return;
                            }
                        }).catch((result) => {
                            console.log(result.message);
                            res.end(result.message);
                            return;
                        })
                    }
                }

                res.status(200).json({id: idCar});

            }).catch((result) => {
                console.log(result.message);
                res.end(result.message);
            })
        } catch (e){
            console.log(e.toString());
            res.status(500).end(e.toString());
        }

    } else {
        res.status(400).json({reason : "no params"});
    }
})

server.delete('/deleteCar/:idCar', async (req, res) => {
    try{
        const id = req.params.idCar;

        const deleteCar = new Promise((resolve, reject) => {
            const sql = "DELETE FROM `diplom`.`car` WHERE (`idCar` = " + id + ");";

            connection.query(sql, (err, result) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        })

        deleteCar.then((result) => {
            console.log(result);
            res.status(200).json({status : "ok"});
        }).catch((result) => {
            console.log(result.message);
            res.end(result.message);
        })
    } catch (e) {
        console.log(e.message);
        res.status(500).end(e.message);
    }
})

server.delete('/deleteUserCar/:idCar', async (req, res) => {
    try{
        const id = req.params.idCar;

        const deleteCar = new Promise((resolve, reject) => {
            const sql = "DELETE FROM `diplom`.`usercar` WHERE (`iduserCar` = " + id + ");";

            connection.query(sql, (err, result) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        })

        deleteCar.then((result) => {
            console.log(result);
            res.status(200).json({status : "ok"});
        }).catch((result) => {
            console.log(result.message);
            res.end(result.message);
        })
    } catch (e) {
        console.log(e.message);
        res.status(500).end(e.message);
    }
})

server.post('/updateUserCar', multer.single('photo'), async (req, res) => {
    const {name, cost, millage, operating_mode, id} = req.body;

    const updateUserCar = (name, cost, millage, operating_mode, idCar) => {
        return  new Promise((resolve, reject) => {
            const sql = `update diplom.usercar set name = '${name}', cost = '${cost}', millage = '${millage}', operating_modes_idoperating_modes = ${operating_mode} where iduserCar = ${idCar};`;

            connection.query(sql, (err, result) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        });
    };

    try{
        if(!name || !cost || !millage || !operating_mode || !id){
            res.status(400).end('Missing data in req');
        } else {
            updateUserCar(name, cost, millage, operating_mode, id).then((result) => {
                console.log(result);
                res.status(200).json({status : "ok"});
            }).catch((result) => {
                console.log(result.message);
                res.end(result.message);
            });
        }
    } catch (e) {
        console.log(e.toString());
        res.status(500).end(e.toString());
    }
})

server.get('/getOperatingModes', async (req, res) => {
    const getModes = new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM diplom.operating_modes;';

        connection.query(sql, (err, result) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                resolve(result);
            }
        })
        }
    )

    try{
        getModes.then((result) => {
            res.status(200).json(result);
        }).catch((result) => {
            console.log(result.message);
            res.status(500).end(result.message);
        });
    } catch (e){
        console.log(e.toString());
        res.status(500).end(e.toString());
    }
})

server.get('/getSpendingTypes', async (req, res) => {
    const getTypes = new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM diplom.spendingtype;';

            connection.query(sql, (err, result) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        }
    )

    try{
        getTypes.then((result) => {
            res.status(200).json(result);
        }).catch((result) => {
            console.log(result.message);
            res.status(500).end(result.message);
        });
    } catch (e){
        console.log(e.toString());
        res.status(500).end(e.toString());
    }
})

server.post('/addRefuelingToUserCar', async (req, res) => {
    const {idCar, type, quality, millage, date} = req.body;

    const addRefueling = new Promise((resolve, reject) => {
        const sql = 'INSERT INTO `diplom`.`refueling` (`date`, `millage`, `fuel_quality`, `petrol-type`, `usercar_iduserCar`)' + ` VALUES ('${date}', '${millage}', '${quality}', '${type}', ${idCar})`;

        connection.query(sql, (err, result) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                resolve(result);
            }
        })
    })

    try{
        if(!idCar || !type || !millage || !quality || !date){
            res.status(400).end('Missing data in req');
        } else {
            addRefueling.then((result) => {
                console.log(result);
                res.status(200).json({status : "ok"});
            }).catch((result) => {
                console.log(result.message);
                res.end(result.message);
            });
        }
    } catch (e) {
        console.log(e.toString());
        res.status(500).end(e.toString());
    }

})

server.post('/addOilChangeToUserCar', async (req, res) => {
    const {idCar, millage, date} = req.body;

    const addOilChange = new Promise((resolve, reject) => {
        const sql = 'INSERT INTO `diplom`.`oil_change` (`date`, `millage`, `usercar_iduserCar`)' + ` VALUES (${date}, ${millage}, ${idCar})`;

        connection.query(sql, (err, result) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                resolve(result);
            }
        })
    })

    try{
        if(!idCar || !millage || !date){
            res.status(400).end('Missing data in req');
        } else {
            addOilChange.then((result) => {
                console.log(result);
                res.status(200).json({status : "ok"});
            }).catch((result) => {
                console.log(result.message);
                res.end(result.message);
            });
        }
    } catch (e) {
        console.log(e.toString());
        res.status(500).end(e.toString());
    }

})

server.get('/getSost/:nm', async (req, res) => {
    const name = req.params.nm;

    if(name === 'Alpina'){
        res.send('1');
    } else if (name === "Acura"){
        res.end("2");
    } else {
        res.end("3");
    }
})

function serverInit(){
    try {
        initCon();
        server.listen(3000, () => {
            console.log(`App listening in 3000`);
        })
    } catch (err){
        console.log("произошла херня");
    }
}

async function initCon(){
    connection.connect( err => {
        if(err) {
            console.log(err);
            throw new Error(err);
        }
        else console.log("Connection - ok");
    })
}






























































