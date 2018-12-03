import React from 'react';
import ReactDOM from 'react-dom';
import TeamMembersList from './TeamMembersList';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<TeamMembersList />, div);
  ReactDOM.unmountComponentAtNode(div);
});
