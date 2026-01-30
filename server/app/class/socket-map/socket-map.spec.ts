import { SocketMap } from './socket-map';

describe('SocketMap', () => {
    let socketMap: SocketMap;
    const socketId = 'socket1';
    const user = { uid: 'uid1', username: 'user1', imageUrl: '' };
    beforeEach(() => {
        socketMap = new SocketMap();
    });

    it('should add a user and retrieve it by socket ID', () => {
        socketMap.addUser(socketId, user);
        expect(socketMap.getUserFromSocket(socketId)).toEqual(user);
    });

    it('should add a user and retrieve the socket ID by username', () => {
        socketMap.addUser(socketId, user);
        expect(socketMap.getSocketFromName(user.username)).toEqual(socketId);
    });

    it('should delete a user by username', () => {
        socketMap.addUser(socketId, user);
        socketMap.deleteUser(user);
        expect(socketMap.getUserFromSocket(socketId)).toBeUndefined();
        expect(socketMap.getSocketFromName(user.username)).toBeUndefined();
    });

    it('should return the correct size', () => {
        expect(socketMap.size).toBe(0);

        socketMap.addUser('socket1', { uid: 'uid1', username: 'user1' });
        expect(socketMap.size).toBe(1);

        socketMap.addUser('socket2', { uid: 'uid2', username: 'user2' });
        expect(socketMap.size).toBe(2);

        socketMap.deleteUser({ uid: 'uid1', username: 'user1' });
        expect(socketMap.size).toBe(1);
    });
});
