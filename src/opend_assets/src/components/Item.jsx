import React, { useEffect, useState } from "react";
import logo from "../../assets/logo.png";
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "../../../declarations/nft";
import { Principal } from "@dfinity/principal";
import Button from "./Button";
import { opend } from "../../../declarations/opend";

function Item(props) {
  const [name, setName] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [image, setImage] = useState();
  const [button, setButton] = useState(); // control the states of sell button
  const [priceInput, setPriceInput] = useState(); // control the states of price input
  const [loaderHidden, setLoaderHidden] = useState(true); 
  const [blur, setBlur] = useState(); // control the style of image
  const [listingStatus, setListingStatus] = useState(); // control the notice of listing

  const id = props.id;

  const localHost = "http://localhost:8080/"; // to make HTTP request to fetch the nft canister
  const agent = new HttpAgent({ host: localHost }); // create a HTTP argent
  // TODO: when deploy live, remove the following line
  agent.fetchRootKey(); // to get rid of Error: Invalid principal argument
  let NFTActor;

  async function loadNFT() {
    // create a nft actor and fetch data from backend
    NFTActor = await Actor.createActor(idlFactory, {
      agent,
      canisterId: id,
    });

    const name = await NFTActor.getName();
    const owner = await NFTActor.getOwner();
    const imageBytes = await NFTActor.getImage();

    // turn image bytes to an image URL
    const imageContent = new Uint8Array(imageBytes);
    const imageURL = URL.createObjectURL(
      new Blob([imageContent.buffer], { type: "image/png" })
    );

    setName(name);
    setOwnerId(owner.toText());
    setImage(imageURL);

    // handle input, ownerId, and sell button
    const nftIsListed = await opend.isListed(props.id);
    if (nftIsListed) {
      setPriceInput(); // hide the input
      setOwnerId("OpenD");
      setListingStatus("Listed");
    } else {
      setButton(<Button handleClick={handleSell} text={"Sell"} />);
    };
  }

  useEffect(() => {
    loadNFT();
  }, []);

  let price;
  function handleSell() {
    // show input when sell button is clicked and change button text
    console.log("Sell clicked");
    setPriceInput(
      <input
        placeholder="Price in Samaritan"
        type="number"
        className="price-input"
        value={price}
        onChange={(e) => (price = e.target.value)}
      />
    );
    setButton(<Button handleClick={sellItem} text={"Confirm"} />); // change button text
  }

  async function sellItem() {
    // to display NFT ready to sell
    setBlur({filter: "blur(4px)"});
    setLoaderHidden(false);
    console.log("Sell confirmed: " + price);
    const listingResult = await opend.listItem(props.id, Number(price));
    console.log("listing: " + listingResult);
    if (listingResult == "Success") {
      const openDId = await opend.getOpenDCanisterID(); // get the system Principal Id as the new owner
      const transferResult = await NFTActor.transferOwnership(openDId);
      console.log("transfer: " + transferResult);
      if (transferResult === "Success") {
        setLoaderHidden(true);
        setButton(); // hide the button
        setPriceInput(); // hide the input
        setOwnerId("OpenD");
        setListingStatus("Listed");
      }
    }
  }

  return (
    <div className="disGrid-item">
      <div className="disPaper-root disCard-root makeStyles-root-17 disPaper-elevation1 disPaper-rounded">
        <img
          className="disCardMedia-root makeStyles-image-19 disCardMedia-media disCardMedia-img"
          src={image}
          style={blur}
        />
        <div hidden={loaderHidden} className="lds-ellipsis">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div className="disCardContent-root">
          <h2 className="disTypography-root makeStyles-bodyText-24 disTypography-h5 disTypography-gutterBottom">
            {name}
            <span className="purple-text"> {listingStatus}</span>
          </h2>
          <p className="disTypography-root makeStyles-bodyText-24 disTypography-body2 disTypography-colorTextSecondary">
            Owner: {ownerId}
          </p>
          {priceInput}
          {button};
        </div>
      </div>
    </div>
  );
}

export default Item;
