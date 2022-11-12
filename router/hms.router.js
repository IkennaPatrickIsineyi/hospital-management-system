///router/hms.router.js
//import controllers
const controllers = require("../controllers/hms.controllers.js");
//import Router object from express
const router = require("express").Router();
//entryPoint
router.get("/ad", controllers.entryPoint);
//login
router.post("/login", controllers.login);
//logout
router.get("/logout", controllers.logOut);
//createAccount
router.post("/createAccount", controllers.createAccount);
//addPatient
router.post("/addPatient", controllers.addPatient);
//admitPatient
router.get("/admitPatient", controllers.admitPatient);
//dischargePatient
router.get("/dischargePatient", controllers.dischargePatient);
//addSupplier
router.post("/addSupplier", controllers.addSupplier);
//restock
router.post("/restock", controllers.restock);
//setSupplier
router.post("/setSupplier", controllers.setSupplier);
//useStock
router.get("/useStock", controllers.useStock);
//createAppointment
router.post("/createAppointment", controllers.createAppointment);
//cancelAppointment
router.post("/cancelAppointment", controllers.cancelAppointment);
//removeStaff
router.get("/removeStaff", controllers.removeStaff);
//queryStaff
router.get("/queryStaff", controllers.queryStaff);
//replyQuery
router.get("/replyQuery", controllers.replyQuery);
//createStock
router.post("/createStock", controllers.createStock);
//findStaff
router.get("/findStaff", controllers.findStaff);
//findPatient
router.get("/findPatient", controllers.findPatient);
//findSupplier
router.get("/findSupplier", controllers.findSupplier);
//findStock
router.get("/findStock", controllers.findStock);
//getTodayAppointments
router.get("/getTodayAppointments", controllers.getTodayAppointments);
//getMyAppointments
router.get("/getMyAppointments", controllers.getMyAppointments);
//getPatientRecord
router.post("/getPatientRecord", controllers.getPatientRecord);
//makeReport
router.post("/makeReport", controllers.makeReport);
//getReqItems
router.post("/getReqItems", controllers.getReqItems);
//getStaffRecord
router.post("/getStaffRecord", controllers.getStaffRecord);
//getSupplierRecord
router.post("/getSupplierRecord", controllers.getSupplierRecord);
//issueItems
router.post("/issueItems", controllers.issueItems);
//createTabless
router.get("/admin/createTables", controllers.createTables);

/* //uploadFile
router.post("/uploadStaffImg", controllers.saveFile); */
//export router object
module.exports = router;

/* tests
                    admin/createTables
                    createAccount/?password=ikepass&firstname=iken&lastname=isi&designation=doctor&address=amad street&phonenumber=975735&image=umaiai.jpg&birthday=2002/4/23&dateemployed=2022/4/23
                    login/?staffId=ikenisi&password=ikepass
                    logout/?staffId=ikenisi
                    addPatient/?firstName=sapa&lastName=papa&birthday=2020/5/10&email=iki@kkfl.klk&phone=99404&address=ollumm street&image=jfjfj.jpg
                    admitPatient/?patientId=sapapapa&admittedBy=ikenisi&healthIssue=cancer fucked up
                    dischargePatient/?admissionId=1
                    createStock/?name=mantmol&description=some drugs
                    addSupplier/?fullName=okon ko stores&stockId=1&email=khdlkh@uur.cii&phone=dfhgjhsg&address=ooki street
                    purchaseStock/?stockId=1&supplierId=1&qty=67&dateAdded=2022/4/22
                    useStock/?stockId=1&staffId=ikenisi&qty=300&dateUsed=2022/4/23&timeUsed=5:5:50
                    createAppointment/?patientId=sapapapa&staffId=ikenisi&appointmentDate=2022/4/22&appointmentTime=5:5:50&healthIssue=suor jjd disease
                    cancelAppointment/?appointmentId=1
                    removeStaff/?staffId=ikenisi
                    queryStaff/?staffId=ikenisi&query=you did not work&dateQueried=2022/4/23&queriedBy=ikenisi
                    replyQuery/?queryId=1&reply=I was drunk. LMAO
                    */