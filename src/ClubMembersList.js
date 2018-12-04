import React, { Component } from 'react';
import './App.css';

import ReactTable from "react-table";
import 'react-table/react-table.css'

import withFixedColumns from "react-table-hoc-fixed-columns";

import Chance from "chance";
import checkboxHOC from "react-table/lib/hoc/selectTable";

const CheckboxTable = checkboxHOC(ReactTable);

const chance = new Chance();

function getData(testData) {
  const data = testData.map(item => {
    const _id = chance.guid();
    return {
      _id,
      ...item
    };
  });
  return data;
}


class ClubMembersList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selection: [],
      selectAll: false,
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
                                           onClick={() => this.showPopUp(profile.value)}/>),
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
                    width: 100,
                },
                {
                    Header: "Last Name",
                    accessor: "last_name",
                    width: 100,
                },
            ]
        },
        {
            Header: "Infos",
            columns: [
                {
                    Header: 'Email',
                    accessor: 'email',
                    width: 200,
                },
                {
                    Header: 'Teams',
                    accessor: 'teams',
                    width: 150,
                },
                {
                    Header: 'Licence n°',
                    accessor: 'licence_number',
                    width: 150,
                },
                {
                    Header: 'Telephone',
                    accessor: 'phone_number',
                    width: 150,
                    filterable: false,
                },
                {
                    Header: 'Taille',
                    accessor: 'height',
                    width: 100,
                    filterable: false,
                },
                {
                    Header: 'Poids',
                    accessor: 'weight',
                    width: 100,
                    filterable: false,
                },
            ]
        },
      ],
    };
  }

  // Get members data from API and save them in state
  getApiClubMemberList(){

    const API_URL = 'http://api.local.sporteasy.net:8000/v2.1/clubs/' + this.props.club_id + '/profiles/';

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
        height: api_response.results[i].profile.weight,
        weight: api_response.results[i].profile.height,
        licence_number: api_response.results[i].profile.licence_number,
        phone_number: api_response.results[i].profile.phone_number,
        teams: api_response.results[i].teams,
      };
      members_data.push(new_member);
    }
    this.setState({members_data: getData(members_data)});
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
        return(<div id={"popup"}></div>)
    }
  }

  // Add/delete lines to state.selection
  toggleSelection = (key) => {
    // start off with the existing state
    let selection = [...this.state.selection];
    const keyIndex = selection.indexOf(key);
    // check to see if the key exists
    if (keyIndex >= 0) {
      // it does exist so we will remove it using destructing
      selection = [
        ...selection.slice(0, keyIndex),
        ...selection.slice(keyIndex + 1)
      ];
    } else {
      // it does not exist so add it
      selection.push(key);
    }
    // update the state
    this.setState({ selection });
  };

  // Add/delete all the lines from state.selection
  toggleAll = () => {

    const selectAll = !this.state.selectAll;
    const selection = [];
    if (selectAll) {
      // we need to get at the internals of ReactTable
      const wrappedInstance = this.checkboxTable.getWrappedInstance();
      // the 'sortedData' property contains the currently accessible records based on the filter and sort
      const currentRecords = wrappedInstance.getResolvedState().sortedData;
      // we just push all the IDs onto the selection array
      currentRecords.forEach(item => {
        selection.push(item._original._id);
      });
    }
    this.setState({ selectAll, selection });
  };

  // Return true if key-line is selected
  isSelected = key => {
    return this.state.selection.includes(key);
  };

  // Log selected lines
  logSelection = () => {
    for(var i=0; i<this.state.members_data.length; i++){
        if(this.isSelected(this.state.members_data[i]._id)){
            console.log(this.state.members_data[i]);
        }
    }
  };

  // Show Table if there is data in the state.members_data
  showTable(){
      try{
          // Get functions and checkbox props
          const { toggleSelection, toggleAll, isSelected, logSelection } = this;
          const { selectAll } = this.state;
          const checkboxProps = {
            selectAll,
            isSelected,
            toggleSelection,
            toggleAll,
            selectType: "checkbox",
          };

          return(
                <CheckboxTable ref={r => (this.checkboxTable = r)} data={this.state.members_data} noDataText="Loading .." columns={this.state.columns} defaultPageSize={10}
                className="-striped -highlight react_table" filterable {...checkboxProps}/>
          )
      }
      catch(error){
          console.log("No members_data!");
      }
  }

  // Get members data from the API and convert them in state.members_data
  componentDidMount(){
    this.getApiClubMemberList();

  }

  render() {

    return(
        <div>

          <button onClick={this.logSelection}>Log Selection</button>
          {this.showTable()}
          {this.popUp()}

          {this.state.selection}

        </div>
    );

  }


}

export default ClubMembersList;
