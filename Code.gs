const SHEET_ID = '1-Kl9cUt2aCxC6_EkC0K_U4pN0yPiGtXmE09FbE-PQ0A';  // << Replace with your actual Google Sheet ID
const SHEET_NAME = 'FolderLog';          // << Replace with your sheet name or create a new sheet named "FolderLog"

function doGet() {
  return HtmlService.createHtmlOutputFromFile('form')
    .setTitle('PDF Upload to Folder');
}

/**
 * Upload PDFs to the Drive folder named folderName.
 * Creates the folder if it doesn't exist.
 * Logs folder name and URL in a Google Sheet.
 *
 * @param {string} folderName The folder name to create/use.
 * @param {Array} filesData Array of objects {name: string, data: base64 string}
 * @return {string} success or error message
 */
function uploadPDFs(folderName, filesData) {
  try {
    folderName = folderName.trim();
    if (!folderName) throw new Error('Folder name is required.');

    // Get or create folder
    let folders = DriveApp.getFoldersByName(folderName);
    let folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);

    // Save files to folder
    filesData.forEach(file => {
      const bytes = Utilities.base64Decode(file.data);
      const blob = Utilities.newBlob(bytes, MimeType.PDF, file.name);
      folder.createFile(blob);
    });

    // Log folder info to Google Sheet
    logFolderToSheet(folderName, folder.getUrl());

    return `✅ Successfully uploaded ${filesData.length} file(s) to folder "<a href="${folder.getUrl()}" target="_blank">${folderName}</a>".`;
  } catch (e) {
    return `❌ Error: ${e.message}`;
  }
}

/**
 * Append folder name and URL to Google Sheet.
 *
 * @param {string} folderName
 * @param {string} folderUrl
 */
function logFolderToSheet(folderName, folderUrl) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  
  // Append header if sheet is new and empty
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Folder Name', 'Folder URL', 'Timestamp']);
  }

  sheet.appendRow([folderName, folderUrl, new Date()]);
}
