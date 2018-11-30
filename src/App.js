import React, { Component } from 'react';
import './App.css';

import data from './event_74.json';

import ReactTable from "react-table";
import 'react-table/react-table.css'

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      members_data: [],
      columns: [
        {
            Header: "Profile",
            columns: [
                {
                    Header: '',
                    accessor: 'avatar',
                    width: 40,
                    filterable: false,
                    Cell: profile => (<img src={profile.value.avatar["120x120"]} alt={profile.value.avatar["120x120"]}
                                           className={"avatar"}
                                           onClick={() => this.showPopUp(profile.value)}/>)
                },
                {
                    Header: 'Id',
                    accessor: 'id',
                    width: 50,
                    filterable: false,
                },
                {
                    Header: "First Name",
                    accessor: "first_name",
                    width: 150,
                },
                {
                    Header: "Last Name",
                    accessor: "last_name",
                    width: 150,
                },
            ]
        },
        {
            Header: "Infos",
            columns: [
                {
                    Header: 'Email',
                    accessor: 'email',
                    width: 250,
                },
                {
                    Header: 'Telephone',
                    accessor: 'phone_number',
                    width: 200,
                    filterable: false,
                },
                {
                    Header: 'Rôle',
                    accessor: 'role',
                    width: 200,
                },
                {
                    Header: 'Taille',
                    accessor: 'height',
                    filterable: false,
                },
                {
                    Header: 'Poids',
                    accessor: 'weight',
                    filterable: false,
                },
            ]
        },
      ],
    };
  }

  // Pour chaque result on va créer un objet membre et l'ajouter dans la liste qu'on affiche dans le tableau
  createDataFromJson(){

    let members_data = [];

    for(var i=0; i<data.results.length; i++){
      let new_member = {
        avatar: data.results[i].profile,
        first_name: data.results[i].profile.first_name,
        last_name: data.results[i].profile.last_name,
        email: data.results[i].profile.email,
        id: data.results[i].profile.id,
        role: data.results[i].role.localized_name,
        height: data.results[i].profile.weight,
        weight: data.results[i].profile.height,
        licence_number: data.results[i].profile.licence_number,
        phone_number: data.results[i].profile.phone_number,
      };
      members_data.push(new_member);
    }
    this.setState({members_data: members_data})
  }

  // Au clic on afficher ou cache le pop-up, en lui envoyant les bonnes données
  showPopUp(popup_content){

    let d = document.getElementById("popup");

    if(d.style.visibility === "visible") {
        d.style.visibility = "hidden";
        d.style.opacity = "0";
        d.style.width = "0";
        d.style.height = "0";
        this.setState({popup_content: null});
    }
    else{
        d.style.visibility = "visible";
        d.style.opacity = "1";
        d.style.width = "35%";
        d.style.height = "30%";
        this.setState({popup_content: popup_content});
    }
  }

  // Contenu du PopUp
  popUp(){
    try{
      return(
          <div id={"popup"}>
            <img src={"/close.png"} className={"close_popup"}
                 onClick={() => this.showPopUp()}/>

            <div className={"popup_avatar_div"}>
              <img src={this.state.popup_content.avatar["120x120"]} className={"popup_avatar"}/>
            </div>

            <div className={"popup_infos_div"}>
                <h3>{this.state.popup_content.first_name} {this.state.popup_content.last_name}</h3>
                <h4>Id : {this.state.popup_content.id}</h4>
                <h4>Email : {this.state.popup_content.email}</h4>
                <h4>Téléphone : {this.state.popup_content.phone_number}</h4>
            </div>
          </div>
      )}
    catch (error) {
        console.error('No popup data.');
        return(<div id={"popup"}></div>)
    }
  }

  componentDidMount(){
    this.createDataFromJson();
  }

  render() {


    return(
        <div>

          <ReactTable data={this.state.members_data} columns={this.state.columns} defaultPageSize={10} style={{height: "500px" }}
          className="-striped -highlight react_table" filterable/>

          {this.popUp()}

        </div>
    );

  }


}

export default App;
