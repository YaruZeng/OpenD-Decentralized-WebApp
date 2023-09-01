import Debug "mo:base/Debug";
import Principal "mo:base/Principal";

actor class NFT (name: Text, owner: Principal, content: [Nat8]) { // to create actors programmatically 
  
  let itemName = name;
  let nftOwner = owner;
  let imageBytes = content;

  public query func getName() : async Text{
    return itemName;
  };

  public query func getOwner() : async Principal{
    return nftOwner;
  };

  public query func getImage() : async [Nat8]{
    return imageBytes;
  };

};