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
    };
  }

  // Pour chaque result on va créer un objet membre et l'ajouter dans la liste qu'on affiche dans le tableau
  createDataFromJson(){

    let members_data = [];

    for(var i=0; i<data.results.length; i++){
      let new_member = {
        firstName: data.results[i].profile.first_name,
        lastName: data.results[i].profile.last_name,
        email: data.results[i].profile.email,
        id: data.results[i].profile.id,
      };
      members_data.push(new_member);
    }
    this.setState({members_data: members_data})
  }

  componentDidMount(){
    this.createDataFromJson();
  }

  render() {

    const columns = [
        {
            Header: "Name",
            columns: [
                {
                    Header: "First Name",
                    accessor: "firstName",
                    width: 150,
                },
                {
                    Header: "Last Name",
                    accessor: "lastName",
                    width: 150,
                }
            ]
        },
        {
            Header: "Infos",
            columns: [
                {
                    Header: 'Email',
                    accessor: 'email',
                    width: 300,
                },
                {
                    Header: 'Id',
                    accessor: 'id',
                },
            ]
        },
    ];

    return(
        <div>

          <ReactTable data={this.state.members_data} columns={columns} defaultPageSize={10}  style={{height: "400px" }}
          className="-striped -highlight react_table" filterable/>

            My beautiful React Table

        </div>
    );

  }


}

export default App;
