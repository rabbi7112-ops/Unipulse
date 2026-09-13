UNIPULSE FOR WINDOWS — SIMPLE VERSION
=====================================

This version is intentionally simple.
There is NO Flutter, NO Android SDK, NO Java, and NO APK build.

HOW TO RUN
----------
1. Extract this ZIP to a normal folder.
2. Double-click: RUN_UNIPULSE_WINDOWS.bat
3. On the FIRST RUN ONLY, paste your MongoDB Atlas connection string.
4. Wait while UniPulse checks/downloads Node.js packages if needed.
5. UniPulse opens automatically as a Windows app-style window.

NEXT TIME
---------
Just double-click RUN_UNIPULSE_WINDOWS.bat.
The MongoDB connection string is saved locally in:
config\mongodb-uri.txt

CHANGE DATABASE
---------------
Double-click CHANGE_MONGODB_CONNECTION.bat
Then paste the new MongoDB connection string.

STOP SERVER
-----------
Double-click STOP_UNIPULSE.bat

DEMO LOGIN
----------
Email: demo@unipulse.local
Password: Demo123!

Or click "Continue with Student SSO" on the login page.
You can also create your own account from the app.

MONGODB ATLAS
-------------
If the first connection fails:
1. Open MongoDB Atlas.
2. Go to Security > Network Access.
3. Add your current IP address.
4. Confirm the database username/password in your connection string.
5. Confirm your cluster is running.
6. Run RUN_UNIPULSE_WINDOWS.bat again.

WHAT IS SAVED IN MONGODB
------------------------
- User accounts and profiles
- Timetable records
- Events
- Event RSVP status
- Wellbeing mood check-ins
- Counselling requests

WINDOWS APP BEHAVIOUR
---------------------
UniPulse opens using Microsoft Edge in App Mode when Edge is available.
This gives a clean standalone window without normal browser tabs/address bar.
If Edge is unavailable, it opens in your default browser instead.

FIRST-RUN INTERNET
------------------
The first run may need internet to get Node.js/server packages.
It does NOT download Flutter, Android SDK, Java/JDK, Gradle, or Google Android tools.
