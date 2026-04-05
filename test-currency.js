// Test file to verify currency formatting change
function formatMoney(n) {
  return n.toLocaleString(undefined, { style: 'currency', currency: 'INR' });
}

// Test with some sample amounts
console.log('Testing currency formatting with INR:');
console.log('1000:', formatMoney(1000));
console.log('2500.50:', formatMoney(2500.50));
console.log('10000:', formatMoney(10000));
console.log('999999.99:', formatMoney(999999.99));

// For comparison, show what it would look like with USD
function formatMoneyUSD(n) {
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
}

console.log('\nFor comparison with USD:');
console.log('1000:', formatMoneyUSD(1000));
console.log('2500.50:', formatMoneyUSD(2500.50));
