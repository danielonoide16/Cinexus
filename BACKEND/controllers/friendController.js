const FriendRequest = require('../models/friendModel');
const User = require('../models/userModel');

exports.sendRequest = async (req, res) => {
    const { toId } = req.body;
    if (!toId) return res.status(400).json({ error: 'toId is required' });
    if (toId === req.user.id) return res.status(400).json({ error: 'You cannot add yourself' });

    const [currentUser, targetUser] = await Promise.all([
        User.findById(req.user.id),
        User.findById(toId)
    ]);

    if (!currentUser || !targetUser) return res.status(404).json({ error: 'User not found' });
    if (currentUser.friends.some(friendId => friendId.toString() === toId)) {
        return res.status(400).json({ error: 'Users are already friends' });
    }

    const existingRequest = await FriendRequest.findOne({
        $or: [
            { from: req.user.id, to: toId },
            { from: toId, to: req.user.id }
        ]
    });
    if (existingRequest) return res.status(400).json({ error: 'Request already exists' });

    await FriendRequest.create({ from: req.user.id, to: toId, status: 'pending' });
    res.status(201).json({ message: 'Request sent' });
};

exports.getRequests = async (req, res) => {
    const pending = await FriendRequest.find({
        to: req.user.id,
        status: 'pending'
    }).populate('from', 'name bio avatarUrl');

    res.json(
        pending.map(request => ({
            id: request.from._id,
            name: request.from.name,
            bio: request.from.bio,
            avatarUrl: request.from.avatarUrl
        }))
    );
};

exports.handleRequest = async (req, res) => {
    const { action } = req.body;
    const { fromId } = req.params;
    if (!['accept', 'decline'].includes(action)) {
        return res.status(400).json({ error: 'Action must be accept or decline' });
    }

    const request = await FriendRequest.findOne({
        from: fromId,
        to: req.user.id,
        status: 'pending'
    });
    if (!request) return res.status(404).json({ error: 'Request not found' });

    if (action === 'accept') {
        request.status = 'accepted';
        await request.save();

        await Promise.all([
            User.findByIdAndUpdate(req.user.id, { $addToSet: { friends: fromId } }),
            User.findByIdAndUpdate(fromId, { $addToSet: { friends: req.user.id } })
        ]);
    } else {
        await request.deleteOne();
    }

    res.json({ message: action === 'accept' ? 'Friend added' : 'Request declined' });
};

exports.getFriends = async (req, res) => {
    const user = await User.findById(req.user.id).populate('friends', 'name bio avatarUrl');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user.friends);
};

exports.getSentRequests = async (req, res) => {
    const sent = await FriendRequest.find({
        from: req.user.id,
        status: 'pending'
    }).select('to');

    res.json(sent.map(request => request.to));
};

exports.removeFriend = async (req, res) => {
    const { friendId } = req.params;

    await Promise.all([
        User.findByIdAndUpdate(req.user.id, { $pull: { friends: friendId } }),
        User.findByIdAndUpdate(friendId, { $pull: { friends: req.user.id } }),
        FriendRequest.deleteMany({
            $or: [
                { from: req.user.id, to: friendId },
                { from: friendId, to: req.user.id }
            ]
        })
    ]);

    res.json({ message: 'Friend removed' });
};
