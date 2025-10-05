import { purchaseType } from "@prisma/client";
import { getDiscountPercent } from "../../../lib/helper/payment";
import prisma from "../../../db/index";



const subcriptions = [
  {
    markedPrice: 300,
    title: "Bronze",
    price: 150,
    time: "2 Month",
    offerActive: [ "Access to Our Exclusive Telegram Premium Group",],
    offerInActive: ["Free Daily Practice Tests","Access Free DPPs Every Day","Free Access to PYQ Tests", "Free Access to Mock Tests"],
    btncolor: "",
  },

  {
    markedPrice: 400,
    title: "Silver",
    price: 200,
    time: "2 Month",
    offerActive: ["Access to Our Exclusive Telegram Premium Group","Free Daily Practice Tests" ,"Access Free DPPs Every Day"],
    offerInActive: ["Free Access to PYQ Tests", "Free Access to Mock Tests"],
    btncolor: "success",
  },
  {
    markedPrice: 500,
    title: "Gold",
    price: 250,
    time: "2 Month",
    offerActive: ["Access to Our Exclusive Telegram Premium Group","Free Daily Practice Tests","Access Free DPPs Every Day" ,"Free Access to PYQ Tests", "Free Access to Mock Tests"],
    offerInActive: [],
    btncolor: "",
  },
];

const offers = [
  {
    markedPrice: 300,
    title: "Basic Plan",
    price: 150,
    token: 150,
    offerActive: ["This card does not include any bonus or additional tokens"],
    offerInActive: [],
    btncolor: "",
  },
  {
    markedPrice: 300,
    title: "Standerd Plan",
    price: 200,
    token: 205,
    offerActive: ["Get 5 extra tokens with this purchase."],
    offerInActive: [],
    btncolor: "success",
  },
  {
    markedPrice: 300,
    title: "Premium Plan",
    price: 250,
    token: 260,
    offerActive: ["Get 10 extra tokens with this purchase."],
    offerInActive: [],
    btncolor: "",
  },
  // {
  //   markedPrice: 300,
  //   title: "Premium + Plan",
  //   price: 600,
  //   token: 650,
  //   offerActive: ["You will not get any extra tokens."],
  //   offerInActive: [],
  //   btncolor: "",
  // },
];



export const SubcriptionsAndOffer = async() =>{
    // subscription and offer
  subcriptions.map(async (sub) => {
    await prisma.subcriptionOffers.create({
      data: {
        type: purchaseType.subcription,
        title: sub.title,
        price: sub.price,
        offerActive: sub.offerActive,
        offerInActive: sub.offerInActive,
        btncolor: sub.btncolor,
        time: sub.time,
        markedPrice: sub.markedPrice,
        discount: getDiscountPercent(sub.markedPrice, sub.price),
      },
    });
  });

  offers.map(async (sub) => {
    await prisma.subcriptionOffers.create({
      data: {
        type: purchaseType.token,
        title: sub.title,
        price: sub.price,
        offerActive: sub.offerActive,
        offerInActive: sub.offerInActive,
        btncolor: sub.btncolor,
        token: sub.token,
        markedPrice: sub.markedPrice,
        discount: getDiscountPercent(sub.markedPrice, sub.price),
      },
    });
  });
}