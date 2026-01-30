enum ChatEvent {
  sendMessage("sendChatMessage"),
  sendChatHistory("sendChatHistory"),
  createChatRoom("createChatRoom"),
  getJoinedRooms("getJoinedChatRooms"),
  getOtherRooms("getOtherChatRooms"),
  joinRoom("joinChatRoom"),
  leaveRoom("leaveChatRoom"),
  deleteRoom("deleteChatRoom"),
  creatorUpgrade("chatCreatorUpgrade"),
  seeUnreadMessages("seeUnreadMessages"),
  sendSound("sendSound");

  const ChatEvent(this.name);
  final String name;
}
