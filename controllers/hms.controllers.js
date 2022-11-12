///controllers/hms.controllers.js
//import models
const db = require("../model/hms.model.js");
const crypto = require("crypto");
const path = require('path');

//genSessionId
const genSessionId = () => {
    return crypto.randomBytes(32).toString('base64');
};

//checkLoginStatus:staffId,sessionId,result(boolean,err)
const checkLoginStatus = (staffId, sessionId, result) => {
    console.log(sessionId);
    db.checkLoginStatus(staffId, sessionId, (err, res) => {

        if (err) {
            console.log("Error checking login status...", err);
            result(null, err);
        }
        else if (res.length > 0) {
            console.log("already logged in...", res);
            result(true, null);
        }
        else {
            console.log("not logged in...", res);
            result(false, null);
        }
    });
};

//createTables
exports.createTables = (req, res) => {
    const tables = [db.createStafftb, db.createPatienttb,
    db.createStocktb, db.createLogintb, db.createAppointmenttb,
    db.createSuppliertb, db.createPurchasetb, db.createAdmissiontb,
    db.createQuerytb, db.createUsagetb, db.createIncrStockQtyTrigger,
    db.createDecrStockQtyTrigger, db.createUpdStockAvailableTrigger];
    let count = 0;
    for (let table of tables) {
        table((err, result) => {
            count++;
            if (err) console.log("error creating table...", err);
            else console.log(`table created...${count}`, result);
            if (count == tables.length) res.send({ respCode: 1 });
        });
    }
};
//login:respCode 0=error, 1=sucessful, 2=invalid login
//3=already logged in
exports.login = (req, res) => {
    checkLoginStatus(req.cookies.staffId, req.cookies.sessionId,
        (isLoggedIn, error) => {
            if (error) {
                res.send({ respCode: 0 });
            }//if(error)
            else if (isLoggedIn === false) {
                const sessionId = genSessionId(); //fix this
                console.log(req.body.staffId, req.body.password);
                db.login(req.body.staffId, req.body.password, sessionId,
                    (err, result) => {
                        if (err) {
                            console.log("Error occurred...", err, sessionId);
                            res.send({ respCode: 0 });
                        }//if
                        else if (result.affectedRows) {
                            console.log(`${req.body.staffId} log in success...`, result);
                            homePageSetup(req.body.staffId, req, res, () => {
                                res.cookie("staffId", req.body.staffId);
                                res.cookie("sessionId", sessionId);
                            });

                        }//else if(result.affectedRows)
                        else {
                            console.log("Invalid credentials...", result);
                            res.send({ respCode: 2 });
                        }
                    });//db.login
            }//else if (isLoggedIn===false)
            else if (isLoggedIn === true) {
                res.send({ respCode: 3 });
            }//else if(isLoggedIn===true)
        });//checkLoginStatus
}


//createAccount
exports.createAccount = (req, res) => {
    checkLoginStatus(req.cookies.staffId, req.cookies.sessionId,
        (isLoggedIn, error) => {

            if (error) {
                res.send({ respCode: 0 });
            }//if(error)
            else if (isLoggedIn === true) {
                saveFile(req.files.image, req.body.firstname, 'public', (fileSaved, myFileName) => {
                    if (fileSaved) {
                        console.log("checked");
                        const firstName = req.body.firstname;
                        const lastName = req.body.lastname;
                        const staffId = firstName + lastName; //fix this
                        const password = staffId;//fix this
                        db.createAccount(staffId.slice(0, 11), password,
                            firstName, lastName, req.body.dateemployed,
                            req.body.designation, req.body.address,
                            req.body.phonenumber, req.body.email,
                            myFileName, req.body.birthday, (err, result) => {
                                if (err) {
                                    console.log("Error occurred...", err);
                                    res.send({ respCode: 0 });
                                }//if
                                else if (result.affectedRows) {
                                    console.log("account created...", staffId);
                                    res.send({ respCode: 1, staffId: staffId });
                                }//else if(result.affectedRows)
                                else {
                                    console.log("staff already exists...", result);
                                    res.send({ respCode: 2 });
                                }
                            }
                        );//db.createAccount
                    }
                    else {
                        console.log("File NOT saved");
                        res.send({ respCode: 0 });
                    }
                });
            }//else if (isLoggedIn===false)
            else if (isLoggedIn === false) {
                res.send({ respCode: 3 });
            }//else if(isLoggedIn===true)
        });//checkLoginStatus
};


