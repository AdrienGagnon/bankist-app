'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const displayMovements = function (movements, sort = false) {
  // Empty container before doing anything
  // innerHTML similar to textContent method, innerHTML returns everything, not only the text
  containerMovements.innerHTML = '';

  // Sorting the movements, but not the original!! --> slice() to copy
  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  // function for display of the movements
  movs.forEach(function (mov, i) {
    // Check if deposit or withdraw, will be red or green
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    // copy the html in the movement section, change the type (deposit or withdraw) and change the ammount of money (mov)
    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">3 days ago</div>
        <div class="movements__value">${mov}€</div>
      </div>
    `;
    // insert the newly created html string directly at the beggining of the movement section of the html file
    // see documentation for afterbegin or beforeend, it changes the order where it is added
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

// Display balance in top right
const calcDisplayBalance = function (acc) {
  // Calculate the sum of movements
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  // Change the text in top right for balance
  labelBalance.textContent = `${acc.balance}€`;
};

// Display summary
const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov);
  labelSumIn.textContent = `${incomes}€`;

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(out)}€`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      return int >= 1;
    })
    .reduce((acc, interest) => acc + interest, 0);
  labelSumInterest.textContent = `${interest}€`;
};

// create a username in the accounts
const createUsernames = function (accs) {
  // loop over the accounts array
  accs.forEach(function (acc) {
    // create a new method called userName and assign the username
    acc.userName = acc.owner
      .toLowerCase()
      .split(' ')
      .map(word => word[0])
      .join('');
  });
};

// create the usernames
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc.movements);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

// Events handler
let currentAccount;

btnLogin.addEventListener('click', function (e) {
  // Prevents form from submitting
  e.preventDefault();

  // Checks for the account linked to the username
  currentAccount = accounts.find(
    acc => acc.userName === inputLoginUsername.value
  );

  // Checks if the pin is correct for that account
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI and welcome message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    // App appears
    containerApp.style.opacity = 100;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    // Remove focus from a text input
    inputLoginPin.blur();

    updateUI(currentAccount);
  }
});

// transfer
btnTransfer.addEventListener('click', function (e) {
  // Preventing reloading of the page
  e.preventDefault();
  // enregistrer le montant
  const amount = Number(inputTransferAmount.value);
  // verifier le receiver account
  const receiverAcc = accounts.find(
    acc => acc.userName === inputTransferTo.value
  );
  // Clean input
  inputTransferAmount.value = inputTransferTo.value = '';
  // Verify if he has enough money
  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.userName !== currentAccount.userName
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);
    // Update UI
    updateUI(currentAccount);
  }
});

// Requesting loan
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputLoanAmount.value);
  if (amount > 0 && currentAccount.movements.some(mov => mov > amount * 0.1)) {
    // Add movement to currentAccount
    currentAccount.movements.push(amount);
    // UpdateUI
    updateUI(currentAccount);
  }
  inputLoanAmount.value = '';
});

// Delete an account

btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  if (
    // Check if the name and pin are correct
    Number(inputClosePin.value) === currentAccount.pin &&
    inputCloseUsername.value === currentAccount.userName
  ) {
    // Check for the index of the account to delete
    const index = accounts.findIndex(
      acc => acc.userName === currentAccount.userName
    );
    // Delete the account
    accounts.splice(index, 1);
    // Hide UI
    containerApp.style.opacity = 0;
  }
  // Clear the input
  inputCloseUsername.value = inputClosePin.value = '';
});

// state of the sorting
let sorted = false;

// button to sort event
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

// const currencies = new Map([
//   ['USD', 'United States dollar'],
//   ['EUR', 'Euro'],
//   ['GBP', 'Pound sterling'],
// ]);

