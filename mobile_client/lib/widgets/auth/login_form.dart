import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:mobile_client/constants/dev_user.dart';
import 'package:mobile_client/constants/enum/page_url.dart';
import 'package:mobile_client/constants/styles/colors/colors.dart';
import 'package:mobile_client/constants/styles/fonts/font_sizes.dart';
import 'package:mobile_client/locator.dart';
import 'package:mobile_client/models/environment.dart';
import 'package:mobile_client/services/user_auth_service.dart';
import 'package:mobile_client/utils/app_navigator.dart';

class LoginForm extends StatefulWidget {
  const LoginForm({
    super.key,
  });

  @override
  State<LoginForm> createState() => _LoginFormState();
}

class _LoginFormState extends State<LoginForm> {
  final formKey = GlobalKey<FormState>();
  final usernameController = TextEditingController(
      text: Environment.isDeveloperMode ? devUser["username"] : "");
  final passwordController = TextEditingController(
      text: Environment.isDeveloperMode ? devUser["password"] : "");

  bool hidePassword = true;
  bool isLoading = false;

  //TODO: create a dict linking firebase error codes with proper messages
  void login() async {
    if (!formKey.currentState!.validate()) {
      return;
    }
    setState(() {
      isLoading = true;
    });
    try {
      await locator.get<UserAuthService>().login(
          username: usernameController.text, password: passwordController.text);
      if (mounted) {
        AppNavigator.go("/${PageUrl.home.name}");
      }
    } on FirebaseAuthException catch (e) {
      showFirebaseErrorMessage(e);
    } catch (e) {
      showErrorDialog(e.toString().substring(11));
    }
    setState(() {
      isLoading = false;
    });
  }

  void showFirebaseErrorMessage(FirebaseAuthException error) {
    String errorMessage = "";

    switch (error.code) {
      case 'invalid-credential':
        errorMessage = 'Mot de passe incorrect.';
      case "user-disabled":
        errorMessage = "Ce compte a été désactivé.";
        break;
      default:
        break;
    }

    showErrorDialog(errorMessage.isNotEmpty ? errorMessage : error.toString());
  }

  void showErrorDialog(String message) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text("Problème détecté"),
          content: Text(message),
          actions: [
            TextButton(
              onPressed: () {
                AppNavigator.pop(context);
              },
              child: const Text("OK"),
            ),
          ],
        );
      },
    );
  }

  @override
  void dispose() {
    usernameController.dispose();
    passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: const BoxConstraints(maxWidth: 700),
      child: Form(
          key: formKey,
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 15),
            child: Column(
              children: [
                const SizedBox(height: 20),
                TextFormField(
                  controller: usernameController,
                  decoration: InputDecoration(
                    prefixIcon: Icon(Icons.person_2_outlined),
                    labelText: "Nom d'utilisateur",
                    border: OutlineInputBorder(),
                    counterText: ' ',
                  ),
                  validator: (val) {
                    if (val == null || val.isEmpty) {
                      return "Entrez votre nom d'utilisateur";
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: passwordController,
                  obscureText: hidePassword,
                  decoration: InputDecoration(
                    prefixIcon: Icon(Icons.password),
                    suffixIcon: IconButton(
                        onPressed: () {
                          setState(() {
                            hidePassword = !hidePassword;
                          });
                        },
                        icon: Icon(hidePassword
                            ? Icons.remove_red_eye_outlined
                            : Icons.remove_red_eye_rounded)),
                    labelText: "Mot de passe",
                    border: OutlineInputBorder(),
                    counterText: ' ',
                  ),
                  validator: (val) {
                    if (val == null || val.isEmpty) {
                      return "Entrez votre mot de passe";
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 20),
                SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: isLoading ? null : login,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.red[300],
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(12),
                        child: const Text(
                          "Se connecter",
                          style: TextStyle(
                              color: Colors.white, fontSize: FontSize.m),
                        ),
                      ),
                    )),
                const SizedBox(height: 15),
                RichText(
                  text: TextSpan(
                    text: 'Nouvel utilisateur ? ',
                    style: const TextStyle(color: Colors.black, fontSize: 18),
                    children: [
                      TextSpan(
                        text: 'Inscrivez-vous',
                        style: const TextStyle(
                          color: MyColors.darkBlue,
                          fontWeight: FontWeight.bold,
                          decoration: TextDecoration.underline,
                        ),
                        recognizer: TapGestureRecognizer()
                          ..onTap = () {
                            AppNavigator.go("/${PageUrl.signup.name}");
                          },
                      ),
                    ],
                  ),
                ),
              ],
            ),
          )),
    );
  }
}
