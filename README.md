# Media Sorter

**Automatically organize your photos and videos into folders!**

MediaSort is a simple tool that helps you keep your photos and videos organized. It automatically sorts them into folders based on whether they're pictures or videos, and whether they were taken in portrait (vertical) or landscape (horizontal) orientation. It can also move matching subtitle files (like .SRT files) along with your videos. It supports common image formats like JPEG, PNG, and RAW (.dng), and video formats like MP4 and MOV.

**Prerequisites:**

Before using MediaSort, you need to have Node.js installed on your computer. You can download it from the official Node.js website: [https://nodejs.org/](https://nodejs.org/)

**How to Use:**

There are two main ways to use MediaSort:

**1. Using the Program Directly:**

1.  Open your computer's "Terminal" or "Command Prompt" (search for it in your computer's search bar).
2.  Navigate to the folder where you saved the `mediaSorter.js` file (or whatever it's named).
3.  Type this command and press Enter, replacing `<YOUR_MEDIA_FOLDER>` with the actual location of your photos and videos:

    ```bash
    node ./mediaSorter.js <YOUR_MEDIA_FOLDER>
    ```

    For example:

    ```bash
    node ./mediaSorter.js /Users/yourname/Pictures/MyVacationPhotos  // macOS/Linux
    node ./mediaSorter.js C:\Users\YourName\Pictures\MyVacationPhotos // Windows
    ```

**2. Putting the Program in Your Photos Folder:**

1.  Copy the `mediaSorter.js` file into the folder containing your photos and videos.
2.  Open your computer's "Terminal" or "Command Prompt".
3.  Navigate to your photos and videos folder.
4.  Type this command and press Enter:

    ```bash
    node ./mediaSorter.js
    ```

**What Happens Next?**

1.  MediaSort will count how many files it's going to organize.
2.  You'll be asked to confirm the process.
3.  MediaSort will create folders named `img_h` (horizontal images), `img_v` (vertical images), `vid_h` (horizontal videos), and `vid_v` (vertical videos).
4.  Your files will be moved into the correct folders.
5.  You'll be asked if you want to move subtitle files as well.

**Supported File Types:**

*   **Images:** .jpg, .jpeg, .png, .dng (RAW)
*   **Videos:** .mp4, .mov

**Need Help?**

If you have any questions or problems, please reach out!
