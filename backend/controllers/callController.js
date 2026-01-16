const Call = require('../models/Call');
const Chat = require('../models/Chat');
const User = require('../models/User');

const initiateCall = async (req, res) => {
  try {
    const { chatId, callType, receiverIds } = req.body;
    const caller = req.user;

    if (chatId) {
      const chat = await Chat.findById(chatId);
      if (!chat) {
        return res.status(404).json({ success: false, error: 'Chat not found' });
      }

      if (!chat.participants.includes(caller._id)) {
        return res.status(403).json({ success: false, error: 'You are not a participant of this chat' });
      }

      const receiver = chat.participants.find(
        participant => participant.toString() !== caller._id.toString()
      );

      const call = new Call({
        caller: caller._id,
        receivers: [receiver],
        chat: chatId,
        callType,
        status: 'ringing',
        startedAt: new Date()
      });

      await call.save();

      const populatedCall = await Call.findById(call._id)
        .populate('caller', '-__v -createdAt -updatedAt')
        .populate('receivers', '-__v -createdAt -updatedAt')
        .populate('chat');

      return res.status(201).json({
        success: true,
        call: populatedCall
      });
    }

    if (receiverIds && Array.isArray(receiverIds)) {
      const receivers = await User.find({ _id: { $in: receiverIds } });
      
      if (receivers.length === 0) {
        return res.status(400).json({ success: false, error: 'No valid receivers found' });
      }

      const call = new Call({
        caller: caller._id,
        receivers: receiverIds,
        callType,
        status: 'ringing',
        startedAt: new Date()
      });

      await call.save();

      const populatedCall = await Call.findById(call._id)
        .populate('caller', '-__v -createdAt -updatedAt')
        .populate('receivers', '-__v -createdAt -updatedAt');

      return res.status(201).json({
        success: true,
        call: populatedCall
      });
    }

    return res.status(400).json({ success: false, error: 'Either chatId or receiverIds is required' });
  } catch (error) {
    console.error('Initiate call error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateCallStatus = async (req, res) => {
  try {
    const { callId } = req.params;
    const { status } = req.body;
    const currentUser = req.user;

    const call = await Call.findById(callId);
    if (!call) {
      return res.status(404).json({ success: false, error: 'Call not found' });
    }

    const isParticipant = 
      call.caller.toString() === currentUser._id.toString() ||
      call.receivers.some(receiver => receiver.toString() === currentUser._id.toString());

    if (!isParticipant) {
      return res.status(403).json({ success: false, error: 'You are not a participant of this call' });
    }

    call.status = status;
    
    if (status === 'ended' || status === 'missed') {
      call.endedAt = new Date();
    } else if (status === 'ongoing') {
      call.startedAt = new Date();
    }

    await call.save();

    const populatedCall = await Call.findById(call._id)
      .populate('caller', '-__v -createdAt -updatedAt')
      .populate('receivers', '-__v -createdAt -updatedAt')
      .populate('chat');

    res.json({
      success: true,
      call: populatedCall
    });
  } catch (error) {
    console.error('Update call status error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getUserCalls = async (req, res) => {
  try {
    const currentUser = req.user;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;

    const calls = await Call.find({
      $or: [
        { caller: currentUser._id },
        { receivers: currentUser._id }
      ]
    })
    .populate('caller', '-__v -createdAt -updatedAt')
    .populate('receivers', '-__v -createdAt -updatedAt')
    .populate('chat')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const totalCalls = await Call.countDocuments({
      $or: [
        { caller: currentUser._id },
        { receivers: currentUser._id }
      ]
    });

    res.json({
      success: true,
      calls,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCalls,
        pages: Math.ceil(totalCalls / limit)
      }
    });
  } catch (error) {
    console.error('Get user calls error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getCallDetails = async (req, res) => {
  try {
    const { callId } = req.params;
    const currentUser = req.user;

    const call = await Call.findById(callId)
      .populate('caller', '-__v -createdAt -updatedAt')
      .populate('receivers', '-__v -createdAt -updatedAt')
      .populate('chat');

    if (!call) {
      return res.status(404).json({ success: false, error: 'Call not found' });
    }

    const isParticipant = 
      call.caller._id.toString() === currentUser._id.toString() ||
      call.receivers.some(receiver => receiver._id.toString() === currentUser._id.toString());

    if (!isParticipant) {
      return res.status(403).json({ success: false, error: 'You are not a participant of this call' });
    }

    res.json({
      success: true,
      call
    });
  } catch (error) {
    console.error('Get call details error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  initiateCall,
  updateCallStatus,
  getUserCalls,
  getCallDetails
};