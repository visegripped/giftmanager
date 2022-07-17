import React from 'react';
import './App.css';

function App() {
  return (
    <>
      <header className="App-header">
        <div>Logged in as $user</div> {/* link this to their view */}
        <div>Edit list for: $users</div>
      </header>
      <main>{/* list and add form will go here. stacked at mobile, side by side at > tablet. */}</main>
      <footer></footer>
    </>
  );
}

export default App;
