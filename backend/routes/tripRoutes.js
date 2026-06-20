const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  generateTrip,
  getUserTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  regenerateDay,
  addActivity,
  removeActivity,
} = require('../controllers/tripController');

// All trip routes require authentication
router.use(auth);

router.post('/', generateTrip);
router.get('/', getUserTrips);
router.get('/:id', getTripById);
router.put('/:id', updateTrip);
router.delete('/:id', deleteTrip);
router.post('/:id/regenerate-day', regenerateDay);
router.post('/:id/add-activity', addActivity);
router.delete('/:id/remove-activity', removeActivity);

module.exports = router;