//logOut
exports.logOut = (req, res) => {
    checkLoginStatus(req.cookies.staffId, req.cookies.sessionId,
        (isLoggedIn, error) => {
            if (error) {
                res.send({ respCode: 0 });
            }//if(error)
            else if (isLoggedIn === true) {
                db.logOut(req.cookies.staffId, req.cookies.sessionId,
                    (err, result) => {
                        if (err) {
                            console.log("Error occurred...", err);
                            res.send({ respCode: 0 });
                        }//if
                        else if (result.affectedRows) {
                            console.log("logged out...", result);
                            res.clearCookie("staffId");
                            res.clearCookie("sessionId");
                            res.send({ respCode: 1 });
                        }//else if(result.affectedRows)
                        else {
                            console.log("Something is wrong somewhere...", result);
                            res.send({ respCode: 2 });
                        }
                    });//db.login
            }//else if (isLoggedIn===true)
            else if (isLoggedIn === false) {
                console.log("not logged in...");
                res.send({ respCode: 3 });
            }//else if(isLoggedIn===false)
        });//checkLoginStatus
};


//addPatient
exports.addPatient = (req, res) => {
    checkLoginStatus(req.cookies.staffId, req.cookies.sessionId,
        (isLoggedIn, error) => {
            if (error) {
                res.send({ respCode: 0 });
            }//if(error)
            else if (isLoggedIn === true) {
                saveFile(req.files.image, req.body.firstName,
                    'public', (fileSaved, myFileName) => {
                        if (fileSaved) {
                            const patientId = req.body.firstName + req.body.lastName;
                            db.addPatient(patientId.slice(0, 11), req.body.firstName, req.body.lastName,
                                req.body.birthday, req.body.email, req.body.phone,
                                req.body.address, myFileName, (err, result) => {
                                    if (err) {
                                        console.log("Error occurred...", err);
                                        res.send({ respCode: 0 });
                                    }//if
                                    else if (result.affectedRows) {
                                        console.log("patient added...", result);
                                        res.send({ respCode: 1 });
                                    }//else if(result.affectedRows)
                                    else {
                                        console.log("Something is wrong somewhere...", result);
                                        res.send({ respCode: 2 });
                                    }
                                }
                            );//db.addPatient
                        }
                        else {
                            console.log("File NOT saved");
                            res.send({ respCode: 0 });
                        }
                    });
            }//else if (isLoggedIn===true)
            else if (isLoggedIn === false) {
                console.log("not logged in...");
                res.send({ respCode: 3 });
            }//else if(isLoggedIn===false)
        });//checkLoginStatus
};


//admitPatient
exports.admitPatient = (req, res) => {
    checkLoginStatus(req.cookies.staffId, req.cookies.sessionId,
        (isLoggedIn, error) => {
            if (error) {
                res.send({ respCode: 0 });
            }//if(error)
            else if (isLoggedIn === true) {

                db.admitPatient(req.query.patientId, req.query.admittedBy,
                    req.query.healthIssue, (err, result) => {
                        if (err) {
                            console.log("Error occurred...", err);
                            res.send({ respCode: 0 });
                        }//if
                        else if (result.affectedRows) {
                            console.log("patient admitted...", result);
                            res.send({ respCode: 1 });
                        }//else if(result.affectedRows)
                        else {
                            console.log("Something is wrong somewhere...", result);
                            res.send({ respCode: 2 });
                        }
                    });//db.login
            }//else if (isLoggedIn===true)
            else if (isLoggedIn === false) {
                console.log("not logged in...");
                res.send({ respCode: 3 });
            }//else if(isLoggedIn===false)
        });//checkLoginStatus
};

//dischargePatient
exports.dischargePatient = (req, res) => {
    checkLoginStatus(req.cookies.staffId, req.cookies.sessionId,
        (isLoggedIn, error) => {
            if (error) {
                res.send({ respCode: 0 });
            }//if(error)
            else if (isLoggedIn === true) {
                db.dischargePatient(req.query.admissionId, (err, result) => {
                    if (err) {
                        console.log("Error occurred...", err);
                        res.send({ respCode: 0 });
                    }//if
                    else if (result.affectedRows) {
                        console.log("patient discharged...", result);
                        res.send({ respCode: 1 });
                    }//else if(result.affectedRows)
                    else {
                        console.log("Something is wrong somewhere...", result);
                        res.send({ respCode: 2 });
                    }
                });//db.login
            }//else if (isLoggedIn===true)
            else if (isLoggedIn === false) {
                console.log("not logged in...");
                res.send({ respCode: 3 });
            }//else if(isLoggedIn===false)
        });//checkLoginStatus
};

