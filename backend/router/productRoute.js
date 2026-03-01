const express = require("express");
const productController = require("../controller/productController");
const router = express.Router();

router.post("/create_product", productController.createProduct);
router.get("/get_product/:productType", productController.getProduct);
router.patch("/update_product/:productId", productController.updateProduct);
router.delete("/delete_product/:productId", productController.deleteProduct);

module.exports = router;