#!/usr/bin/env node
// Default language for the conversation below is English unless a specific language is mentioned by the user.
const fs = require("fs").promises;
const path = require("path");
const readline = require("readline");
const { execFile } = require("child_process");
const { promisify } = require("util");
const execFileAsync = promisify(execFile);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Configuration
const FOLDER_NAMES = {
  IMAGE: { VERTICAL: "img_v", HORIZONTAL: "img_h" },
  VIDEO: { VERTICAL: "vid_v", HORIZONTAL: "vid_h" },
};

// Supported file types
const SUPPORTED_IMAGES = [".jpg", ".jpeg", ".png", ".dng"];
const SUPPORTED_VIDEOS = [".mp4", ".mov"];

async function createFolderIfNeeded(folderPath) {
  try {
    await fs.mkdir(folderPath, { recursive: true });
  } catch (error) {
    if (error.code !== "EEXIST") throw error;
  }
}

async function getMediaMetadata(filePath) {
  try {
    const { stdout } = await execFileAsync("exiftool", [
      "-json",
      "-ImageWidth",
      "-ImageHeight",
      "-Rotation",
      "-Orientation",
      filePath,
    ]);
    return JSON.parse(stdout)[0];
  } catch {
    return null;
  }
}

async function getFallbackDimensions(filePath, isVideo) {
  const args = isVideo
    ? [
        "-v",
        "error",
        "-select_streams",
        "v:0",
        "-show_entries",
        "stream=width,height",
        "-of",
        "csv=p=0",
        filePath,
      ]
    : [
        "-v",
        "error",
        "-show_entries",
        "stream=width,height",
        "-of",
        "csv=p=0",
        filePath,
      ];
  try {
    const { stdout } = await execFileAsync("ffprobe", args);
    const [width, height] = stdout.trim().split(",").map(Number);
    return { width, height };
  } catch {
    return null;
  }
}

function determineOrientation(dimensions) {
  if (dimensions.rotation)
    return dimensions.rotation > 0 ? "VERTICAL" : "HORIZONTAL";
  if (dimensions.orientation)
    return dimensions.orientation === "Horizontal (normal)"
      ? "HORIZONTAL"
      : "VERTICAL";
  return dimensions.width > dimensions.height ? "HORIZONTAL" : "VERTICAL";
}

async function processFile(filePath, baseDir) {
  // Ensure filePath is a string
  if (typeof filePath !== "string") {
    console.error(`Invalid filePath: ${filePath}`);
    return false;
  }
  const ext = path.extname(filePath).toLowerCase();
  const metadata = await getMediaMetadata(filePath);
  const isVideo = SUPPORTED_VIDEOS.includes(ext);
  const isImage = SUPPORTED_IMAGES.includes(ext);
  if (!isVideo && !isImage) {
    console.log(`Skipping unsupported file: ${path.basename(filePath)}`);
    return false;
  }
  const dimensions =
    metadata && metadata.ImageWidth && metadata.ImageHeight
      ? {
          width: metadata.ImageWidth,
          height: metadata.ImageHeight,
          rotation: metadata.Rotation,
          orientation: metadata.Orientation,
        }
      : await getFallbackDimensions(filePath, isVideo);
  if (!dimensions) {
    console.log(
      `Could not process ${path.basename(filePath)} - failed to get dimensions`
    );
    return false;
  }
  const orientation = determineOrientation(dimensions);
  const targetFolder = FOLDER_NAMES[isVideo ? "VIDEO" : "IMAGE"][orientation];
  const targetPath = path.join(baseDir, targetFolder, path.basename(filePath));
  await createFolderIfNeeded(path.join(baseDir, targetFolder));
  try {
    await fs.rename(filePath, targetPath);
    console.log(`Moved ${path.basename(filePath)} to ${targetFolder}`);
    return true;
  } catch (error) {
    console.error(`Error moving ${path.basename(filePath)}:`, error.message);
    return false;
  }
}

async function askForBatchMode() {
  return new Promise((resolve) => {
    rl.question(
      "Do you want to process all files without individual confirmations? (y/n): ",
      (answer) => resolve(answer.toLowerCase() === "y")
    );
  });
}

async function checkDependencies() {
  try {
    await execFileAsync("ffmpeg", ["-version"]);
    await execFileAsync("ffprobe", ["-version"]);
    await execFileAsync("exiftool", ["-ver"]);
    return true;
  } catch {
    console.error(
      "Error: Required dependencies not found. Please install ffmpeg, ffprobe, and exiftool."
    );
    return false;
  }
}

