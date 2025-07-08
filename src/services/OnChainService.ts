// import type { PeginResponse } from "../hooks/wallet.type";
// import type { Wallet } from "../hooks/wallet.type";
// import logger from "../utils/logger";

// export const PegIn=async(wallet:Wallet) : Promise<PeginResponse>=>{
//     try{
//         const result=await wallet.wallet.generateAddress()
//         logger.log("result from pegin is ",result)
//         if(result){
//             return result;
//         }
//         throw new Error("No result returned from pegin");
//     }catch(err){
//         throw new Error(`An error occured ${err}`)
//     }
// }

// export const PegOut=async(wallet:Wallet,address:string,amount:number)=>{
//     try{
//         const result=await wallet.wallet.sendOnchain(amount,address)
//         logger.log('pegout result ',result)
//         if(result){
//             return result;
//         }
//     }catch(err){
//         logger.log('An error occured ',err)
//         throw new Error(`An error occured ${err}`)
//     }
// }