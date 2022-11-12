///model/hms.model.js
//import connection
const sql = require("./hms.db.js");
///create tables ///
//createLogintb:staffId(fk),sessionId(pk),dateLogged,timeLogged
exports.createLogintb = (result) => {
    sql.query("create table if not exists logintb(sessionId varchar(64),\
    staffId varchar(12), dateLogged date default(current_date),\
    timeLogged time default(current_time), primary key(sessionId),\
    index (staffId), foreign key(staffId) references stafftb(staffId)\
    on delete cascade on update cascade)", result);
};
//createPatienttb:patientId(pk),firstName,lastName,birthday,
//dateRegistered,timeRegistered,email,phone,address,image,
//createdBy(fk)
exports.createPatienttb = (result) => {
    sql.query("create table if not exists patienttb(patientId varchar(12),\
    firstName varchar(20), lastName varchar (20), birthday date,\
    dateRegistered date default(current_date),\
    timeRegistered time default(current_time), email varchar(64),\
    phone varchar(15), address varchar(100), image varchar(30),\
    createdBy varchar(12), primary key(patientId), index (createdBy),\
    foreign key(createdBy) references stafftb(staffId)\
    on update cascade on delete set null)", result);
};
//createStafftb:staffId,firstName,lastName,dateEmployed,
//designation,address,phone, email,birthday,image,
exports.createStafftb = (result) => {
    sql.query("create table if not exists stafftb(staffId varchar(12),\
    password varchar(100),firstName varchar(20),lastName varchar (20), birthday date,\
    dateEmployed date default(current_date), designation varchar(30),\
    email varchar(64), phone varchar(15), address varchar(100),\
    image varchar(30), primary key(staffId))",
        result);
};
//createStocktb:stockId,name,description,qty,price
exports.createStocktb = (result) => {
    sql.query("create table if not exists stocktb(stockId \
    int auto_increment,name varchar(50), description \
    varchar (250),qty int default 0, price float default 0, \
   supplierId int, check(qty>=0),primary key(stockId) )", result);
};
//createAppointmenttb:appointmentId,patientId(fk),doctor(fk),
//appointmentDate, diagnosis, findings,status
exports.createAppointmenttb = (result) => {
    sql.query("create table if not exists appointmenttb(\
    appointmentId int auto_increment, patientId varchar(12),\
    staffId varchar (12), appointmentDate date,\
    diagnosis text, findings text, status varchar(15),\
    primary key(appointmentId), index(patientId),index(doctor),\
    foreign key(patientId) references patienttb(patientId) \
    on delete set null on update cascade,\
    foreign key(doctor)references stafftb(staffId) on update cascade \
    on delete set null)", result);
};
//createSuppliertb:supplierId,fullName,stockId(fk),dateRegistered,timeRegistered,
//email,phone,address
exports.createSuppliertb = (result) => {
    sql.query("create table if not exists suppliertb(supplierId int auto_increment,\
    fullName varchar(40), dateRegistered date default(current_date),\
    timeRegistered time default(current_time), email varchar(64),\
    phone varchar(15), address varchar(100), primary key(supplierId),\
    index(stockId), foreign key(stockId) references stocktb(stockId)\
    on delete cascade on update cascade)", result);
};

//createStockSuppliertb:tableId,supplierId(fk),stockId(fk)
exports.createStockSuppliertb = (result) => {
    sql.query("create table if not exists stockSuppliertb(tableId \
    int auto_increment,supplierId int,stockId int, primary key(tableId),\
    index(stockId),index(supplierId), foreign key(stockId) \
    references stocktb(stockId) on delete set null on update \
    cascade,foreign key(supplierId) references suppliertb(supplierId)\
    on delete set null on update cascade)", result);
};
//createPurchasetb:purchaseId,stockId(fk),supplierId(fk),datePurchased,
//qty
exports.createPurchasetb = (result) => {
    sql.query("create table if not exists purchasetb(\
    purchaseId int auto_increment, stockId int,\
    supplierId int, datePurchased date,qty int,check(qty>=0),\
    primary key(purchaseId), index(stockId),index(supplierId),\
    foreign key(stockId) references stocktb(stockId)on delete \
    set null on update cascade,\
    foreign key(supplierId) references suppliertb(supplierId)\
    on delete set null on update cascade)", result);
};
//createAdmissiontb:admissionId,patientId(fk),staffId(fk),dateAdmitted,
//dateDischarged,healthIssue
exports.createAdmissiontb = (result) => {
    sql.query("create table if not exists admissiontb(\
    admissionId int auto_increment, patientId varchar(12),\
    staffId varchar(12), dateAdmitted date default(current_date),\
    dateDischarged date, healthIssue varchar(100), \
    primary key(admissionId), index(patientId),index(staffId),\
    foreign key(patientId) references patienttb(patientId)\
    on delete cascade on update cascade,foreign key(staffId)\
    references stafftb(staffId) on delete set null on \
    update cascade)", result);
};
//createQuerytb:queryId,staffId(fk),query,reply,dateQueried,dateReplied,
//queriedBy(fk)
exports.createQuerytb = (result) => {
    sql.query("create table if not exists querytb(queryId int auto_increment,\
    staffId varchar(12), query varchar (500), reply varchar(1000),\
    dateQueried date default(current_date), dateReplied date,\
    queriedBy varchar(12),primary key(queryId),\
    index (staffId),index(queriedBy), foreign key(staffId)\
    references stafftb(staffId) on update cascade on delete cascade,\
    foreign key(queriedBy) references stafftb(staffId) on\
    update cascade on delete set null)", result);
};
//createReqItemtb:reqId,stockId,appointmentId,
//qty,issued
exports.createReqItemtb = (result) => {
    sql.query("create table if not exists reqItemtb(reqId int\
    auto_increment, appointmentId varchar(12), stockId int,\
    dateUsed date default(current_date),note varchar(200), timeUsed time\
    default(current_time),qty int,issued boolean default false,\
    check(qty>=0),primary key(reqId),\
    index (appointmentId),index(stockId),\
    foreign key(stockId) references stocktb(stockId)\
    on update cascade on delete set null)", result);
};