async function findFiles(directory, extensions) {
  const items = await fs.readdir(directory, { withFileTypes: true });
  let mediaFiles = [];
  for (const item of items) {
    const fullPath = path.join(directory, item.name);
    if (item.isDirectory()) {
      // Recursively search subdirectories
      const subDirFiles = await findFiles(fullPath, extensions);
      mediaFiles = [...mediaFiles, ...subDirFiles];
    } else if (extensions.includes(path.extname(item.name).toLowerCase())) {
      mediaFiles.push(fullPath); // Ensure this is a string
    }
  }
  return mediaFiles;
}

async function moveSRTFiles(directory) {
  const mediaFiles = await findFiles(directory, [
    ...SUPPORTED_IMAGES,
    ...SUPPORTED_VIDEOS,
  ]);
  const srtFiles = await findFiles(directory, [".srt"]);
  console.log(
    `Found ${mediaFiles.length} media files and ${srtFiles.length} SRT files`
  );
  if (srtFiles.length === 0) {
    console.log("No SRT files found to process.");
    return;
  }
  const batchMode = await askForBatchMode();
  let movedCount = 0,
    skippedCount = 0;
  for (const srtFile of srtFiles) {
    // Ensure mediaFiles contains resolved paths
    const matchingMedia = mediaFiles.find((media) => {
      console.log(`Checking media: ${media}`); // Debugging line
      return path.parse(media).name === path.parse(srtFile).name;
    });
    if (matchingMedia) {
      const targetPath = path.join(
        path.dirname(matchingMedia),
        path.basename(srtFile)
      );
      const shouldMove =
        batchMode ||
        (await new Promise((resolve) => {
          rl.question(
            `Move "${srtFile}" to "${targetPath}"? (y/n): `,
            (answer) => resolve(answer.toLowerCase() === "y")
          );
        }));
      if (shouldMove) {
        await fs.rename(srtFile, targetPath);
        console.log(
          `Moved: ${path.basename(srtFile)} -> ${path.basename(matchingMedia)}`
        );
        movedCount++;
      } else {
        console.log(`Skipped: ${path.basename(srtFile)}`);
        skippedCount++;
      }
    } else {
      console.log(
        `No matching media file found for: ${path.basename(srtFile)}`
      );
      skippedCount++;
    }
  }
  console.log("\nSummary:");
  console.log(`Moved: ${movedCount} files`);
  console.log(`Skipped: ${skippedCount} files`);
}

async function organizeMedia(directory) {
  if (!(await checkDependencies())) {
    rl.close();
    return;
  }
  console.log(`Processing directory: ${directory}`);
  const mediaFiles = await findFiles(directory, [
    ...SUPPORTED_IMAGES,
    ...SUPPORTED_VIDEOS,
  ]);
  // Log the number of media files found
  console.log(`Found ${mediaFiles.length} media files.`);
  const batchMode = await askForBatchMode();
  let processedCount = 0,
    skippedCount = 0;
  for (const filePath of mediaFiles) {
    const shouldProcess =
      batchMode ||
      (await new Promise((resolve) => {
        rl.question(`Process ${path.basename(filePath)}? (y/n): `, (answer) =>
          resolve(answer.toLowerCase() === "y")
        );
      }));
    if (shouldProcess) {
      const success = await processFile(filePath, directory);
      if (success) processedCount++;
      else skippedCount++;
    } else {
      console.log(`Skipped: ${path.basename(filePath)}`);
      skippedCount++;
    }
  }
  console.log("\nSummary:");
  console.log(`Processed: ${processedCount} files`);
  console.log(`Skipped: ${skippedCount} files`);
  // Continue to the SRT processing part regardless of media files found
  const moveSRT = await new Promise((resolve) => {
    rl.question(
      "Do you want to move SRT files that match the media files? (y/n): ",
      (answer) => resolve(answer.toLowerCase() === "y")
    );
  });
  if (moveSRT) {
    await moveSRTFiles(directory);
  } else {
    console.log("SRT file moving skipped.");
  }
  rl.close();
}

// Get directory from command line argument or use current directory
const targetDirectory = process.argv[2] || process.cwd();
organizeMedia(targetDirectory);
