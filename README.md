# dji-media-organizer
NodeJS (v20.12.0)

##### This CLI app organizes images and videos (including .SRT files) into sub-directories (based on media type and orientation).

## Getting started: <br>
1. open the Terminal in the project path and run the following: <br>
`node ./organize-dji-media.js <YOUR_PATH>` <br>

*OR* 
copy the file `organize-dji-media.js` into the media directory and run:
`node ./organize-dji-media.js`


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
