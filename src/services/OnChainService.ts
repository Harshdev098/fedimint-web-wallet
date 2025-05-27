// import type { PeginResponse } from "../hooks/wallet.type";
// import type { Wallet } from "../hooks/wallet.type";

// export const PegIn=async(wallet:Wallet) : Promise<PeginResponse>=>{
//     try{
//         const result=await wallet.wallet.pegin({})
//         console.log("result from pegin is ",result)
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
//         const result=await wallet.wallet.pegout(amount,address)
//         console.log('pegout result ',result)
//         if(result){
//             return result;
//         }
//     }catch(err){
//         console.log('An error occured ',err)
//         throw new Error(`An error occured ${err}`)
//     }
// }