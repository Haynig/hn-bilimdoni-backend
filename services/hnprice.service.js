export const getHNPrice = async () => {

const res = await fetch("https://api.ston.fi/v1/pools");

const data = await res.json();

const pool = data.pools.find(p =>
p.token0.symbol === "HN" || p.token1.symbol === "HN"
);

return pool.price;

};