/// table triggers///
//incr_stock_qty
exports.createIncrStockQtyTrigger = (result) => {
    sql.query("create trigger if not exists incr_stock_qty\
    after insert on purchasetb for each row begin\
    update stocktb set qty=qty+new.qty where\
    stockId=new.stockId; end;", result);
};
//decr_stock_qty
exports.createDecrStockQtyTrigger = (result) => {
    sql.query("create trigger if not exists decr_stock_qty\
    after update on reqItemtb for each row begin\
    update stocktb set qty=qty-new.qty where stockId=\
    new.stockId;\
    end;", result);
};

///application queries///

//login:staffId,password,sessionId,result
exports.login = (staffId, password, sessionId, result) => {
    sql.query("insert into logintb(staffId,sessionId)\
    select ?,? where exists(select staffId from stafftb where\
    staffId=? and password=?)", [staffId, sessionId,
        staffId, password], result);


    /* (err, res) => {
        if (res.affectedRows > 0) {
            sql.query("select designation from stafftb where staffId=?",
                result);
        }
        else {
            result(err, res);
        }
    }); */
};
//logOut:staffId,sessionId,result
exports.logOut = (staffId, sessionId, result) => {
    sql.query("delete from logintb where staffId=? and\
    sessionId=?", [staffId, sessionId], result);
};
//createAccount:password,firstName,lastName,dateEmployed,
//designation,addresss,phoneNumber,image,birthday
exports.createAccount = (staffId, password, firstName, lastName, dateEmployed,
    designation, addresss, phoneNumber, email, image, birthday, result) => {
    sql.query("insert into stafftb(staffId,password,firstName,lastName,\
    dateEmployed,designation,address,phone,email,image,\
    birthday) values ( ?,?,?,?,?,?,?,?,?,?,?)", [staffId, password, firstName, lastName,
        dateEmployed, designation, addresss, phoneNumber, email, image,
        birthday], result);
};
//addPatient:firstName,lastName,birthday,email, phone,address,
//image,createdBy
exports.addPatient = (patientId, firstName, lastName, birthday,
    email, phone, address, image, result) => {
    sql.query("insert into patienttb(patientId,firstName,lastName,birthday,\
    email, phone,address,image) values ( ?,?,?,?,?,?,?,?)", [patientId, firstName,
        lastName, birthday, email, phone, address, image], result);
};
//admitPatient:patientId,admittedBy,healthIssue
exports.admitPatient = (patientId, admittedBy, healthIssue,
    result) => {
    sql.query("insert into admissiontb(patientId,staffId,\
    healthIssue) values ( ?,?,?)", [patientId, admittedBy,
        healthIssue], result);
};
//dischargePatient:admissionId
exports.dischargePatient = (admissionId, result) => {
    sql.query("update admissiontb set \
    dateDischarged= current_date() where admissionId=?",
        [admissionId], result);
};
//addSupplier:supplierId,fullName,dateRegistered,timeRegistered,
//email,phone,address
exports.addSupplier = (fullName, email, phone, address, result) => {
    sql.query("insert into suppliertb(fullName,email,phone,\
    address) values ( ?,?,?,?)", [fullName, email, phone, address],
        result);
};
//restock:stockId,supplierId,qty,datePurchased
exports.restock = (stockDataList, result) => {
    sql.query("insert into purchasetb(stockId,supplierId,\
            qty,datePurchased) values  ?",
        [stockDataList.map((item) => {
            return [item.stockId, item.supplierId,
            item.qty, item.dateAdded]
        })],
        result);
};


