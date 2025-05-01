const express = require(`express`);
const cors = require(`cors`);
const db = require(`./Utils/database`);
const bodyParser = require(`body-parser`);
const jwt = require('jsonwebtoken'); 
const { scheduleTasks }= require(`./Cron/task-cron`);

const Admin = require(`./Models/admin-model`);
const Users = require(`./Models/users-model`);
const Staff = require(`./Models/staffs-model`);
const Reviews = require(`./Models/reviews-model`);
const Revenue = require(`./Models/revenue-model`);
const Services = require(`./Models/services-model`);
const Appointments = require(`./Models/appointments-model`);
const StaffService = require(`./Models/staff-service-model`);

const authRouter = require(`./Routes/auth-router`);
const staffRouter = require(`./Routes/staff-router`);
const reviewRouter = require(`./Routes/review-router`);
const serviceRouter = require(`./Routes/service-router`);
const paymentRouter = require(`./Routes/payment-router`);
const appointmentRouter = require(`./Routes/appointment-router`);
const { sendMail } = require('./Utils/mail-service');


require('dotenv').config();

const PORT = process.env.PORT || 3000;

if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.JWT_SECRET_KEY || !process.env.API_URL) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const app = express();

  const corsOptions = {
      origin: "*", // Replace with your frontend URL in production 
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    };
  
  
app.use(cors(corsOptions));
app.use(bodyParser.json());


/* ----------API Routes---------- */

app.use(`${process.env.API_URL}/auth`, authRouter);
app.use(`${process.env.API_URL}/staff`, staffRouter);
app.use(`${process.env.API_URL}/review`, reviewRouter);
app.use(`${process.env.API_URL}/payment`, paymentRouter);
app.use(`${process.env.API_URL}/service`, serviceRouter);
app.use(`${process.env.API_URL}/appointment`, appointmentRouter);


/* --------------User Associations---------------- */

Users.hasMany(Appointments, { foreignKey: `userId`, onDelete: `CASCADE` });
Appointments.belongsTo(Users, { foreignKey: `userId`});

Users.hasMany(Reviews, { foreignKey: `userId`, onDelete: `CASCADE` });
Reviews.belongsTo(Users, { foreignKey: `userId` });


/* --------------Staff Associations---------------- */

Staff.hasMany(Appointments, { foreignKey: `staffId`, onDelete: `RESTRICT` });
Appointments.belongsTo(Staff, { foreignKey: `staffId`});

Staff.hasMany(Reviews, { foreignKey: `staffId`, onDelete: `CASCADE` });
Reviews.belongsTo(Staff, { foreignKey: `staffId` });

Staff.belongsToMany(Services, { through: StaffService, foreignKey: `staffId` });
Services.belongsToMany(Staff, { through: StaffService, foreignKey: `serviceId` });


/* --------------Service Associations---------------- */

Services.hasMany(Appointments, { foreignKey: `serviceId`, onDelete: `RESTRICT` });
Appointments.belongsTo(Services, { foreignKey: `serviceId`});


/* --------------Appointments Associations---------------- */

//Each appointment will be unique to a user hence only one review per user
Appointments.hasOne(Reviews, { foreignKey: `appointmentsId`, onDelete: `CASCADE` });
Reviews.belongsTo(Appointments, { foreignKey: `appointmentsId` });

//TODO:create admin and revenue data

/* async function createData() {
  await Admin.create({
    id: 172,
    name : 'shivi',
    email: 'shivi.admin@appointwell.com',
    password: 'shivi#admin@27'
  })
  
  await Revenue.create({
    totalRevenue : 12000,
    hairServiceRevenue : 5000,
    nailServiceRevenue : 2000,
    skincareServiceRevenue : 3000,
    makeupServiceRevenue : 2000,
    totalRefunds : 0
  })
}
createData() */

// Test email with proper parameters
/* sendMail(
    "Test User",
    "raajaag14@gmail.com",
    "Test Subject",
    "Confirmed",
    {
        serviceName: "Test Service",
        date: "2024-05-01",
        startTime: "10:00 AM",
        staffName: "Test Staff",
        price: "₹500"
    }
)s
.then(response => {
    console.log('Email response:', response);
})
.catch(error => {
    console.error('Email error:', error);
}); */

/* -------Sync the database------- */

db.sync(/* { force : true } */)
  .then(() => {
    console.log(`Connected with DB!`);
    /* --------------CRON JOB--------------- */
    /* scheduleTasks(); */
    app.listen(PORT, () => console.log(`Server running @ PORT:${PORT}`));
  })
  .catch((err) => {
    console.log(err);
  });