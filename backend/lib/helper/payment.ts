


// price is merketpricce 
export const getFinalPrice = (markedPrice: number, discountPercent: number) => {
  return markedPrice - (markedPrice * discountPercent) / 100;
};

export const getDiscountPercent = (markedPrice: number, price:number) =>{
 return ((markedPrice - price) / markedPrice) * 100;
}

export const discountAmount = (markedPrice:number ,discountPercent:number ) =>{
return (markedPrice * discountPercent) / 100;
} 





