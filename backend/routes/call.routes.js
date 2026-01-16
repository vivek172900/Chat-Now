const express = require('express');
const router = express.Router();
const { 
  initiateCall, 
  updateCallStatus, 
  getUserCalls, 
  getCallDetails 
} = require('../controllers/callController');
const { authenticate, requireUserId } = require('../middleware/auth');

router.use(authenticate, requireUserId);

router.post('/', initiateCall);
router.put('/:callId/status', updateCallStatus);
router.get('/', getUserCalls);
router.get('/:callId', getCallDetails);

module.exports = router;