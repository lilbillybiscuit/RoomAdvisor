import "./ReviewRoomModal.css";
import React, { Component } from "react";
import { Button } from "../../Button";
import { Autocomplete, Textarea, Slider } from "@mantine/core";
// import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getStorage, ref, uploadBytes, getDownloadURL } from "api/storage";
import Compress from "browser-image-compression";
import { ThemeProvider } from "react-bootstrap";
import { createTheme } from "@mui/material/styles";
import { codeToCollege } from "../../../utils/colleges";
import received from "../../../static/review-received.svg";
import compressing from "../../../static/compressing-images.svg";

const theme = createTheme({
  typography: {
    body1: {
      fontSize: 72,
    },
  },
  components: {
    MuiAutocomplete: {
      styleOverrides: {
        root: {
          "& label": {
            fontSize: 64,
          },
        },
        input: {
          fontSize: 22,
        },
        listbox: {
          fontSize: 22,
        },
      },
    },
  },
});

export default class ReviewRoomModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      compressing: false,
      submitting: false,
      storage: getStorage(),
      fileTypeError: false,
    };
  }

  compressFile = async (file) => {
    // Compression config
    const options = {
      // As the key specify the maximum size
      // Leave blank for infinity
      maxSizeMB: 0.01,
      maxWidthOrHeight: 1920,
      // Use webworker for faster compression with
      // the help of threads
      useWebWorker: true,
    };

    // Initialize compression
    // First argument is the file object from the input
    // Second argument is the options object with the
    // config
    const compressedBlob = await Compress(file, options);
    // Convert to file
    compressedBlob.lastModifiedDate = new Date();
    const convertedBlobFile = new File([compressedBlob], file.name, {
      type: file.type,
      lastModified: Date.now(),
    });
    return convertedBlobFile;
  };

  makeid(length) {
    var result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  uploadPictures = async (files, roomCode) => {
    var count = this.makeid(5);
    var fileLinks = [];
    for (const file of files) {
      const compressed = await this.compressFile(file);
      const storageRef = ref(
        this.state.storage,
        `${this.props.college}-${roomCode}-${count}`
      );
      await uploadBytes(storageRef, compressed);
      const fileUrl = await getDownloadURL(storageRef);
      fileLinks.push(fileUrl);
      count++;
    }
    return fileLinks;
  };

  roomCodeIsValid = (code) => {
    for (const roomCode of this.props.roomNames) {
      if (code === roomCode) return true;
    }
    return false;
  };

  pictureFileFormatsValid = (pictures) => {
    for (const pic of pictures) {
      const ext = pic.name.split(".").pop().toLowerCase();

      if (ext === "png" || ext === "jpg" || ext === "jpeg") continue;

      this.setState({ fileTypeError: true });
      return false;
    }
    return true;
  };

  handleAddReview = async (e) => {
    e.preventDefault();

    if (!this.roomCodeIsValid(e.target.roomCode.value)) return;

    if (!this.pictureFileFormatsValid(e.target.roomPictures.files)) return;

    this.setState({ compressing: true });

    //send pictures to firebase
    const fileLinks = await this.uploadPictures(
      e.target.roomPictures.files,
      e.target.roomCode.value
    );

    this.setState({ compressing: false, submitting: true });

    this.props.handleAddReview({
      roomCode: e.target.roomCode.value,
      sw: e.target.sw.value,
      rec: e.target.rec.value,
      noise: e.target.noise.value / 25,
      size: e.target.size.value / 25,
      roomPictures: fileLinks,
    });

    this.setState({ submitting: false });
  };

  render() {
    if (this.state.compressing) {
      return (
        <div>
          <div>
            <img
              className="review-received-image"
              src={received}
              alt="review-received"
            />
            <p>Thank you for submitting a review!</p>
          </div>
          <div>
            <img
              className="review-received-image"
              src={compressing}
              alt="compressing-images"
            />
            <p>Compressing Pictures...</p>
          </div>
        </div>
      );
    } else if (this.state.submitting) {
      return (
        <div>
          <div>
            <img
              className="review-received-image"
              src={received}
              alt="review-received"
            />
            <p>Uploading review...</p>
          </div>
        </div>
      );
    }
    return (
      <div className="submit-review-container">
        <div className="submit-review-form-container">
          <div className="submit-review-header">
            <p className="submit-review-header-text"> Review a room </p>
            <p className="submit-review-header-subtext">
              {" "}
              This anonymous form lets you review a room you are currently
              living in or have lived in the past. Individual identities
              associated with reviews will not be displayed or kept in our
              records.
            </p>
            <hr className="line-block"></hr>
          </div>

          <form onSubmit={this.handleAddReview}>
            <ThemeProvider theme={theme}>
              <Autocomplete
                onFocus={(event) =>
                  event.target.setAttribute("autocomplete", "off")
                }
                name="roomCode"
                label={`In ${codeToCollege(
                  this.props.college
                )}, what room would you like to review?`}
                placeholder="Please include entry way, room number, and letter of the room. (Ex: B41A) "
                data={this.props.roomNames}
                required
              />
            </ThemeProvider>
            <Textarea
              name="sw"
              placeholder="..."
              label="What did/do you like about this room and/or suite?"
              autosize
              minRows={2}
              required
            />
            <Textarea
              name="rec"
              placeholder="..."
              label="Would you recommend this room and/or suite to another student?"
              autosize
              minRows={2}
              required
            />
            <div className="slider-container">
              <p className="question-title">
                Relative to other rooms at Yale, how loud is/was this room
                usually?{" "}
              </p>
              <Slider
                label={null}
                className="slider"
                styles={{
                  root: { width: "60%" },
                  bar: { backgroundColor: "#0053c5" },
                  thumb: { backgroundColor: "#fff", borderColor: "#0053c5" },
                  mark: { backgroundColor: "#fff" },
                  markFilled: { borderColor: "#0053c5" },
                }}
                name="noise"
                step={25}
                defaultValue={50}
                marks={[
                  { value: 0, label: "Much quieter" },
                  { value: 25, label: "Quieter" },
                  { value: 50, label: "Same" },
                  { value: 75, label: "Louder" },
                  { value: 100, label: "Much louder" },
                ]}
              />
              <br />
            </div>
            <div className="slider-container">
              <p className="question-title">
                {" "}
                Relative to other rooms at Yale, the size of this room is:{" "}
              </p>
              <Slider
                label={null}
                className="slider"
                styles={{
                  root: { width: "60%" },
                  bar: { backgroundColor: "#0053c5" },
                  thumb: { backgroundColor: "#fff", borderColor: "#0053c5" },
                  mark: { backgroundColor: "#fff" },
                  markFilled: { borderColor: "#0053c5" },
                }}
                name="size"
                step={25}
                defaultValue={50}
                marks={[
                  { value: 0, label: "Much smaller" },
                  { value: 25, label: "Smaller" },
                  { value: 50, label: "Same" },
                  { value: 75, label: "Larger" },
                  { value: 100, label: "Much larger" },
                ]}
              />
              <br />
            </div>

            <div className="picture-upload-container">
              <p className="photo-upload-title"> Add photos to your review </p>
              <p className="question-subtext">
                {" "}
                A picture speaks a thousand words! If you have a photo of the
                room before or after you moved in please upload here. Individual
                names and identities will not be displayed or kept in our
                records.{" "}
              </p>
              <label
                class="custom-file-upload file-input__label"
                for="roomPictures"
              >
                <svg
                  className="upload-icon"
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fas"
                  data-icon="upload"
                  class="svg-inline--fa fa-upload fa-w-16"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                >
                  <path
                    fill="#0053c5"
                    d="M296 384h-80c-13.3 0-24-10.7-24-24V192h-87.7c-17.8 0-26.7-21.5-14.1-34.1L242.3 5.7c7.5-7.5 19.8-7.5 27.3 0l152.2 152.2c12.6 12.6 3.7 34.1-14.1 34.1H320v168c0 13.3-10.7 24-24 24zm216-8v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h136v8c0 30.9 25.1 56 56 56h80c30.9 0 56-25.1 56-56v-8h136c13.3 0 24 10.7 24 24zm-124 88c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm64 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z"
                  ></path>
                </svg>
                <input
                  multiple
                  class="photo-upload-button"
                  type="file"
                  id="roomPictures"
                  name="roomPictures"
                  accept="image/png, image/jpeg"
                />
                {this.state.fileTypeError ? "only png and jpg allowed" : ""}
              </label>
            </div>

            <div className="submit-button-container">
              <Button
                buttonStyle="btn--primary"
                buttonSize="btn--large"
                className="register-button align-right"
                type="submit"
              >
                Submit
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}
