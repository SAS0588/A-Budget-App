  /* Beginning notes
  Modules
 - Important aspect of any robust application's architecture;
 - Keep the units of code from a project both cleanly separated and organized;
 - Encapsulate some data into privacy and expose other data publicly.

 So for the app, we're going to start with UI MODULE and the DATA MODULE

 PHASE 1:
 - UI MODULE
    - Get input values
    - Add the new item to the UI
    - Update the UI
 - DATA MODULE
    - Add the new item to our data structure
    - Calculate budget
 - CONTROLLER MODULE
    - Add event handler

What we will learn:
  - How to use the module pattern
  - More about private and public data, encapsulation and separation of concerns.

Private - only accessible inside the module. this keeps our code safe.

Data encapsulation - allows us to hide implementation modules from the outside scope.So we only expose a public interface.

The Module Pattern:
  - needs closures and iffys
  */



  /*
  PHASE 2
    - Add event handler to delete item from our data structure and from the UI
    - Recalculate the budget
    - Update the UI


  Event Bubbling, Taret Element, and Event Delegation:
    - Event Bubbling
      - when an event is triggred on some DOM element, the same exact event is trigged on all parent elements.
      - event bubbles up the DOM tree
    - Target Element
      - what starts the event bubble is the target element
    - Event delegation
      - we can hand an event listener to a parent element that will wait for a event to bubble up


  Use case for Event Delegation
    1. When we have an element with lots of child elements that we are interested in
    2. when we want an event handler attached to an element that is not yet in the DOM when our page is loaded.

  */

  /*
PHASE 3
  - Calculate percentages
  - Update percentages in UI
  - Display the current month and year
  - Number formatting
  - Improve input field UX

  */

 // BUDGET CONTROLLER
 var budgetController = (function() {

  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1; // when something is not defined we mark it as -1
  };

  Expense.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome > 0){
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    };

  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

  // also a function constructor, this creates an income object with id, description, and value.
  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function(type){
    var sum = 0;
    data.allItems[type].forEach(function(cur){
      sum += cur.value; // same as sum = sum + cur.value
    });
    data.totals[type] = sum;
  };

  // this is where we store the instances of expenses or incomes. So if someone creates 10 items we can store them in an array.
  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    // this is where the running totals of all expenses and incomes are kept. The above is just for individual items, this is for an aggregate of all ite
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  return {
    addItem: function(type, des, val) {
      var newItem,ID;

      //[1 2 3 4 5], next ID = 6; This is the IDEAL case scenario which will NOT happen
      //[1 2 4 6 8], next ID = 9; This is the REAL world scenario that we should prepare for.
      // so we need to take take the last item in the array and then add 1 to it to keep our data stable. i.e. ID = last ID + 1

      // Create new ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      // Create new item based on 'inc' or 'exp' type
      if (type === 'exp') {
        newItem = new Expense(ID, des, val);
      } else if (type === 'inc') {
        newItem = new Income(ID, des, val);
      }

      // Push it into our data structure
      data.allItems[type].push(newItem);

      // Return new element
      return newItem;
    },

    deleteItem: function(type, id) {
      var ids, index;
      // id = 6
      //ids = [1 2 4 6 8] is what our structure will possible look like (non-linear) so we need to come up with a way that when we delete an item, we can delete from anywhere in the array and not just sequentially. In this case, id = 6 is in the 3rd index spot. We should find a way to delete from the index, not the value.
      
      // map method returns an array. In this case, it will go into either inc or exp array, grab the id and return it in an array.
      ids = data.allItems[type].map(function(current){
        return current.id;
      });

      // returns the index number of the element of the array that we pass in. so for '6' it would be an index of 3
      index = ids.indexOf(id);

      // we only want to remove if the index actually exists so this is the catch:
      if (index !== -1){
        data.allItems[type].splice(index,1); // splice removes elements from the index. the '1' indicates how many items. This array method takes in 2 arguments: index number and how many items to splice.
      };
    },

    calculateBudget: function() {
      // calculate total income and expense
      calculateTotal('exp');
      calculateTotal('inc');

      // calculate the budget: income - expense
      data.budget = data.totals.inc - data.totals.exp;

      // calculate the percentage of income that we spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      };


    },

    calculatePercentages: function() {
      // take total of expenses and each item by the expense total
      data.allItems.exp.forEach(function(cur){
        cur.calcPercentage(data.totals.inc);
      });
    },

    getPercentage: function() {
      var allPerc = data.allItems.exp.map(function(cur){
        return cur.getPercentage();
      });
      return allPerc;
    },

    getBudget: function(){
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };

    },

    testing: function() {
      console.log(data);

    }
  };

})();

