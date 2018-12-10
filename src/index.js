import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import TeamMembersList from './TeamMembersList';
import ClubMembersList from './ClubMembersList';

const root = document.getElementById("react-club_members_table");

const team_id = root.dataset.team_id;
const club_id = root.dataset.club_id;

let translations = {};

translations['parent'] = root.dataset.parent;
translations['account_not_activated'] = root.dataset.account_not_activated;
translations['invalid_email'] = root.dataset.invalid_email;
translations['reminder'] = root.dataset.reminder;
translations['search'] = root.dataset.search;
translations['add_a_member'] = root.dataset.add_a_member;
translations['export'] = root.dataset.export;
translations['affect_to_team'] = root.dataset.affect_to_team;
translations['delete_from_club'] = root.dataset.delete_from_club;
translations['profile'] = root.dataset.profile;
translations['infos'] = root.dataset.infos;


class MembersListApp extends React.Component {

    render() {
        if(team_id !== undefined) {
            return (
                <TeamMembersList team_id={team_id}/>
            );
        }
        else if(club_id !== undefined){
            return (
                <ClubMembersList club_id={club_id} translations={translations}/>
            )
        }
    }
}

//ReactDOM

ReactDOM.render(
  <MembersListApp/>,
  document.getElementById('react-club_members_table')
);
