import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { opend } from "../../../declarations/opend";
import { Principal } from "@dfinity/principal";
import Item from "./Item";

function Minter() {
  const { register, handleSubmit } = useForm(); // handle the form
  const [NFTPrincipal, setNFTPrincipal] = useState(""); // get states of nft minter to handle the page
  const [loaderHidden, setLoaderHidden] = useState(true); // control states of the loader

  async function onSubmit(data) { // get the data from form and mint nft
    setLoaderHidden(false); // show the loader
    const name = data.name;
    const image = data.image[0];
    const imageBytes = [...new Uint8Array(await image.arrayBuffer())]; // convert image to Uint8Array

    const newNFTID = await opend.mint(imageBytes, name);
    setNFTPrincipal(newNFTID.toText());
    setLoaderHidden(true); // hide the loader
  }

  if (NFTPrincipal === "") { // show register page
    return (
      <div className="minter-container">
      <div hidden={loaderHidden} className="lds-ellipsis">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
        <h3 className="makeStyles-title-99 Typography-h3 form-Typography-gutterBottom">
          Create NFT
        </h3>
        <h6 className="form-Typography-root makeStyles-subhead-102 form-Typography-subtitle1 form-Typography-gutterBottom">
          Upload Image
        </h6>
        <form className="makeStyles-form-109" noValidate="" autoComplete="off">
          <div className="upload-container">
            <input
              {...register("image", { required: true })} // var name is "image", required to fill in
              className="upload"
              type="file"
              accept="image/x-png,image/jpeg,image/gif,image/svg+xml,image/webp"
            />
          </div>
          <h6 className="form-Typography-root makeStyles-subhead-102 form-Typography-subtitle1 form-Typography-gutterBottom">
            Collection Name
          </h6>
          <div className="form-FormControl-root form-TextField-root form-FormControl-marginNormal form-FormControl-fullWidth">
            <div className="form-InputBase-root form-OutlinedInput-root form-InputBase-fullWidth form-InputBase-formControl">
              <input
                {...register("name", { required: true })} // var name is "name", required to fill in
                placeholder="e.g. CryptoDunks"
                type="text"
                className="form-InputBase-input form-OutlinedInput-input"
              />
              <fieldset className="PrivateNotchedOutline-root-60 form-OutlinedInput-notchedOutline"></fieldset>
            </div>
          </div>
          <div className="form-ButtonBase-root form-Chip-root makeStyles-chipBlue-108 form-Chip-clickable">
            <span onClick={handleSubmit(onSubmit)} className="form-Chip-label">
              Mint NFT
            </span>
          </div>
        </form>
      </div>
    );
  } else {
    return ( // show minted item
    <div className="minter-container">
      <h3 className="Typography-root makeStyles-title-99 Typography-h3 form-Typography-gutterBottom">
        Minted!
      </h3>
      <div className="horizontal-center">
        <Item id={NFTPrincipal}/>
      </div>
    </div>);
  }
}

export default Minter;
