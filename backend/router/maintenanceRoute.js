const express = require('express');
const router = express.Router();
const maintenanceController = require("../controller/maintenanceController");

// Routes
router.post('/', maintenanceController.createTask);
router.get('/', maintenanceController.getAllTasks);
router.put('/:id', maintenanceController.updateTask);
router.delete('/:id', maintenanceController.deleteTask);

module.exports = router;