// const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/////////////////////////////////////////////////
/* 
// Aray methods
let arr = ['a', 'b', 'c', 'd', 'e'];

// Slice method
console.log(arr.slice(2)); // only the 3 last ones
console.log(arr.slice(2, 4)); // 4 is not included
console.log(arr.slice(-2)); // last 2 elements
console.log(arr.slice(-1)); // last 1 elements
console.log(arr.slice(1, -2)); // start at 1, then the rest except the last two
console.log(arr.slice()); // same array, shallow copy
console.log([...arr]); // same array, shallow copy

// Splice method
console.log(arr.splice(2)); // changes the original array
console.log(arr.splice(-1)); // deletes the last element, returns it
console.log(arr); // only the first 2 are left
console.log(arr.splice(1, 2)); // deletes the 1 and 2, so b and c
console.log(arr);

// Reverse
const arr2 = ['j', 'i', 'h', 'g', 'f'];
console.log(arr2.reverse()); // mutates the original array

// Concat
const letters = arr.concat(arr2);
console.log(letters); // 2 arrays together
console.log([...arr, ...arr2]); // same thing

// Join
console.log(letters.join(' - ')); // mutates to string
 */
/* 
// At method
const arr = [23, 11, 64];
console.log(arr[0]); // first item in array
console.log(arr.at(0)); // same thing

console.log(arr[arr.length - 1]); // last element
console.log(arr.slice(-1)[0]); // last element
console.log(arr.at(-1)); // last element, faster

// At method on strings
console.log('jonas'.at(0));
console.log('jonas'.at(-1));
 */
/* 
// ForEach method for arrays
const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

for (const [i, movement] of movements.entries()) {
  if (movement > 0) {
    console.log(`Movement ${i + 1}: You deposited ${movement}`);
  } else {
    console.log(`Movement ${i + 1}: You withdrew ${Math.abs(movement)}`);
  }
}
console.log('----------------- forEach -----------------');
// Easier way, can access the index and the array
movements.forEach(function (mov, i, arr) {
  if (mov > 0) {
    console.log(`Movement ${i + 1}: You deposited ${mov}`);
  } else {
    console.log(`Movement ${i + 1}: You withdrew ${Math.abs(mov)}`);
  }
});
 */

////////////////////////////////////////
// forEach with maps and sets
/* 
// Maps
const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);
currencies.forEach(function (value, key, map) {
  console.log(`${key}: ${value}`);
});

// Sets
const currenciesUnique = new Set(['USD', 'GBP', 'USD', 'EUR', 'EUR']);
console.log(currenciesUnique);
currenciesUnique.forEach(function (value, _value, set) {
  // value and _value are the same
  console.log(`${value}: ${value}`);
});
 */
/* 
// Coding challenge 1

const dataJulia1 = [3, 5, 2, 12, 7];
const dataJulia2 = [9, 16, 6, 8, 3];
const dataKate1 = [4, 1, 15, 8, 3];
const dataKate2 = [10, 5, 6, 1, 4];

const checkDogs = function (arr1, arr2) {
  const arr1Dogs = arr1.slice(1, 3);
  const dogs = arr1Dogs.concat(arr2);
  console.log(dogs);
  dogs.forEach(function (age, i) {
    age >= 3
      ? console.log(`Dog number ${i + 1} is an adult, and is ${age} years old`)
      : console.log(`Dog number ${i + 1} is still a puppy`);
  });
};
checkDogs(dataJulia1, dataKate1);
// checkDogs(dataJulia2, dataKate2);
 */
/* 
// Map, filter and reduce

// Map
const eurToUsd = 1.1;
const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
// const movementsUSD = movements.map(function (mov) {
//   return mov * eurToUsd;
// });

const movementsUSDfor = [];
for (const mov of movements) movementsUSDfor.push(mov * eurToUsd);
console.log(movementsUSDfor); // same thing

const movementsUSD = movements.map(mov => mov * eurToUsd); // same as before but cleaner
console.log(movements, movementsUSD); // New array created

const movementsDescriptions = movements.map(
  (mov, i) =>
    `Movement ${i + 1}: You ${mov > 0 ? 'deposited' : 'withdrew'} ${Math.abs(
      mov
    )}`
);

console.log(movementsDescriptions);
 */