//addSupplier
exports.addSupplier = (req, res) => {
    checkLoginStatus(req.cookies.staffId, req.cookies.sessionId,
        (isLoggedIn, error) => {
            if (error) {
                res.send({ respCode: 0 });
            }//if(error)
            else if (isLoggedIn === true) {
                db.addSupplier(req.body.fullName,
                    req.body.email, req.body.phone, req.body.address,
                    (err, result) => {
                        if (err) {
                            console.log("Error occurred...", err);
                            res.send({ respCode: 0 });
                        }//if
                        else if (result.affectedRows) {
                            console.log("Supplier added...", result);
                            res.send({ respCode: 1 });
                        }//else if(result.affectedRows)
                        else {
                            console.log("Something is wrong somewhere...", result);
                            res.send({ respCode: 2 });
                        }
                    });//db.login
            }//else if (isLoggedIn===true)
            else if (isLoggedIn === false) {
                console.log("not logged in...");
                res.send({ respCode: 3 });
            }//else if(isLoggedIn===false)
        });//checkLoginStatus
};


//restock
exports.restock = (req, res) => {
    checkLoginStatus(req.cookies.staffId, req.cookies.sessionId,
        (isLoggedIn, error) => {
            if (error) {
                res.send({ respCode: 0 });
            }//if(error)
            else if (isLoggedIn === true) {
                /* const stocks = JSON.parse(req.body.stockId);
                const suppliers = JSON.parse(req.body.supplierId);
                console.log('stocks: ', stocks);
                console.log('suppliers: ', suppliers); */
                const stockDataList = JSON.parse(req.body.stockDataList);
                /*  stockDataList.map((item) => {
                     return [item.stockId, item.supplierId,
                     item.qty, item.dateAdded]
                 }); */
                console.log('stocks: ', stockDataList);
                db.restock(/* stocks, suppliers,
                    req.body.qty, req.body.dateAdded, */ stockDataList, (err, result) => {
                    if (err) {
                        console.log("Error occurred...", err);
                        res.send({ respCode: 0 });
                    }//if
                    else if (result.affectedRows) {
                        console.log("stocks added...", result);
                        res.send({ respCode: 1 });
                    }//else if(result.affectedRows)
                    else {
                        console.log("Something is wrong somewhere...", result);
                        res.send({ respCode: 2 });
                    }
                });//db.login
            }//else if (isLoggedIn===true)
            else if (isLoggedIn === false) {
                console.log("not logged in...");
                res.send({ respCode: 3 });
            }//else if(isLoggedIn===false)
        });//checkLoginStatus
};


//setSupplier
exports.setSupplier = (req, res) => {
    checkLoginStatus(req.cookies.staffId, req.cookies.sessionId,
        (isLoggedIn, error) => {
            if (error) {
                res.send({ respCode: 0 });
            }//if(error)
            else if (isLoggedIn === true) {
                /* const stocks = JSON.parse(req.body.stockId);
                const suppliers = JSON.parse(req.body.supplierId);
                console.log('stocks: ', stocks);
                console.log('suppliers: ', suppliers); */
                const stockDataList = JSON.parse(req.body.stockDataList);
                /* stockDataList.map((item) => {
                    return [item.stockId, item.supplierId,
                    item.qty, item.dateAdded]
                }); */
                console.log('stocks: ', stockDataList);
                db.setSupplier(/* stocks, suppliers,
                    req.body.qty, req.body.dateAdded, */ stockDataList, (err, result) => {
                    if (err) {
                        console.log("Error occurred...", err);
                        res.send({ respCode: 0 });
                    }//if
                    else if (result.affectedRows) {
                        console.log("stocks added...", result);
                        res.send({ respCode: 1 });
                    }//else if(result.affectedRows)
                    else {
                        console.log("Something is wrong somewhere...", result);
                        res.send({ respCode: 2 });
                    }
                });//db.login
            }//else if (isLoggedIn===true)
            else if (isLoggedIn === false) {
                console.log("not logged in...");
                res.send({ respCode: 3 });
            }//else if(isLoggedIn===false)
        });//checkLoginStatus
};


//useStock
exports.useStock = (req, res) => {
    checkLoginStatus(req.cookies.staffId, req.cookies.sessionId,
        (isLoggedIn, error) => {
            if (error) {
                res.send({ respCode: 0 });
            }//if(error)
            else if (isLoggedIn === true) {
                db.useStock(req.query.stockId, req.query.qty,
                    req.query.staffId, req.query.dateUsed,
                    req.query.timeUsed, (err, result) => {
                        if (err) {
                            console.log("Error occurred...", err);
                            res.send({ respCode: 0 });
                        }//if
                        else if (result.affectedRows) {
                            console.log("stocks used...", result);
                            res.send({ respCode: 1 });
                        }//else if(result.affectedRows)
                        else {
                            console.log("Something is wrong somewhere...", result);
                            res.send({ respCode: 2 });
                        }
                    });//db.login
            }//else if (isLoggedIn===true)
            else if (isLoggedIn === false) {
                console.log("not logged in...");
                res.send({ respCode: 3 });
            }//else if(isLoggedIn===false)
        });//checkLoginStatus
};