// UI CONTROLLER
var UIController = (function() {

  var DOMStrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
  };

  var formatNumber = function (num, type){
    var numSplit, int, dec, type;
    /*
      + or - before number
      exactly 2 decimal points
      comma separating the thousands
      
      examples:
      2310.47 -> 2,310.47
      2000 -> 2,000
    */

    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split('.');
    int = numSplit[0];
    if (int.length > 3) {
      //substr() method takes 2 arguments. (start of index, and how many characters to move over). i.e. (0,1) would be start at index 0 and go over one character.
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3 , 3); // if input is 2310, output is 2,310
    };

    dec = numSplit[1];
   
    return ( type === 'exp' ? '-': '+') + ' ' + int + '.' + dec;
  };

  var nodeListForEach = function(list, callback) {
    for (var i = 0; i < list.length; i++){
      callback(list[i], i);
    };
  };

  return {
    getInput: function() {
      return {
        type: document.querySelector(DOMStrings.inputType).value, // Will be either add or subtract (income or expense)
        description: document.querySelector(DOMStrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
      };
    },

    addListItem: function(obj, type) {
      var html,
        newHtml,
        element;
      // Create HTML string with placeholder text
      if (type === 'inc') { // the % sign is just to see the placeholder text easier
        element = DOMStrings.incomeContainer;
        html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value"> %value%</div> <div class="item__delete"> <button class="item__delete__btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
      } else if (type === 'exp') {
        element = DOMStrings.expensesContainer;
        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete__btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      // Replace placeholder text with actual data
      newHtml = html.replace('%id%', obj.id); // the replace method searches for the %id% and then replaces it with the stored object id
      newHtml = newHtml.replace('%description%', obj.description); // this time, since we already have newHtml stored with our string, we can just append that variable. So this will search through newHtml and change all description to object description.
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type)); // same as above

      // Insert HTML into the DOM
      /*
      The method is called: insertAdjacentHTML();
      visualization of positions names: you can enter in the html element in multiple different places.
      <!-- beforebegin -->
      <p>
        <!-- afterbegin -->
        foo
          <!-- beforeend -->
        </p>
        <!-- afterend -->

        so think of it as: before you begin <p> - after you begin <p> - before you end <p> - after you end <p>
      */
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

    },

    deleteListItem: function(selectorID){
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    // this function clears the text field after we enter in a description.
    clearFields: function() {
      var fields;
      // returns a full list of methods and attributes associated with the queried arguments.
      fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);
      // this is the only way we can call the slice method because we want to convert the above list into an array. So we call the slice method form the Array prototype and give it the fields variable to convert into an array which is then stored in fieldsArr.
      var fieldsArr = Array.prototype.slice.call(fields);
      // Loops over all of the array elements and replaces the current element's value to empty.
      fieldsArr.forEach(function(current, index, array) {
        current.value = "";
      });

      // Sets the focus of the field back to the input description.
      fieldsArr[0].focus();

    },

    displayBudget: function(obj){
      obj.budget > 0 ? type = 'inc' : type = 'exp';
      document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
      document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
      document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage;

      if (obj.percentage > 0) {
        document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
      } else {
        document.querySelector(DOMStrings.percentageLabel).textContent = '---';
      }

    },

    displayPercentages: function(percentages) {
      var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);
      
      nodeListForEach(fields, function(current, index) {
        if (percentages[index] > 0){
          current.textContent = percentages[index] + '%';
        } else {
          current.textContent = '---';
        };
      });
    },

    displayMonth: function(){
      var now, month, year;
      
      now = new Date(); // var christmas = new Date(2016, 11, 25);
      months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      month = now.getMonth();
      year = now.getFullYear();
      document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;

    },

    changedType: function() {

      var fields = document.querySelectorAll(
        DOMStrings.inputType + ',' +
        DOMStrings.inputDescription + ',' +
        DOMStrings.inputValue
      );

      nodeListForEach(fields, function(cur) {
        cur.classList.toggle('red-focus');
      });

      //turns the checkmark button red if expense is chosen.
      document.querySelector(DOMStrings.inputBtn).classList.toggle('red');







    },

    getDOMstrings: function() {
      return DOMStrings;
    }
  };

})();

//GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {

  var setupEventListeners = function() {
    var DOM = UICtrl.getDOMstrings();
    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    document.addEventListener('keypress', function(event) {
      // this listens for the ENTER button. The ENTER button has an object prop that returns 13 for the keycode. We can create a conditional to catch that and then pass in the data.
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });
    // this sets up an event listener in the HTML for <div class = "container"> ln 53
    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

    // this is an event listener for change (changes from inc to exp)
    document.querySelector(DOM.inputType).addEventListener('change',UIController.changedType);
  };

  var updateBudget = function() {
    // 1. Calculate the budget
    budgetCtrl.calculateBudget();

    // 2. Return the budget
    var budget = budgetCtrl.getBudget();

    // 3. Display the budget on the UI
    UICtrl.displayBudget(budget);

  };

  var updatePercentages = function() {
    // 1. calculate percentage
    budgetCtrl.calculatePercentages();

    // 2. read from budget controller
    var percentages = budgetCtrl.getPercentage();

    // 3. update user interface with new percentages
    UICtrl.displayPercentages(percentages);

  }

  var ctrlAddItem = function() {
    var input,
      newItem;

    // 1. Get the field input data
    input = UICtrl.getInput();

    // If statement checks for empty value or if number is NOT A NUMBER. !isNaN means that it is true if it IS a number, and false if it is NOT a number.
    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

      // 2. Add the item to the budget controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      // 3. Add the item to the UI
      UICtrl.addListItem(newItem, input.type);

      // 4. Clear the fields
      UICtrl.clearFields();

      // 5. Calculate and update budget
      updateBudget();

      // 6. Calculate and update percentages
      updatePercentages();
    };
  };

  // this deletes the income or expense item on the UI
  var ctrlDeleteItem = function (event) {
    var itemID, splitID, type, ID;

    // this targets the parent div where the icon is sitting and assigns the id - inc-1 or exp-1 - to itemID.
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    console.log(event.target.parentNode.parentNode.parentNode.parentNode.id);

    if (itemID) {
      
      //strings have access to a method: split(); we are going to use this method. When we call the method js wraps the primitive into an object. This can happen to numbers as well.

      // so for an example return of inc-1
      splitID = itemID.split('-'); //returns [inc,1]
      type = splitID[0]; // type is set to [inc]
      ID = parseInt(splitID[1]); //splitID is converted to an integer and then ID set to [1]

      // 1. delete the item from the data structure
      budgetCtrl.deleteItem(type, ID);

      // 2. delete the item from the UI
      UICtrl.deleteListItem(itemID);

      // 3. update and show the new budget
      updateBudget();

      // 4. calculate and update percentages
      updatePercentages();
    };
  };

  return {
    init: function() {
      console.log('Application has started.');
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
      setupEventListeners();
    }
  };

})(budgetController, UIController);


// START HERE
controller.init();
