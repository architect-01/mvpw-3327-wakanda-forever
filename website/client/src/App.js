import AccountInfo from "./Components/AccountInfo";
import Registration from "./Components/Registration";
import Voting from "./Components/Voting";
import ShowLeads from "./Components/ShowLeads";
import Header from "./Components/Header";
import "./CSS/App.css";

function App() {
  return (
    <div className="AppWrapper">
      <Header></Header>
      <AccountInfo></AccountInfo>
      <div className="App">
        <Registration></Registration>
        <Voting></Voting>
        <ShowLeads></ShowLeads>
      </div>
    </div>
  );
}

export default App;