//setSupplier:stockId,supplierId,qty,datePurchased
exports.setSupplier = (stockDataList, result) => {
    sql.query("insert into stockSuppliertb(stockId,supplierId) values ?",
        [stockDataList.map((item) => {
            return [item.stockId, item.supplierId]
        })],
        result);
};


//pharmacy issues items
//useStock:stockId,qty,staffId,dateUsed,timeUsed
exports.useStock = (appointmentId, result) => {
    sql.query("update reqItemtb set issued=? where appointmentId=?",
        [true, appointmentId], result);
};

//doctor request for items 
//reqItem:stockId,qty,staffId,dateUsed,timeUsed
exports.reqItem = (stockId, qty, appointmentId, dateUsed,
    timeUsed, result) => {
    sql.query("insert into reqItemtb(stockId,qty, appointmentId,\
    dateUsed,timeUsed)value (?,?,?,?,?)", [stockId, qty,
        staffId, dateUsed, timeUsed], result);
};

//createAppointment:patientId,appointmentDate
exports.createAppointment = (patientId, appointmentDate,
    result) => {
    sql.query("insert into appointmenttb(patientId,\
    appointmentDate, status)\
    values ( ?,?,?)", [patientId, appointmentDate, "pending"], result);
};
//cancelAppointment:appointmentId
exports.cancelAppointment = (appointmentId, result) => {
    sql.query("update appointmenttb set status= ? \
    where appointmentId=?", ['canceled', appointmentId],
        result);
};
//removeStaff:staffId
exports.removeStaff = (staffId, result) => {
    sql.query("delete from stafftb where staffId=?",
        [staffId], result);
};
//queryStaff:staffId,query,dateQueried,queriedBy
exports.queryStaff = (staffId, query, dateQueried, queriedBy,
    result) => {
    sql.query("insert into querytb(staffId,query,\
    dateQueried,queriedBy) values ( ?,?,?,?)", [staffId,
        query, dateQueried, queriedBy], result);
};
//replyQuery:queryId,reply,dateReplied
exports.replyQuery = (queryId, reply, result) => {
    sql.query("update querytb set reply= ?,\
    dateReplied=current_date() where queryId=?",
        [reply, queryId], result);
};
//createStock:name, description
exports.createStock = (name, description, price, result) => {
    sql.query("insert into stocktb(name, description,price)\
    values ( ?,?,?)", [name, description, price], result);
};
//checkLoginStatus:staffId,sessionId,result(err,res)
exports.checkLoginStatus = (staffId, sessionId, result) => {
    sql.query("select * from logintb where staffId=?\
    and sessionId=?", [staffId, sessionId], result);
};

//getDesignation: staffId, result(err,res)
exports.getDesignation = (staffId, result) => {
    sql.query("select designation from stafftb where staffId = ?",
        [staffId], result);
};

//used to create a physician's home page
//getMyAppointments: staffId, result(err,res)

exports.getMyAppointments = (staffId, result) => {
    sql.query("select appointmenttb.appointmentId,\
    appointmenttb.patientId, patienttb.firstName,patienttb.lastName \
    from appointmenttb inner join patienttb on appointmenttb.patientId=patienttb.patientId \
    and appointmenttb.appointmentDate=current_date and appointmenttb.staffId=?\
     and appointmenttb.status=?",
        [staffId, 'pending'], result);
};


//findStaff:lastname,result(err,res)
exports.findStaff = (name, result) => {
    console.log('^' + name, " staff");
    sql.query("select firstName,lastName,phone,image,staffId from\
     stafftb where lastName regexp ? or firstName regexp ?",
        ['^' + name, '^' + name], result);
};

//findPatient:lastname,result(err,res)
exports.findPatient = (lastname, result) => {
    console.log('^' + lastname, " patient");
    sql.query("select firstName,lastName,phone,image, patientId from patienttb where lastName regexp ?",
        ['^' + lastname], result);
};

//findSupplier:fullName,result(err,res)
exports.findSupplier = (fullName, result) => {
    console.log('^' + fullName, " supplier");
    sql.query("select fullName,phone, supplierId from suppliertb where fullName regexp ?",
        ['^' + fullName], result);
};

//findStock:name,result(err,res)
exports.findStock = (name, result) => {
    console.log('^' + name, " stock");
    sql.query("select name,description,stockId from stocktb where name regexp ?",
        ['^' + name], result);
};