//createAppointment
exports.createAppointment = (req, res) => {
    checkLoginStatus(req.cookies.staffId, req.cookies.sessionId,
        (isLoggedIn, error) => {
            if (error) {
                res.send({ respCode: 0 });
            }//if(error)
            else if (isLoggedIn === true) {
                db.createAppointment(req.body.patientId,
                    req.body.appointmentDate, (err, result) => {
                        if (err) {
                            console.log("Error occurred...", err);
                            res.send({ respCode: 0 });
                        }//if
                        else if (result.affectedRows) {
                            console.log("appointment created...", result);
                            res.send({ respCode: 1 });
                        }//else if(result.affectedRows)
                        else {
                            console.log("Something is wrong somewhere...", result);
                            res.send({ respCode: 2 });
                        }
                    });//db.login
            }//else if (isLoggedIn===true)
            else if (isLoggedIn === false) {
                console.log("not logged in...");
                res.send({ respCode: 3 });
            }//else if(isLoggedIn===false)
        });//checkLoginStatus
};

//cancelAppointment
exports.cancelAppointment = (req, res) => {
    checkLoginStatus(req.cookies.staffId, req.cookies.sessionId,
        (isLoggedIn, error) => {
            if (error) {
                res.send({ respCode: 0 });
            }//if(error)
            else if (isLoggedIn === true) {
                db.cancelAppointment(req.body.appointmentId,
                    (err, result) => {
                        if (err) {
                            console.log("Error occurred...", err);
                            res.send({ respCode: 0 });
                        }//if
                        else if (result.affectedRows) {
                            console.log("appointment canceled...", result);
                            res.send({ respCode: 1 });
                        }//else if(result.affectedRows)
                        else {
                            console.log("Something is wrong somewhere...", result);
                            res.send({ respCode: 2 });
                        }
                    });//db.login
            }//else if (isLoggedIn===true)
            else if (isLoggedIn === false) {
                console.log("not logged in...");
                res.send({ respCode: 3 });
            }//else if(isLoggedIn===false)
        });//checkLoginStatus
};

//removeStaff
exports.removeStaff = (req, res) => {
    checkLoginStatus(req.cookies.staffId, req.cookies.sessionId,
        (isLoggedIn, error) => {
            if (error) {
                res.send({ respCode: 0 });
            }//if(error)
            else if (isLoggedIn === true) {
                db.removeStaff(req.query.staffId, (err, result) => {
                    if (err) {
                        console.log("Error occurred...", err);
                        res.send({ respCode: 0 });
                    }//if
                    else if (result.affectedRows) {
                        console.log("staff removed...", result);
                        res.send({ respCode: 1 });
                    }//else if(result.affectedRows)
                    else {
                        console.log("Something is wrong somewhere...", result);
                        res.send({ respCode: 2 });
                    }
                });//db.login
            }//else if (isLoggedIn===true)
            else if (isLoggedIn === false) {
                console.log("not logged in...");
                res.send({ respCode: 3 });
            }//else if(isLoggedIn===false)
        });//checkLoginStatus
};

//queryStaff
exports.queryStaff = (req, res) => {
    checkLoginStatus(req.cookies.staffId, req.cookies.sessionId,
        (isLoggedIn, error) => {
            if (error) {
                res.send({ respCode: 0 });
            }//if(error)
            else if (isLoggedIn === true) {
                db.queryStaff(req.query.staffId, req.query.query,
                    req.query.dateQueried, req.query.queriedBy,
                    (err, result) => {
                        if (err) {
                            console.log("Error occurred...", err);
                            res.send({ respCode: 0 });
                        }//if
                        else if (result.affectedRows) {
                            console.log("staff queried...", result);
                            res.send({ respCode: 1 });
                        }//else if(result.affectedRows)
                        else {
                            console.log("Something is wrong somewhere...", result);
                            res.send({ respCode: 2 });
                        }
                    });//db.login
            }//else if (isLoggedIn===true)
            else if (isLoggedIn === false) {
                console.log("not logged in...");
                res.send({ respCode: 3 });
            }//else if(isLoggedIn===false)
        });//checkLoginStatus
};

//replyQuery
exports.replyQuery = (req, res) => {
    checkLoginStatus(req.cookies.staffId, req.cookies.sessionId,
        (isLoggedIn, error) => {
            if (error) {
                res.send({ respCode: 0 });
            }//if(error)
            else if (isLoggedIn === true) {
                db.replyQuery(req.query.queryId, req.query.reply,
                    (err, result) => {
                        if (err) {
                            console.log("Error occurred...", err);
                            res.send({ respCode: 0 });
                        }//if
                        else if (result.affectedRows) {
                            console.log("query replied...", result);
                            res.send({ respCode: 1 });
                        }//else if(result.affectedRows)
                        else {
                            console.log("Something is wrong somewhere...", result);
                            res.send({ respCode: 2 });
                        }
                    });//db.login
            }//else if (isLoggedIn===true)
            else if (isLoggedIn === false) {
                console.log("not logged in...");
                res.send({ respCode: 3 });
            }//else if(isLoggedIn===false)
        });//checkLoginStatus
};

