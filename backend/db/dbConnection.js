var mongoose = require("mongoose");

mongoose.set("strictQuery", false);
// var OnlinemmongoDBURL = 'mongodb+srv://25rohitkumar:Rohit2512@cluster0.vn8uypl.mongodb.net/?retryWrites=true&w=majority';
var mongoDBURL = process.env.MONGOURL;
console.log(mongoDBURL);  
mongoose
  .connect(mongoDBURL, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10000, // Wait max 10s before fail
  })
  .then(() => {
    console.log("Connection Established to dataBase");
  })
  .catch((err) => console.log(err));
