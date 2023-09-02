import Cycles "mo:base/ExperimentalCycles";
import Principal "mo:base/Principal";
import NFTActorClass "../NFT/nft";
import Debug "mo:base/Debug";

actor OpenD {
 
    public shared(msg) func mint(imgData: [Nat8], name: Text) : async Principal { // mint nft from an ecommerce page
        let owner : Principal = msg.caller;

        Debug.print(debug_show((Cycles.balance()))); // check cycles balance
        Cycles.add(100_500_000_000); // add cycles
        let newNFT = await NFTActorClass.NFT(name, owner, imgData); // mint nft through the NFT actor class
        Debug.print(debug_show((Cycles.balance())));
        let newNFTPrincipal = await newNFT.getCanisterId(); // get the principal id of new NFT

        return newNFTPrincipal;
    };      

};