//createStock
exports.createStock = (req, res) => {
    checkLoginStatus(req.cookies.staffId, req.cookies.sessionId,
        (isLoggedIn, error) => {
            if (error) {
                res.send({ respCode: 0 });
            }//if(error)
            else if (isLoggedIn === true) {
                db.createStock(req.body.name,
                    req.body.description, req.body.price,
                    (err, result) => {
                        if (err) {
                            console.log("Error occurred...", err);
                            res.send({ respCode: 0 });
                        }//if
                        else if (result.affectedRows) {
                            console.log("stocks created...", result);
                            res.send({ respCode: 1 });
                        }//else if(result.affectedRows)
                        else {
                            console.log("Something is wrong somewhere...", result);
                            res.send({ respCode: 2 });
                        }
                    });//db.login
            }//else if (isLoggedIn===true)
            else if (isLoggedIn === false) {
                console.log("not logged in...");
                res.send({ respCode: 3 });
            }//else if(isLoggedIn===false)
        });//checkLoginStatus
};

//physicianHomePage
const physicianHomePage = (staffId, req, res, callback) => {
    //physician homepage needs staffId,
    //appointments(appointmentId,patientId,firstName,lastName)
    // let physicianApp = [{ 'firstName': 'John', 'lastName': 'Sam', 'appointmentId': 34, 'patientId': 'ydh' },
    // { 'firstName': 'John', 'lastName': 'Paul', 'appointmentId': 56, 'patientId': 'ydh' }];
    //data={staffId:'', physicianApp:[]};

    db.getMyAppointments(staffId, (err, result) => {
        if (err) {
            console.log("error...", err);
            res.send({ respCode: 0 });
        }
        else {
            console.log("Found...", result);
            callback();
            const finalResult = { respCode: 1, data: { 'user': 2, 'staffId': staffId, 'appointments': result } }
            console.log(finalResult);
            res.send(finalResult);
        }
    });//db.physicianHomePage
}//close

//administratorHomePage
const administratorHomePage = (staffId, req, res, callback) => {
    callback();
    const finalResult = { respCode: 1, data: { 'user': 1, 'staffId': staffId } }
    console.log(finalResult);
    res.send(finalResult);
};

//storeKeeperHomePage
const storeKeeperHomePage = (staffId, req, res, callback) => {
    callback();
    const finalResult = { respCode: 1, data: { 'user': 3, 'staffId': staffId } };
    console.log(finalResult);
    res.send(finalResult);
};


//receptionistHomePage
const receptionistHomePage = (staffId, req, res, callback) => {
    //receptionist's homepage needs staffId,
    //appointments(appointmentId,patientId,firstName,lastName)
    //let receptionistApp = [{'appointmentId':22, 'patientId': 'hhdjj',
    // 'firstName': 'John', 'lastName': 'Sam' },
    //{'appointmentId':43, 'patientId': 'hhhjhdjj', 'firstName': 'John',
    // 'lastName': 'Paul' }];
    //{'staffId':'','appointments':[]}
    db.getTodayAppointments((err, result) => {
        if (err) {
            console.log("error...", err);
            res.send({ respCode: 0 });
        }
        else {
            console.log("Found...", result);
            callback();
            const finalResult = { respCode: 1, data: { 'user': 0, 'staffId': staffId, 'appointments': result } };
            console.log(finalResult);
            res.send(finalResult);
        }
    });//db.physicianHomePage
};


//homePageSetup
const homePageSetup = (staffId, req, res, callback) => {
    console.log(staffId);
    //get designation
    //result should be [{'designation':'sth'}]
    db.getDesignation(staffId, (err, resp) => {

        if (err) {
            res.send({ respCode: 0 });
        }
        else {

            const homePages = {
                'physician': physicianHomePage,
                'receptionist': receptionistHomePage,
                'storeKeeper': storeKeeperHomePage,
                'administrator': administratorHomePage
            };
            //call controller function for the designation
            //to fetch required data from database
            console.log(resp);
            homePages[resp[0].designation](staffId, req, res, callback);
        }
    });
}


//entryPoint
exports.entryPoint = (req, res) => {
    const staffId = req.cookies.staffId;
    console.log('called');
    checkLoginStatus(staffId, req.cookies.sessionId,
        (isLoggedIn, error) => {
            if (error) {
                res.send({ respCode: 0 });
            }//if(error)
            else if (isLoggedIn === true) {
                homePageSetup(staffId, req, res, () => { });
            }//else if (isLoggedIn===true)
            else if (isLoggedIn === false) {
                console.log("not logged in...");
                res.send({ respCode: 2 });
            }//else if(isLoggedIn===false)
        });//checkLoginStatus
};

