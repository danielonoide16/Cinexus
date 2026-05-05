const Friend = require('../models/friendModel');
const User = require('../models/userModel');

exports.sendRequest = (req, res) => {
    const { toId } = req.body;
    const friends = Friend.read();
    const exists = friends.find(f =>
        (f.from === req.user.id && f.to === toId) || (f.from === toId && f.to === req.user.id)
    );
    if (exists) return res.status(400).json({ error: 'Request already exists' });

    friends.push({ from: req.user.id, to: toId, status: 'pending' });
    Friend.write(friends);
    res.json({ message: 'Request sent' });
};

exports.getRequests = (req, res) => {
    const friends = Friend.read();
    const users = User.read();
    const pending = friends
        .filter(f => f.to === req.user.id && f.status === 'pending')
        .map(f => {
            const u = users.find(x => x.id === f.from);
            return { id: u.id, name: u.name, bio: u.bio };
        });
    res.json(pending);
};

exports.handleRequest = (req, res) => {
    const { action } = req.body;
    const fromId = parseInt(req.params.fromId);
    const friends = Friend.read();
    const idx = friends.findIndex(f => f.from === fromId && f.to === req.user.id && f.status === 'pending');
    if (idx === -1) return res.status(404).json({ error: 'Request not found' });

    if (action === 'accept') {
        friends[idx].status = 'accepted';
    } else {
        friends.splice(idx, 1);
    }
    Friend.write(friends);
    res.json({ message: action === 'accept' ? 'Friend added' : 'Request declined' });
};

exports.getFriends = (req, res) => {
    const friends = Friend.read();
    const users = User.read();
    const myFriends = friends
        .filter(f => f.status === 'accepted' && (f.from === req.user.id || f.to === req.user.id))
        .map(f => {
            const friendId = f.from === req.user.id ? f.to : f.from;
            const u = users.find(x => x.id === friendId);
            return { id: u.id, name: u.name, bio: u.bio };
        });
    res.json(myFriends);
};

exports.getSentRequests = (req, res) => {
    const friends = Friend.read();
    const sent = friends.filter(f => f.from === req.user.id && f.status === 'pending').map(f => f.to);
    res.json(sent);
};
