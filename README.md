# dji-media-organizer
Prerequisites: NodeJS (v20.12.0)

##### This CLI app organizes images and videos (including .SRT files) into sub-directories (based on media type and orientation).

## Getting started: <br>
1. There are two methods to run this app: <br>
### OPTION 1: open the Terminal in the project path and run the following: <br>
`node ./organize-dji-media.js <YOUR_PATH>` <br>
![example](https://raw.githubusercontent.com/razzodev/dji-media-organizer/refs/heads/main/docs/run%20app%20with%20path.gif)
<br>
### OPTION 2: copy the file `organize-dji-media.js` into your media directory and then run:
`node ./organize-dji-media.js` <br>
![example](https://github.com/razzodev/dji-media-organizer/blob/main/docs/run%20app%20file%20in%20media%20path.png)
<br>

2. the app will count the files about to be moved,
confirm to create a batch process: <br>
`Do you want to process all files without individual confirmations? (y/n):`

3. sub-directories will be created
`img_h , img_v , vid_h , vid_v`
and the corresponding files will move there.

4. confirm to move the .SRT files to their corresponding file location: <br>
`Do you want to move SRT files that match the media files? (y/n):`

5. finally, confirm a batch process for the .SRT files: <br>
`Do you want to process all files without individual confirmations? (y/n):`

<br>

contact me for any issues.
