import React, { useEffect, useState } from "react";
import logo from "../../assets/logo.png";
import {Actor, HttpAgent} from "@dfinity/agent";
import {idlFactory} from "../../../declarations/nft";
import {Principal} from "@dfinity/principal";

function Item(props) {

  const [name, setName] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [image, setImage] = useState();

  const id = Principal.fromText(props.id);

  const localHost = "http://localhost:8080/"; // to make HTTP request to fetch the nft canister
  const agent = new HttpAgent({host: localHost}); // create a HTTP argent

  async function loadNFT() { // create a nft actor and fetch data from backend
    const NFTActor = await Actor.createActor(idlFactory, {
      agent,
      canisterId: id
    });

    const name = await NFTActor.getName();
    const owner = await NFTActor.getOwner();
    const imageBytes = await NFTActor.getImage();

    // turn image bytes to an image URL
    const imageContent = new Uint8Array(imageBytes);
    const imageURL = URL.createObjectURL(
      new Blob([imageContent.buffer], {type: "image/png"})
    );

    setName(name);
    setOwnerId(owner.toText());
    setImage(imageURL);
  };


  useEffect(() => {
    loadNFT();
  }, []);

  return (
    <div className="disGrid-item">
      <div className="disPaper-root disCard-root makeStyles-root-17 disPaper-elevation1 disPaper-rounded">
        <img
          className="disCardMedia-root makeStyles-image-19 disCardMedia-media disCardMedia-img"
          src={image}
        />
        <div className="disCardContent-root">
          <h2 className="disTypography-root makeStyles-bodyText-24 disTypography-h5 disTypography-gutterBottom">
            {name}<span className="purple-text"></span>
          </h2>
          <p className="disTypography-root makeStyles-bodyText-24 disTypography-body2 disTypography-colorTextSecondary">
            Owner: {ownerId}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Item;
