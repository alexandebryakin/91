import React from 'react';
import './NavBar.scss';

function NavBar(): React.ReactElement {
  return (
    <nav className="navbar navbar--fixed-top">
      <div className="navbar__inner">
        <div className="navbar__items navbar__items--end">
          <div className="navbar__item">Log out</div>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
