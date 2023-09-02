import React, { useEffect, useState } from "react";
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "../../../declarations/nft";
import { idlFactory as tokenIdlFactory } from "../../../declarations/token";
import { Principal } from "@dfinity/principal";
import Button from "./Button";
import { opend } from "../../../declarations/opend";
import CURRENT_USER_ID from "../index";
import PriceLabel from "./PriceLabel";

function Item(props) {
  const [name, setName] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [image, setImage] = useState();
  const [button, setButton] = useState(); // control the states of sell button
  const [priceInput, setPriceInput] = useState(); // control the states of price input
  const [loaderHidden, setLoaderHidden] = useState(true);
  const [blur, setBlur] = useState(); // control the style of image
  const [listingStatus, setListingStatus] = useState(); // control the notice of listing
  const [priceLabel, setPriceLabel] = useState();
  const [shouldDisplay, setDisplay] = useState(true); // control the display of NFT item

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

    // handle input, ownerId, and sell button on MyNFTs and Discover page
    if (props.role === "collection") {
      // on MyNFTs page
      const nftIsListed = await opend.isListed(props.id);
      if (nftIsListed) {
        setPriceInput(); // hide the input
        setOwnerId("OpenD");
        setListingStatus("Listed");
        setBlur({ filter: "blur(4px)" });
      } else {
        setButton(<Button handleClick={handleSell} text={"Sell"} />);
      }
    } else if (props.role === "discover") {
      // on Discover page
      const originalOwner = await opend.getOriginalOwner(props.id);
      if (originalOwner.toText() != CURRENT_USER_ID.toText()) {
        // original owner cannot buy the NFT
        setButton(<Button handleClick={handleBuy} text={"Buy"} />);
      }

      const price = await opend.getListedNFTPrice(props.id);
      setPriceLabel(<PriceLabel sellPrice={price.toString()} />);
    }
  }

  useEffect(() => {
    loadNFT();
  }, []);

  let price;
  function handleSell() {
    // show input when sell button is clicked and change button text
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
    setBlur({ filter: "blur(4px)" });
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

  async function handleBuy() {
    // triggered when user click buy on Discover page
    console.log("Buy is triggered");
    setLoaderHidden(false);
    const tokenActor = await Actor.createActor(tokenIdlFactory, {
      // create a token actor with its own id
      agent,
      canisterId: Principal.fromText("rrkah-fqaaa-aaaaa-aaaaq-cai"),
    });

    const sellerId = await opend.getOriginalOwner(props.id);
    const itemPrice = await opend.getListedNFTPrice(props.id);

    const result = await tokenActor.transfer(sellerId, itemPrice); // transfer tokens through the token actor
    if (result == "Success") {
      const transferResult = await opend.completePurchase(
        props.id,
        sellerId,
        CURRENT_USER_ID
      );
      console.log("purchase: " + transferResult);
      setLoaderHidden(true);
      setDisplay(false); // hide the sold NFT
    }
  }

  return (
    <div className="disGrid-item" style={{display: shouldDisplay ? "inline" : "none"}}>
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
          {priceLabel}
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
