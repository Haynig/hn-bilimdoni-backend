export const getTonPrice = async () => {

const res = await fetch(
"https://api.coingecko.com/api/v3/simple/price?ids=the-open-network&vs_currencies=usd"
);

const data = await res.json();

return data["the-open-network"].usd;

};
