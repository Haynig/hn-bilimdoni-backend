export function generateAccountNumber(prefix){
  return prefix + Math.floor(10000000000 + Math.random() * 90000000000);
}
