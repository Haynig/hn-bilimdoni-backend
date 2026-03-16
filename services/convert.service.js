import { getHNPrice } from "./hnprice.service.js";
import { getTonPrice } from "./rate.service.js";

export const getHNtoUZS = async () => {

const hn = await getHNPrice();

const ton = await getTonPrice();

const usdUzs = 12600; // USD → so'm kursi

return hn * ton * usdUzs;

};
