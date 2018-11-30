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
        age: "-",
        taille: "-",
        poids: "-",
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
                    accessor: "firstName"
                },
                {
                    Header: "Last Name",
                    accessor: "lastName",
                }
            ]
        },
        {
            Header: "Infos",
            columns: [
                {
                    Header: 'Age',
                    accessor: 'age',
                },
                {
                    Header: 'Taille',
                    accessor: 'taille',
                },
                {
                    Header: 'Poids',
                    accessor: 'poids',
                },
            ]
        },
    ];

    return(
        <div>
            <div className={"react_table"}>
                <ReactTable data={this.state.members_data} columns={columns} defaultPageSize={10}/>
            </div>
            My beautiful React Table
        </div>
    );

  }


}

export default App;
