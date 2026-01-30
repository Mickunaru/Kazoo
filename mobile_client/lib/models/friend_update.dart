class FriendUpdate {
    final String username;
    final bool isAdded;
  
    FriendUpdate({
      required this.username,
      required this.isAdded,
    });
  
    factory FriendUpdate.fromJson(Map<String, dynamic> json) {
      return FriendUpdate(
        username: json['username'] as String,
        isAdded: json['isAdded'] as bool,
      );
    }
  
    Map<String, dynamic> toJson() {
      return {
        'username': username,
        'isAdded': isAdded,
      };
    }
  }