import React, { Component } from 'react';
import './App.css';

import ReactTable from "react-table";
import 'react-table/react-table.css'
import Popup from 'reactjs-popup'

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
      columns_name: [],
      teams_options: [],
      columns: [],
    };
    this.renderEditable = this.renderEditable.bind(this);
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

    let columns_name = api_response.config.headers;
    this.setState({columns_name: columns_name});
    console.log(this.state.columns_name);

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
        parents: api_response.results[i].profile.parents,
      };
      members_data.push(new_member);
    }
    console.log(members_data);
    this.setState({members_data: getData(members_data)});
    this.getTeamsOptions();
    this.getColumns();
  }

  // Get in state all the possible choice for teams
  getTeamsOptions(){
      // Get available options
      let options = [];

      // For each member
      for (var i = 0; i < this.state.members_data.length; i++) {
          // For each team
          for (var j = 0; j < this.state.members_data.length; j++) {
              if (!options.includes(this.state.members_data[i]['teams'][j])
                  && this.state.members_data[i]['teams'][j] !== undefined) {
                  options.push(this.state.members_data[i]['teams'][j]);
              }
          }
      }
      this.setState({teams_options:options});
  }

  // Create table columns
  getColumns(){

      // Define columns
      let columns = [
                        {
                            Header: this.props.translations.profile,
                            fixed: "left",
                            columns: [
                                {
                                    Header: '',
                                    accessor: 'id',
                                    width: 40,
                                    filterable: false,
                                    Cell: id => (this.memberOptions(id.value)),
                                },
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
                                    Header: () => (<span>{this.state.columns_name[0].localized_name}</span>),
                                    accessor: "last_name",
                                    width: 150,
                                    Cell: this.renderEditable,
                                    filterMethod: (filter, row) => this.getSelectFilterMethod(filter, row, 'last_name'),
                                    Filter: ({ filter, onChange }) => this.getSelectFilter(filter, onChange, 'last_name'),
                                },
                                {
                                    Header: () => (<div>{this.state.columns_name[1].localized_name}</div>),
                                    accessor: "first_name",
                                    width: 150,
                                    Cell: this.renderEditable,
                                    filterMethod: (filter, row) => this.getSelectFilterMethod(filter, row, 'first_name'),
                                    Filter: ({ filter, onChange }) => this.getSelectFilter(filter, onChange, 'first_name'),
                                },
                            ]
                        },
                        {
                            Header: this.props.translations.infos,
                            columns: [
                                {
                                    Header: () => (<span>{this.state.columns_name[2].localized_name}</span>),
                                    accessor: 'email',
                                    width: 250,
                                    Cell: this.renderEditable,
                                    Filter: ({ filter, onChange }) => this.getTextFilter(filter, onChange, 'email'),
                                },
                                {
                                    Header: () => (<span>{this.state.columns_name[17].localized_name}</span>),
                                    accessor: 'teams',
                                    width: 175,
                                    Cell: this.renderEditable,
                                    filterMethod: (filter, row) => this.getCheckboxTeamsFilterMethod(filter, row, 'teams'),
                                    Filter: ({ filter, onChange }) => this.getCheckboxTeamsFilter(filter, onChange, 'teams'),
                                },
                                {
                                    Header: this.state.columns_name[15].localized_name,
                                    accessor: 'phone_number',
                                    width: 150,
                                    filterable: false,
                                    Cell: this.renderEditable,
                                },
                                {
                                    Header: this.state.columns_name[18].localized_name,
                                    accessor: 'height',
                                    width: 100,
                                    filterable: false,
                                },
                                {
                                    Header: this.state.columns_name[19].localized_name,
                                    accessor: 'weight',
                                    width: 100,
                                    filterable: false,
                                },
                            ]
                        },
                    ];

      // Calcul max number of parents
      let max_parents = 0;

      for(var p=0; p<this.state.members_data.length; p++){
          if(this.state.members_data[p].parents.length > max_parents){
              max_parents = this.state.members_data[p].parents.length;
          }
      }

      // Create parents columns
      for(let x=0; x<max_parents; x++){
          let parent_column = {
                            Header: this.props.translations.parent + " " + parseInt(x+1),
                            columns: [
                                {
                                    Header: this.state.columns_name[0].localized_name,
                                    accessor: 'parents',
                                    width: 150,
                                    filterable: false,
                                    Cell: parents => (this.showParentName(parents, x+1)),
                                },
                                {
                                    Header: this.state.columns_name[2].localized_name,
                                    accessor: 'parents',
                                    width: 150,
                                    filterable: false,
                                    Cell: parents => (this.showParentEmail(parents, x+1)),
                                },
                                {
                                    Header: this.state.columns_name[15].localized_name,
                                    accessor: 'parents',
                                    width: 150,
                                    filterable: false,
                                    Cell: parents => (this.showParentPhone(parents, x+1)),
                                },
                            ]
                        };
                        columns.push(parent_column);
      }
      this.setState({columns:columns});
  }

  // Show Table if there is data in the state.members_data
  showTable(){
      if(this.state.members_data.length !== 0){
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

          // Filter data with global search bar
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

          // const page_size = this.state.members_data.length;

          return(
                <CheckboxTable ref={r => (this.checkboxTable = r)} data={data} noDataText="Loading .."
                             defaultPageSize={20} showPagination={true} columns={this.state.columns}
                             className="-striped -highlight react_table" filterable {...checkboxProps}
                             defaultFilterMethod={(filter, row) => row[filter.id] !== undefined
                             ? String(row[filter.id]).toLowerCase().includes(filter.value.toLowerCase()) : false}
              />
          )
      }
      else{
          console.log("No members_data!");
      }
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

  // Log selected lines
  changeEditionMode = () => {
    this.setState({isEditionMode: !this.state.isEditionMode});
    console.log(this.state.isEditionMode)
  };


  // Show parent name
  showParentName(parents, parent_nb){
      if(parents.value.length >= parent_nb) {
          return (
              <div>{parents.value[parent_nb-1].first_name} {parents.value[parent_nb-1].last_name}</div>
          );
      }
  }

  // Show parent email
  showParentEmail(parents, parent_nb){
      if(parents.value.length >= parent_nb) {
          return (
              <div>{parents.value[parent_nb-1].email}</div>
          );
      }
  }

  // Show parent phone
  showParentPhone(parents, parent_nb){
      if(parents.value.length >= parent_nb) {
          return (
              <div>{parents.value[parent_nb-1].phone_number}</div>
          );
      }
  }

  // Pop In with member options
  memberOptions(id){
      return(
          <div>
              <div id={"member_"+id+"_options"} className={"members_options"}>

                  <Popup
                    trigger={<button className="settings_button"> + </button>}
                    closeOnDocumentClick
                    position={"right center"}
                  >
                    <span>
                            <a className={"profile_ref js-popin-form"}
                                href={"/members/board/" + id + "/update/" }>
                                    {this.props.translations.update_office_presence}
                            </a>

                            <br/>

                            <a className={"profile_ref js-popin-form"}
                                href={"/profile/parents/" + id + "/create/roster/" }>
                                    {this.props.translations.add_a_parent}
                            </a>

                            <br/>

                            <Popup
                                trigger={<div className={"profile_ref js-popin-form"}>
                                    {this.props.translations.delete_from_club}
                                </div>}
                                closeOnDocumentClick
                                modal
                            >

                              {this.props.translations.delete_from_club_confirmation}
                              <br/><br/>
                              <button className={"action_button"} onClick={() => this.deleteAPIClubMember([id])}>
                                  {this.props.translations.delete_from_club}
                              </button>

                            </Popup>
                    </span>
                 </Popup>
              </div>
          </div>
      )
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
                  <img src={"/Icon_search.png"} className={"icon_search show_hide_filters"}
                     onClick={() => {this.showHideFilters(column_name)}}/>

                  <div>

                      <div id={"filters_"+column_name} className={"filters"}>
                          {/*Text filter*/}
                          <div id={"text_filter"}>
                                <input id={"text_filter"} type={"text"} onChange={event => onChange(event.target.value)}
                                    placeholder={this.props.translations.search + ".."}/><br/>
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
              </div>
      );
  }

  // Get filter
  getTextFilter(filter, onChange, column_name){
      return(
        <div>
             <img src={"/Icon_search.png"} className={"icon_search show_hide_filters"}
                     onClick={() => {this.showHideFilters(column_name)}}/>
              <div>
                  <div id={"filters_"+column_name} className={"filters"}>
                      <div id={"text_filter"}>
                        <input id={"text_filter"} type={"text"} onChange={event => onChange(event.target.value)}
                               placeholder={this.props.translations.search + ".."}/>
                      </div>
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
                      <img src={"/Icon_search.png"} className={"icon_search show_hide_filters"}
                          onClick={() => {this.showHideFilters(column_name)}}/>

                      <div id={"filters_"+column_name} className={"filters"}>
                        {/*Text filter*/}
                        <div id={"text_filter"}>
                            <input id={"text_filter"} type={"text"} onChange={event => onChange(event.target.value)}
                                   placeholder={this.props.translations.search + ".."}/>
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

  // Get filter method
  getCheckboxTeamsFilterMethod(filter, row){

      // Get available options
      let options = this.state.teams_options;

      // If option checkbox is checked, add this option
      let checked_checkbox = [];

      if(document.getElementById("checkbox_filter") !== null) {
          for (var p = 0; p < options.length; p++) {
              let checkbox = document.getElementById(options[p]);
              if (checkbox.checked) {
                  checked_checkbox.push(options[p]);
              }
          }
      }

      // If textual search
      if (filter.value !== 'on') {
          return String(row[filter.id]).toLowerCase().includes(filter.value.toLowerCase())
      }
      // If no checkbox checked and no textual seach
      else if (checked_checkbox.length === 0) {
          return true
      }
      // If checkbox checked contains one of teams
      return (
          checked_checkbox.some(r => row[filter.id].includes(r))
      );
    }

  // Get filter
  getCheckboxTeamsFilter(filter, onChange, column_name) {

      let options = [];

      // For each member
      for (var i = 0; i < this.state.members_data.length; i++) {
          // For each team
          for (var j = 0; j < this.state.members_data.length; j++) {
              if (!options.includes(this.state.members_data[i][column_name][j])
                  && this.state.members_data[i][column_name][j] !== undefined) {
                  options.push(this.state.members_data[i][column_name][j]);
              }
          }
      }

      options = options.sort();

      // Create a checkbox for each team
      return (
           <div>
              <img src={"/Icon_search.png"} className={"icon_search show_hide_filters"}
                     onClick={() => {this.showHideFilters(column_name)}}/>

              <div id={"filters_" + column_name} className={"filters"}>
                  {/*Text filter*/}
                  <div id={"text_filter"}>
                      <input id={"text_filter"} type={"text"} onChange={event => onChange(event.target.value)}
                             placeholder={this.props.translations.search + ".."}/>
                  </div>
                  <br/>
                  {/*Checkbox Filter*/}
                  <div id={"checkbox_filter"}>
                      {options.map(option => (
                          <div>
                              <input type={"checkbox"} id={option}
                                     onChange={event => onChange(event.target.value)}/>
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

      if(d.style.opacity === '0.95'){
          d.style.opacity = '0';
          d.style.display = 'none';
      }
      else {
          d.style.opacity = '0.95';
          d.style.display = 'block';
      }
      return false;
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
          const id = members_data[cellInfo.index].id;
          // If column === email
          if(cellInfo.column.id === 'email'){
              // If status === pending
              if(members_data[cellInfo.index].status === 'pending') {
                  const id = members_data[cellInfo.index].id;
                  return (
                      <div className="email_content">
                          <a href={"/profile/"+id} className={"profile_ref"}>
                              {members_data[cellInfo.index][cellInfo.column.id]}
                          </a>
                          <div className="email_warning">
                                {this.props.translations.account_not_activated}
                          </div>

                          <button className="email_reminder">
                              <a href={"/profile/"+id+"/reminder/"} className={"profile_ref js-popin-form"}>
                                {this.props.translations.reminder}
                              </a>
                          </button>
                      </div>
                  );
              }
              // If no email
              else if(members_data[cellInfo.index].status === 'not_invited'){
                  return (
                      <div className="email_warning">
                          <button className="email_invite">
                              Invite
                          </button>
                      </div>
                  );
              }
              // If email is invalid
              else if(members_data[cellInfo.index].status === 'invalid'){
                  const id = members_data[cellInfo.index].id;
                  return (
                      <div className="email_content">
                          <a href={"/profile/"+id} className={"profile_ref"}>
                              {members_data[cellInfo.index][cellInfo.column.id]}
                          </a>
                          <div className="email_warning">
                              {this.props.translations.invalid_email}
                          </div>

                          <button className="email_correct">
                              <a href={"/profile/"+id+"/reminder/"} className={"profile_ref"}>
                                Correct
                              </a>
                          </button>
                      </div>
                  );
              }
          }

          else if(cellInfo.column.id === 'teams'){
              return (
                  // Change URL to static URL
                  <a href={"/profile/"+id} className={"profile_ref"}>
                      {members_data[cellInfo.index][cellInfo.column.id].map(team => (
                        <div className={"team_name"}>{team}</div>
                      ))}
                  </a>
              );
          }

          // If column !== email !== teams
          return (
              // Change URL to static URL
              <a href={"/profile/"+id} className={"profile_ref"}>
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
