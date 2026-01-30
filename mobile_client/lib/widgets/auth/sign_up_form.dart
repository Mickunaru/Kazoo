import 'package:email_validator/email_validator.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:mobile_client/constants/enum/page_url.dart';
import 'package:mobile_client/constants/styles/fonts/font_sizes.dart';
import 'package:mobile_client/locator.dart';
import 'package:mobile_client/services/user_auth_service.dart';
import 'package:mobile_client/shop/classes/shop_item.dart';
import 'package:mobile_client/utils/app_navigator.dart';
import 'package:mobile_client/widgets/avatar/avatar_picker.dart';

class SignUpForm extends StatefulWidget {
  const SignUpForm({
    super.key,
  });

  @override
  State<SignUpForm> createState() => _SignUpFormState();
}

class _SignUpFormState extends State<SignUpForm> {
  final formKey = GlobalKey<FormState>();
  final avatarController = TextEditingController();
  final usernameController = TextEditingController();
  final emailController = TextEditingController();
  final passwordController = TextEditingController();
  final confirmPasswordController = TextEditingController();
  bool hidePassword = true;
  bool hideConfirmPassword = true;
  final usernameMaxLength = 12;
  bool isLoading = false;

  //TODO: create a dict linking firebase error codes with proper messages
  void signUp() async {
    if (!formKey.currentState!.validate()) return;
    setState(() {
      isLoading = true;
    });
    try {
      await locator.get<UserAuthService>().signUp(
          email: emailController.text,
          password: passwordController.text,
          username: usernameController.text,
          avatar: avatarController.text);
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
      case "email-already-in-use":
        errorMessage = "Cet email est déjà utilisé.";
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

  void onAvatarPicked(ShopItem avatar) {
    setState(() {
      avatarController.text = avatar.imageUrl;
    });
  }

  @override
  void dispose() {
    avatarController.dispose();
    usernameController.dispose();
    emailController.dispose();
    passwordController.dispose();
    confirmPasswordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Form(
        key: formKey,
        child: Column(children: [
          AvatarPicker(
            onAvatarPicked: onAvatarPicked,
            isCustomAvatarDisabled: true,
          ),
          if (avatarController.text == "")
            Column(
              children: [
                const SizedBox(height: 8),
                Text("Choisissez votre avatar",
                    style: TextStyle(fontSize: FontSize.m)),
              ],
            ),
          const SizedBox(height: 16),
          TextFormField(
            controller: usernameController,
            decoration: const InputDecoration(
              prefixIcon: Icon(Icons.person_2_outlined),
              labelText: "Nom utilisateur",
              border: OutlineInputBorder(),
              counterText: ' ',
            ),
            validator: (val) {
              if (val == null || val.isEmpty) {
                return "Entrez un nom d'utilisateur";
              } else if (val.length < 5) {
                return "Entrez au moins 5 charactères";
              } else if (!RegExp(r'^[a-zA-Z0-9_]+$').hasMatch(val)) {
                return "Utilisez uniquement des lettres, des chiffres et des underscores (_)";
              }
              return null;
            },
            maxLength: usernameMaxLength,
          ),
          const SizedBox(height: 8),
          TextFormField(
            controller: emailController,
            decoration: const InputDecoration(
              prefixIcon: Icon(Icons.email_outlined),
              labelText: "Email",
              border: OutlineInputBorder(),
              counterText: ' ',
            ),
            validator: (val) {
              if (val == null || val.isEmpty) {
                return "Entrez un email";
              }
              if (!EmailValidator.validate(val)) {
                return "Entrez un email valide";
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
                errorMaxLines: 2),
            validator: (val) {
              if (val == null || val.isEmpty) {
                return "Entrez un mot de passe";
              } else if (!RegExp(
                      r'^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*\W).{8,}$')
                  .hasMatch(val)) {
                return "Le mot de passe doit contenir au moins 8 caractères, incluant une majuscule, une minuscule, un chiffre et un caractère spécial.";
              } else if (val.contains(' ')) {
                return "Le mot de passe ne doit pas contenir d'espaces.";
              }
              return null;
            },
          ),
          const SizedBox(height: 8),
          TextFormField(
            controller: confirmPasswordController,
            obscureText: hideConfirmPassword,
            decoration: InputDecoration(
              prefixIcon: Icon(Icons.check),
              suffixIcon: IconButton(
                  onPressed: () {
                    setState(() {
                      hideConfirmPassword = !hideConfirmPassword;
                    });
                  },
                  icon: Icon(hideConfirmPassword
                      ? Icons.remove_red_eye_outlined
                      : Icons.remove_red_eye_rounded)),
              labelText: "Confirmer le mot de passe",
              border: OutlineInputBorder(),
              counterText: ' ',
            ),
            validator: (val) {
              if (val == null || val.isEmpty) {
                return "Confimez votre mot de passe";
              } else if (val != passwordController.text) {
                return "Les mots de passe ne correspondent pas";
              }
              return null;
            },
          ),
          const SizedBox(height: 25),
          SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                  onPressed: avatarController.text.isEmpty || isLoading
                      ? null
                      : signUp,
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: const Text("Créer un compte",
                        style: TextStyle(
                            fontSize: FontSize.m, color: Colors.black)),
                  ))),
        ]));
  }
}
