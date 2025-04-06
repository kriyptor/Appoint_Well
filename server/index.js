const express = require(`express`);
const cors = require(`cors`);
const db = require(`./Utils/database`);
const bodyParser = require(`body-parser`);
const jwt = require('jsonwebtoken'); 

const Users = require(`./Models/usersModel`);
const Reviews = require(`./Models/reviewsModel`);
const Staff = require(`./Models/staffsModel`);
const Services = require(`./Models/servicesModel`);
const Appointments = require(`./Models/appointmentsModel`);
const StaffService = require(`./Models/staffServiceModel`);
const { request } = require('http');
const userRouter = require(`./Routes/users-router`);

require('dotenv').config();

const PORT = process.env.PORT || 4000;

if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.JWT_SECRET_KEY ||!process.env.API_URL) {
    console.error('Missing required environment variables');
    process.exit(1);
  }

  const app = express();

  const corsOptions = {
      origin: "*", // Replace with your frontend URL in production 
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    };
  
  
  app.use(cors(corsOptions));
  app.use(bodyParser.json());


  /* ----------API Routes---------- */
  app.use(`${process.env.API_URL}/user`, userRouter);

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

Services.hasMany(Reviews, { foreignKey: `servicesId`, onDelete: `CASCADE` });
Reviews.belongsTo(Services, { foreignKey: `servicesId` });


/* --------------Appointments Associations---------------- */

//Each appointment will be unique to a user hence only one review per user
Appointments.hasOne(Reviews, { foreignKey: `appointmentsId`, onDelete: `CASCADE` });
Reviews.belongsTo(Appointments, { foreignKey: `appointmentsId` });



//sync the database
db.sync(/* { force : true } */)
.then(() => {
    console.log(`Connected with DB!`);
    app.listen(PORT, () => console.log(`Server running @ PORT:${PORT}`));
}).catch((err) => {
    console.log(err)
})