//receptionist
//get all the hospital's appointment for today
//getTodayAppointments:patientId,result(err,res)
exports.getTodayAppointments = (result) => {
    sql.query("select appointmenttb.appointmentDate, appointmenttb.patientId, \
    patienttb.firstName, patienttb.lastName, appointmenttb.appointmentId from \
    appointmenttb inner join patienttb on appointmenttb.appointmentDate= \
    current_date and appointmenttb.status=?", ['pending'], result);
};

//get first and last names of a patient
//getPatientNames:patientId,result(err,res)
exports.getPatientNames = (patientId, result) => {
    sql.query("select firstName,lastName from patienttb where \
    patientId=?",
        [patientId], result);
};


//make report of diagnosis, findings and req items([["rice",23],["beans",53]])
//makeReport: doctor, diagnosis,findings,reqItems,result(err,res)
exports.makeReport = (diagnosis, findings,
    appointmentId, treatment, result) => {
    sql.query("update appointmenttb set diagnosis=?,\
    findings=?, status=? where appointmentId=?",
        [diagnosis, findings, "seen", appointmentId],
        (err, res) => {
            if (err) {
                result(err, res);
            }
            else if (res.affectedRows > 0) {
                console.log(treatment);
                sql.query("insert into reqItemtb(stockId,qty,note,appointmentId) values ?",
                    [treatment.map((item) => {
                        return [item.stockId, Number(item.qty), item.note, Number(appointmentId)]
                    })], result);
            }
            else {
                result(err, res);
            }
        });
};

//pharmacy sell req items to patients
//issueReqItems: appointmentId,stockId,result(err,res)
exports.issueReqItems = (appointmentId, stockId, result) => {
    sql.query("update reqItemtb set issued=? where\
    stockId=? and appointmentId=?", [true, stockId,
        appointmentId], result);
};


//pharmacy sell req items to patients
//issueItems: issuedItems:[reqId,reqId,...],result(err,res)
exports.issueItems = (issuedItems, result) => {
    sql.query("update reqItemtb set issued=? where reqId in (?)",
        [true, issuedItems], result);
};


//get all reports on a patient's previous appointments
//getMedicalReports :patientId,result(err,res)
exports.getMedicalReports = (patientId, result) => {
    sql.query("select appointmentId,appointmentDate,diagnosis,\
    findings, staffId  from appointmenttb\
    where status=? and patientId=?", ["seen", patientId], result);
};

//get all reports on a patient's previous appointments
//getReqItems :patientId,result(err,res)
//{ 'reqId': 23, 'name': 'Rice', 'qty': 35, 'note': 'colored one' },
exports.getReqItems = (patientId, result) => {
    sql.query("select reqItemtb.reqId,stocktb.name,reqItemtb.qty,\
    reqItemtb.note, reqItemtb.dateUsed from reqItemtb inner join stocktb on \
    reqItemtb.stockId=stocktb.stockId \
    where reqItemtb.issued=? and reqItemtb.appointmentId in (\
    select appointmentId from appointmenttb where patientId=?)",
        [false, patientId], result);
};

//get patient's bio data
//getPatientBio :patientId,result(err,res)
exports.getPatientBio = (patientId, result) => {
    sql.query("select firstName,lastName,birthday,\
    dateRegistered, timeRegistered,email,phone,address,\
   image  from patienttb where patientId=?",
        [patientId], result);
};


//get staff's bio data
//getStaffRecord :staffId,result(err,res)
exports.getStaffRecord = (staffId, result) => {
    sql.query("select staffId,firstName,lastName,birthday,\
    dateEmployed, designation,email,phone,address,\
   image  from stafftb where staffId=?",
        [staffId], result);
};


/* 	let bioData = [{'supplierId':45,
    'fullName': 'John company',
   'stocksSupplied':[{'stockName':'Panadol'},
   {'stockName':'Contact Lens'}],
   'address':'25, Sapele road, Benin City',
   'phone':'9838388',
   'email':'yehdh@yehh.hhj'}]; */

//get supplier data
//getSupplierRecord :supplierId,result(err,res)
exports.getSupplierRecord = (supplierId, result) => {
    let data = {};
    let stocks = [];
    sql.query("select supplierId,fullName,\
     email,phone,address \
     from suppliertb where supplierId = ? ",
        [supplierId], (err, res) => {
            if (err) {
                result(err, res);
            }
            else if (res.length) {
                data = res[0];
                sql.query("select name from stocktb where \
                stockId in (select stockId from \
                stockSuppliertb where supplierId=?)",
                    [supplierId], (err, res) => {
                        if (err) {
                            result(err, res);
                        }
                        else {
                            const resp = [{ ...data, 'stocksSupplied': res }]
                            console.log('resp', resp);
                            result(err, resp);
                        }
                    });
            }
            else {
                result(err, res);
            }
        });
};


//createStafftb:staffId,firstName,lastName,dateEmployed,
//designation,address,phone, email,birthday,image,