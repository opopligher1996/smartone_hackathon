import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import RouteViewer from './containers/RouteViewer';
import ETAPanel from './containers/ETAPanel';
import Replay from './containers/Replay';
import Cal from './containers/Cal';
import Report from './containers/Report';
import CustomerReport from './containers/CustomerReport';
import SimilarityCheck from './containers/SimilarityCheck';
// import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { HashRouter as Router, Route, Link} from 'react-router-dom';
import 'Styles/App.scss';
import "@babel/polyfill";
import RecordViewer from './containers/RecordViewer';
import InfoWall from './containers/InfoWall';
import TopBar from './components/TopBar';
import Tester from './containers/Tester';
import SelectSample from './containers/Tester/AddTestCaseFlow/SelectSample';
import AddTestCaseFlow from './containers/Tester/AddTestCaseFlow';
import LiveTest from './containers/Tester/LiveTest';
import RunTestCaseFlow from './containers/Tester/RunTestCaseFlow';
import ETATester from './containers/ETATester';
import ETAReview from './containers/ETAReview';
import TestETA from './containers/ETATester/TestETA';
import Dashboard from './containers/Dashboard';
import Login from './containers/Login';
import history from './history';
import configureStore from "./store";
import { Provider, connect } from "react-redux";
import { PersistGate } from "redux-persist/lib/integration/react";

function updateCurrentUser(text) {
  return {
    type: "UPDATE",
    text
  };
}

const { store, persistor } = configureStore();

const mapStateToProps = state => ({
  currentUser: state.form.currentUser
});

class App extends Component {

  onUpdateCurrentUser = (role) => {
    this.props.dispatch(updateCurrentUser(role));
  };

  constructor(props) {
    super(props);
    this.state = {
      user: null
    };
  }

  isValidAccount = (role, password) => {
    if((role == 'operator' || role == 'developer') && password == '12345678')
    {
      this.setState({user:role})
      this.onUpdateCurrentUser(role)
      return true
    }
    return false
  }

  removeAccount = () => {
    this.setState({user: null})
    this.onUpdateCurrentUser(null)
  }

  render() {
    const currentUser = this.props.currentUser
    return <div>
      <Router forceRefresh={true} history={history}>
       <div>
        <TopBar history={history} user={currentUser} removeAccount={this.removeAccount}/>
        <Route path="/" exact component={RouteViewer} />
        <Route path="/login" render={(props) => <Login {...props} user={currentUser} isValidAccount={this.isValidAccount} removeAccount={this.removeAccount}/>} exact/>
        <Route path="/etaPanel" component={ETAPanel} />
        <Route path="/replay" component={Replay} />
        <Route path="/cal" component={Cal} />
        <Route path="/report" component={Report} />
        <Route path="/customerStopReport" component={CustomerReport} />
        <Route path="/check" component={SimilarityCheck} />
        <Route path="/rv/:query?" component={RecordViewer} />
        <Route path="/busStopReport" component={Report}/>
        <Route path="/info" component={InfoWall} />
        <Route path="/tester" component={Tester} exact />
        <Route path="/tester/add-test-case" component={AddTestCaseFlow} />
        <Route path="/tester/live-test" component={LiveTest} />
        <Route path="/tester/run-test/:caseId" component={RunTestCaseFlow} />
        <Route path="/eta-review" component={ETAReview} exact/>
        <Route path="/eta-tester" component={ETATester} exact/>
        <Route path="/dashboard" render={(props) => <Dashboard {...props} user={currentUser}/>} exact/>
       </div>
     </Router>
    </div>;
  }
}

const ConnectedApp = connect(mapStateToProps)(App);

ReactDOM.render(
  <Provider store={store}>
    <PersistGate persistor={persistor}>
      <ConnectedApp />
    </PersistGate>
  </Provider>,
  document.getElementById('root')
);