/* 
// filter method
const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
const deposits = movements.filter(function (mov) {
  return mov > 0; // only the elements >0 will be in the new deposits array
});
console.log(deposits);

const depositsFor = [];
for (const mov of movements) if (mov > 0) depositsFor.push(mov);
console.log(depositsFor); // longer and cant chain easily

const withdrawals = movements.filter(amount => amount < 0);
console.log(withdrawals);
 */
/* 
// Reduce method
const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

// Reduce: the returned value in the function will be the new accumulator

// accumulator is like a snowball
const balance = movements.reduce(function (accumulator, current, i, arr) {
  console.log(`Iteration ${i}: ${accumulator}`);
  return accumulator + current;
}, 0); // 0 is the initial value of accumulator
console.log(balance); // sum of all the movements

let balance2 = 0;
for (const mov of movements) balance2 += mov;
console.log(balance2); // longer and cumbersome
 */
/* 
// Other reduce utilities: maximum value
const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
const max = movements.reduce((acc, mov) => {
  if (acc > mov) return acc;
  else return mov;
}, movements[0]);
console.log(max);
 */
/* 
// Coding challenge 2: map, filter and reduce

const calcAverageHumanAge = function (ages) {
  const adults = ages
    .map(function (age) {
      return age <= 2 ? age * 2 : 16 + age * 4;
    })
    .filter(function (age) {
      return age >= 18;
    });
  console.log(adults);
  const average =
    adults.reduce(function (acc, age) {
      return acc + age;
    }, 0) / adults.length;
  return average;
};
console.log(calcAverageHumanAge([5, 2, 4, 1, 15, 8, 3]));
 */
/* 
// chaining map, filter and reduce
const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

// Pipeline
const eurToUsd = 1.1;
const totalDepositsUSD = movements
  .filter(mov => mov > 0)
  .map((mov, i, arr) => {
    console.log(arr);
    return mov * eurToUsd;
  }) // use the arr parameter to check for mistakes
  .reduce((acc, mov) => acc + mov, 0);
console.log(totalDepositsUSD);
 */

/* 
// Coding challenge 3

const calcAverageHumanAge = ages =>
  ages
    .map(age => (age <= 2 ? age * 2 : 16 + age * 4))
    .filter(age => age >= 18)
    .reduce((acc, age, i, arr) => acc + age / arr.length, 0);
console.log(calcAverageHumanAge([5, 2, 4, 1, 15, 8, 3]));
 */
/* 
// find method
const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
const firstWithdrawal = movements.find(mov => mov < 0); // Only the first element that satisfies the condition
console.log(movements);
console.log(firstWithdrawal);

console.log(accounts);

const account = accounts.find(acc => acc.owner === 'Jessica Davis'); // finds the account that has the owner as jessica davis
console.log(account);
 */
/* 
// Findindex method
const arr = ['bonjour', 'salut', 'allo', 'sup'];
const bonjour = arr.findIndex((acc, i, arr) => acc === 'allo');
console.log(bonjour); // returns the index of 'allo'
 */
/* 
// Some and every
const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
console.log(movements.includes(-130)); // returns true or false

const anyDeposit = movements.some(mov => mov > 0); // Check if there is an item in the array that returns true to the condition
console.log(anyDeposit);

// Every
console.log(movements.every(mov => mov > 0)); // only true if all elements in the array satisfy the condition

// Seperate callback
const deposit = mov => mov > 0;
console.log(movements.some(deposit));
console.log(movements.every(deposit));
console.log(movements.filter(deposit));
 */
