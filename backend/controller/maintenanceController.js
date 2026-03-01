
const MaintenanceTask = require('../model/maintananceTaskModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Create a new Maintenance Task
exports.createTask = catchAsync(async (req, res, next) => {
    const task = await MaintenanceTask.create(req.body);
    res.status(201).json(task);
});

// Get all Maintenance Tasks with location and asset populated
exports.getAllTasks = catchAsync(async (req, res, next) => {
    const tasks = await MaintenanceTask.find()
        .populate('Location')
        .populate('Asset');
    res.status(200).json(tasks);
});

// Update a Maintenance Task
exports.updateTask = catchAsync(async (req, res, next) => {
    const task = await MaintenanceTask.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!task) {
        return next(new AppError('Maintenance Task not found', 404));
    }
    res.status(200).json(task);
});

// Delete a Maintenance Task
exports.deleteTask = catchAsync(async (req, res, next) => {
    const task = await MaintenanceTask.findByIdAndDelete(req.params.id);
    if (!task) {
        return next(new AppError('Maintenance Task not found', 404));
    }
    res.status(204).json({ status: 'success', data: null });
});

exports.logMaintenance = catchAsync(async (req, res, next) => {
  const { maintenanceDate, serviceDetails, cost, performedBy } = req.body;
  const asset = await Asset.findById(req.params.assetId);

  if (!asset) return next(new AppError('Asset not found', 404));
  if (!isValidObjectId(performedBy)) {
    return next(new AppError('Invalid user ID for performer', 400));
  }

  // Push new maintenance history entry
  asset.MaintenanceHistory.push({ maintenanceDate, serviceDetails, cost, performedBy });
  asset.Status = 'Under Maintenance';

  // Add an event to the general history
  asset.AssetHistory.push({
    event: 'Maintenance Event Logged',
    details: { serviceDetails, cost },
    changedBy: performedBy,
  });

  await asset.save();
  res.status(200).json(asset);
});
