import 'package:flutter/material.dart';
import 'package:mobile_client/widgets/auth/login_form.dart';
import 'package:mobile_client/widgets/auth/login_header.dart';

class LoginPage extends StatelessWidget {
  const LoginPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        backgroundColor: const Color(0xFF283593),
        body: SafeArea(
          child: Center(
            child: Column(
              children: [
                Expanded(
                  flex: 1,
                  child: LoginHeader(),
                ),
                Expanded(
                  flex: 1,
                  child: Container(
                    color: Colors.white,
                    child: Center(
                      child: LoginForm(),
                    ),
                  ),
                ),
                // const EstimationAnswerWidget(canAnswer: true),
              ],
            ),
          ),
        ));
  }
}
