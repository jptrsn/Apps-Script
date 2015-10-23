/* Code copyright 2015, James Petersen.
 * Published under a Creative Commons Attribution Share-Alike 4.0 International Licence
 *
 */

var MAKE_COPY = false;
var FOLDER_KEY = '----------------------------';

function onFormSubmit(e) {
  Logger.log(e);
  var data = e.namedValues;
  var email = data['Email Address'][0];
  var title = data['Title of Resource'][0];
  var link = data['Link to Resource'][0];
  var products = data['Relevant Product'][0].split(', ');
  var type = data['Type of Resource'];
  if (type == 'YouTube Video') {
    sendConfirmationEmail(data);
    return;
  }
  
  if (MAKE_COPY) {
    var copiedFile = copyResource(link);
  } else {
    var copiedFile = openResource(link);
  }
    
  if (!copiedFile) {
    //deleteSubmission();
    sendErrorEmail(data);
    return;
  } else {
    data['Link to Resource'][0] = copiedFile.getUrl();
    addToFolders(copiedFile, products);
    if (MAKE_COPY) {
      copiedFile.addEditor(email).setShareableByEditors(false);
    }
    sendConfirmationEmail(data);
  }
}

function addToFolders(file, folderNames) {
 var folder = DriveApp.getFolderById(FOLDER_KEY);
    var children = folder.getFolders();
    while (children.hasNext()) {
      var childFolder = children.next();
      for (i in folderNames) {
        if (childFolder.getName() == folderNames[i]) {
          childFolder.addFile(file);
          folderNames.splice(parseInt(i,10),1);
        }
      }
      
    }
    for (i in folderNames) {
      var newFolder = DriveApp.createFolder(folderNames[i]);
      folder.addFolder(newFolder);
      DriveApp.removeFolder(newFolder);
      newFolder.addFile(file);
    }
}

function copyResource(link) {
  try {
    var id = link.substr(link.indexOf('/d/')+3);
    id = id.substr(0,id.indexOf('/edit'));
    var source = DriveApp.getFileById(id);
    var copy = source.makeCopy().setName(source.getName());
  } catch(e) {
    return false;
  }
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var responseSheet = ss.getSheetByName('Form Responses 1');
  var linkCol = responseSheet.getRange(1,1,1,responseSheet.getLastColumn()).getValues()[0].indexOf('Link to Shared Copy')+1;
  var row = responseSheet.getRange(responseSheet.getLastRow(),linkCol).setValue(copy.getUrl());
  return copy;
}

function openResource(link) {
  try {
    var id = link.substr(link.indexOf('/d/')+3);
    id = id.substr(0,id.indexOf('/edit'));
    var copy = DriveApp.getFileById(id);
  } catch(e) {
    return false;
  }
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var responseSheet = ss.getSheetByName('Form Responses 1');
  var linkCol = responseSheet.getRange(1,1,1,responseSheet.getLastColumn()).getValues()[0].indexOf('Link to Shared Copy')+1;
  var row = responseSheet.getRange(responseSheet.getLastRow(),linkCol).setValue(copy.getUrl());
  return copy;
}


function deleteSubmission() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var responseSheet = ss.getSheetByName('Form Responses 1');
  responseSheet.deleteRow(responseSheet.getLastRow());
}

function sendErrorEmail(data) {
  var recipient = data['Email Address'][0];
  var body = HtmlService.createTemplateFromFile('error');
  body.name = data['Submitted by'][0];
  body = body.evaluate().getContent();
  GmailApp.sendEmail(recipient, 'ERROR: your training submission failed', body, {htmlBody:body, replyTo:'my.gmail.address-noreply@gmail.com'});
}

function sendConfirmationEmail(data) {
  var recipient = data['Email Address'][0];
  var body = HtmlService.createTemplateFromFile('confirmation');
  body.name = data['Submitted by'][0];
  body.sharedFolder = DriveApp.getFolderById(FOLDER_KEY).getUrl();
  body.copyUrl = data['Link to Resource'][0];
  body = body.evaluate().getContent();
  GmailApp.sendEmail(recipient, 'Shared resources confirmation', body, {htmlBody:body, replyTo:'my.gmail.address-noreply@gmail.com'});
}


function getDataContent() {
  var response = FormApp.openByUrl(SpreadsheetApp.getActiveSpreadsheet().getFormUrl()).getResponses().pop();
  var data = response.getItemResponses();
  var content = [];
  for (i in data) {
    content.push(data[i].getItem().getTitle() + ': ' + data[i].getResponse());
  }
  return content;
}
