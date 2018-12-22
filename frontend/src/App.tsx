import React, { Component } from 'react';
import logo from './logo.svg';
import css from './App.module.scss';

class App extends Component {
  render() {
    return (
      <div className={css.app}>
        <header className={css.appHeader}>
          <img src={logo} className={css.appLogo} alt="logo" />
          <p>
            Welcome to React
          </p>
        </header>
      </div>
    );
  }
}

export default App;
