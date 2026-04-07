const  express=require("express");
const cors=require("cors");
const dbconnect=require('./config/database')
const authRoutes=require('./routes/auth');
const bookingRoutes=require('./routes/booking');
const eventRoutes=require('./routes/event');

require("dotenv").config();
const app=express();
app.use(cors());
app.use(express.json());



//routes
app.use('/api/auth',authRoutes);
app.use('/api/events',eventRoutes);
app.use('/api/bookings',bookingRoutes);

dbconnect();

const PORT=process.env.PORT ||5000



app.listen(PORT,()=>{
  console.log(`server is running on port ${PORT}`)
})