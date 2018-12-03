import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import TeamMembersList from './TeamMembersList';
import ClubMembersList from './ClubMembersList';

const team_id = window.team_id;
const club_id = window.club_id;


class MembersListApp extends React.Component {

    render() {
        if(team_id !== undefined) {
            return (
                <TeamMembersList team_id={team_id}/>
            );
        }
        else if(club_id !== undefined){
            return (
                <ClubMembersList club_id={club_id}/>
            )
        }
    }
}

//ReactDOM

ReactDOM.render(
  <MembersListApp/>,
  document.getElementById('root')
);
