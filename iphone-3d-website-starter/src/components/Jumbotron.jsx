import { wrapperForImpl } from "jsdom/lib/jsdom/living/generated/utils";
import React from "react";
import Iphone from "../assets/images/iphone-14.jpg"
import HoldingIphone from "../assets/images/iphone-hand.png"

function JUumbotron() {
    const handleLearnmore = () => {
       const soundsectionElement =  document.querySelector(".sound-section")
        window.scrollTo({
            top:soundsectionElement?.getBoundingClientRect().top,
            left: 0,
            behavior: 'smooth'
        });
    }
    return ( 
        <div className="jumbotron-section wrapper">
            <h2 className="title">New</h2>
            <img className="logo" src={Iphone} alt="iPhone 14 Pro"></img>
            <p className="text">Big and Bigger</p>
            <span className="description">
                From $41.62/mo. for 24 mo. or $999 before trade-in
            </span>
            <ul className="links">
                <li>
                    <button className="button">Buy</button>
                </li>
                <li>
                    <a className="link" onClick={handleLearnmore}>Learn more</a>
                </li>
            </ul>
            <img src={HoldingIphone} alt="iPhone" className="iphone-img"></img>
        </div>
     );
}

export default JUumbotron;