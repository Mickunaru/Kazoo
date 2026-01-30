    
Just giving details regarding electron:
    "electron": "ng build --base-href ./ && electron ."
    "forge_package": "electron-forge package" Used for testing
    "forge_make": "electron-forge make", Used for final production


Use the electron command when you want to test out the app with electron but not package the app

the package commande creates the .asar which is then used by the make command
the make command creates an installer

when using "package" the product should be here:
LOG3900-111\desktop-client\out\client-win32-x64\client.exe

when using make the "product" should be here:
LOG3900-111\desktop-client\out\make\squirrel.windows\x64.client-1.0.0 Setup

Note: the app can be opened inside the .asar but should not be used as the final product as
it's dependencies can be "external"


if this error occus while building:
Error: EBUSY: resource busy or locked, 
unlink 'LOG3900-111\desktop-client\out\client-win32-x64\resources\app.asar'
=> close your IDE and try running it from a terminal that is not in the IDE 
(ensure all other folder you have that could seem to contain the project are closed)

