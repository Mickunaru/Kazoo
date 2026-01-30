class FriendLists {
  final List<String> friends;
  final List<String> notFriends;
  final List<String> pending;

  FriendLists({
    required this.friends,
    required this.notFriends,
    required this.pending,
  });

  factory FriendLists.fromJson(Map<String, dynamic> json) {
    return FriendLists(
      friends: List<String>.from(json['friends']),
      notFriends: List<String>.from(json['notFriends']),
      pending: List<String>.from(json['pending']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'friends': friends,
      'notFriends': notFriends,
      'pending': pending,
    };
  }
}