//findStaff
exports.findStaff = (req, res) => {
    db.findStaff(req.query.name,
        (err, result) => {
            if (err) {
                console.log("Error occurred...", err);
                res.send({ respCode: 0, data: [] });
            }//if
            else if (result.length) {
                console.log("...", result);
                res.send({ respCode: 1, data: result });
            }//else if(result.affectedRows)
            else {
                console.log("Nothing happened...", result);
                res.send({ respCode: 2, data: [] });
            }
        });//db.login
};

//findPatient
exports.findPatient = (req, res) => {
    db.findPatient(req.query.lastName,
        (err, result) => {
            if (err) {
                console.log("Error occurred...", err);
                res.send({ respCode: 0, data: [] });
            }//if
            else if (result.length) {
                console.log("...", result);
                res.send({ respCode: 1, data: result });
            }//else if(result.affectedRows)
            else {
                console.log("Nothing happened...", result);
                res.send({ respCode: 2, data: [] });
            }
        });//db.login
};

//findSupplier
exports.findSupplier = (req, res) => {
    db.findSupplier(req.query.fullName,
        (err, result) => {
            if (err) {
                console.log("Error occurred...", err);
                res.send({ respCode: 0, data: [] });
            }//if
            else if (result.length) {
                console.log("...", result);
                res.send({ respCode: 1, data: result });
            }//else if(result.affectedRows)
            else {
                console.log("Nothing happened...", result);
                res.send({ respCode: 2, data: [] });
            }
        });//db.login

};


//findStock
exports.findStock = (req, res) => {
    db.findStock(req.query.name,
        (err, result) => {
            if (err) {
                console.log("Error occurred...", err);
                res.send({ respCode: 0, data: [] });
            }//if
            else if (result.length) {
                console.log("...", result);
                res.send({ respCode: 1, data: result });
            }//else if(result.affectedRows)
            else {
                console.log("Nothing happened...", result);
                res.send({ respCode: 2, data: [] });
            }
        });//db.login

};


//getTodayAppointments
exports.getTodayAppointments = (req, res) => {
    checkLoginStatus(req.cookies.staffId, req.cookies.sessionId,
        (isLoggedIn, error) => {
            if (error) {
                res.send({ respCode: 0 });
            }//if(error)
            else if (isLoggedIn === true) {
                db.getTodayAppointments((err, result) => {
                    if (err) {
                        console.log("Error occurred...", err);
                        res.send({ respCode: 0, data: [] });
                    }//if
                    else if (result.length) {
                        console.log("...", result);
                        res.send({ respCode: 1, data: result });
                    }//else if(result.affectedRows)
                    else {
                        console.log("Nothing happened...", result);
                        res.send({ respCode: 2, data: [] });
                    }
                });//db.getTodayAppointments
            }//else if (isLoggedIn===true)
            else if (isLoggedIn === false) {
                console.log("not logged in...");
                res.send({ respCode: 3 });
            }//else if(isLoggedIn===false)
        });//checkLoginStatus
};


//getMyAppointments
exports.getMyAppointments = (req, res) => {
    checkLoginStatus(req.cookies.staffId, req.cookies.sessionId,
        (isLoggedIn, error) => {
            if (error) {
                res.send({ respCode: 0 });
            }//if(error)
            else if (isLoggedIn === true) {
                db.getMyAppointments(req.query.staffId,
                    (err, result) => {
                        if (err) {
                            console.log("Error occurred...", err);
                            res.send({ respCode: 0, data: [] });
                        }//if
                        else if (result.length) {
                            console.log("...", result);
                            res.send({ respCode: 1, data: result });
                        }//else if(result.affectedRows)
                        else {
                            console.log("Nothing happened...", result);
                            res.send({ respCode: 2, data: [] });
                        }
                    });//db.getMyAppointments
            }//else if (isLoggedIn===true)
            else if (isLoggedIn === false) {
                console.log("not logged in...");
                res.send({ respCode: 3 });
            }//else if(isLoggedIn===false)
        });//checkLoginStatus
};

//getReqItems
exports.getReqItems = (req, res) => {
    checkLoginStatus(req.cookies.staffId, req.cookies.sessionId,
        (isLoggedIn, error) => {
            if (error) {
                res.send({ respCode: 0 });
            }//if(error)
            else if (isLoggedIn === true) {
                db.getReqItems(req.body.patientId,
                    (err, result) => {
                        if (err) {
                            console.log("Error occurred...", err);
                            res.send({ respCode: 0, data: [] });
                        }//if
                        else {
                            console.log("...", result);
                            res.send({ respCode: 1, data: result });
                        }
                    });//db.getMyAppointments
            }//else if (isLoggedIn===true)
            else if (isLoggedIn === false) {
                console.log("not logged in...");
                res.send({ respCode: 3 });
            }//else if(isLoggedIn===false)
        });//checkLoginStatus
};

