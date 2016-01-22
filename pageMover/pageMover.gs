function reorder(newOrder) {
  //newOrder = ['Where you work', '1894040689', 'Home', '766404077']; // for testing
  //newOrder = ['Home', '766404077', 'Where you work', '1894040689']; // for testing
  Logger.log(newOrder);
  var form = FormApp.getActiveForm();
  var structure = getFormMatrix();
  var offSet = structure.shift();
  var newOrderArray = [];
  for (var j = 2; j < newOrder.length; j += 2) {
    //newOrderArray.push(newOrder[j]); // for testing
    newOrderArray.push(newOrder[j+1]);
    //Logger.log(newOrder[j]);
  }
  for (j in newOrderArray) {
    form.getItemById(newOrderArray[j]).asPageBreakItem().setGoToPage(FormApp.PageNavigationType.CONTINUE); // automatically set navigation to continue
    var from = form.getItemById(newOrderArray[j]).getIndex();
    var to = offSet++;
    if (to != from) {
      Logger.log('From %s to %s',from,to);
      form.moveItem(from, to);
    }
    for (k in structure) {
      if (structure[k][0] == newOrderArray[j]) {
        var pageItems = structure[k][1];
        for (m in pageItems) {
          var from = form.getItemById(pageItems[m]).getIndex();
          var to = offSet++;
          if (to != from) {
            form.moveItem(from, to);
          }
        }
      }
    }
  }
  Logger.log('end reorder');
}

// Creates a 3D matrix of the original form structure.
// Structure is [questionsOnHomePage, [page1, [question1, question2, ...], page2, [question1, question2, ...], page3, [...],...]]
function getFormMatrix() {
  var form = FormApp.getActiveForm();
  var items = form.getItems();
  
  // the empty matrix to be populated and returned
  var matrix = [];
  // pageIndex is the 0-indexed counter of the number of pages
  var pageIndex = 0;
  // pageArray stores the ID of the current page, and an array of questions belonging to the page.
  var pageArray = [form.getId()];
  // pageQuestionArray is an array of all questions belonging to the current page according to pageIndex
  var pageQuestionArray = [];
  // lastPageId stores the pageID of the last instance of a PAGE_BREAK item
  var lastPageId;
  // questionsOnHomePage indicates the number of items belonging on the first, immovable page
  var questionsOnHomePage = 0;
  
  
  for (i in items) {
    // necessary to skip questions belonging to page 1, as page 1 can't be moved
    if (items[i].getType() == 'PAGE_BREAK' && pageIndex == 0) {
      questionsOnHomePage = items[i].getIndex();
      matrix.push(questionsOnHomePage);
      //Logger.log(items[i].getIndex());
    }
    
    if (items[i].getType() == 'PAGE_BREAK') {
      pageIndex++;
      //Logger.log(items[i].getTitle());
    }
    
    // main statement to create new element in matrix
    if (items[i].getType() == 'PAGE_BREAK' && pageIndex > 1) {
      pageArray = [lastPageId, pageQuestionArray];
      matrix.push(pageArray);
      pageQuestionArray = [];
      //lastPageId = items[i].getTitle(); // for testing
      lastPageId = items[i].getId();
      //Logger.log(items[i].getTitle());
      continue;
    } else if (items[i].getType() != 'PAGE_BREAK' && pageIndex > 0) {
      //pageQuestionArray.push(items[i].getTitle()); // for testing
      pageQuestionArray.push(items[i].getId());
      //Logger.log(items[i].getTitle());
    }
    
    // store ID of first page break in form
    if (items[i].getType() == 'PAGE_BREAK' && pageIndex > 0) {
      //lastPageId = items[i].getTitle(); // for testing
      lastPageId = items[i].getId();
      
    }
    
    // push final page of entries into matrix
    if (i == items.length-1) {
      //Logger.log('Last question: %s',items[i].getTitle());
      pageArray = [lastPageId, pageQuestionArray];
      matrix.push(pageArray);
      
    }
  }
  Logger.log('end getFormMatrix');
  return matrix;
}
