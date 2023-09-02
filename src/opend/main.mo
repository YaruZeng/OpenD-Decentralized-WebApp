import Cycles "mo:base/ExperimentalCycles";
import Principal "mo:base/Principal";
import NFTActorClass "../NFT/nft";
import Debug "mo:base/Debug";
import HashMap "mo:base/HashMap";
import List "mo:base/List";

actor OpenD {

    var mapOfNFTs = HashMap.HashMap<Principal, NFTActorClass.NFT>(1, Principal.equal, Principal.hash); // to store <NFTPrincipalId: NFT>
    var mapOfOwners = HashMap.HashMap<Principal, List.List<Principal>>(1, Principal.equal, Principal.hash); // to store <OwnerPrincipalId: List of NFTPrincipalIds>

    public shared(msg) func mint(imgData: [Nat8], name: Text) : async Principal { // mint nft from an ecommerce page
        let owner : Principal = msg.caller;

        Debug.print(debug_show((Cycles.balance()))); // check cycles balance
        Cycles.add(100_500_000_000); // add cycles
        let newNFT = await NFTActorClass.NFT(name, owner, imgData); // mint nft through the NFT actor class
        Debug.print(debug_show((Cycles.balance())));

        let newNFTPrincipal = await newNFT.getCanisterId(); // get the principal id of new NFT
        
        mapOfNFTs.put(newNFTPrincipal, newNFT); // store new NFT into NFTMap
        addToOwnerMap(owner, newNFTPrincipal); // store new NFT into ownerMap

        return newNFTPrincipal;
    };      

    private func addToOwnerMap(owner: Principal, nftId: Principal) { // to store new NFT into ownerMap
        var ownedNFTs : List.List<Principal> = switch (mapOfOwners.get(owner)) { // get the list of NFTs the owner owned
            case null List.nil<Principal>(); // in case the owener ID doesn't exist in the map
            case (?result) result;
        };

        ownedNFTs := List.push(nftId, ownedNFTs); // save new NFT to the list
        mapOfOwners.put(owner, ownedNFTs); // save into the ownerMap
    };

    public query func getOwnedNFTs(user: Principal) : async [Principal] {
        var userNFTs : List.List<Principal> = switch (mapOfOwners.get(user)) { // get the list of NFTs the owner owned
            case null List.nil<Principal>(); // in case the owener ID doesn't exist in the map
            case (?result) result;
        };

        return List.toArray(userNFTs);
    };

};