//makeReport
exports.makeReport = (req, res) => {
    checkLoginStatus(req.cookies.staffId, req.cookies.sessionId,
        (isLoggedIn, error) => {
            if (error) {
                res.send({ respCode: 0 });
            }//if(error)
            else if (isLoggedIn === true) {
                const treatment = JSON.parse(req.body.treatment);
                const appointmentId = req.body.appointmentId;

                db.makeReport(
                    req.body.diagnosis, req.body.findings,
                    appointmentId, treatment,
                    (err, result) => {
                        if (err) {
                            console.log("Error occurred...", err);
                            res.send({ respCode: 0 });
                        }//if
                        else if (result.affectedRows) {
                            console.log("...", result);
                            res.send({ respCode: 1 });
                        }//else if(result.affectedRows)
                        else {
                            console.log("Nothing happened...", result);
                            res.send({ respCode: 2 });
                        }
                    });//db.makeReport
            }//else if (isLoggedIn===true)
            else if (isLoggedIn === false) {
                console.log("not logged in...");
                res.send({ respCode: 3 });
            }//else if(isLoggedIn===false)
        });//checkLoginStatus
};

//issueReqItems
exports.issueReqItems = (req, res) => {
    checkLoginStatus(req.cookies.staffId, req.cookies.sessionId,
        (isLoggedIn, error) => {
            if (error) {
                res.send({ respCode: 0 });
            }//if(error)
            else if (isLoggedIn === true) {
                db.issueReqItems(
                    req.body.appointmentId, req.body.stockId,
                    (err, result) => {
                        if (err) {
                            console.log("Error occurred...", err);
                            res.send({ respCode: 0 });
                        }//if
                        else if (result.length) {
                            console.log("...", result);
                            res.send({ respCode: 1 });
                        }//else if(result.affectedRows)
                        else {
                            console.log("Nothing happened...", result);
                            res.send({ respCode: 2 });
                        }
                    });//db.issueReqItems
            }//else if (isLoggedIn===true)
            else if (isLoggedIn === false) {
                console.log("not logged in...");
                res.send({ respCode: 3 });
            }//else if(isLoggedIn===false)
        });//checkLoginStatus
};


//issueItems
exports.issueItems = (req, res) => {
    checkLoginStatus(req.cookies.staffId, req.cookies.sessionId,
        (isLoggedIn, error) => {
            if (error) {
                res.send({ respCode: 0 });
            }//if(error)
            else if (isLoggedIn === true) {
                const items = JSON.parse(req.body.issuedItems)
                db.issueItems(
                    items,
                    (err, result) => {
                        if (err) {
                            console.log("Error occurred...", err);
                            res.send({ respCode: 0 });
                        }//if
                        else if (result.affectedRows) {
                            console.log("...", result);
                            res.send({ respCode: 1 });
                        }//else if(result.affectedRows)
                        else {
                            console.log("Nothing happened...", result);
                            res.send({ respCode: 2 });
                        }
                    });//db.issueReqItems
            }//else if (isLoggedIn===true)
            else if (isLoggedIn === false) {
                console.log("not logged in...");
                res.send({ respCode: 3 });
            }//else if(isLoggedIn===false)
        });//checkLoginStatus
};

//getMedicalReports
exports.getMedicalReports = (req, res) => {
    checkLoginStatus(req.cookies.staffId, req.cookies.sessionId,
        (isLoggedIn, error) => {
            if (error) {
                res.send({ respCode: 0 });
            }//if(error)
            else if (isLoggedIn === true) {
                db.getMedicalReports(req.body.patientId,
                    (err, result) => {
                        if (err) {
                            console.log("Error occurred...", err);
                            res.send({ respCode: 0, data: [] });
                        }//if
                        else if (result.length) {
                            console.log("...", result);
                            res.send({ respCode: 1, data: result });
                        }//else if(result.affectedRows)
                        else {
                            console.log("Nothing happened...", result);
                            res.send({ respCode: 2, data: result });
                        }
                    });//db.getMedicalReports
            }//else if (isLoggedIn===true)
            else if (isLoggedIn === false) {
                console.log("not logged in...");
                res.send({ respCode: 3 });
            }//else if(isLoggedIn===false)
        });//checkLoginStatus
};