/* 
// Flat and flatmap
const arr = [[1, 2, 3], [4, 5, 6], 7, 8];
console.log(arr.flat()); // creates a full array, removes the nested arrays
const arrDeep = [[[1, 2], 3], [4, [5, 6]], 7, 8];
console.log(arrDeep.flat()); // Only goes one level deep of flat
console.log(arrDeep.flat(1));
console.log(arrDeep.flat(2)); // Goes two levels deep!!

const accountMovements = accounts.map(acc => acc.movements);
console.log(accountMovements); // array of arrays (the movements of all the account)

const allMovements = accountMovements.flat();
console.log(allMovements); // all the movements in one array, not nested
const overalBalance = allMovements.reduce((acc, mov) => acc + mov, 0); // sum of all the movements
console.log(overalBalance);

// Same thing chained
const overalBalance2 = accounts
  .map(acc => acc.movements)
  .flat()
  .reduce((acc, mov) => acc + mov, 0);
console.log(overalBalance2);

// Same thing with flatmap
const overalBalance3 = accounts
  .flatMap(acc => acc.movements) // Only goes 1 level deep
  .reduce((acc, mov) => acc + mov, 0);
console.log(overalBalance3);
 */
/* 
// Sorting arrays

const owners = ['Jonas', 'Zach', 'Adam', 'Martha'];
console.log(owners.sort()); // alphabetical order
console.log(owners); // original array is changed

// Numbers (not mixed with strings!!)
const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
console.log(movements);
// console.log(movements.sort()); // Sorting by string, not numbers by default

// Sort: return < 0, A, B (keep order)
// return > 0, B, A (switch order)

movements.sort((a, b) => {
  if (a > b) return 1;
  if (b > a) return -1;
});

movements.sort((a, b) => a - b); // same thing, cleaner

console.log(movements); // sorted in ascending order

movements.sort((a, b) => {
  if (a > b) return -1;
  if (b > a) return 1;
});

movements.sort((a, b) => b - a); // same thing, cleaner

console.log(movements); // sorted in descending order
 */
/* 
// Creating and filling arrays
console.log(new Array(1, 2, 3, 4, 5, 6, 7));

const x = new Array(7); // array with 7 empty elements
console.log(x);
console.log(x.fill(1, 3, 5)); // fills with the element, from the 3rd to the 5th
const arr = [1, 2, 3, 4, 5, 6, 7, 8];
arr.fill(23, 2, 6); // replaces with 23!!
console.log(arr);

const y = Array.from({ length: 7 }, () => 1); // creating an array with 7 1s
console.log(y);

const z = Array.from({ length: 7 }, (current, i) => i + 1); // creates an array from 1 to 7, can replace current by _ if not used
console.log(z);

// converting the almost arrays returned form querySelectorAll to real arrays so we can used array methods
// Example: if we wanted to get the sum of the movements displayed

labelBalance.addEventListener('click', function () {
  const movementsUI = Array.from(
    document.querySelectorAll('.movements__value'), //Node list
    el => Number(el.textContent.replace('€', '')) // mapping function
  ); // all the movements displayed
  console.log(movementsUI);
});
 */
