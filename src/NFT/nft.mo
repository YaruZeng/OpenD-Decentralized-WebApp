import Debug "mo:base/Debug";
import Principal "mo:base/Principal";

actor class NFT (name: Text, owner: Principal, content: [Nat8]) = this { // to create actors programmatically 
  
    private let itemName = name;
    private var nftOwner = owner;
    private let imageBytes = content;

    public query func getName() : async Text{
        return itemName;
    };

    public query func getOwner() : async Principal{
        return nftOwner;
    };

    public query func getImage() : async [Nat8]{
        return imageBytes;
    };

    public query func getCanisterId() : async Principal {
        return Principal.fromActor(this);
    };

    public shared(msg) func transferOwnership(newOwner: Principal) : async Text { // transfer the ownership of the NFT to a new owner
        if (msg.caller == nftOwner) {
            nftOwner := newOwner;
            return "Success";
        } else {
            return "Error: Not initated by NFT Owner."
        }
    };

};