//getPatientBio
exports.getPatientBio = (req, res) => {
    checkLoginStatus(req.cookies.staffId, req.cookies.sessionId,
        (isLoggedIn, error) => {
            if (error) {
                res.send({ respCode: 0 });
            }//if(error)
            else if (isLoggedIn === true) {
                db.getPatientBio(req.body.patientId,
                    (err, result) => {
                        if (err) {
                            console.log("Error occurred...", err);
                            res.send({ respCode: 0, data: [] });
                        }//if
                        else if (result.length) {
                            console.log("...", result);
                            res.send({ respCode: 1, data: result });
                        }//else if(result.affectedRows)
                        else {
                            console.log("Nothing happened...", result);
                            res.send({ respCode: 2, data: result });
                        }
                    });//db.getPatientBio
            }//else if (isLoggedIn===true)
            else if (isLoggedIn === false) {
                console.log("not logged in...");
                res.send({ respCode: 3 });
            }//else if(isLoggedIn===false)
        });//checkLoginStatus
};

//getPatientRecord
exports.getPatientRecord = (req, res) => {
    let record = {};
    checkLoginStatus(req.cookies.staffId, req.cookies.sessionId,
        (isLoggedIn, error) => {
            if (error) {
                res.send({ respCode: 0 });
            }//if(error)
            else if (isLoggedIn === true) {
                db.getPatientBio(req.body.patientId,
                    (err, result) => {
                        if (err) {
                            console.log("Error occurred...", err);
                            res.send({ respCode: 0, data: [] });
                        }//if
                        else if (result.length) {
                            console.log("...", result);
                            record['bioData'] = result;
                            db.getMedicalReports(req.body.patientId,
                                (err, result) => {
                                    if (err) {
                                        console.log("Error occurred...", err);
                                        res.send({ respCode: 0, data: [] });
                                    }//if
                                    else {
                                        console.log("...", result);
                                        record['medicalRecord'] = result;
                                        console.log("full record:", record);
                                        res.send({ respCode: 1, data: record });
                                    }//else if(result.affectedRows)

                                });//db.getMyAppointments
                        }//else if(result.affectedRows)
                        else {
                            console.log("Nothing happened...", result);
                            res.send({ respCode: 2, data: [] });
                        }
                    });//db.getMyAppointments
            }//else if (isLoggedIn===true)
            else if (isLoggedIn === false) {
                console.log("not logged in...");
                res.send({ respCode: 3 });
            }//else if(isLoggedIn===false)
        });//checkLoginStatus
};

//getStaffRecord
exports.getStaffRecord = (req, res) => {
    checkLoginStatus(req.cookies.staffId, req.cookies.sessionId,
        (isLoggedIn, error) => {
            if (error) {
                res.send({ respCode: 0 });
            }//if(error)
            else if (isLoggedIn === true) {
                console.log(req.body.staffId);
                db.getStaffRecord(req.body.staffId,
                    (err, result) => {
                        if (err) {
                            console.log("Error occurred...", err);
                            res.send({ respCode: 0, data: [] });
                        }//if
                        else {
                            console.log("...", result);
                            res.send({ respCode: 1, data: result });
                        }
                    });//db.getStaffBio
            }//else if (isLoggedIn===true)
            else if (isLoggedIn === false) {
                console.log("not logged in...");
                res.send({ respCode: 3 });
            }//else if(isLoggedIn===false)
        });//checkLoginStatus
};

//getSupplierRecord
exports.getSupplierRecord = (req, res) => {
    checkLoginStatus(req.cookies.staffId, req.cookies.sessionId,
        (isLoggedIn, error) => {
            if (error) {
                res.send({ respCode: 0 });
            }//if(error)
            else if (isLoggedIn === true) {
                console.log(req.body.supplierId);
                db.getSupplierRecord(req.body.supplierId,
                    (err, result) => {
                        if (err) {
                            console.log("Error occurred...", err);
                            res.send({ respCode: 0, data: [] });
                        }//if
                        else {
                            console.log("...", result);
                            res.send({ respCode: 1, data: result });
                        }
                    });//db.getStaffBio
            }//else if (isLoggedIn===true)
            else if (isLoggedIn === false) {
                console.log("not logged in...");
                res.send({ respCode: 3 });
            }//else if(isLoggedIn===false)
        });//checkLoginStatus
};


//uploadFile

const saveFile = (myFile, firstname, folder, callback) => {
    if (myFile) {
        console.log('starting file upload...');
        const myFileExt = path.extname(myFile.name);
        const myFileName = firstname + myFile.md5.slice(0, 10) + myFileExt;
        const uploadPath = path.join(__dirname, '..', folder, myFileName);
        myFile.mv(uploadPath, (error) => {
            console.log('file found...');
            if (!error) {
                console.log('file uploaded...');
                callback(true, myFileName);
            }
            else {
                console.log('file upload FAILED...', error);
                callback(false, null);
            }

        });
    }
    //no file uploaded
    else {
        console.log('no file uploaded...');
        callback(false, null);
    }
};
