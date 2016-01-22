/* Script copyright 2015, James Petersen and Bjorn Behrendt
 * Source code is published under Creative Commons ShareAlike 4.0 International Licence
 * 
 * If you use any of this source code in your project, please credit the original authors.
 *
 * Learn more at http://www.opensourceteacher.ca/apps-script/pagemover and
 * http://sites.google.com/site/edlistenscripts/pagemover
 */

function onInstall(){
  onOpen();
}

function onOpen(){
  var ui = FormApp.getUi();
  ui.createAddonMenu()
  .addItem("Organize Pages", 'pageList')
//    .addItem("Test", 'test')
  .addToUi(); 
}


function pageList(){
  var ui = FormApp.getUi();
  var html = HtmlService.createHtmlOutputFromFile('pageListSidebar');
  html.setSandboxMode(HtmlService.SandboxMode.IFRAME);
  html.setTitle("Page Mover"); 
  ui.showSidebar(html);
}

function test(){
  var ui = FormApp.getUi();
  var af = FormApp.getActiveForm();
  var html = HtmlService.createHtmlOutputFromFile('test.html');
  html.setSandboxMode(HtmlService.SandboxMode.IFRAME);
  html.setTitle("Test"); 
  ui.showSidebar(html);
}

function getQuestions() {
  var form = FormApp.getActiveForm();
  var formTitle = form.getTitle();
  var items = form.getItems();
  var itemL = items.length-1;
  var allQuestions = [];
  allQuestions.push({'qID':'--','title':formTitle});
  

  for (var i=0; i <= itemL; ++i) {
    var qID = items[i].getId();
    var qType = items[i].getType()+ "";
    var qTitle =  items[i].getTitle();
    //    var qIndex=  items[i].getIndex();
    //    var qHelpTxt =  items[i].getHelpText();
    var entry = {'qID':qID,'title':qTitle,'type':qType};
    if (qType == 'PAGE_BREAK'){
    allQuestions.push(entry);
    }
  } // end For
  if (allQuestions != ""){

  } else {

  }
//Logger.log(allQuestions);
  return(JSON.stringify(allQuestions)); // Added JSON.stringify(value) to ensure proper passing of content
}  //end getQuestions()
