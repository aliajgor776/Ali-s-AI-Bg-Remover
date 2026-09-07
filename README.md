# CleanCut AI — Fixed No-Python Version

### Start
1. Extract this ZIP.
2. Open the `clean-cut-ai` folder.
3. Double-click **START WEBSITE.bat**.
4. Chrome/Edge should open `http://127.0.0.1:8080`.
5. Keep the black PowerShell window open.

### If the page opens but AI removal fails
The app uses IMG.LY's in-browser background-removal engine. The first run downloads the model (tens of MB) and needs internet access. The image itself is processed in the browser.

This version uses:
- `esm.sh` for the JavaScript package
- IMG.LY's static model asset path
- `isnet_quint8` model
- CPU fallback for wider browser compatibility
- PNG output at the original pixel dimensions

If it still fails, press **F12 → Console**, try one image, and send a screenshot of the red error line.
