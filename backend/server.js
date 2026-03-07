const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const cors = require("cors");

//Middleware
const dotenv = require("dotenv");
dotenv.config();
app.use(express.json());
const globalErrorHandler = require("./utils/errorHandlerMiddleware");

//Routes
const authRoutes = require("./router/userRoute");
const assetRoutes = require("./router/assetRoutes");
const productRoutes = require("./router/productRoute");
const locationRoutes = require("./router/locationRoute");
const maintenanceTaskRoutes = require("./router/maintenanceRoute");
const qrCodeGeneratorRoutes=require("./router/QrCodeRoute");
const vendorRoutes=require("./router/vendorRoutes");
// Load environment variables

const PORT = process.env.PORT || 5000;

// Connect to the database
require("./db/dbConnection");

// Middleware
app.use(cookieParser());
app.use(express.json());

const FrontEnd = "http://localhost:3000";
app.use(
  cors({
    origin: FrontEnd,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

// Routes
app.use("/auth", authRoutes);
app.use("/assets", assetRoutes);
app.use("/qrcode", qrCodeGeneratorRoutes);
app.use("/product", productRoutes);
app.use("/locations", locationRoutes);
app.use("/maintenance-tasks", maintenanceTaskRoutes);
app.use("/vendor", vendorRoutes);


app.get("/", (req, res) => {
  res.send("Hello, Asset Management Backend 🚴");
});

app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
