import React, { Component } from 'react';
import './App.css';

class PopUp extends Component {

      // Onclick, show or hide pop-up, by giving him data
      hidePopUp(popup_content){

        let d = document.getElementById("popup");

        d.style.visibility = "hidden";
        d.style.opacity = "0";
        d.style.width = "0";
        d.style.height = "0";
        
      }

      // Pop-up content
      popUp(){
        try{
          return(
              <div id={"popup"}>
                <img src={"/close.png"} className={"close_popup"}
                     onClick={() => this.hidePopUp()}
                     alt={"close"}/>

                <div className={"popup_avatar_div"}>
                  <img src={this.props.popup_content.avatar["120x120"]} className={"popup_avatar"} alt={"avatar"}/>
                </div>

                <div className={"popup_infos_div"}>
                    <h3>{this.props.popup_content.first_name} {this.props.popup_content.last_name}</h3>
                    <h4>Id : {this.props.popup_content.id}</h4>
                    <h4>Email : {this.props.popup_content.email}</h4>
                    <h4>Téléphone : {this.props.popup_content.phone_number}</h4>
                </div>
              </div>
          )}
        catch (error) {
            return(<div id={"popup"}></div>)
        }
      }

  render() {
    return(
        <div>
            {this.popUp()}
        </div>
    )
  }

}

export default PopUp;
