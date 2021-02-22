import React from "react";
import { Switch, BrowserRouter as Router, Route } from "react-router-dom";
import ChooseDeck from "../choose-deck";
import RandomCard from "../random-card";
import FinishScreen from "../finish-screen";

const App: React.FC = () => {
    return (
        <Router>
            <Switch>
                <Route exact path="/deck/:name" component={RandomCard}/>
                <Route exact path="/finish" component={FinishScreen} />
                <Route path="/" component={ChooseDeck} /> 
            </Switch>
        </Router>
    )
};

export default App;
