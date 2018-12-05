import React, { Component } from 'react';
import './App.css';

import ReactTable from "react-table";
import 'react-table/react-table.css'

import PopUp from "./PopUp";

import withFixedColumns from "react-table-hoc-fixed-columns";
import Chance from "chance";
import checkboxHOC from "react-table/lib/hoc/selectTable";

const CheckboxTable = checkboxHOC(ReactTable);
const ReactTableFixedColumns = withFixedColumns(ReactTable);

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

class TeamMembersList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      members_data: [],
      selection: [],
      selectAll: false,
      isEditionMode: false,
    };
    this.renderEditable = this.renderEditable.bind(this);
  }

  // Get members data from API and save them in state
  getApiTeamMemberList(){

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
    this.setState({members_data: getData(members_data)})
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
                member.first_name + " (" + member.id + ") "
            ))}
        </div>
    )
  };

  // Log selected lines
  changeEditionMode = () => {
    this.setState({isEditionMode: !this.state.isEditionMode});
    console.log(this.state.isEditionMode)
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
              <CheckboxTable ref={r => (this.checkboxTable = r)} data={this.state.members_data} noDataText="Loading .."
                             defaultPageSize={20}
                             className="-striped -highlight react_table" filterable {...checkboxProps}
                             defaultFilterMethod={(filter, row) => row[filter.id] !== undefined
                             ? String(row[filter.id]).toLowerCase().includes(filter.value.toLowerCase()) : false}
                             columns={[
                                {
                                    Header: "Profile",
                                    fixed: "left",
                                    columns: [
                                        {
                                            Header: '',
                                            accessor: 'avatar',
                                            width: 40,
                                            filterable: false,
                                            Cell: profile => (<img src={profile.value.avatar["120x120"]}
                                                                   alt={profile.value.avatar["120x120"]}
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
                                            width: 150,
                                            Cell: this.renderEditable,
                                            filterMethod: (filter, row) => this.getSelectFilterMethod(filter, row, 'first_name'),
                                            Filter: ({ filter, onChange }) => this.getSelectFilter(filter, onChange, 'first_name'),
                                        },
                                        {
                                            Header: "Last Name",
                                            accessor: "last_name",
                                            width: 150,
                                            Cell: this.renderEditable,
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
                                            Cell: this.renderEditable,
                                        },
                                        {
                                            Header: 'Rôle',
                                            accessor: 'role',
                                            width: 200,
                                            filterMethod: (filter, row) => this.getCheckboxFilterMethod(filter, row, 'role'),
                                            Filter: ({ filter, onChange }) => this.getCheckboxFilter(filter, onChange, 'role'),
                                        },
                                        {
                                            Header: 'Telephone',
                                            accessor: 'phone_number',
                                            width: 150,
                                            filterable: false,
                                            Cell: this.renderEditable,
                                        },
                                        {
                                            Header: 'Taille',
                                            accessor: 'height',
                                            width: 100,
                                            filterable: false,
                                            Cell: this.renderEditable,
                                        },
                                        {
                                            Header: 'Poids',
                                            accessor: 'weight',
                                            width: 100,
                                            filterable: false,
                                            Cell: this.renderEditable,
                                        },
                                    ]
                                },
                              ]}
              />
          )
      }
      catch(error){
          return("No data in state.members_data.");
      }
  }

  // Get filter method
  getSelectFilterMethod(filter, row, column_name){

      // console.log("change");

      let options = [];

      for(var i=0; i<this.state.members_data.length; i++){
            if(!options.includes(this.state.members_data[i][column_name])){
                options.push(this.state.members_data[i][column_name]);
            }
      }

      // console.log(filter);
      // console.log(row);

      // Check actual value on the filter
      if (filter.value === "All") {
        return true;
      }

      for(var j=0; j<options.length; j++){
          if (filter.value === options[j]) {
              return row[filter.id] === options[j];
          }
      }
    }

  // Get filter
  getSelectFilter(filter, onChange, column_name){

      let options = [];

      for(var i=0; i<this.state.members_data.length; i++){
            if(!options.includes(this.state.members_data[i][column_name])){
                options.push(this.state.members_data[i][column_name]);
            }
      }

      options = options.sort();

      // Create select options
      return(
          <div>
            <select onChange={event => onChange(event.target.value)}>
                <option value='All'>All</option>
                {options.map(option => (
                    <option value={option}>{option}</option>
                ))}
            </select>
          </div>
      );
  }

  // Filter with many choices

  // Get filter method
  getCheckboxFilterMethod(filter, row, column_name){

      // Get available options
      let options = [];
      for(var i=0; i<this.state.members_data.length; i++){
            if(!options.includes(this.state.members_data[i][column_name])){
                options.push(this.state.members_data[i][column_name]);
            }
      }

      // If option checkbox is checked, add this option
      let checked_checkbox = [];
      for(var j=0; j<options.length; j++){
          let checkbox = document.getElementById(options[j]);
          if (checkbox.checked) {
              checked_checkbox.push(options[j]);
          }
      }

      // Return all the members with checked option
      if(checked_checkbox.length === 0){return true}
      return(
          checked_checkbox.includes(row[filter.id])
      );
    }

  // Get filter
  getCheckboxFilter(filter, onChange, column_name){

      let options = [];

      for(var i=0; i<this.state.members_data.length; i++){
            if(!options.includes(this.state.members_data[i][column_name])){
                options.push(this.state.members_data[i][column_name]);
            }
      }

      options = options.sort();

      // Create a checkbox for each team
      return(
          <div>
            {options.map(option => (
                <div>
                    <input type={"checkbox"} id={option} onChange={event => onChange(event.target.value)}/>
                    {option}
                </div>
            ))}
        </div>

      );
  }


  // Get members data from the API and convert them in state.members_data
  componentDidMount(){
    this.getApiTeamMemberList();

  }

  renderEditable(cellInfo) {
      if(this.state.isEditionMode) {
          return (
              <div
                  style={{backgroundColor: "#fafafa"}}
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={e => {
                      const members_data = [...this.state.members_data];
                      members_data[cellInfo.index][cellInfo.column.id] = e.target.innerHTML;
                      this.setState({members_data});
                  }}
                  dangerouslySetInnerHTML={{
                      __html: this.state.members_data[cellInfo.index][cellInfo.column.id]
                  }}
              />
          );
      }
      else {
          return (
              <div

                  dangerouslySetInnerHTML={{
                      __html: this.state.members_data[cellInfo.index][cellInfo.column.id]
                  }}
              />
          );
      }
  }

  render() {

    return(
        <div>

          {this.showTable()}
          <PopUp popup_content={this.state.popup_content}/>

          {/*See selection with checkbox  */}
          {/*Appel à l'API pour affecter les joueurs à l'équipe choisie*/}
          <button onClick={this.changeEditionMode}>Change Edition Mode</button>
          <button onClick={this.logSelection}>Log Selection</button>
          {this.showSelection()}

        </div>
    );

  }


}

export default TeamMembersList;
