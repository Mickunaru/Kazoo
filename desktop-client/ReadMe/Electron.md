# Electron Forge Workflow

This document outlines the Electron Forge commands and their usage in the development, packaging, and distribution process.

Disclaimer: this file was made Using chatgpt: I asked it to make a markdown of my Electron_README.txt file. If you want a simpler version of this file I reccomend you go read it.

## Commands Overview

### 1. **`electron` Command (Testing)**
   - **Purpose**: Used for testing the app during development. It runs the app in the Electron runtime but does not package or prepare it for distribution.
   - **Command**: 
     ```bash
     "electron": "ng build --base-href ./ && electron ."
     ```
   - **Description**:
     - This command first builds the app using Angular's build process (`ng build`), then launches the app with Electron (`electron .`).
     - It is useful for testing and iterating on the app in development.
     - It **does not package** the app into a distributable format.
  
### 2. **`forge_package` Command (Creates `.asar`)**
   - **Purpose**: Packages the app into a distributable format, including creating the `.asar` file, but does not yet prepare it for distribution.
   - **Command**: 
     ```bash
     "forge_package": "electron-forge package"
     ```
   - **Description**:
     - This command prepares the app for packaging and bundles the source code into a `.asar` file.
     - The `.asar` file contains all your app’s code and assets, but it's **not the final product** for end-users.
     - **The app can be run from the `.asar` file**, but it is not recommended as the final product since external dependencies or native modules may not be included.
   - **Output**: 
     ```
     LOG3900-111\desktop-client\out\client-win32-x64\client.exe
     ```

### 3. **`forge_make` Command (Creates Installer)**
   - **Purpose**: Takes the packaged app (including the `.asar` file) and creates platform-specific installers.
   - **Command**: 
     ```bash
     "forge_make": "electron-forge make"
     ```
   - **Description**:
     - This command creates the final product—installers for various platforms (e.g., `.exe`, `.dmg`, `.deb`).
     - It’s used for **distributing** the app to end users.
     - It includes the `.asar` file along with necessary dependencies.
   - **Output**:
     ```
     LOG3900-111\desktop-client\out\make\squirrel.windows\x64.client-1.0.0 Setup
     ```

## Important Notes on `.asar`

- The `.asar` file is crucial for **packaging** and **running** the app, but it should **not** be used as the final product for end users.
- External dependencies or native modules may not be included by default in the `.asar` file, which can cause issues when trying to run the app from the `.asar` alone.
- The final product for distribution should be a **fully packaged app** with all dependencies bundled via the `make` command, not just the `.asar` file.

## Error Handling

### Error: `EBUSY: resource busy or locked`

If you encounter the error:

Error: EBUSY: resource busy or locked, unlink 'LOG3900-111\desktop-client\out\client-win32-x64\resources\app.asar'

Follow these steps:
1. **Close your IDE**: Sometimes, the IDE keeps files locked, causing issues with the build process.
2. **Run the build from a terminal**: Make sure you're running the build process from a terminal that's **outside of the IDE**.
3. **Ensure no other processes are using the app files**: Make sure the app isn’t running or being accessed by any other programs while building.

## Summary

- **`electron`**: Use this command for **testing** the app in the Electron runtime during development.
- **`forge_package`**: Use this to **package** the app and create the `.asar` file.
- **`forge_make`**: Use this to **create the final installer** for distribution.
- **.asar**: While the `.asar` file is essential for packaging, it should not be used as the final product for end-users.
- **Handling Errors**: Ensure no processes lock the `.asar` file, and run the build process outside the IDE if you encounter the `EBUSY` error.

By following this process, you can smoothly develop, test, package, and distribute your Electron app.