/* 
// Coding challenge 4

const dogs = [
  { weight: 22, curFood: 250, owners: ['Alice', 'Bob'] },
  { weight: 8, curFood: 200, owners: ['Matilda'] },
  { weight: 13, curFood: 275, owners: ['Sarah', 'John'] },
  { weight: 32, curFood: 340, owners: ['Michael'] },
];

// 1.
dogs.forEach(
  dog => (dog.recommendedFood = Math.trunc(dog.weight ** 0.75 * 28))
);
console.log(dogs);

// 2.
// console.log(
//   dogs.forEach(dog => dog.owners.includes('Sarah'))
//     ? dog.curFood > dog.recommendedFood
//       ? 'too much'
//       : 'too little'
//     : false
// );

console.log(dogs.find(dog => dog.owners.includes('Sarah')));

// 3.
const ownersEatTooMuch = dogs
  .filter(dog => dog.curFood > dog.recommendedFood)
  .flatMap(dog => dog.owners);
const ownersEatTooLittle = dogs
  .filter(dog => dog.curFood < dog.recommendedFood)
  .flatMap(dog => dog.owners);

console.log(ownersEatTooMuch);
console.log(ownersEatTooLittle);

// 4.
console.log(`${ownersEatTooMuch.join(' and ')}'s dogs eat too much!`);
console.log(`${ownersEatTooLittle.join(' and ')}'s dogs eat too little!`);

// 5.
console.log(dogs.some(dog => dog.curFood === dog.recommendedFood));

// 6.
const okay = dog =>
  dog.curFood <= dog.recommendedFood + dog.recommendedFood / 10 &&
  dog.curFood >= dog.recommendedFood - dog.recommendedFood / 10;

console.log(dogs.some(okay));

// 7.
const okayDogs = dogs.filter(okay);
console.log(okayDogs);

// 8.
const recommendedSort = dogs
  .slice()
  .sort((a, b) => a.recommendedFood - b.recommendedFood);
console.log(recommendedSort);
 */

////////////////////////////////////////////////////////
// Practice array methods
/* 
// 1. Total of bank deposits
const bankDepositSum = accounts
  .flatMap(acc => acc.movements)
  .filter(mov => mov > 0)
  .reduce((sum, cur) => sum + cur, 0);

console.log(bankDepositSum);

// 2. Number of deposits greater than 1000
const numDeposits1000 = accounts
  .flatMap(acc => acc.movements)
  .reduce((amount, cur) => (cur >= 1000 ? amount + 1 : amount), 0); // cant write amount++!!!

console.log(numDeposits1000);

let a = 10;
console.log(a++); //returns 10, the old value
console.log(a); // returns 11, the new value

// 3. Create an object with an array of arrays
const sums = accounts
  .flatMap(acc => acc.movements)
  .reduce(
    (sums, cur) => {
      // cur > 0 ? (sums.deposits += cur) : (sums.withdrawals += cur);
      sums[cur > 0 ? 'deposits' : 'withdrawals'] += cur; // same thing
      return sums; // Important to do with {}!!!
    },
    { deposits: 0, withdrawals: 0 }
  );

console.log(sums); // sums -> object

// 4. Convert any string to title case
// this is a nice title -> This Is a Nice Title
const convertTitleCase = function (title) {
  const exceptions = ['a', 'and', 'the', 'but', 'or', 'on', 'in', 'with'];
  return title
    .toLowerCase()
    .split(' ')
    .map(word =>
      exceptions.includes(word) ? word : word[0].toUpperCase() + word.slice(1)
    )
    .join(' ');
};

console.log(convertTitleCase('this is a nice title'));
console.log(convertTitleCase('this is a LONG title but not too long'));
console.log(convertTitleCase('and here is another title with an EXAMPLE'));
 */

////////////////////////////////////////////////////////
// Array methods: when to use them and which one to use?
//
//--- To mutate original array:
//  add to original:
//    .push
//    .unshift
//
//  remove from original:
//    .pop
//    .shift
//    .splice
//
//  others:
//    .revers
//    .sort
//    .fill
//
//--- Creating a new array:
//
//  computed from original:
//    .map
//
//  filtered using condition:
//    .filter
//
//  portion of original:
//    .slice
//
//  adding original to other:
//    .concat
//
//  flattening the original
//    .flat
//    .flatMap
//
//--- An array index
//
//  based on value:
//    .indexOf
//
//  based on test condition:
//    .findIndexOf
//
//--- Know if array includes
//
//  based on value:
//    .includes
//
//  based on test condition:
//    .some
//    .every
//
//--- To transform to value
//
//  based on accumulator:
//    .reduce
//
//--- An array element
//
//  based on test condition:
//    .find
//
//--- A new string
//
//  based on separator string:
//    .join
//
//--- To just loop array
//
//  based on callback:
//    .forEach
//
//////////////////////////////////////////////
