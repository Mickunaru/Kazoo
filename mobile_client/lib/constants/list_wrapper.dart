class ListWrapper {
  final List<dynamic> list;
  ListWrapper(this.list);

  Map<String, dynamic> toJson() => {"list": list};
}
