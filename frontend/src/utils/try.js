import React, { Component } from "react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Compress from "browser-image-compression";
import { cTo } from './dat';
import { setDoc, doc } from "firebase/firestore";
import { db } from './firebase';
import { arrayUnion, updateDoc } from "firebase/firestore";

//TODO:
//Fix button anamalous sizing
// add hasSubmittedReview to user data object
// ESCAPE user input for reviews and sanitize inputs
// Ensure that the rooms inputted to add reviews are kosher
// Resize images before they are displayed



export default class TIME extends Component {
    constructor(props) {
        super(props);
        this.state = {
            storage: getStorage()
        }
    }

    isAlpha = (ch) => {
        return /^[A-Z]$/i.test(ch);
    }

    onChange = async (e) => {
        // const file = e.target.files[0];
        // const compressed = await this.compressFile(file);
        // //some-child is the name of the file saved on firebase
        // const storageRef = ref(this.state.storage, 'defaultRoom');
        // await uploadBytes(storageRef, compressed);
        // const fileUrl = await getDownloadURL(storageRef);
        // console.log(fileUrl)

        

        

        const defaultPic = 'https://firebasestorage.googleapis.com/v0/b/room-advisor-v0.appspot.com/o/defaultRoom?alt=media&token=f5d02524-5103-442a-a6bb-b35afaae27e8';
        const college1 = ['BF','BK', 'BR', 'DC', 'ES', 'GH', 'JE', 'MC', 'MY', 'PC', 'SY', 'SM', 'TD', 'TC']
        for(const choice of college1) {
            const collegeArray = cTo(choice);
            var ignore = [];
            for(var i = 0; i < collegeArray.length; i++) {
                // Check to see if the current room has been put in the ignore array
                // If it has continue
                var igk = false;
                for(var l = 0; l < ignore.length; l++) {
                    if(i === ignore[l]) {
                        igk = true;
                        break;
                    }
                }
                if(igk) {
                    continue;
                }  
                
                // Suites are formed with similar stems eg BF-A13A, with the stem being BF-A13
                // Find the stem and put all the suites formmed with that stem together

                // TODO: HANDLE edgecase where a room exists within a suite but has a different 
                // number. eg Suite BF-A13 with rooms BF-A13A, BF-A13B, BF-A13C and BF-A14
                // This suite should have 4 rooms but the current code won't catch it
                ignore.push(i);
                const suite = collegeArray[i];
                //get suite name without the letters
                const lastLetter = suite[0].slice(-1);
                var originalSuiteName;
                if (this.isAlpha(lastLetter)) {
                    originalSuiteName = suite[0].slice(0, -1);
                } else {
                    originalSuiteName = suite[0];
                }
                
                // Create suite with all the rooms required
                var formedSuite = [];
                formedSuite.push(suite);

                // look to see if this suite has other rooms
                for(var j = 0; j < collegeArray.length; j++) {
                    if(i === j) continue;
                    // Ensure we don't add duplicate rooms
                    var ig = false;
                    for(var k = 0; k < ignore.length; k++) {
                        if(j === ignore[k]) {
                            ig = true;
                            break;
                        }
                    }
                    if(ig) {
                        continue;
                    }

                    // Ensure the room found to be a part of the suite is valid
                    const checkSuite = collegeArray[j];
                    const checkName = checkSuite[0].slice(0, -1);
                    if(originalSuiteName === checkName) {
                        ignore.push(j);
                        formedSuite.push(checkSuite);
                    }

                }
                var finalSuiteName;
                // Obtain the suite stem name
                if(formedSuite.length === 1) {
                    finalSuiteName = suite[0].slice(3);
                } else {
                    finalSuiteName = suite[0].slice(3, -1);
                }
                
                console.log(finalSuiteName)
                var finalSuite = {
                    buildingName: choice,
                    suiteCode: finalSuiteName,
                    suiteRoomNames: [],
                };
                // console.log(formedSuite)
                for(const suiteRoom of formedSuite) {
                    const tryName = `${suiteRoom[0].slice(3)}`
                    // Used to construct rooms because of limitations with firebase document retrieval
                    // Within each suite, this just tells you the room code, eg A13A
                    finalSuite.suiteRoomNames.push(tryName);
                    var rm = {
                        [tryName]: {
                            roomCode: tryName,
                            meta: {
                                favorited: false,
                                noBeds: suiteRoom[1],
                                pictures: [],
                                picturesToBeReviewed:[],
                                roomReviews: [],
                                roomReviewsToBeReviewed:[]
                            }
                        }
                    }
                    const merged = {
                        ...finalSuite,
                        ...rm
                    }
                    finalSuite = merged;
                }
                
                // Collection ref
                const bfCollectionRef = doc(db, `Suites/${finalSuite.buildingName}-${finalSuiteName}`);
                await setDoc(bfCollectionRef, finalSuite);
            }

        }
        

        // console.log(uploadArray)
        // 
        

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
            useWebWorker: true
        }

        // Initialize compression
        // First argument is the file object from the input
        // Second argument is the options object with the
        // config
        const compressedBlob = await Compress(file, options);
        // Convert to file
        compressedBlob.lastModifiedDate = new Date();
        const convertedBlobFile = new File([compressedBlob], file.name, { type: file.type, lastModified: Date.now()})
        return convertedBlobFile;
    }

    render() {
        return (
            <input type="file" onChange={this.onChange} />
        );
    }
}