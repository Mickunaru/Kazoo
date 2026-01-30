import 'package:flutter/material.dart';
import 'package:mobile_client/constants/enum/page_url.dart';
import 'package:mobile_client/constants/styles/colors/colors.dart';
import 'package:mobile_client/utils/app_navigator.dart';
import 'package:mobile_client/widgets/auth/sign_up_form.dart';

class SignupPage extends StatelessWidget {
  const SignupPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        backgroundColor: Colors.white,
        appBar: AppBar(
          leading: IconButton(
              onPressed: () {
                AppNavigator.go("/${PageUrl.login.name}");
              },
              icon: Icon(Icons.arrow_back, color: Colors.white)),
          backgroundColor: MyColors.darkBlue,
        ),
        body: Center(
          child: Container(
              constraints: const BoxConstraints(maxWidth: 700),
              child: SingleChildScrollView(
                child: Padding(
                  padding: EdgeInsets.only(right: 24, bottom: 24, left: 24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Text("Joignez nous!",
                          style: Theme.of(context).textTheme.headlineMedium),
                      const SizedBox(height: 25),
                      SignUpForm()
                    ],
                  ),
                ),
              )),
        ));
  }
}
