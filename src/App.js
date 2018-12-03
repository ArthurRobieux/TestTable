import React, { Component } from 'react';
import './App.css';

import ReactTable from "react-table";
import 'react-table/react-table.css'

import withFixedColumns from "react-table-hoc-fixed-columns";
const ReactTableFixedColumns = withFixedColumns(ReactTable);

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      members_data: [],
      columns: [
        {
            Header: "Profile",
            fixed: "left",
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

  // Get members data from API and save them in state
  getApiMemberList(){

    const API_URL = 'http://api.local.sporteasy.net:8000/v2.1/teams/' + this.props.team_id + '/profiles/';

    fetch(API_URL, {
        method: "GET",
        credentials: 'include',
    })
    .then(response =>
        response.json()
    )
    .then(json_response =>
        this.createDataFromJson(json_response),
    )
  }

  // For each member in the API response, we will create a member and add him to state.members_data
  createDataFromJson(api_response){

    let members_data = [];

    for(var i=0; i<api_response.results.length; i++){
      let new_member = {
        avatar: api_response.results[i].profile,
        first_name: api_response.results[i].profile.first_name,
        last_name: api_response.results[i].profile.last_name,
        email: api_response.results[i].profile.email,
        id: api_response.results[i].profile.id,
        role: api_response.results[i].role.localized_name,
        height: api_response.results[i].profile.weight,
        weight: api_response.results[i].profile.height,
        licence_number: api_response.results[i].profile.licence_number,
        phone_number: api_response.results[i].profile.phone_number,
      };
      members_data.push(new_member);
    }
    this.setState({members_data: members_data})
  }

  // Onclick, show or hide pop-up, by giving him data
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
    console.log(this.state);
  }

  // Pop-up content
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

  // Show Table if there is data in the state.members_data
  showTable(){
      try{
          return(
              <ReactTableFixedColumns data={this.state.members_data} columns={this.state.columns} defaultPageSize={10}
                className="-striped -highlight react_table" filterable/>
          )
      }
      catch(error){
          return("No data in state.members_data.");
      }
  }

  // Get members data from the API and convert them in state.members_data
  componentDidMount(){
    this.getApiMemberList();

  }

  render() {

    return(
        <div>

          {this.showTable()}
          {this.popUp()}

        </div>
    );

  }


}

export default App;
