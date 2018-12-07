import React, { Component } from 'react';
import './App.css';

import ReactTable from "react-table";
import 'react-table/react-table.css'

import PopUp from "./PopUp"

// import withFixedColumns from "react-table-hoc-fixed-columns";

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
      isEditionMode: false,
      search: '',
    };
    this.renderEditable = this.renderEditable.bind(this);
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
        status: api_response.results[i].profile.status.slug_name,
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
          const { toggleSelection, toggleAll, isSelected } = this;
          const { selectAll } = this.state;
          const checkboxProps = {
            selectAll,
            isSelected,
            toggleSelection,
            toggleAll,
            selectType: "checkbox",
          };

          // Define columns
          let columns = [
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
                                        filterMethod: (filter, row) => this.getSelectFilterMethod(filter, row, 'last_name'),
                                        Filter: ({ filter, onChange }) => this.getSelectFilter(filter, onChange, 'last_name'),
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
                                        Filter: ({ filter, onChange }) => this.getTextFilter(filter, onChange, 'email'),
                                    },
                                    {
                                        Header: 'Teams',
                                        accessor: 'teams',
                                        width: 175,
                                        Cell: this.renderEditable,
                                        filterMethod: (filter, row) => this.getCheckboxFilterMethod(filter, row, 'teams'),
                                        Filter: ({ filter, onChange }) => this.getCheckboxFilter(filter, onChange, 'teams'),
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
                                    },
                                    {
                                        Header: 'Poids',
                                        accessor: 'weight',
                                        width: 100,
                                        filterable: false,
                                    },
                                ]
                            },
                        ];

          let list_columns = [];

          for(var i=0; i<columns.length; i++){
              for(var j=0; j<columns[i].columns.length; j++){
                  list_columns.push(columns[i].columns[j].accessor);
              }
          }

          // Get data and filter if general search
          // let data = this.state.members_data;
          //
          // if (this.state.search) {
          //     // For each row/member
          //     data = data.filter(row => {
          //         // For each column
          //         for(var k=0; k<list_columns.length; k++){
          //             // If search === column value
          //             if(String(row[list_columns[k]]).toLowerCase().includes(this.state.search.toLowerCase())){
          //                 return true
          //             }
          //         }
          //         return false
          //    });
          // }

          let data = this.state.members_data;

          if (this.state.search) {
              data = data.filter(row => {
                return String(row['first_name']).toLowerCase().includes(this.state.search.toLowerCase()) ||
                       String(row['last_name']).toLowerCase().includes(this.state.search.toLowerCase()) ||
                       String(row['email']).toLowerCase().includes(this.state.search.toLowerCase()) ||
                       String(row['teams']).toLowerCase().includes(this.state.search.toLowerCase()) ||
                       String(row['phone_number']).toLowerCase().includes(this.state.search.toLowerCase())
              });
          }

          return(
                <CheckboxTable ref={r => (this.checkboxTable = r)} data={data} noDataText="Loading .."
                             defaultPageSize={20} columns={columns}
                             className="-striped -highlight react_table" filterable {...checkboxProps}
                             defaultFilterMethod={(filter, row) => row[filter.id] !== undefined
                             ? String(row[filter.id]).toLowerCase().includes(filter.value.toLowerCase()) : false}
              />
          )
      }
      catch(error){
          console.log("No members_data!");
      }
  }

  // Filter with only 1 choice

  // Get filter method
  getSelectFilterMethod(filter, row, column_name){

      if (filter.value === "All") {
        return true;
      }
      return row[filter.id] !== undefined ? String(row[filter.id]).toLowerCase().includes(filter.value.toLowerCase()) : false;

    }

  // Get filter
  getSelectFilter(filter, onChange, column_name){

      let options = [];

      for(var i=0; i<this.state.members_data.length; i++){
            if(!options.includes(this.state.members_data[i][column_name])
                && this.state.members_data[i][column_name] !== ''){
                options.push(this.state.members_data[i][column_name]);
            }
      }

      options = options.sort();

      // Create select options
      return(
          <div>

              <button className={"action_button show_hide_filters"}>Filter</button>

              <div id={"filters_"+column_name} className={"filters"}>
                  {/*Text filter*/}
                  <div id={"text_filter"}>
                        <input id={"text_filter"} type={"text"} onChange={event => onChange(event.target.value)}
                            placeholder={"Search.."}/><br/>
                  </div>
                  <br/>
                {/*Select filter  */}
                <div id={"select_filter"}>
                <select onChange={event => onChange(event.target.value)} id={"select_filter"}>
                    <option value='All'>All</option>
                    {options.map(option => (
                        <option value={option}>{option}</option>
                    ))}
                </select>
                </div>
              </div>

          </div>
      );
  }

  // Get filter
  getTextFilter(filter, onChange, column_name){
      return(
          <div>
              <button className={"action_button show_hide_filters"}>Filter</button>

              <div id={"filters_"+column_name} className={"filters"}>
                  <div id={"text_filter"}>
                    <input id={"text_filter"} type={"text"} onChange={event => onChange(event.target.value)}
                           placeholder={"Search.."}/>
                  </div>
              </div>
          </div>
      );
  }

  // Filter with many choices

  // Get filter method
  getCheckboxFilterMethod(filter, row, column_name){

      // Get available options
      let options = [];
      for(var i=0; i<this.state.members_data.length; i++){
            if(!options.includes(this.state.members_data[i][column_name])
                && this.state.members_data[i][column_name] !== ''){
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

      // If textual search
      if(filter.value !== 'on'){
          return String(row[filter.id]).toLowerCase().includes(filter.value.toLowerCase())
      }
      // If all checked
      else if(document.getElementById("all_checkbox").checked){
          return true
      }
      // If no checkbox checked and no textual seach
      else if(checked_checkbox.length === 0){
          return true
      }
      // If checkbox checked
      return(
          checked_checkbox.includes(row[filter.id] || String(row[filter.id]).toLowerCase().includes(filter.value.toLowerCase()))
      );
    }

  // Get filter
  getCheckboxFilter(filter, onChange, column_name){

      let options = [];

      for(var i=0; i<this.state.members_data.length; i++){
            if(!options.includes(this.state.members_data[i][column_name])
                && this.state.members_data[i][column_name] !== ''){
                options.push(this.state.members_data[i][column_name]);
            }
      }

      options = options.sort();

      // Create a checkbox for each team
      return(
        <div>

              <button className={"action_button show_hide_filters"}>Filter</button>

              <div id={"filters_"+column_name} className={"filters"}>
                {/*Text filter*/}
                <div id={"text_filter"}>
                    <input id={"text_filter"} type={"text"} onChange={event => onChange(event.target.value)}
                           placeholder={"Search.."}/>
                </div>
                <br/>
                {/*Checkbox Filter*/}
                <div id={"checkbox_filter"}>
                    <input type={"checkbox"} id='all_checkbox' onChange={event => onChange(event.target.value)}/>
                    All
                    {options.map(option => (
                        <div>
                            <input type={"checkbox"} id={option} onChange={event => onChange(event.target.value)}/>
                            {option}
                        </div>
                    ))}
                </div>
            </div>

        </div>

      );
  }

  showHideFilters(column_name){

      const d = document.getElementById("filters_"+column_name);

      if(d.style.opacity === '1'){
          d.style.opacity = '0';
          d.style.visibility = 'hidden';
      }
      else {
          d.style.opacity = '1';
          d.style.visibility = 'visible';
      }
  }






  // Get members data from the API and convert them in state.members_data
  componentDidMount(){
    this.getApiClubMemberList();

  }

  renderEditable(cellInfo) {

      let members_data = this.state.members_data;

      if (this.state.search) {
          members_data = members_data.filter(row => {
            return String(row['first_name']).toLowerCase().includes(this.state.search.toLowerCase()) ||
                   String(row['last_name']).toLowerCase().includes(this.state.search.toLowerCase()) ||
                   String(row['email']).toLowerCase().includes(this.state.search.toLowerCase()) ||
                   String(row['teams']).toLowerCase().includes(this.state.search.toLowerCase()) ||
                   String(row['phone_number']).toLowerCase().includes(this.state.search.toLowerCase())
          });
      }

      // If edition mode
      if(this.state.isEditionMode) {
          return (
              <div
                  style={{backgroundColor: "#fafafa"}}
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={e => {
                      members_data[cellInfo.index][cellInfo.column.id] = e.target.innerHTML;
                      this.setState({members_data});
                  }}
                  dangerouslySetInnerHTML={{
                      __html: members_data[cellInfo.index][cellInfo.column.id]
                  }}
              />
          );
      }
      // If not edition mode
      else {
          // If column === email
          if(cellInfo.column.id === 'email'){
              // If status === pending
              if(members_data[cellInfo.index].status === 'pending') {
                  const id = members_data[cellInfo.index].id;
                  return (
                      <div className="email_content">
                          <a href={"http://no-team-noteam.local.sporteasy.net:8000/profile/"+id} className={"profile_ref"}>
                              {members_data[cellInfo.index][cellInfo.column.id]}
                          </a>
                          <div className="email_warning">
                                Account not activated
                          </div>

                          <button className="email_reminder">
                              Reminder
                          </button>
                      </div>
                  );
              }
              else if(members_data[cellInfo.index].status === 'not_invited'){
                  return (
                      <div className="email_warning">
                          No email for this account
                          <button className="email_invite">
                              Invite
                          </button>

                      </div>
                  );
              }
          }

          // If column !== email
          const id = members_data[cellInfo.index].id;
          return (
              // Change URL to static URL
              <a href={"http://no-team-noteam.local.sporteasy.net:8000/profile/"+id} className={"profile_ref"}>
                  <div>
                      {members_data[cellInfo.index][cellInfo.column.id]}
                  </div>
              </a>
          );
      }
  }

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

  render() {

    return(
        <div>

          {/* Menu 1 */}
          <div id={"members_list_menu1"}>

              {/*General Filter*/}
              <input className={"action_filter"} type={"text"} placeholder={"Search.."}
                     value={this.state.search} onChange={e => this.setState({search: e.target.value})}/>

              {this.showSelection()}

          </div>

          <button onClick={() => this.showHideMenu(1)} className={"show_hide_menu"}>+</button>
          <hr color="black" size="1" className={"hr_between_menu"}/>

          {/* Menu 2 */}
          <div id={"members_list_menu2"}>

              <h3>Actions générales</h3>
              {/*Edition Mode*/}
              <button onClick={this.changeEditionMode} className={"action_button"}>Edition Mode</button>
              {/*Log Selection*/}
              <button onClick={this.logSelection} className={"action_button"}>Log Selection</button>
              {/*Export members list*/}
              <a href={"http://no-team.local.sporteasy.net:8000/members/export/?season_id=18"}>
                <button className={"action_button"}>Export</button>
              </a>
              {/*Add a member*/}
              <a href={"http://no-team.local.sporteasy.net:8000/members/invite/"}>
                <button className={"action_button"}>Add a member</button>
              </a>
              {/*Print members list*/}
              <button className={"action_button"}>Print</button>

              <h3>Actions collectives</h3>
              {/*Affect players to a team*/}
              <button className={"action_button"}>Affect player to team</button>
              {/*Delete players from club*/}
              <button className={"action_button"}>Delete player from club</button>
              {/*Send a global message*/}
              <button className={"action_button"}>Send a message</button>

          </div>

          <button onClick={() => this.showHideMenu(2)} className={"show_hide_menu"}>+</button>
          <hr color="black" size="1" className={"hr_between_menu"}/>

          {/* Table */}
          <div>
              {this.showTable()}
              <PopUp popup_content={this.state.popup_content}/>
          </div>

        </div>
    );

  }


}

export default ClubMembersList;
