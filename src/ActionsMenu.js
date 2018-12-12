import React, { Component } from 'react';
import './App.css';

import 'react-table/react-table.css'

import Popup from 'reactjs-popup'



class ActionsMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Show selected lines
  showSelection = () => {
    let selected_members = [];
    for(var i=0; i<this.state.members_data.length; i++){
        if(this.isSelected(this.state.members_data[i]._id)){
            selected_members.push(this.state.members_data[i]);
        }
    }
    return(
        <div>
            {selected_members.map(member => (
                member.first_name + " " + member.last_name + " (" + member.id + ") "
            ))}
        </div>
    )
  };

  // Show or hide menu 1/2
  showHideMenu(nb){
      const id = "members_list_menu" + nb;
      const d = document.getElementById(id);
      const max_height = d.scrollHeight;

      if(d.style.height === String(max_height)+'px') {
          d.style.height = '65px';
      }
      else{
        d.style.height = String(max_height)+'px';
      }
  }

  // Delete selected members from the club
  deleteSelectionFromClub(){
    let selected_members = [];
    for(var i=0; i<this.state.members_data.length; i++){
        if(this.isSelected(this.state.members_data[i]._id)){
            selected_members.push(this.state.members_data[i].id);
        }
    }
    this.deleteAPIClubMember(selected_members);
  }

  // Get members data from API and save them in state
  deleteAPIClubMember(profiles){

    const API_URL = 'http://api.local.sporteasy.net:8000/v2.1/clubs/' + this.props.club_id + '/profiles/';

    fetch(API_URL, {
        method: "DELETE",
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer fc1c759891085a50a296af72a74a6f93767e2ab1',
        },
        body: JSON.stringify({
            profiles: profiles,
        }),
    })
    .then(response =>
        response.json()
    )
    .then(json_response =>
        console.log(json_response),
        console.log("deleted"),
        window.location.reload(),
    )
  }




  render() {

    return(
        <div>

          {/* Menu 1 */}
          <div id={"members_list_menu1"}>

              {/*General Filter*/}
              <input className={"action_filter"} type={"text"} placeholder={this.props.translations.search + ".."}
                     value={this.state.search} onChange={e => this.setState({search: e.target.value})}/>

              {this.showSelection()}

          </div>

          <button onClick={() => this.showHideMenu(1)} className={"show_hide_menu"}>+</button>
          <hr color="black" size="1" className={"hr_between_menu"}/>

          {/* Menu 2 */}
          <div id={"members_list_menu2"}>

              {/*Edition Mode*/}
              {/*<button onClick={this.changeEditionMode} className={"action_button"}>Edition Mode</button>*/}
              {/*Log Selection*/}
              {/*<button onClick={this.logSelection} className={"action_button"}>Log Selection</button>*/}

              {/*Add a member*/}
              <a href={"/members/invite/"}>
                <button className={"action_button"}>{this.props.translations.add_a_member}</button>
              </a>

              {/*Export members list*/}
              <a href={"/members/export/"}>
                <button className={"action_button"}>{this.props.translations.export}</button>
              </a>

              {/*Affect players to a team*/}
              <button className={"action_button"}>{this.props.translations.affect_to_team}</button>

              {/*Delete players from club*/}
              <Popup
                    trigger={<button className={"action_button"}>{this.props.translations.delete_from_club}</button>}
                    closeOnDocumentClick
                    modal
              >
                  {this.props.translations.delete_from_club_confirmation}
                  <br/><br/>
                  {this.showSelection()}
                  <br/>
                  <button className={"action_button"} onClick={() => this.deleteSelectionFromClub()}>
                      {this.props.translations.delete_from_club}
                  </button>
              </Popup>

              {/*Send a global message*/}
              {/*<button className={"action_button"}>Send a message</button>*/}

          </div>

          <button onClick={() => this.showHideMenu(2)} className={"show_hide_menu"}>+</button>
          <hr color="black" size="1" className={"hr_between_menu"}/>


        </div>
    );

  }


}

export default ActionsMenu;
