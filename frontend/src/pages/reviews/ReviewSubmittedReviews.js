import "./ReviewSubmittedReviews.css"
import React, { Component, createRef } from "react";
import {
    collection,
    getDocs,
    query,
    where,
} from "firebase/firestore";
import { db } from "../../utils/firebase";
import NavDropdownComponent from "../../components/ViewReviews/Nav/NavDropdownComponent";
import { codeToCollege, collegesToCode } from "../../utils/colleges";


export default class ReviewSubmittedReviews extends Component {
    constructor(props) {
        super(props);
        this.state = {
            building: {
                value: codeToCollege(this.props.user.meta.college),
                label: codeToCollege(this.props.user.meta.college),
            },
            allSuites: []
        }
        this.container = createRef();
    }

    componentDidMount() {
        const suitesRef = collection(db, "Suites");
        const q = query(
            suitesRef,
            where("buildingName", "==", collegesToCode(this.state.building.value))
        );
        var suiteData = [];
        getDocs(q).then((data) => {
            data.forEach((docs) => {
                suiteData.push(docs.data());
            });
        
            var fetchedSuites = this.makeSuites(suiteData);
            var finalSuites = [];
            for(const suite of fetchedSuites) {
                for(const room of suite.suiteRooms) {
                    if(room.meta.roomReviewsToBeReviewed.length > 0 || room.meta.picturesToBeReviewed.length > 0) {
                        finalSuites.push(suite);
                        console.log(suite)
                    }
                }
            }

            this.setState({
                ...this.state,
                allSuites: finalSuites,
            });
        });
    }

    makeSuites = (suites) => {
        var finalSuites = [];
        for (const suite of suites) {
          var madeSuite = {
            buildingName: suite.buildingName,
            suiteCode: suite.suiteCode,
            suiteRooms: [],
          };
          for (var room of suite.suiteRoomNames) {
            madeSuite.suiteRooms.push(suite[room]);
          }
          finalSuites.push(madeSuite);
        }
        return finalSuites;
    };

    handleBuildingDropdownChange = (e) => {
        this.buildingDropdown1.updateYourState(e);
        this.setState({...this.state, building: e});
    }
    

    render() {
        return (
        <div>
            <NavDropdownComponent
                ref={(ip) => {
                this.buildingDropdown1 = ip;
                }}
                currCollege={this.state.building}
                handleChange={this.handleBuildingDropdownChange}
            />
            {this.state.allSuites.map((suite) => (
                <div>
                    <h5>{suite.suiteCode}</h5>
                    <>
                        {suite.suiteRooms.map((room) => (
                            <div className="pictures-container">
                                {room.roomCode}
                                <div className="pic-inner-container">
                                    {room.meta.picturesToBeReviewed.map((pic) => (
                                        <div>
                                            <div className="pic">
                                                <img
                                                    src={pic}
                                                    alt="review-conf-den"   
                                                     
                                                />
                                            </div>
                                            <form>
                                                <div>
                                                    <br/>
                                                    <button>Accept</button>
                                                    <button>Deny</button>
                                                </div>
                                            </form>
                                            <br/>
                                        </div>   
                                    ))}
                                </div>
                                
                                {room.meta.roomReviewsToBeReviewed.map((rev) => (
                                    <form>
                                        <p>{rev.sw}</p>
                                        <p>{rev.rec}</p>
                                        <p>{rev.noise}</p>
                                        <p>{rev.size}</p>
                                        <p>{rev.reviewYear}</p>
                                        <p>{rev.reviewerClassYear}</p>
                                        <button>Accept</button>
                                        <button>Deny</button>
                                    </form>  
                                ))}
                                
                            </div>
                        ))}
                    </>
                </div>
                
            ))}
        </div>
        );
    }
}